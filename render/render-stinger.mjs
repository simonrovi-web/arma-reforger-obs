// Renderiza stinger.html a stinger.webm (VP9 con canal alfa) para la transición Stinger de OBS.
// Requiere: Node, ffmpeg en el PATH, Google Chrome instalado y `npm i puppeteer-core` en esta carpeta.
// Uso: node render-stinger.mjs [fps] [segundos]
import puppeteer from 'puppeteer-core';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const fps = +(process.argv[2] || 60), secs = +(process.argv[3] || 2.0);
const chrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
].find(p => p && existsSync(p));
if (!chrome) throw new Error('No encuentro Chrome/Edge. Define CHROME_PATH.');

const frames = path.join(here, 'frames');
rmSync(frames, { recursive: true, force: true }); mkdirSync(frames);

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto(pathToFileURL(path.join(here, '..', 'stinger.html')).href, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => document.getAnimations().forEach(a => a.pause()));

const total = Math.round(fps * secs);
for (let i = 0; i < total; i++) {
  const t = i * 1000 / fps;
  await page.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), t);
  await page.screenshot({ path: path.join(frames, `f_${String(i).padStart(4, '0')}.png`), omitBackground: true });
  if (i % 20 === 0) console.log(`frame ${i}/${total}`);
}
await browser.close();

const out = path.join(here, 'stinger.webm');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(frames, 'f_%04d.png'),
  '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '8M', '-auto-alt-ref', '0', out], { stdio: 'inherit' });
rmSync(frames, { recursive: true, force: true });
console.log('Listo →', out, '| Punto de transición en OBS: 1000 ms');
