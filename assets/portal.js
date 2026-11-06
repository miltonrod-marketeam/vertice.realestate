/* VÉRTICE · lógica del portal público */
(function () {
  'use strict';
  const V = Vertice, D = V.data, E = V.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let inv = [];
  const st = { cat: 'todos', zona: 'todas', rango: 'todos', q: '', orden: 'destacados', vista: 'tarjetas' };

  // Vendidos: se muestran 10 días desde que se marcan como vendidos y luego desaparecen solos
  const cargar = () => { inv = V.store.inventario().filter(V.visiblePublico); };
  const vendido = (i) => i.estatus === 'vendido';
  const disp = () => inv.filter((i) => !vendido(i));
  const etqEstatus = (i, cls) => vendido(i)
    ? `<span class="${cls} etq" style="background:rgb(var(--ember));color:#fff">Vendido</span>`
    : i.estatus === 'reservado' ? `<span class="${cls} etq bg-white text-black">Reservado</span>` : '';

  /* ---------- Filtro y orden ---------- */
  function coincide(i, sinCat) {
    if (!sinCat && st.cat !== 'todos' && i.categoria !== st.cat) return false;
    if (st.zona !== 'todas' && i.zona !== st.zona) return false;
    if (st.rango !== 'todos' && V.rango(i.precioMxn) !== st.rango) return false;
    if (st.q) {
      const h = [i.titulo, i.ref, i.ubicacion, V.zona(i.zona), V.CAT[i.categoria]?.label].join(' ').toLowerCase();
      if (!h.includes(st.q)) return false;
    }
    return true;
  }
  function ordenar(l) {
    const c = [...l];
    const f = {
      'precio-asc': (a, b) => a.precioMxn - b.precioMxn,
      'precio-desc': (a, b) => b.precioMxn - a.precioMxn,
      'superficie-desc': (a, b) => b.superficieM2 - a.superficieM2,
      reciente: (a, b) => String(b.creadoEn).localeCompare(String(a.creadoEn)),
      destacados: (a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0) || String(b.creadoEn).localeCompare(String(a.creadoEn))
    }[st.orden];
    return c.sort(f);
  }

  /* ---------- Piezas de interfaz ---------- */
  const fotoPrincipal = (i) => (i.fotos || []).find((f) => V.safeUrl(f.url)) || { url: '', alt: i.titulo };
  const imgTag = (f, cls, eager) =>
    `<img src="${E(V.safeUrl(f.url))}" alt="${E(f.alt || '')}" ${eager ? '' : 'loading="lazy"'} decoding="async" onerror="Vertice.imgFallback(this)" class="${cls}">`;

  function card(i, n) {
    const f = fotoPrincipal(i);
    const msg = `Hola, me interesa el inmueble ${i.ref} (${i.titulo}).`;
    return `<div class="reveal d${(n % 3) + 1}"><article class="card tilt glow-c cat-${E(i.categoria)} cursor-pointer flex flex-col h-full" data-ref="${E(i.ref)}" tabindex="0" role="button" aria-label="Abrir ficha de ${E(i.titulo)}">
      <div class="relative aspect-[4/3] bg-surface2 overflow-hidden over-photo group">
        ${imgTag(f, 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-105' + (vendido(i) ? ' grayscale-[.7]' : ''))}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none"></div>
        <div class="absolute top-3 left-3"><span class="chip-c">${E(V.CAT[i.categoria]?.label || i.categoria)}</span></div>
        <span class="absolute top-3 right-3 inline-flex items-center gap-1.5 text-white text-[11px] px-2 py-1 rounded-full bg-black/55">${V.icon('layers', 12)}${(i.fotos || []).length}</span>
        ${etqEstatus(i, 'absolute top-12 right-3')}
        <div class="absolute left-0 bottom-4 pricetag">
          <div class="font-display text-[26px] font-semibold leading-none">${V.mxn(i.precioMxn)} <span class="font-sans text-[11px] font-medium opacity-70">MXN</span></div>
          <div class="num text-[11px] opacity-70 mt-1.5">${V.usd(i.precioMxn)} · ${V.mxn(V.precioM2(i))}/m²</div>
        </div>
      </div>
      <div class="h-1" style="background:linear-gradient(90deg,rgb(var(--c)),rgb(var(--c) / .25))"></div>
      <div class="p-5 flex flex-col gap-3 flex-1">
        <div class="flex items-center justify-between gap-3 text-xs text-muted">
          <span class="num font-semibold" style="color:rgb(var(--ember-ink))">${E(i.ref)}</span>
          <a data-stop href="${E(V.mapaUrl(i))}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 hover:text-ember-ink">${V.icon('pin', 13)}${E(V.zona(i.zona))}</a>
        </div>
        <h3 class="font-display text-[22px] font-semibold leading-snug">${E(i.titulo)}</h3>
        <p class="text-sm text-muted leading-relaxed line-clamp-2">${E(i.descripcion)}</p>
        <dl class="grid grid-cols-3 gap-2 pt-1 mt-auto">
          ${[['ruler', 'Terreno', V.m2(i.superficieM2), 'tide'], ['building', 'Construcción', V.construccion(i), 'ember'], ['trend', 'Plusvalía zona', '▲ ' + i.plusvaliaZonaPct + '% est.', 'ochre']].map(([ic, t, v, c], k) =>
            `<div class="rounded-xl px-2 py-2.5 text-center" style="background:rgb(var(--${c}) / .11);box-shadow:inset 0 -2px 0 rgb(var(--${c}) / .85)"${k === 2 ? ' title="Estimación ilustrativa de plusvalía en la zona a 3 años"' : ''}><span class="inline-flex" style="color:rgb(var(--${c}))">${V.icon(ic, 15)}</span><dt class="text-[10.5px] text-muted mt-1 leading-none">${t}</dt><dd class="num text-[12.5px] font-semibold mt-1.5 leading-tight" style="color:rgb(var(--${c}))">${E(v)}</dd></div>`).join('')}
        </dl>
        <div class="flex items-center justify-between gap-2 pt-1">
          <span class="chip-c max-w-[60%]" style="--c:var(--ink);border-left-color:rgb(var(--ember))">${E(i.estatusLegal)}</span>
          <div class="flex items-center gap-2">
            <a data-stop href="${E(V.wa(msg))}" target="_blank" rel="noopener" class="icon-btn !w-9 !h-9" aria-label="Consultar por WhatsApp" style="color:rgb(var(--tide))">${V.waIcon(17)}</a>
            <span class="btn btn-ink btn-sm">Ficha técnica <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </div>
    </article></div>`;
  }

  function filaLista(i) {
    return `<tr class="cursor-pointer cat-${E(i.categoria)}" data-ref="${E(i.ref)}">
      <td class="num font-semibold" style="color:rgb(var(--c))">${E(i.ref)}</td>
      <td><div class="font-semibold">${E(i.titulo)}${vendido(i) ? ' <span class="etq" style="background:rgb(var(--ember));color:#fff">Vendido</span>' : ''}</div><div class="text-xs text-muted">${E(V.CAT[i.categoria]?.label)}</div></td>
      <td class="text-muted whitespace-nowrap">${E(V.zona(i.zona))}</td>
      <td class="num whitespace-nowrap">${V.m2(i.superficieM2)}</td>
      <td class="num whitespace-nowrap text-muted">${E(V.construccion(i))}</td>
      <td class="whitespace-nowrap">${E(i.asoleamiento)}</td>
      <td class="whitespace-nowrap" style="color:rgb(var(--moss))">${E(i.estatusLegal)}</td>
      <td class="num font-semibold whitespace-nowrap">${V.mxn(i.precioMxn)}</td>
      <td class="text-right"><span class="btn btn-ink btn-sm">Ver ficha</span></td></tr>`;
  }

  function hero() {
    const dp = disp(), i = dp.find((x) => x.destacado) || dp[0];
    const box = $('#heroFeatured');
    if (!i) { box.innerHTML = ''; return; }
    const f = fotoPrincipal(i);
    box.innerHTML = `<div class="glow-ring rounded-[26px]"><article class="card tilt cat-${E(i.categoria)} cursor-pointer relative z-[1]" style="border-radius:24px" data-ref="${E(i.ref)}" tabindex="0" role="button" aria-label="Abrir ficha de ${E(i.titulo)}">
      <div class="relative aspect-[4/4.2] sm:aspect-[4/3.6] lg:aspect-[4/4.4] overflow-hidden over-photo group">
        ${imgTag(f, 'w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105', true)}
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/25 pointer-events-none"></div>
        <div class="absolute top-4 left-4 flex flex-wrap gap-2"><span class="chip-c">Pieza destacada</span><span class="chip-c" style="--c:var(--tide)">${E(i.estatusLegal)}</span></div>
        <div class="absolute bottom-0 inset-x-0 p-5 text-white">
          <p class="num text-[11px] opacity-75">${E(i.ref)} · ${E(V.zona(i.zona))}</p>
          <h2 class="font-display text-[28px] font-semibold leading-tight mt-1">${E(i.titulo)}</h2>
          <div class="flex items-end justify-between gap-3 mt-4">
            <div><p class="text-[11px] opacity-70">Inversión</p><p class="fig text-3xl leading-none" style="color:#FF8A62">${V.mxn(i.precioMxn)}<span class="text-xs font-sans opacity-80"> MXN</span></p></div>
            <span class="btn btn-primary btn-sm">Ver ficha →</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-3 text-center divide-x divide-line py-3.5">
        <div><p class="text-[11px] text-muted">Superficie</p><p class="num text-[13px] font-semibold mt-0.5">${V.m2(i.superficieM2)}</p></div>
        <div><p class="text-[11px] text-muted">Topografía</p><p class="text-[13px] font-semibold mt-0.5">${E(i.topografia.split(' ')[0])} ${E(i.topografia.match(/[+-]?\d+%/)?.[0] || '')}</p></div>
        <div><p class="text-[11px] text-muted">Uso de suelo</p><p class="text-[13px] font-semibold mt-0.5">${E(i.usoSuelo)}</p></div>
      </div></article></div>`;
  }

  const CCOL = { todos: 'ember', terreno: 'moss', casa: 'ember', bodega: 'tide', rancho: 'ochre' };
  const ON = { ochre: '#1a1208', tide: '#04201b', moss: '#04210f' };

  /* ---------- Franja de cifras ---------- */
  let statsKey = '';
  function stats() {
    const inv = disp();
    if (!inv.length) { $('#statsRow').innerHTML = ''; statsKey = ''; return; }
    const ha = inv.reduce((a, i) => a + i.superficieM2, 0) / 1e4;
    const ps = inv.map((i) => i.precioMxn);
    const zonas = new Set(inv.map((i) => i.zona)).size;
    const items = [
      { n: inv.length, dec: 0, suf: '', t: 'inmuebles en la colección', sub: 'cada uno con ficha técnica', c: 'ember', ico: 'building' },
      { n: ha, dec: 2, suf: ' ha', t: 'de superficie registrada', sub: 'medida y con coordenadas', c: 'tide', ico: 'ruler' },
      { txt: V.compact(Math.min(...ps)), t: 'inversión de entrada', sub: 'hasta ' + V.compact(Math.max(...ps)) + ' MXN', c: 'ochre', ico: 'coin' },
      { n: zonas, dec: 0, suf: '', t: zonas === 1 ? 'zona del Bajío' : 'zonas del Bajío', sub: 'del centro al corredor 57', c: 'moss', ico: 'map' }
    ];
    const key = JSON.stringify(items.map((x) => [x.n, x.txt, x.sub]));
    if (key === statsKey) return; statsKey = key;
    $('#statsRow').innerHTML = items.map((x, k) => `<div class="stat reveal d${k % 4}" style="--c:var(--${x.c})">
      <p class="fig text-[36px] sm:text-5xl leading-none mt-1" style="color:rgb(var(--c))">${x.txt ? E(x.txt) : `<span data-count="${x.n}" data-dec="${x.dec}" data-suf="${E(x.suf)}">${E(x.n.toLocaleString('es-MX', { minimumFractionDigits: x.dec, maximumFractionDigits: x.dec }) + x.suf)}</span>`}</p>
      <p class="font-semibold mt-3 text-[14px]">${E(x.t)}</p><p class="text-[12.5px] text-muted mt-0.5">${E(x.sub)}</p></div>`).join('');
    countUp($('#statsRow'));
  }
  function countUp(root) {
    const els = $$('[data-count]', root);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      const el = en.target, to = +el.dataset.count, dec = +el.dataset.dec, suf = el.dataset.suf || '', t0 = performance.now(), d = 1200;
      const f = (t) => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * e).toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; if (k < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f);
    }), { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Encabezado de la colección (reacciona al filtro) ---------- */
  const CAT_TXT = {
    todos: 'Cada pieza llega con lectura de terreno, documentos a la vista y dictamen de un arquitecto.',
    terreno: 'Lotes y predios campestres con pendiente, asoleamiento y servicios medidos antes de la primera visita.',
    casa: 'Arquitectura con firma, pensada para su terreno. Ficha de construcción y dictamen incluidos.',
    bodega: 'Naves y bodegas con acceso para carga, servicios y situación legal documentada.',
    rancho: 'Fincas con superficie amplia: la lectura del suelo y del agua primero, la casa después.'
  };
  function catHead(l) {
    const k = st.cat, c = CCOL[k];
    const n = l.length, tot = l.reduce((a, i) => a + i.precioMxn, 0);
    const min = n ? Math.min(...l.map((i) => i.precioMxn)) : 0;
    const pm2 = n ? l.reduce((a, i) => a + V.precioM2(i), 0) / n : 0;
    const chips = [];
    if (st.zona !== 'todas') chips.push(['zona', 'Zona: ' + V.zona(st.zona)]);
    if (st.rango !== 'todos') chips.push(['rango', 'Inversión: ' + ($('#heroRango').selectedOptions[0]?.text || st.rango)]);
    if (st.q) chips.push(['q', 'Búsqueda: ' + st.q]);
    const tile = (v, t, cc) => `<div class="rounded-2xl border border-line bg-surface/80 backdrop-blur p-4"><p class="fig text-2xl sm:text-3xl leading-none" style="color:rgb(var(--${cc}))">${E(v)}</p><p class="text-[12px] text-muted mt-2">${E(t)}</p></div>`;
    $('#catHead').innerHTML = `<div class="swap relative card overflow-hidden p-7 sm:p-10" style="--c:var(--${c})">
      <span class="absolute inset-x-0 top-0 h-1.5" style="background:linear-gradient(90deg,rgb(var(--c)),rgb(var(--c)/.15))"></span>
      <span class="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full pointer-events-none" style="background:radial-gradient(closest-side,rgb(var(--c)/.26),transparent)"></span>
      <div class="relative grid lg:grid-cols-12 gap-8 items-end">
        <div class="lg:col-span-7">
          <p class="eyebrow" style="color:rgb(var(--c))">${k === 'todos' ? 'Colección' : 'Colección · ' + E(V.CAT[k].label)}</p>
          <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.04] mt-4">${k === 'todos' ? 'Inmuebles con expediente <span style="color:rgb(var(--ember-ink))">revisado</span>' : E(V.CAT[k].corto)}</h2>
          <p class="text-muted mt-4 max-w-xl leading-relaxed">${E(CAT_TXT[k])}</p>
          ${chips.length ? `<div class="flex flex-wrap gap-2 mt-5">${chips.map(([q, t]) => `<button class="chip-c cursor-pointer hover:opacity-80" data-quitar="${q}" aria-label="Quitar filtro ${E(t)}">${E(t)} <span aria-hidden="true">✕</span></button>`).join('')}<button class="text-xs font-semibold underline text-muted self-center ml-1" data-reset-all>Limpiar todo</button></div>` : ''}
        </div>
        <div class="lg:col-span-5 grid grid-cols-2 gap-3">
          ${tile(String(n), n === 1 ? 'inmueble en esta vista' : 'inmuebles en esta vista', c)}
          ${tile(n ? V.compact(min) : '—', 'desde', c === 'ochre' ? 'ember' : 'ochre')}
          ${tile(n ? V.compact(tot) : '—', 'valor del conjunto', c === 'tide' ? 'moss' : 'tide')}
          ${tile(n ? V.mxn(pm2) : '—', 'promedio por m²', c === 'ember' ? 'moss' : 'ember')}
        </div>
      </div></div>`;
  }

  function tabs() {
    const base = disp().filter((i) => coincide(i, true));
    const defs = [['todos', 'Todos'], ...Object.entries(V.CAT).map(([k, v]) => [k, v.corto])];
    $('#tabs').innerHTML = defs.map(([k, label]) => {
      const n = k === 'todos' ? base.length : base.filter((i) => i.categoria === k).length;
      const on = st.cat === k, c = CCOL[k];
      return `<button role="tab" aria-selected="${on}" data-tab="${k}" class="tabpill ${on ? 'on' : ''}" style="--c:var(--${c});--on:${ON[c] || '#fff'}">${E(label)}<span class="num text-[11px] opacity-70">${n}</span></button>`;
    }).join('');
  }

  /* ---------- Zonas ---------- */
  const ZONA_INFO = {
    'sma-centro': { c: 'ember', ico: 'home', txt: 'Calles empedradas y vida de barrio: casas de autor a pocos pasos de plazas, galerías y mesas.' },
    'cruz-palmar': { c: 'moss', ico: 'sun', txt: 'Terrenos campestres con vista abierta y un trayecto corto al centro.' },
    'atotonilco': { c: 'ochre', ico: 'compass', txt: 'Rumbo a Dolores Hidalgo: ranchos y fincas con superficie amplia y horizonte largo.' },
    'corredor-industrial': { c: 'tide', ico: 'road', txt: 'Sobre la carretera 57: bodegas y naves con acceso para carga.' }
  };
  // Centro de cada zona (promedio de sus inmuebles) y distancia a la Parroquia, calculados con los datos reales
  const PARROQUIA = [20.9144, -100.7452];
  const km = (a, b) => { const r = Math.PI / 180, dl = (b[0] - a[0]) * r, dn = (b[1] - a[1]) * r;
    const h = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dn / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
  const geo = (l) => {
    if (!l.length) return '';
    const la = l.reduce((s, i) => s + i.lat, 0) / l.length, ln = l.reduce((s, i) => s + i.lng, 0) / l.length, d = km(PARROQUIA, [la, ln]);
    return `${la.toFixed(3)}° N  ${Math.abs(ln).toFixed(3)}° O<br>${d < 1.5 ? 'En el centro' : Math.round(d) + ' km a la Parroquia'}`;
  };
  function zonas() {
    $('#zonasGrid').innerHTML = Object.entries(D.zonas).map(([id, nombre], k) => {
      const z = ZONA_INFO[id] || { c: 'ember', ico: 'map', txt: '' };
      const l = disp().filter((i) => i.zona === id), n = l.length;
      const desde = n ? Math.min(...l.map((i) => i.precioMxn)) : 0;
      return `<a href="#catalogo" data-zona="${E(id)}" class="reveal d${k} zona card glow-c group relative overflow-hidden p-6 min-h-[320px] flex flex-col ${n ? '' : 'opacity-60 pointer-events-none'}" style="--c:var(--${z.c})">
        <div class="topo zt" data-ztopo="${k}"></div>
        <span class="zona-wash"></span>
        <div class="relative">
          <h3 class="font-display text-2xl font-semibold leading-tight pr-16">${E(nombre)}</h3>
          ${n ? `<p class="zona-geo">${geo(l)}</p>` : ''}
          <p class="text-[14px] text-muted mt-3 leading-relaxed">${E(z.txt)}</p></div>
        <div class="zona-sil">${V.dib[id] ? V.dib[id]() : ''}</div>
        <div class="relative mt-auto pt-5 flex items-end justify-between gap-3">
          <div><p class="fig text-5xl leading-none" style="color:rgb(var(--c))">${n}</p><p class="text-[12px] text-muted mt-1">${n === 1 ? 'inmueble' : 'inmuebles'}</p></div>
          <div class="text-right"><p class="num text-[13px] font-semibold">${n ? V.compact(desde) + ' MXN' : 'Próximamente'}</p><p class="text-[12px] text-muted">${n ? 'inversión desde' : 'sin piezas hoy'}</p></div>
        </div>
        <span class="zona-cta">Ver piezas →</span></a>`;
    }).join('');
    $$('[data-ztopo]').forEach((el, k) => V.topo(el, [{ x: 760 - k * 90, y: 140 + k * 60, n: 9, s: 3 }]));
  }

  /* ---------- Ruta de compra y preguntas (contenido fijo) ---------- */
  const RUTA = [
    ['Visita y lectura', 'Recorres el inmueble con un asesor y recibes la ficha técnica con topografía, asoleamiento y servicios.', 'ember', 'compass'],
    ['Oferta y apartado', 'Presentas tu oferta por escrito. Si se acepta, el inmueble pasa a Reservado.', 'tide', 'note'],
    ['Revisión notarial', 'Tu notario revisa escritura, predial, gravamen y uso de suelo antes de cualquier firma.', 'ochre', 'scale'],
    ['Contrato', 'Se formaliza la promesa o el contrato de compraventa con las condiciones acordadas.', 'moss', 'doc'],
    ['Escrituración', 'Firma ante notario, pago de impuestos y derechos, e inscripción. Después, las llaves.', 'ember', 'check']
  ];
  const FAQ = D.faq || [];
  function estatico() {
    $('#rutaGrid').innerHTML = RUTA.map(([t, d, c, ico], k) => `<li class="reveal d${k % 4} ruta card glow-c relative p-6 pt-8" style="--c:var(--${c})">
      <span class="ruta-n">${k + 1}</span><div class="dib">${V.dib['r' + (k + 1)]()}</div>
      <h3 class="font-display text-xl font-semibold mt-4">${E(t)}</h3><p class="text-[14px] text-muted mt-2 leading-relaxed">${E(d)}</p></li>`).join('');
    $('#faqList').innerHTML = FAQ.map(([q, a], k) => `<details class="faq card" ${k === 0 ? 'open' : ''}><summary><span>${E(q)}</span><i aria-hidden="true"></i></summary><p>${E(a)}</p></details>`).join('');
    $$('[data-ico]').forEach((el) => { el.innerHTML = V.icon(el.dataset.ico, 22); });
  }

  function render() {
    const lo = ordenar(inv.filter((i) => coincide(i)));
    const l = lo.filter((i) => !vendido(i)).concat(lo.filter(vendido));
    const n = lo.filter((i) => !vendido(i)).length;
    $('#heroCount').textContent = n + (n === 1 ? ' inmueble' : ' inmuebles');
    tabs(); catHead(lo.filter((i) => !vendido(i))); hero(); stats(); zonas();
    const vacio = `<div class="col-span-full card p-12 text-center"><p class="font-display text-2xl font-semibold">Ningún inmueble coincide</p><p class="text-muted mt-2 text-sm">Prueba con otra zona o rango, o cuéntanos qué buscas y lo localizamos.</p><div class="flex justify-center gap-3 mt-6"><button class="btn btn-ink" data-reset>Quitar filtros</button><button class="btn btn-ghost" data-contacto>Pedir una búsqueda</button></div></div>`;
    $('#grid').innerHTML = l.length ? l.map(card).join('') : vacio;
    $('#listaBody').innerHTML = l.length ? l.map(filaLista).join('') : `<tr><td colspan="9" class="text-center text-muted py-10">Sin resultados</td></tr>`;
    const lista = st.vista === 'lista';
    $('#grid').classList.toggle('hidden', lista);
    $('#listaWrap').classList.toggle('hidden', !lista);
    $('#vTarjetas').className = 'btn btn-sm ' + (lista ? '' : 'btn-ink'); $('#vTarjetas').style.background = lista ? 'transparent' : '';
    $('#vLista').className = 'btn btn-sm ' + (lista ? 'btn-ink' : ''); $('#vLista').style.background = lista ? '' : 'transparent';
    $('#vTarjetas').setAttribute('aria-pressed', !lista); $('#vLista').setAttribute('aria-pressed', lista);
    V.reveal();
  }
  function sync() {
    $('#heroTipo').value = st.cat; $('#heroZona').value = st.zona; $('#heroRango').value = st.rango;
    $('#buscar').value = st.q; $('#orden').value = st.orden;
  }

  /* ---------- Ficha del inmueble ----------
   * Cada inmueble tiene su propia página (/propiedad/REF), armada en el servidor. Desde la colección se va directo a ella. */
  const paginaDe = (ref) => '/propiedad/' + encodeURIComponent(ref);
  const abrir = (ref) => { location.href = paginaDe(ref); };
  // Enlaces antiguos con #/propiedad/REF llevan a la página del inmueble
  function ruta() {
    const m = location.hash.match(/^#\/propiedad\/(.+)$/);
    if (m) location.replace(paginaDe(decodeURIComponent(m[1])));
  }

  /* ---------- Contacto ---------- */
  const mCont = V.modal($('#modalContacto'));
  function abrirContacto(ref) {
    $('#kInteres').innerHTML = disp().map((i) => `<option value="${E(i.ref)}" ${i.ref === ref ? 'selected' : ''}>${E(i.ref)} · ${E(i.titulo)}</option>`).join('') + `<option value="">Búsqueda general o asesoría</option>`;
    if (!ref) $('#kInteres').value = '';
    mCont.open();
  }
  const valida = (nombre, tel) => {
    const ok1 = nombre.value.trim().length >= 2, ok2 = tel.value.replace(/\D/g, '').length >= 8;
    nombre.setAttribute('aria-invalid', !ok1); tel.setAttribute('aria-invalid', !ok2);
    if (!ok1) { nombre.focus(); V.toast('Escribe tu nombre'); return false; }
    if (!ok2) { tel.focus(); V.toast('Revisa tu teléfono'); return false; }
    return true;
  };
  // Envía a la base y solo confirma cuando la base responde; evita doble envío
  const enviar = async (form, datos, alTerminar) => {
    const b = form.querySelector('[type="submit"]'); if (b.disabled) return;
    // Campo trampa: una persona no lo ve; si viene lleno es un bot. Se le responde igual y no se guarda.
    const trampa = form.querySelector('[name="sitio_web"]');
    if (trampa && trampa.value) { form.reset(); alTerminar(); return; }
    b.disabled = true;
    try { await V.store.addProspecto(datos); form.reset(); alTerminar(); }
    catch (err) {
      console.error(err);
      V.toast(err && err.code === 'P0001' ? err.message : 'No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.');
    }
    finally { b.disabled = false; }
  };
  $('#formContacto').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valida($('#kNombre'), $('#kTel'))) return;
    const ref = $('#kInteres').value, i = inv.find((x) => x.ref === ref);
    enviar(e.target, { nombre: $('#kNombre').value.trim(), telefono: $('#kTel').value.trim(), inmuebleId: ref || null, interes: i ? '' : 'Búsqueda general',
      origen: 'Portal web', resumen: 'Solicitud de inspección', nota: $('#kMsg').value.trim() || 'Solicitó agendar una inspección desde el portal.' },
      () => { mCont.close(); V.toast('Solicitud enviada. Te contactamos hoy en horario hábil.'); });
  });
  $('#contCerrar').addEventListener('click', () => mCont.close());
  $('#formConsigna').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valida($('#cNombre'), $('#cTel'))) return;
    enviar(e.target, { nombre: $('#cNombre').value.trim(), telefono: $('#cTel').value.trim(), origen: 'Formulario de consignación',
      interes: `Consigna: ${$('#cTipo').value} · ${$('#cUbic').value.trim() || 's/ubicación'} · ${$('#cSup').value.trim() || 's/superficie'} m²`,
      resumen: 'Solicitud de consignación', nota: $('#cDet').value.trim() || 'Quiere consignar un inmueble.' },
      () => V.toast('Recibimos tu solicitud. Un arquitecto te contactará en menos de 24 horas hábiles.'));
  });

  /* ---------- Simulador ---------- */
  function simular() {
    const cap = +$('#sCap').value, tasa = +$('#sTasa').value / 100, anos = +$('#sAnos').value;
    $('#oCap').textContent = V.mxn(cap); $('#oTasa').textContent = Math.round(tasa * 100) + '%'; $('#oAnos').textContent = anos + (anos === 1 ? ' año' : ' años');
    const fin = cap * Math.pow(1 + tasa, anos), gan = fin - cap;
    $('#simFinal').textContent = V.mxn(fin);
    $('#simGan').textContent = `+${V.mxn(gan)} (+${((gan / cap) * 100).toFixed(1)}%)`;
    let b = '';
    for (let t = 0; t <= anos; t++) {
      const v = cap * Math.pow(1 + tasa, t), h = Math.max(6, (v / fin) * 100), ult = t === anos;
      b += `<div class="flex-1 flex flex-col items-center justify-end gap-1.5 h-full"><div class="w-full rounded-t-md transition-all duration-500" style="height:${h}%;background:${ult ? 'rgb(var(--moss))' : 'rgb(var(--ember) / ' + (0.35 + 0.5 * (t / Math.max(anos, 1))).toFixed(2) + ')'}"></div><span class="num text-[10px] text-muted">${t}</span></div>`;
    }
    $('#simBars').innerHTML = b;
  }
  ['sCap', 'sTasa', 'sAnos'].forEach((id) => $('#' + id).addEventListener('input', simular));
  $('#simVer').addEventListener('click', () => {
    st.rango = V.rango(+$('#sCap').value); st.cat = 'todos'; sync(); render();
    $('#catalogo').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Eventos generales ---------- */
  $('#heroTipo').addEventListener('change', (e) => { st.cat = e.target.value; render(); });
  $('#heroZona').addEventListener('change', (e) => { st.zona = e.target.value; render(); });
  $('#heroRango').addEventListener('change', (e) => { st.rango = e.target.value; render(); });
  $('#buscar').addEventListener('input', (e) => { st.q = e.target.value.trim().toLowerCase(); render(); });
  $('#orden').addEventListener('change', (e) => { st.orden = e.target.value; render(); });
  $('#vTarjetas').addEventListener('click', () => { st.vista = 'tarjetas'; render(); });
  $('#vLista').addEventListener('click', () => { st.vista = 'lista'; render(); });
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { st.cat = b.dataset.tab; sync(); render(); } });

  const abrirDesde = (e) => {
    if (e.target.closest('[data-stop]')) return;
    const c = e.target.closest('[data-ref]'); if (c) abrir(c.dataset.ref);
  };
  ['#grid', '#heroFeatured', '#listaBody'].forEach((s) => {
    const el = $(s);
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-reset]')) { Object.assign(st, { cat: 'todos', zona: 'todas', rango: 'todos', q: '' }); sync(); render(); return; }
      if (e.target.closest('[data-contacto]')) { abrirContacto(''); return; }
      abrirDesde(e);
    });
    el.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-ref]')) { e.preventDefault(); abrir(e.target.dataset.ref); } });
  });
  document.addEventListener('click', (e) => {
    const qx = e.target.closest('[data-quitar]');
    if (qx) { const d = { zona: 'todas', rango: 'todos', q: '' }; st[qx.dataset.quitar] = d[qx.dataset.quitar]; sync(); render(); return; }
    if (e.target.closest('[data-reset-all]')) { Object.assign(st, { cat: 'todos', zona: 'todas', rango: 'todos', q: '' }); sync(); render(); return; }
    const c = e.target.closest('[data-cat]');
    if (c) { st.cat = c.dataset.cat; sync(); render(); }
    const z = e.target.closest('[data-zona]');
    if (z) { st.zona = z.dataset.zona; st.cat = 'todos'; sync(); render(); }
    if (e.target.closest('[data-contacto]') && !e.target.closest('#grid')) abrirContacto('');
    if (e.target.closest('#menuMovil a, #menuMovil button')) { $('#menuMovil').classList.add('hidden'); $('#btnMenu').setAttribute('aria-expanded', 'false'); }
  });
  $('#btnMenu').addEventListener('click', () => { const h = $('#menuMovil').classList.toggle('hidden'); $('#btnMenu').setAttribute('aria-expanded', String(!h)); });
  window.addEventListener('hashchange', ruta);
  window.addEventListener('popstate', ruta);
  window.addEventListener('storage', (e) => { if (e.key && e.key.startsWith('vertice.v2')) { cargar(); render(); } });
  window.addEventListener('vertice:data', () => { cargar(); render(); });

  /* ---------- Arranque ---------- */
  $('#icoBuscar').innerHTML = V.icon('search', 16);
  $('#vTarjetas').innerHTML = V.icon('grid', 15) + '<span class="hidden sm:inline">Tarjetas</span>';
  $('#vLista').innerHTML = V.icon('list', 15) + '<span class="hidden sm:inline">Lista</span>';
  $('#heroZona').innerHTML += Object.entries(D.zonas).map(([k, v]) => `<option value="${E(k)}">${E(v)}</option>`).join('');
  $('#footZonas').innerHTML = Object.entries(D.zonas).map(([k, v]) => `<p><a href="#catalogo" data-zona="${E(k)}" class="hover:text-ember-ink">${E(v)}</a></p>`).join('');
  $('#footMail').textContent = D.config.email; $('#footMail').href = 'mailto:' + D.config.email;
  $('#footWa').textContent = 'WhatsApp +52 415 555 0130'; $('#footWa').href = V.wa('Hola, quisiera información.');
  estatico();
  V.topo($('#heroTopo'));
  V.topo($('#statsTopo'), [{ x: 120, y: 60, n: 8, s: 3 }, { x: 900, y: 140, n: 9, s: 3 }]);
  V.topo($('#metTopo'), [{ x: 860, y: 140, n: 11, s: 4 }, { x: 80, y: 600, n: 8, s: 3 }]);
  V.topo($('#catTopo'), [{ x: 940, y: 80, n: 9, s: 3 }]);
  V.topo($('#simTopo'), [{ x: 880, y: 120, n: 12, s: 5 }, { x: 60, y: 560, n: 9, s: 2 }]);
  cargar(); sync(); render(); simular(); V.tilt(document.body); V.reveal();
  ruta();
  const agendar = new URLSearchParams(location.search).get('agendar');
  if (agendar !== null) { history.replaceState(null, '', location.pathname + location.hash); abrirContacto(disp().some((i) => i.ref === agendar) ? agendar : ''); }
})();
