/* VÉRTICE · núcleo compartido (portal + consola)
 * - esc / safeUrl: toda cadena que entra a innerHTML pasa por aquí (evita XSS)
 * - store: capa de datos. HOY usa localStorage; en producción se reemplaza por llamadas
 *   a la API manteniendo estas mismas firmas (ver docs/esquema.sql y README).
 */
(function () {
  const D = window.VERTICE_DATA;
  const V = (window.Vertice = {});
  V.data = D;

  /* ---------- Seguridad básica ---------- */
  V.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  V.safeUrl = (u) => {
    const t = String(u).trim();
    if (/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(t)) return t; // fotos subidas desde el equipo (sin SVG)
    try { const x = new URL(String(u).trim(), location.href); return ['https:', 'http:'].includes(x.protocol) ? x.href : ''; } catch { return ''; }
  };

  /* ---------- Formatos ---------- */
  const TC = D.config.tipoCambio;
  V.mxn = (n) => '$' + Math.round(n).toLocaleString('es-MX');
  V.usd = (n) => 'US$' + Math.round(n / TC).toLocaleString('en-US');
  V.m2 = (n) => Number(n).toLocaleString('es-MX', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(+n) ? 0 : 2 }) + ' m²';
  V.compact = (n) => (n >= 1e6 ? '$' + (n / 1e6).toFixed(2).replace(/\.?0+$/, '') + ' M' : '$' + Math.round(n / 1e3) + ' mil');
  V.fmtFecha = (iso, conHora) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const f = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    return conHora ? f + ' · ' + d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' }) : f;
  };
  V.precioM2 = (i) => (i.superficieM2 > 0 ? Math.round(i.precioMxn / i.superficieM2) : 0);
  V.construccion = (i) => (i.construccionM2 > 0 ? V.m2(i.construccionM2) : 'Lote libre');
  V.rango = (p) => (p < 1e6 ? 'accesible' : p <= 8e6 ? 'medio' : 'premium');
  V.mapaUrl = (i) => `https://www.google.com/maps?q=${i.lat},${i.lng}`;
  V.wa = (texto) => `https://wa.me/${D.config.whatsapp}?text=${encodeURIComponent(texto)}`;
  V.zona = (k) => D.zonas[k] || k;
  V.uid = (p) => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  V.CAT = {
    terreno: { label: 'Terreno campestre', corto: 'Terrenos' },
    casa: { label: 'Casa de autor', corto: 'Casas de autor' },
    bodega: { label: 'Bodega y nave', corto: 'Bodegas y naves' },
    rancho: { label: 'Rancho y finca', corto: 'Ranchos y fincas' }
  };
  V.ESTATUS_INMUEBLE = ['publicado', 'reservado', 'borrador', 'vendido'];
  V.ESTATUS_PROSPECTO = ['Nuevo contacto', 'Cita agendada', 'En negociación', 'Revisión notarial', 'Cerrado / ganado', 'En pausa'];
  V.TIPOS_INTERACCION = ['Llamada telefónica', 'Mensaje de WhatsApp', 'Visita al inmueble', 'Envío de dossier', 'Revisión notarial', 'Oferta / negociación', 'Nota interna'];

  /* ---------- Iconos (trazo, sin emoji) ---------- */
  const P = {
    phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
    chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8',
    scale: 'M12 3v18 M5 21h14 M5 7h14 M5 7l-3 8a4 4 0 0 0 6 0z M19 7l-3 8a4 4 0 0 0 6 0z',
    coin: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M14.8 9a2 2 0 0 0-1.8-1h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1 M12 6v2 M12 16v2',
    note: 'M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    bolt: 'M13 2L3 14h9l-1 8 10-12h-9z',
    drop: 'M12 2.7l5.7 5.6a8 8 0 1 1-11.4 0z',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
    road: 'M4 19L8 5 M20 19L16 5 M12 6v3 M12 12v3 M12 18v2',
    sun: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 1v2 M12 21v2 M4.2 4.2l1.4 1.4 M18.4 18.4l1.4 1.4 M1 12h2 M21 12h2 M4.2 19.8l1.4-1.4 M18.4 5.6l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    compass: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3z',
    layers: 'M12 2l10 5-10 5L2 7z M2 17l10 5 10-5 M2 12l10 5 10-5',
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
    search: 'M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M21 21l-4.3-4.3',
    plus: 'M12 5v14 M5 12h14',
    x: 'M18 6L6 18 M6 6l12 12',
    check: 'M20 6L9 17l-5-5',
    chevL: 'M15 18l-6-6 6-6',
    chevR: 'M9 18l6-6-6-6',
    link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7 M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
    upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
    clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2',
    ext: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
    menu: 'M3 12h18 M3 6h18 M3 18h18',
    trash: 'M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6',
    home: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
    map: 'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4z M8 2v16 M16 6v16',
    ruler: 'M21.3 15.3l-6 6a1 1 0 0 1-1.4 0L2.7 10.1a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0l11.2 11.2a1 1 0 0 1 0 1.4z M7.5 10.5l2 2 M10.5 7.5l2 2 M13.5 4.5l2 2 M4.5 13.5l2 2',
    building: 'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4 M9 9v.01 M9 13v.01 M9 17v.01',
    trend: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
    dash: 'M3 3h8v10H3z M13 3h8v6h-8z M13 11h8v10h-8z M3 15h8v6H3z',
    share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4',
    db: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3z M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3'
  };
  V.icon = (n, size = 18, cls = '') =>
    `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n] || ''}"/></svg>`;
  V.waIcon = (size = 18) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.03 6.17c-3.18 0-5.77 2.59-5.77 5.77 0 1.3.38 2.27 1.02 3.29l-.58 2.13 2.18-.57c.98.58 1.91.93 3.15.93 3.18 0 5.77-2.59 5.77-5.77 0-3.19-2.58-5.77-5.77-5.77zm3.39 8.25c-.14.4-.84.77-1.17.82-.3.05-.68.06-1.09-.07-.25-.08-.58-.19-.99-.37-1.74-.75-2.87-2.5-2.96-2.62-.09-.12-.71-.94-.71-1.79s.45-1.27.61-1.45c.16-.17.35-.22.46-.22h.33c.11 0 .25-.04.39.3.14.35.49 1.2.53 1.29.04.09.07.19.01.3-.06.12-.09.19-.17.29l-.26.3c-.09.09-.18.18-.08.35.1.17.45.74.96 1.2.66.59 1.22.77 1.39.86.17.09.28.07.38-.04.1-.12.43-.51.55-.68.12-.17.23-.15.39-.09s1.01.48 1.18.56c.17.09.29.13.33.2.04.07.04.42-.1.82z"/></svg>`;
  V.iconInteraccion = (tipo) => {
    if (/Llamada/.test(tipo)) return 'phone';
    if (/WhatsApp/.test(tipo)) return 'chat';
    if (/Visita/.test(tipo)) return 'pin';
    if (/dossier/i.test(tipo)) return 'doc';
    if (/notarial/i.test(tipo)) return 'scale';
    if (/Oferta/.test(tipo)) return 'coin';
    return 'note';
  };

  /* ---------- Tema (claro por defecto) ---------- */
  V.theme = {
    get() { try { return localStorage.getItem('vertice.theme') || 'light'; } catch { return 'light'; } },
    set(t) { document.documentElement.classList.toggle('dark', t === 'dark'); try { localStorage.setItem('vertice.theme', t); } catch {} },
    toggle() { this.set(document.documentElement.classList.contains('dark') ? 'light' : 'dark'); }
  };

  /* ---------- Almacenamiento (reemplazable por API) ---------- */
  const K = { inv: 'vertice.v2.inventario', pro: 'vertice.v2.prospectos' };
  const mem = {}; // respaldo si localStorage no está disponible
  const rd = (k) => { if (mem[k]) return mem[k]; try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
  // Devuelve false si el navegador no pudo guardar (cuota llena); en ese caso el dato queda solo en memoria de la sesión
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); delete mem[k]; return true; } catch { mem[k] = v; return false; } };
  const isoAt = (dias, hora) => {
    const d = new Date(); d.setDate(d.getDate() + dias);
    const [h, m] = (hora || '10:00').split(':'); d.setHours(+h, +m, 0, 0); return d.toISOString();
  };
  const sembrarProspectos = () => D.prospectos.map((p) => ({
    id: p.id, creadoEn: isoAt(p.creadoDias, '09:00'), nombre: p.nombre, telefono: p.telefono, email: p.email,
    inmuebleId: p.inmuebleId, interes: '', presupuesto: p.presupuesto, origen: p.origen, ejecutivo: p.ejecutivo, estatus: p.estatus,
    bitacora: p.bitacora.map((b) => ({
      id: b.id, fecha: isoAt(b.dias, b.hora), ejecutivo: b.ejecutivo, tipo: b.tipo, resumen: b.resumen, detalle: b.detalle, acuerdo: b.acuerdo || '',
      fechaProxima: b.proximoDias == null ? null : isoAt(b.proximoDias, b.proximaHora || '10:00')
    }))
  }));
  const emit = () => window.dispatchEvent(new CustomEvent('vertice:data'));

  V.store = {
    inventario() {
      let l = rd(K.inv);
      if (!Array.isArray(l) || !l.length) { l = JSON.parse(JSON.stringify(D.inventario)); wr(K.inv, l); }
      return l;
    },
    saveInventario(l) { const ok = wr(K.inv, l); emit(); return ok; },
    prospectos() {
      let l = rd(K.pro);
      if (!Array.isArray(l)) { l = sembrarProspectos(); wr(K.pro, l); }
      return l;
    },
    saveProspectos(l) { const ok = wr(K.pro, l); emit(); return ok; },
    addProspecto(d) {
      const l = this.prospectos();
      const ejecutivo = D.asesores[l.length % D.asesores.length];
      const ahora = new Date().toISOString();
      const p = {
        id: V.uid('p'), creadoEn: ahora, nombre: d.nombre, telefono: d.telefono, email: d.email || '',
        inmuebleId: d.inmuebleId || null, interes: d.interes || '', presupuesto: d.presupuesto || 'Por definir',
        origen: d.origen || 'Portal web', ejecutivo, estatus: 'Nuevo contacto',
        bitacora: [{ id: V.uid('b'), fecha: ahora, ejecutivo: 'Sistema VÉRTICE', tipo: 'Nota interna', resumen: d.resumen || 'Registro desde el portal',
          detalle: d.nota || 'Solicitud recibida desde el portal público.', acuerdo: 'Contactar en las próximas 24 horas.', fechaProxima: null }]
      };
      l.unshift(p); this.saveProspectos(l); return p;
    },
    reset() { try { localStorage.removeItem(K.inv); localStorage.removeItem(K.pro); } catch {} delete mem[K.inv]; delete mem[K.pro]; emit(); }
  };

  /* ---------- Curvas de nivel ---------- */
  function blob(cx, cy, rx, ry, k, seed) {
    const N = 28, pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const n = 1 + 0.1 * Math.sin(3 * a + k * 0.5 + seed) + 0.07 * Math.sin(5 * a - k * 0.3 + seed * 2) + 0.04 * Math.sin(9 * a + k);
      pts.push([cx + Math.cos(a) * rx * n, cy + Math.sin(a) * ry * n]);
    }
    const f = (x) => x.toFixed(1);
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < N; i++) {
      const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    return d + 'Z';
  }
  V.topo = (el, centros) => {
    const cs = centros || [{ x: 800, y: 260, n: 15, s: 1 }, { x: 140, y: 520, n: 11, s: 3 }];
    let paths = '';
    cs.forEach((c) => { for (let k = 0; k < c.n; k++) paths += `<path class="${k % 5 === 4 ? 'hot' : ''}" d="${blob(c.x, c.y, 50 + k * 36, 32 + k * 23, k, c.s)}"/>`; });
    el.innerHTML = `<svg viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${paths}</svg>`;
  };

  /* ---------- Interacciones ---------- */
  V.tilt = (root) => {
    if (matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, cur = null;
    const reset = (el) => { if (el) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); } };
    root.addEventListener('pointermove', (e) => {
      const el = e.target.closest('.tilt');
      if (cur && cur !== el) reset(cur);
      cur = el;
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (px * 5).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * 5).toFixed(2) + 'deg');
      });
    });
    root.addEventListener('pointerleave', () => { reset(cur); cur = null; });
  };
  let io;
  V.reveal = (root = document) => {
    const els = root.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    io = io || new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((e) => io.observe(e));
  };
  V.imgFallback = (img) => {
    img.onerror = null;
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1C2636"/><stop offset="1" stop-color="#0D1219"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><path d="M0 230 L110 150 L190 205 L270 120 L400 215 V300 H0Z" fill="#FF5A26" opacity=".25"/><circle cx="310" cy="70" r="26" fill="#00D4B2" opacity=".35"/></svg>');
  };
  let tt;
  V.toast = (msg) => {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 3200);
  };
  /* Modal accesible: foco atrapado, ESC y devolución de foco */
  V.modal = (el, { onClose } = {}) => {
    let last = null;
    const focusables = () => [...el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
    const key = (e) => {
      if (e.key === 'Escape') { api.close(); return; }
      if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        const a = f[0], b = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    };
    const api = {
      open() { last = document.activeElement; el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; document.addEventListener('keydown', key); setTimeout(() => (focusables()[0] || el).focus(), 60); },
      close() { if (!el.classList.contains('open')) return; el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; document.removeEventListener('keydown', key); if (last && last.focus) last.focus(); onClose && onClose(); },
      get isOpen() { return el.classList.contains('open'); }
    };
    el.addEventListener('mousedown', (e) => { if (e.target === el) api.close(); });
    return api;
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.addEventListener('click', () => V.theme.toggle()));
  });
})();
