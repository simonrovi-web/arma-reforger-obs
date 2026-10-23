// Renderiza stingers HTML a WebM (VP9 con canal alfa) para la transición Stinger de OBS.
// Requiere: Node, ffmpeg en el PATH, Google Chrome instalado y `npm i puppeteer-core` en esta carpeta.
//
// Uso: node render-stinger.mjs [archivo.html ...] [--fps=60]
//   Sin archivos renderiza todos los stinger*.html de la carpeta del paquete.
//   Cada stinger declara su duración y su punto de corte en <meta name="stinger" content="2000 1000">.
//   El vídeo sale junto a este script con el mismo nombre: stinger-estrella.html → stinger-estrella.webm
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const pack = path.join(here, '..');
const args = process.argv.slice(2);
const fps = +(args.find(a => a.startsWith('--fps='))?.slice(6) || 60);
let files = args.filter(a => !a.startsWith('--'));
if (!files.length) files = readdirSync(pack).filter(f => /^stinger.*\.html$/i.test(f));

const chrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(p => p && existsSync(p));
if (!chrome) throw new Error('No encuentro Chrome/Edge. Define CHROME_PATH.');

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
const summary = [];

for (const file of files) {
  const src = path.resolve(pack, file);
  const name = path.basename(src, path.extname(src));
  const frames = path.join(here, 'frames');
  rmSync(frames, { recursive: true, force: true }); mkdirSync(frames);

  await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle0' });
  await page.evaluate(() => document.fonts.ready);
  const [durMs, cutMs] = await page.evaluate(() => (document.querySelector('meta[name=stinger]')?.content || '2000 1000').split(/\s+/).map(Number));
  await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));

  const total = Math.round(fps * durMs / 1000);
  for (let i = 0; i < total; i++) {
    const t = i * 1000 / fps;
    await page.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), t);
    await page.screenshot({ path: path.join(frames, `f_${String(i).padStart(4, '0')}.png`), omitBackground: true });
  }

  const out = path.join(here, `${name}.webm`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(frames, 'f_%04d.png'),
    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '8M', '-auto-alt-ref', '0', out], { stdio: 'inherit' });
  rmSync(frames, { recursive: true, force: true });
  summary.push(`${name}.webm  (${durMs} ms, punto de transición ${cutMs} ms)`);
  console.log('Listo →', out);
}
await browser.close();
console.log('\nEn OBS: Transiciones → + → Stinger → elige el .webm y pon el punto de transición:\n  ' + summary.join('\n  '));
