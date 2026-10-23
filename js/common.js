// Utilidades compartidas por todas las gráficas
(function () {
  const Q = new URLSearchParams(location.search);
  const CFG = window.CFG || {};

  // Textos guardados desde el panel editor.html: { general: {...}, gc: {...}, intro: {...} }
  // (cada gráfica lee los de su página y los generales).
  const PAGE = (location.pathname.split('/').pop() || 'index').replace(/\.html?$/i, '');
  let textos = {};
  try { textos = JSON.parse(localStorage.getItem('ar-textos')) || {}; } catch (e) {}

  // Orden de prioridad: parámetro de la URL › panel editor (esta página › general) › config.js › valor por defecto
  window.P = (k, d) => {
    if (Q.has(k)) return Q.get(k);
    const ed = textos[PAGE]?.[k] ?? textos.general?.[k];
    if (ed !== undefined && ed !== '') return ed;
    return CFG[k] !== undefined ? CFG[k] : d;
  };
  window.PN = (k, d) => { const v = parseFloat(P(k, d)); return isNaN(v) ? d : v; };
  window.PL = (k, d) => { const v = P(k, d); return Array.isArray(v) ? v : String(v).split('|').filter(Boolean); };

  // Color de acento
  const ac = String(P('acento', 'f2a900')).replace('#', '');
  if (/^[0-9a-f]{3,8}$/i.test(ac)) document.documentElement.style.setProperty('--acc', '#' + ac);
  // Las url() de variables CSS se resuelven contra la página que las usa, no contra theme.css:
  // con file:// "../img" apuntaría fuera del paquete, así que se fija la ruta completa.
  document.documentElement.style.setProperty('--camo', `url('${new URL('img/camo.svg', location.href).href}')`);
  const fondo = P('fondo', '');
  if (fondo) document.documentElement.style.setProperty('--foto', `url('${new URL(fondo, location.href).href}')`);

  // Rellena cualquier elemento con data-cfg="clave"
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-cfg]').forEach(el => { el.textContent = P(el.dataset.cfg, el.textContent); });
    const logo = P('logo', '');
    document.querySelectorAll('[data-logo]').forEach(el => {
      if (logo) { el.innerHTML = ''; const i = new Image(); i.src = logo; i.className = 'logo-img'; el.appendChild(i); }
    });
    if (Q.has('preview')) document.body.classList.add('preview');
  });

  // Efecto "descifrado" de texto
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>-_';
  window.scramble = (el, text, dur = 700) => {
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const n = Math.floor(text.length * p);
      el.textContent = text.slice(0, n) + [...text.slice(n)].map(c => c === ' ' ? ' ' : CH[Math.random() * CH.length | 0]).join('');
      if (p < 1) requestAnimationFrame(tick); else el.textContent = text;
    })(t0);
  };

  // Efecto máquina de escribir
  window.typeText = (el, text, speed = 28) => new Promise(r => {
    let i = 0; el.textContent = '';
    const iv = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(iv); r(); } }, speed);
  });

  window.pad = n => String(n).padStart(2, '0');
  window.clockStr = (s = true) => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + (s ? ':' + pad(d.getSeconds()) : ''); };
  window.wait = ms => new Promise(r => setTimeout(r, ms));

  // Canal de mensajes entre el panel de control (dock de OBS) y las fuentes.
  // Usa localStorage: el evento "storage" llega a las demás páginas del mismo origen.
  window.bus = {
    send(msg) { try { localStorage.setItem('ar-bus', JSON.stringify({ ...msg, ts: Date.now() + Math.random() })); } catch (e) {} },
    on(fn) { addEventListener('storage', e => { if (e.key === 'ar-bus' && e.newValue) { try { fn(JSON.parse(e.newValue)); } catch (er) {} } }); }
  };

  // Al aplicar textos en editor.html, las gráficas afectadas se recargan con el texto nuevo
  // (y así repiten su animación de entrada). Los paneles (<html data-panel>) no se recargan.
  window.bus.on(m => {
    if (m.t === 'textos' && !document.documentElement.hasAttribute('data-panel') && (m.page === PAGE || m.page === 'general')) location.reload();
  });
  // Stingers: con ?loop=1 repiten su animación (clase .play en #stage) para previsualizarlos.
  window.stingerLoop = () => {
    if (!Q.has('loop')) return;
    const st = document.getElementById('stage');
    const dur = +(document.querySelector('meta[name=stinger]')?.content.split(/\s+/)[0] || 2000);
    setInterval(() => { st.classList.remove('play'); void st.offsetWidth; st.classList.add('play'); }, dur + 1000);
  };

  window.store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
})();
