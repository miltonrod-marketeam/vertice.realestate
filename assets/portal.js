/* VÉRTICE · lógica del portal público */
(function () {
  'use strict';
  const V = Vertice, D = V.data, E = V.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let inv = [];
  let cur = null; // inmueble abierto en la ficha
  let gi = 0;     // índice de foto
  const st = { cat: 'todos', zona: 'todas', rango: 'todos', q: '', orden: 'destacados', vista: 'tarjetas' };

  const cargar = () => { inv = V.store.inventario().filter((i) => i.estatus === 'publicado' || i.estatus === 'reservado'); };

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
    const f = fotoPrincipal(i), res = i.estatus === 'reservado';
    const msg = `Hola, me interesa el inmueble ${i.ref} (${i.titulo}).`;
    return `<div class="reveal d${(n % 3) + 1}"><article class="card tilt glow-c cat-${E(i.categoria)} cursor-pointer flex flex-col h-full" data-ref="${E(i.ref)}" tabindex="0" role="button" aria-label="Abrir ficha de ${E(i.titulo)}">
      <div class="relative aspect-[4/3] bg-surface2 overflow-hidden over-photo group">
        ${imgTag(f, 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-105')}
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none"></div>
        <div class="absolute top-3 left-3"><span class="chip-c">${E(V.CAT[i.categoria]?.label || i.categoria)}</span></div>
        <span class="absolute top-3 right-3 inline-flex items-center gap-1.5 text-white text-[11px] px-2 py-1 rounded-full bg-black/55">${V.icon('layers', 12)}${(i.fotos || []).length}</span>
        ${res ? '<span class="absolute top-12 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white text-black">Reservado</span>' : ''}
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
          <span class="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1.5 rounded-full" style="color:rgb(var(--ink));background:rgb(var(--ink) / .07)"><span style="color:rgb(var(--ember))" class="inline-flex">${V.icon('shield', 14)}</span>${E(i.estatusLegal)}</span>
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
      <td><div class="font-semibold">${E(i.titulo)}</div><div class="text-xs text-muted">${E(V.CAT[i.categoria]?.label)}</div></td>
      <td class="text-muted whitespace-nowrap">${E(V.zona(i.zona))}</td>
      <td class="num whitespace-nowrap">${V.m2(i.superficieM2)}</td>
      <td class="num whitespace-nowrap text-muted">${E(V.construccion(i))}</td>
      <td class="whitespace-nowrap">${E(i.asoleamiento)}</td>
      <td class="whitespace-nowrap" style="color:rgb(var(--moss))">${E(i.estatusLegal)}</td>
      <td class="num font-semibold whitespace-nowrap">${V.mxn(i.precioMxn)}</td>
      <td class="text-right"><span class="btn btn-ink btn-sm">Ver ficha</span></td></tr>`;
  }

  function hero() {
    const i = inv.find((x) => x.destacado) || inv[0];
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
      <span class="stat-ico">${V.icon(x.ico, 18)}</span>
      <p class="fig text-[36px] sm:text-5xl leading-none mt-5" style="color:rgb(var(--c))">${x.txt ? E(x.txt) : `<span data-count="${x.n}" data-dec="${x.dec}" data-suf="${E(x.suf)}">${E(x.n.toLocaleString('es-MX', { minimumFractionDigits: x.dec, maximumFractionDigits: x.dec }) + x.suf)}</span>`}</p>
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
    const base = inv.filter((i) => coincide(i, true));
    const defs = [['todos', 'Todos'], ...Object.entries(V.CAT).map(([k, v]) => [k, v.corto])];
    $('#tabs').innerHTML = defs.map(([k, label]) => {
      const n = k === 'todos' ? base.length : base.filter((i) => i.categoria === k).length;
      const on = st.cat === k, c = CCOL[k];
      return `<button role="tab" aria-selected="${on}" data-tab="${k}" class="tabpill ${on ? 'on' : ''}" style="--c:var(--${c});--on:${ON[c] || '#fff'}"><i class="dot"></i>${E(label)}<span class="num text-[11px] opacity-70">${n}</span></button>`;
    }).join('');
  }

  /* ---------- Zonas ---------- */
  const ZONA_INFO = {
    'sma-centro': { c: 'ember', ico: 'home', txt: 'Calles empedradas y vida de barrio: casas de autor a pocos pasos de plazas, galerías y mesas.' },
    'cruz-palmar': { c: 'moss', ico: 'sun', txt: 'Terrenos campestres con vista abierta y un trayecto corto al centro.' },
    'atotonilco': { c: 'ochre', ico: 'compass', txt: 'Rumbo a Dolores Hidalgo: ranchos y fincas con superficie amplia y horizonte largo.' },
    'corredor-industrial': { c: 'tide', ico: 'road', txt: 'Sobre la carretera 57: bodegas y naves con acceso para carga.' }
  };
  function zonas() {
    $('#zonasGrid').innerHTML = Object.entries(D.zonas).map(([id, nombre], k) => {
      const z = ZONA_INFO[id] || { c: 'ember', ico: 'map', txt: '' };
      const l = inv.filter((i) => i.zona === id), n = l.length;
      const desde = n ? Math.min(...l.map((i) => i.precioMxn)) : 0;
      return `<a href="#catalogo" data-zona="${E(id)}" class="reveal d${k} zona card glow-c group relative overflow-hidden p-6 min-h-[320px] flex flex-col ${n ? '' : 'opacity-60 pointer-events-none'}" style="--c:var(--${z.c})">
        <div class="topo zt" data-ztopo="${k}"></div>
        <span class="zona-wash"></span>
        <div class="relative"><span class="stat-ico">${V.icon(z.ico, 18)}</span>
          <h3 class="font-display text-2xl font-semibold mt-5 leading-tight">${E(nombre)}</h3>
          <p class="text-[14px] text-muted mt-3 leading-relaxed">${E(z.txt)}</p></div>
        <div class="relative mt-auto pt-7 flex items-end justify-between gap-3">
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
  const FAQ = [
    ['¿Puedo visitar un inmueble antes de decidir?', 'Sí. Agenda una inspección y un asesor te acompaña. Antes de ir recibes la ficha técnica para que la visita sea sobre decisiones y no sobre datos básicos.'],
    ['¿Los precios son negociables?', 'Cada pieza tiene un precio de lista. Cualquier oferta se presenta al propietario por escrito y te respondemos con su decisión.'],
    ['¿Qué documentos debo revisar antes de comprar?', 'Escritura, predial al corriente, certificado de libertad de gravamen y uso de suelo. En cada ficha indicamos cuáles existen y cuáles están en trámite; la validación final la hace tu notario.'],
    ['¿Qué significa que un inmueble esté Reservado?', 'Que hay una oferta aceptada en proceso. Sigue visible en la colección; si te interesa, déjanos tus datos y te avisamos si vuelve a estar disponible.'],
    ['¿Cómo publico mi propiedad?', 'Llena el formulario de consignación al final de esta página. Un asesor revisa tus datos y agenda una visita de lectura del terreno antes de publicarla.']
  ];
  function estatico() {
    $('#rutaGrid').innerHTML = RUTA.map(([t, d, c, ico], k) => `<li class="reveal d${k % 4} ruta card glow-c relative p-6 pt-8" style="--c:var(--${c})">
      <span class="ruta-n">${k + 1}</span><span class="stat-ico mt-1">${V.icon(ico, 18)}</span>
      <h3 class="font-display text-xl font-semibold mt-5">${E(t)}</h3><p class="text-[14px] text-muted mt-2 leading-relaxed">${E(d)}</p></li>`).join('');
    $('#faqList').innerHTML = FAQ.map(([q, a], k) => `<details class="faq card" ${k === 0 ? 'open' : ''}><summary><span>${E(q)}</span><i aria-hidden="true"></i></summary><p>${E(a)}</p></details>`).join('');
    $$('[data-ico]').forEach((el) => { el.innerHTML = V.icon(el.dataset.ico, 22); });
  }

  function render() {
    const l = ordenar(inv.filter((i) => coincide(i)));
    const n = l.length;
    $('#heroCount').textContent = n + (n === 1 ? ' inmueble' : ' inmuebles');
    tabs(); catHead(l); hero(); stats(); zonas();
    const vacio = `<div class="col-span-full card p-12 text-center"><p class="font-display text-2xl font-semibold">Ningún inmueble coincide</p><p class="text-muted mt-2 text-sm">Prueba con otra zona o rango, o cuéntanos qué buscas y lo localizamos.</p><div class="flex justify-center gap-3 mt-6"><button class="btn btn-ink" data-reset>Quitar filtros</button><button class="btn btn-ghost" data-contacto>Pedir una búsqueda</button></div></div>`;
    $('#grid').innerHTML = n ? l.map(card).join('') : vacio;
    $('#listaBody').innerHTML = n ? l.map(filaLista).join('') : `<tr><td colspan="9" class="text-center text-muted py-10">Sin resultados</td></tr>`;
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

  /* ---------- Ficha técnica ---------- */
  const mFicha = V.modal($('#modalFicha'), {
    onClose() { cur = null; if (/^#\/propiedad/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search); }
  });

  function fichaHTML(i) {
    const fotos = (i.fotos || []).filter((f) => V.safeUrl(f.url));
    const f0 = fotos[0] || { url: '', alt: i.titulo };
    const res = i.estatus === 'reservado';
    const metr = [
      ['Inversión', V.mxn(i.precioMxn) + ' MXN', `${V.usd(i.precioMxn)} · ${V.mxn(V.precioM2(i))}/m²`, 'ember', 'coin'],
      ['Superficie', V.m2(i.superficieM2), i.geometria, 'tide', 'ruler'],
      ['Construcción', V.construccion(i), i.normativa, 'ochre', 'building'],
      ['Asoleamiento', i.asoleamiento, i.horasSol > 0 ? `${i.horasSol} h de sol útil al día` : 'Sin carga solar directa', 'ember', 'sun'],
      ['Topografía', i.topografia, i.suelo, 'moss', 'trend'],
      ['Uso de suelo', i.usoSuelo, i.densidad, 'ochre', 'map'],
      ['Situación legal', i.estatusLegal, i.gravamen, 'ember', 'shield'],
      ['Conectividad', i.tiempoAcceso, i.vialidad, 'ochre', 'compass']
    ];
    const serv = [['bolt', 'Energía eléctrica', i.luz], ['drop', 'Agua y drenaje', i.agua], ['scale', 'Registro de propiedad', `${i.estatusLegal} · ${i.gravamen}`], ['road', 'Vialidad y acceso', `${i.vialidad} (${i.tiempoAcceso})`]];
    return `<div class="cat-${E(i.categoria)}">
      <div class="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 sm:px-8 bg-surface/95 backdrop-blur border-b border-line">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2"><span class="chip-c">${E(V.CAT[i.categoria]?.label)}</span><span class="num text-xs text-muted">${E(i.ref)}</span>${res ? '<span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-ink text-paper">Reservado</span>' : ''}</div>
          <h3 id="fichaTitulo" class="font-display text-2xl sm:text-[32px] font-semibold mt-2 leading-tight">${E(i.titulo)}</h3>
          <p class="text-sm text-muted mt-1">${E(i.ubicacion)}</p>
        </div>
        <button class="icon-btn shrink-0" data-close aria-label="Cerrar ficha">${V.icon('x', 18)}</button>
      </div>
      <div class="relative bg-surface2 aspect-[16/10] sm:aspect-[16/8] overflow-hidden over-photo" id="fGal">
        <img id="fMain" src="${E(V.safeUrl(f0.url))}" alt="${E(f0.alt || '')}" onerror="Vertice.imgFallback(this)" class="w-full h-full object-cover transition-opacity duration-200">
        ${fotos.length > 1 ? `<button data-prev class="icon-btn absolute left-3 top-1/2 -translate-y-1/2 !bg-black/55 !border-white/20 !text-white" aria-label="Foto anterior">${V.icon('chevL', 20)}</button>
        <button data-next class="icon-btn absolute right-3 top-1/2 -translate-y-1/2 !bg-black/55 !border-white/20 !text-white" aria-label="Foto siguiente">${V.icon('chevR', 20)}</button>` : ''}
        <span id="fCount" class="num absolute left-3 bottom-3 text-white text-[11px] px-2.5 py-1 rounded-full bg-black/60">1 / ${fotos.length || 1}</span>
        <a href="${E(V.mapaUrl(i))}" target="_blank" rel="noopener" class="btn btn-primary btn-sm absolute right-3 bottom-3">${V.icon('pin', 14)}Abrir en Google Maps</a>
      </div>
      ${fotos.length > 1 ? `<div class="flex gap-2 p-3 sm:px-8 overflow-x-auto no-scrollbar bg-surface2/60 border-b border-line">${fotos.map((f, n) =>
        `<button data-thumb="${n}" class="shrink-0 w-20 h-14 rounded-lg overflow-hidden ${n === 0 ? 'ring-2 ring-ember' : 'opacity-60 hover:opacity-100'}" aria-label="Ver foto ${n + 1}">${imgTag(f, 'w-full h-full object-cover')}</button>`).join('')}</div>` : ''}
      <div class="p-5 sm:p-8 space-y-9">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
          ${metr.map(([t, v, s, c, ic]) => `<div class="pt-3" style="border-top:2px solid rgb(var(--${c}))"><p class="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted font-medium"><span class="shrink-0 w-7 h-7 rounded-lg inline-flex items-center justify-center" style="background:rgb(var(--${c}) / .14);color:rgb(var(--${c}))">${V.icon(ic, 15)}</span>${E(t)}</p><p class="font-display text-[19px] font-semibold leading-snug mt-2.5">${E(v)}</p><p class="text-xs text-muted mt-1 leading-snug">${E(s)}</p></div>`).join('')}
        </div>
        <div class="grid lg:grid-cols-5 gap-8">
          <div class="lg:col-span-3"><h4 class="font-display text-xl font-semibold">Memoria descriptiva</h4><p class="mt-3 text-[15px] leading-relaxed text-muted">${E(i.descripcion)}</p></div>
          <aside class="lg:col-span-2 p-5 rounded-2xl" style="background:rgb(var(--ember) / .09);border-left:3px solid rgb(var(--ember))">
            <p class="eyebrow">Dictamen del arquitecto</p><p class="mt-3 text-[15px] leading-relaxed italic font-display">${E(i.dictamen)}</p></aside>
        </div>
        <div><h4 class="font-display text-xl font-semibold">Servicios y estatus</h4>
          <div class="grid sm:grid-cols-2 gap-3 mt-4">${serv.map(([ic, t, v]) => `<div class="flex gap-3 p-4 rounded-xl border border-line bg-surface2/40"><span class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style="background:rgb(var(--c) / .14);color:rgb(var(--c))">${V.icon(ic, 18)}</span><div><p class="text-[11px] uppercase tracking-wider text-muted">${E(t)}</p><p class="text-sm font-medium mt-0.5">${E(v)}</p></div></div>`).join('')}</div>
          <p class="text-xs text-muted mt-3">Datos referenciales del demo. En producción se confirman en visita y con la documentación.</p></div>
      </div>
      <div class="sticky bottom-0 flex flex-wrap gap-2.5 p-4 sm:px-8 bg-surface/95 backdrop-blur border-t border-line">
        <button class="btn btn-primary flex-1 min-w-[180px]" data-agendar>Agendar inspección</button>
        <a class="btn btn-ghost" target="_blank" rel="noopener" href="${E(V.wa(`Hola, me interesa agendar una inspección del inmueble ${i.ref} (${i.titulo}) en ${i.ubicacion}.`))}">${V.waIcon(16)}WhatsApp</a>
        <button class="btn btn-ghost" data-dossier>${V.icon('download', 16)}Dossier PDF</button>
        <button class="btn btn-ghost" data-copiar>${V.icon('link', 16)}Copiar enlace</button>
      </div></div>`;
  }

  function setFoto(n) {
    const fotos = (cur.fotos || []).filter((f) => V.safeUrl(f.url));
    if (!fotos.length) return;
    gi = (n + fotos.length) % fotos.length;
    const img = $('#fMain'), f = fotos[gi];
    img.style.opacity = '.3';
    setTimeout(() => { img.src = V.safeUrl(f.url); img.alt = f.alt || ''; img.style.opacity = '1'; }, 140);
    $('#fCount').textContent = `${gi + 1} / ${fotos.length}`;
    $$('[data-thumb]').forEach((b) => { const on = +b.dataset.thumb === gi; b.classList.toggle('ring-2', on); b.classList.toggle('ring-ember', on); b.classList.toggle('opacity-60', !on); });
  }

  function abrir(ref, opts = {}) {
    const i = inv.find((x) => x.ref === ref);
    if (!i) { V.toast('Este inmueble ya no está disponible'); return; }
    cur = i; gi = 0;
    $('#fichaBody').innerHTML = fichaHTML(i);
    $('#fichaBody').scrollTop = 0;
    mFicha.open();
    if (!opts.noPush) history.pushState(null, '', '#/propiedad/' + encodeURIComponent(ref));
    document.title = `${i.titulo} · VÉRTICE / SMA`;
  }
  const titulo0 = document.title;
  function ruta() {
    const m = location.hash.match(/^#\/propiedad\/(.+)$/);
    if (m) { const ref = decodeURIComponent(m[1]); if (!mFicha.isOpen || !cur || cur.ref !== ref) abrir(ref, { noPush: true }); }
    else if (mFicha.isOpen) { mFicha.close(); document.title = titulo0; }
  }

  $('#fichaBody').addEventListener('click', (e) => {
    const t = e.target.closest('button,a'); if (!t || !cur) return;
    if (t.hasAttribute('data-close')) { mFicha.close(); document.title = titulo0; }
    else if (t.hasAttribute('data-prev')) setFoto(gi - 1);
    else if (t.hasAttribute('data-next')) setFoto(gi + 1);
    else if (t.dataset.thumb !== undefined) setFoto(+t.dataset.thumb);
    else if (t.hasAttribute('data-agendar')) abrirContacto(cur.ref);
    else if (t.hasAttribute('data-dossier')) dossier(cur);
    else if (t.hasAttribute('data-copiar')) {
      const url = location.origin + location.pathname + '#/propiedad/' + encodeURIComponent(cur.ref);
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => V.toast('Enlace copiado'), () => V.toast(url));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (!mFicha.isOpen) return;
    if (e.key === 'ArrowRight') setFoto(gi + 1); else if (e.key === 'ArrowLeft') setFoto(gi - 1);
  });

  /* ---------- Dossier imprimible (valores escapados) ---------- */
  function dossier(i) {
    const w = window.open('', '_blank');
    if (!w) { V.toast('Habilita las ventanas emergentes para generar el PDF'); return; }
    const fotos = (i.fotos || []).filter((f) => V.safeUrl(f.url));
    const m = [['Inversión', V.mxn(i.precioMxn) + ' MXN', V.usd(i.precioMxn) + ' · ' + V.mxn(V.precioM2(i)) + '/m²'], ['Superficie', V.m2(i.superficieM2), i.geometria], ['Construcción', V.construccion(i), i.normativa],
      ['Asoleamiento', i.asoleamiento, i.horasSol > 0 ? i.horasSol + ' h de sol útil' : 'Sin carga solar directa'], ['Topografía', i.topografia, i.suelo], ['Uso de suelo', i.usoSuelo, i.densidad],
      ['Situación legal', i.estatusLegal, i.gravamen], ['Conectividad', i.tiempoAcceso, i.vialidad]];
    w.document.open();
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Dossier ${E(i.ref)} · ${E(i.titulo)}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Outfit:wght@400;600&display=swap" rel="stylesheet">
<style>@page{size:letter;margin:12mm}body{margin:0;background:#E9E5DE;font:12px/1.5 Outfit,sans-serif;color:#14110F;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.bar{position:sticky;top:0;background:#0A0D12;color:#fff;padding:12px 22px;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #FF5A26}
.bar button{font:600 12px Outfit;border:0;border-radius:8px;padding:9px 16px;cursor:pointer}.p{background:#FF5A26;color:#fff}.s{background:#1C2636;color:#ccd;margin-left:8px}
.sheet{max-width:800px;margin:22px auto;background:#fff;padding:34px 38px;border-radius:10px}
h1{font:600 26px Fraunces,serif;margin:0}h2{font:600 11px Outfit;letter-spacing:.12em;text-transform:uppercase;margin:18px 0 6px;border-bottom:1px solid #E0D9CE;padding-bottom:4px}
.top{display:flex;justify-content:space-between;border-bottom:3px solid #FF5A26;padding-bottom:10px;margin-bottom:14px}.k{color:#6B645C;font-size:11px}
.hero{width:100%;height:230px;object-fit:cover;border-radius:8px}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.g img{width:100%;height:86px;object-fit:cover;border-radius:6px}
.m{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:12px}.m div{border-top:2px solid #FF5A26;padding-top:6px}.m b{display:block;font:600 14px Fraunces,serif}.m small{color:#6B645C}
.q{background:#FFF3EC;border-left:3px solid #FF5A26;padding:9px 12px;margin-top:10px;font-style:italic}.f{margin-top:18px;border-top:1px solid #E0D9CE;padding-top:8px;font-size:10px;color:#6B645C;display:flex;justify-content:space-between}
@media print{body{background:#fff}.bar{display:none}.sheet{margin:0;padding:0;max-width:none;border-radius:0}}</style></head><body>
<div class="bar"><b>VÉRTICE / SMA · Dossier técnico</b><span><button class="p" onclick="window.print()">Imprimir o guardar PDF</button><button class="s" onclick="window.close()">Cerrar</button></span></div>
<div class="sheet"><div class="top"><div><h1>${E(i.titulo)}</h1><div class="k">${E(i.ubicacion)}</div></div><div style="text-align:right"><b>${E(i.ref)}</b><div class="k">${E(V.CAT[i.categoria]?.label)}</div></div></div>
${fotos[0] ? `<img class="hero" src="${E(V.safeUrl(fotos[0].url))}" alt="">` : ''}
${fotos.length > 1 ? `<div class="g">${fotos.slice(1, 4).map((f) => `<img src="${E(V.safeUrl(f.url))}" alt="">`).join('')}</div>` : ''}
<div class="m">${m.map(([a, b, c]) => `<div><small>${E(a)}</small><b>${E(b)}</b><small>${E(c)}</small></div>`).join('')}</div>
<h2>Memoria descriptiva</h2><p>${E(i.descripcion)}</p><div class="q"><b style="font-style:normal">Dictamen del arquitecto.</b> ${E(i.dictamen)}</div>
<h2>Servicios</h2><p><b>Energía:</b> ${E(i.luz)}<br><b>Agua:</b> ${E(i.agua)}<br><b>Vialidad:</b> ${E(i.vialidad)}</p>
<div class="f"><span>VÉRTICE / SMA · ${E(D.config.email)}</span><span>Documento ilustrativo de demo</span></div></div></body></html>`);
    w.document.close(); w.focus();
  }

  /* ---------- Contacto ---------- */
  const mCont = V.modal($('#modalContacto'));
  function abrirContacto(ref) {
    $('#kInteres').innerHTML = inv.map((i) => `<option value="${E(i.ref)}" ${i.ref === ref ? 'selected' : ''}>${E(i.ref)} · ${E(i.titulo)}</option>`).join('') + `<option value="">Búsqueda general o asesoría</option>`;
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
  $('#formContacto').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valida($('#kNombre'), $('#kTel'))) return;
    const ref = $('#kInteres').value, i = inv.find((x) => x.ref === ref);
    V.store.addProspecto({ nombre: $('#kNombre').value.trim(), telefono: $('#kTel').value.trim(), inmuebleId: ref || null, interes: i ? '' : 'Búsqueda general',
      origen: 'Portal web', resumen: 'Solicitud de inspección', nota: $('#kMsg').value.trim() || 'Solicitó agendar una inspección desde el portal.' });
    e.target.reset(); mCont.close(); V.toast('Solicitud enviada. Te contactamos hoy en horario hábil.');
  });
  $('#contCerrar').addEventListener('click', () => mCont.close());
  $('#formConsigna').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!valida($('#cNombre'), $('#cTel'))) return;
    V.store.addProspecto({ nombre: $('#cNombre').value.trim(), telefono: $('#cTel').value.trim(), origen: 'Formulario de consignación',
      interes: `Consigna: ${$('#cTipo').value} · ${$('#cUbic').value.trim() || 's/ubicación'} · ${$('#cSup').value.trim() || 's/superficie'} m²`,
      resumen: 'Solicitud de consignación', nota: $('#cDet').value.trim() || 'Quiere consignar un inmueble.' });
    e.target.reset(); V.toast('Recibimos tu solicitud. Un arquitecto te contactará en menos de 24 horas hábiles.');
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
})();
