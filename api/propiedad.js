/* Página propia de cada inmueble: /propiedad/REF
 * HTML completo desde el servidor (texto, precio, ficha, fotos) con datos estructurados de schema.org,
 * para que Google y los motores de IA la lean sin ejecutar JavaScript. Mismo sistema visual del portal.
 */
const L = require('./_lib');

const TEMA = `<script>try{if(localStorage.getItem('vertice.theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}</script>`;
const TOGGLE = `<script>document.querySelectorAll('[data-theme-toggle]').forEach(function(b){b.addEventListener('click',function(){var d=document.documentElement.classList.toggle('dark');try{localStorage.setItem('vertice.theme',d?'dark':'light')}catch(e){}})})</script>`;
const LUNA = '<span class="icon-moon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></span>';
const SOL = '<span class="icon-sun"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg></span>';
const LOGO = '<svg width="38" height="38" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#FF5A26"/><path d="M8 9l8 14 8-14" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="23" r="2.4" fill="#0A0D12"/></svg>';
const FALLBACK = `this.onerror=null;this.style.opacity='0'`;

function pagina({ b, titulo, descripcion, canonical, imagen, ld, cuerpo, status = 200 }) {
  const D = L.datos();
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${L.esc(titulo)}</title>
  <meta name="description" content="${L.esc(descripcion)}">
  ${canonical ? `<link rel="canonical" href="${canonical}">` : '<meta name="robots" content="noindex">'}
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_MX">
  <meta property="og:site_name" content="${L.esc(D.config.marca)}">
  <meta property="og:title" content="${L.esc(titulo)}">
  <meta property="og:description" content="${L.esc(descripcion)}">
  ${canonical ? `<meta property="og:url" content="${canonical}">` : ''}
  ${imagen ? `<meta property="og:image" content="${L.esc(imagen)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="theme-color" content="#F6F3EE">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23FF5A26'/%3E%3Cpath d='M8 9l8 14 8-14' stroke='white' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
  ${TEMA}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=JetBrains+Mono:wght@400;600&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/vertice.css">
  <link rel="stylesheet" href="/assets/tailwind.css">
  ${ld || ''}
</head>
<body class="bg-paper text-ink font-sans antialiased">
  <header class="sticky top-0 z-40 bg-paper/85 backdrop-blur-xl border-b border-line">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between gap-4">
      <a href="/" class="flex items-center gap-3 shrink-0" aria-label="${L.esc(D.config.marca)}, inicio">${LOGO}
        <span class="leading-none"><span class="font-display text-[19px] font-semibold tracking-tight block">Vértice <span class="text-ember">/</span> SMA</span>
        <span class="text-[10px] tracking-[.16em] uppercase text-muted block mt-1">Territorio y arquitectura</span></span></a>
      <nav class="hidden md:flex items-center gap-7 text-[14px] font-medium text-muted" aria-label="Principal">
        <a href="/#catalogo" class="hover:text-ink transition">Colección</a><a href="/#zonas" class="hover:text-ink transition">Zonas</a><a href="/#metodo" class="hover:text-ink transition">Método</a>
      </nav>
      <button class="icon-btn" data-theme-toggle aria-label="Cambiar entre tema claro y oscuro" title="Tema claro / oscuro">${LUNA}${SOL}</button>
    </div>
  </header>
  ${cuerpo}
  <footer class="band">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 py-12 flex flex-col sm:flex-row gap-6 justify-between text-sm">
      <div><p class="font-display text-2xl font-semibold">Vértice <span style="color:rgb(var(--ember))">/</span> SMA</p>
        <p class="mt-2 max-w-sm" style="color:rgb(var(--muted))">Terrenos, casas de autor, bodegas y fincas en San Miguel de Allende y el Bajío.</p></div>
      <div class="space-y-2"><p><a class="hover:text-ember-ink" href="mailto:${L.esc(D.config.email)}">${L.esc(D.config.email)}</a></p>
        <p><a class="hover:text-ember-ink" href="https://wa.me/${L.esc(D.config.whatsapp)}" target="_blank" rel="noopener">WhatsApp</a></p>
        <p><a class="hover:text-ember-ink" href="/">Ver la colección completa</a></p></div>
    </div>
  </footer>
  ${TOGGLE}
</body>
</html>`;
}

const fila = (k, v) => (v ? `<div class="py-3 border-b border-line last:border-0 grid grid-cols-[42%_1fr] gap-4"><dt class="text-[13px] text-muted">${L.esc(k)}</dt><dd class="text-[14px] font-medium">${L.esc(v)}</dd></div>` : '');
const grupo = (titulo, c, filas) => {
  const html = filas.map(([k, v]) => fila(k, v)).join('');
  return html ? `<section class="card p-6" style="--c:var(--${c})"><h2 class="chip-c">${L.esc(titulo)}</h2><dl class="mt-3">${html}</dl></section>` : '';
};

module.exports = async (req, res) => {
  const b = L.base(req);
  const ref = String((req.query && req.query.ref) || new URL(req.url, b).searchParams.get('ref') || '').toUpperCase();
  try {
    const [inv, zonas] = await Promise.all([L.inmuebles(), L.zonas()]);
    const i = inv.find((x) => x.ref === ref);
    if (!i) {
      const cuerpo = `<main class="max-w-3xl mx-auto px-5 sm:px-8 py-24"><p class="eyebrow">Referencia ${L.esc(ref || '—')}</p>
        <h1 class="font-display text-4xl font-semibold mt-3">Este inmueble ya no está en la colección</h1>
        <p class="text-muted mt-4">Puede que se haya vendido o que la referencia esté mal escrita.</p>
        <a class="btn btn-primary mt-8" href="/#catalogo">Ver los inmuebles disponibles</a></main>`;
      return L.enviar(res, 404, 'text/html; charset=utf-8', pagina({ b, titulo: 'Inmueble no encontrado · VÉRTICE / SMA', descripcion: 'El inmueble no está disponible.', cuerpo }), 'public, s-maxage=60');
    }
    const D = L.datos();
    const url = L.urlInmueble(b, i.ref);
    const cat = L.CAT[i.categoria] || { label: i.categoria, plural: i.categoria, c: 'ember' };
    const zona = zonas[i.zona_id] || '';
    const reservado = i.estatus === 'reservado';
    const fotos = i.fotos.length ? i.fotos : [];
    const precioM2 = i.superficie_m2 > 0 ? Math.round(i.precio_mxn / i.superficie_m2) : 0;
    const dist = L.km(L.PARROQUIA, [+i.lat, +i.lng]);
    const descripcion = `${cat.label} en ${zona || 'San Miguel de Allende'}: ${L.m2(i.superficie_m2)}, ${L.mxn(i.precio_mxn)} MXN. ${String(i.descripcion || '').slice(0, 110)}`.slice(0, 158);
    const wa = `https://wa.me/${D.config.whatsapp}?text=${encodeURIComponent(`Hola, me interesa ${i.ref} · ${i.titulo}. ${url}`)}`;
    const mapa = `https://www.google.com/maps?q=${i.lat},${i.lng}`;
    const otros = inv.filter((x) => x.ref !== i.ref).sort((a, z) => (a.categoria === i.categoria ? -1 : 0) - (z.categoria === i.categoria ? -1 : 0)).slice(0, 3);

    const propiedades = [
      ['Superficie del terreno', L.m2(i.superficie_m2)], ['Construcción', +i.construccion_m2 > 0 ? L.m2(i.construccion_m2) : null],
      ['Uso de suelo', i.uso_suelo], ['Topografía', i.topografia], ['Asoleamiento', i.asoleamiento], ['Situación legal', i.estatus_legal],
      ['Gravamen', i.gravamen], ['Electricidad', i.luz], ['Agua', i.agua], ['Acceso', i.vialidad], ['Tiempo de traslado', i.tiempo_acceso]
    ].filter(([, v]) => v);
    const ld = L.jsonld({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'RealEstateListing', '@id': `${url}#anuncio`, url, name: i.titulo, description: i.descripcion || descripcion,
          datePosted: i.creado_en, dateModified: i.actualizado_en, inLanguage: 'es-MX', image: fotos.map((f) => f.url),
          offers: {
            '@type': 'Offer', price: +i.precio_mxn, priceCurrency: 'MXN', url,
            availability: reservado ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
            seller: { '@id': `${b}/#agencia` }
          },
          about: { '@id': `${url}#inmueble` }, isPartOf: { '@id': `${b}/#sitio` }
        },
        {
          '@type': i.categoria === 'casa' ? 'House' : 'Place', '@id': `${url}#inmueble`, name: i.titulo,
          address: { '@type': 'PostalAddress', streetAddress: i.ubicacion, addressRegion: 'Guanajuato', addressCountry: 'MX' },
          geo: { '@type': 'GeoCoordinates', latitude: +i.lat, longitude: +i.lng }, hasMap: mapa,
          ...(i.categoria === 'casa' && +i.construccion_m2 > 0 ? { floorSize: { '@type': 'QuantitativeValue', value: +i.construccion_m2, unitCode: 'MTK' } } : {}),
          additionalProperty: propiedades.map(([name, value]) => ({ '@type': 'PropertyValue', name, value }))
        },
        {
          '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${b}/` },
            { '@type': 'ListItem', position: 2, name: cat.plural, item: `${b}/#catalogo` },
            { '@type': 'ListItem', position: 3, name: i.titulo, item: url }
          ]
        },
        L.agencia(b)
      ]
    });

    const galeria = fotos.length ? `
      <figure class="card overflow-hidden over-photo relative aspect-[4/3]">
        <img src="${L.esc(fotos[0].url)}" alt="${L.esc(fotos[0].alt || i.titulo)}" class="w-full h-full object-cover" fetchpriority="high" onerror="${FALLBACK}">
        <div class="absolute top-4 left-4 flex gap-2"><span class="chip-c">${L.esc(cat.label)}</span>${reservado ? '<span class="etq bg-white text-black">Reservado</span>' : ''}</div>
      </figure>
      ${fotos.length > 1 ? `<ul class="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">${fotos.slice(1).map((f) => `<li class="card overflow-hidden aspect-[4/3]"><img src="${L.esc(f.url)}" alt="${L.esc(f.alt || i.titulo)}" loading="lazy" class="w-full h-full object-cover" onerror="${FALLBACK}"></li>`).join('')}</ul>` : ''}`
      : '';
    const cuerpo = `
  <main class="cat-${L.esc(i.categoria)}">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 pt-8 lg:pt-12 pb-16">
      <nav aria-label="Ruta" class="num text-[12px] text-muted"><a href="/" class="hover:text-ink">Inicio</a> / <a href="/#catalogo" class="hover:text-ink">${L.esc(cat.plural)}</a> / <span style="color:rgb(var(--c))">${L.esc(i.ref)}</span></nav>
      <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 mt-6">
        <div class="lg:col-span-7">${galeria}</div>
        <div class="lg:col-span-5">
          <p class="num text-[13px] font-semibold" style="color:rgb(var(--c))">${L.esc(i.ref)} · ${L.esc(zona)}</p>
          <h1 class="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] mt-3">${L.esc(i.titulo)}</h1>
          <p class="text-muted mt-3">${L.esc(i.ubicacion)}</p>
          <div class="mt-7 pl-4" style="border-left:3px solid rgb(var(--c))">
            <p class="font-display text-4xl font-semibold leading-none">${L.mxn(i.precio_mxn)} <span class="font-sans text-sm font-medium text-muted">MXN</span></p>
            <p class="num text-[13px] text-muted mt-2">${L.usd(i.precio_mxn)} · ${L.mxn(precioM2)}/m²${reservado ? ' · <strong style="color:rgb(var(--ember-ink))">Reservado</strong>' : ''}</p>
          </div>
          <dl class="grid grid-cols-3 gap-3 mt-7">
            ${[['Terreno', L.m2(i.superficie_m2), 'tide'], ['Construcción', +i.construccion_m2 > 0 ? L.m2(i.construccion_m2) : 'Lote libre', 'ember'], ['Plusvalía zona', '▲ ' + (+i.plusvalia_zona_pct) + '% est.', 'ochre']]
              .map(([k, v, c]) => `<div class="rounded-xl px-3 py-3" style="background:rgb(var(--${c}) / .11);box-shadow:inset 0 -2px 0 rgb(var(--${c}) / .85)"><dt class="text-[11px] text-muted">${k}</dt><dd class="num text-[13px] font-semibold mt-1" style="color:rgb(var(--${c}))">${L.esc(v)}</dd></div>`).join('')}
          </dl>
          <div class="flex flex-wrap gap-3 mt-8">
            <a class="btn btn-primary" href="${L.esc(wa)}" target="_blank" rel="noopener">Preguntar por WhatsApp</a>
            <a class="btn btn-ghost" href="/#/propiedad/${encodeURIComponent(i.ref)}">Agendar inspección</a>
          </div>
          <p class="num text-[12px] text-muted mt-6">${(+i.lat).toFixed(4)}° N · ${Math.abs(+i.lng).toFixed(4)}° O · ${dist < 1.5 ? 'en el centro' : Math.round(dist) + ' km a la Parroquia'} · <a class="underline underline-offset-4 hover:text-ink" href="${mapa}" target="_blank" rel="noopener">Ver en el mapa</a></p>
        </div>
      </div>

      <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 mt-14">
        <article class="lg:col-span-7">
          <h2 class="font-display text-3xl font-semibold">Descripción</h2>
          <p class="mt-4 text-[17px] leading-relaxed">${L.esc(i.descripcion || '')}</p>
          ${i.dictamen ? `<h2 class="font-display text-3xl font-semibold mt-12">Dictamen del arquitecto</h2>
          <blockquote class="mt-4 pl-5 text-[17px] leading-relaxed italic font-display" style="border-left:3px solid rgb(var(--c))">${L.esc(i.dictamen)}</blockquote>` : ''}
          <p class="text-xs text-muted mt-10">Datos referenciales. Se confirman en visita y con la documentación ante notario.</p>
        </article>
        <div class="lg:col-span-5 space-y-5">
          ${grupo('Terreno', 'tide', [['Geometría', i.geometria], ['Normativa', i.normativa], ['Topografía', i.topografia], ['Suelo', i.suelo], ['Asoleamiento', i.asoleamiento && `${i.asoleamiento}${+i.horas_sol ? ` · ${i.horas_sol} h de sol` : ''}`]])}
          ${grupo('Situación legal', 'ember', [['Estatus', i.estatus_legal], ['Gravamen', i.gravamen], ['Uso de suelo', i.uso_suelo], ['Densidad', i.densidad]])}
          ${grupo('Servicios y acceso', 'ochre', [['Electricidad', i.luz], ['Agua', i.agua], ['Vialidad', i.vialidad], ['Traslado', i.tiempo_acceso]])}
        </div>
      </div>

      ${otros.length ? `<section class="mt-20">
        <h2 class="font-display text-3xl font-semibold">Otros inmuebles de la colección</h2>
        <ul class="grid sm:grid-cols-3 gap-6 mt-6">${otros.map((o) => `<li class="cat-${L.esc(o.categoria)}"><a class="card glow-c block overflow-hidden" href="/propiedad/${encodeURIComponent(o.ref)}">
          <div class="aspect-[4/3] bg-surface2 over-photo relative">${o.fotos[0] ? `<img src="${L.esc(o.fotos[0].url)}" alt="${L.esc(o.fotos[0].alt || o.titulo)}" loading="lazy" class="w-full h-full object-cover" onerror="${FALLBACK}">` : ''}
            <span class="chip-c absolute top-3 left-3">${L.esc(L.CAT[o.categoria]?.label || o.categoria)}</span></div>
          <div class="p-5"><p class="font-display text-xl font-semibold">${L.esc(o.titulo)}</p><p class="num text-[13px] text-muted mt-1">${L.mxn(o.precio_mxn)} MXN · ${L.m2(o.superficie_m2)}</p></div></a></li>`).join('')}</ul>
      </section>` : ''}
    </div>
  </main>`;
    L.enviar(res, 200, 'text/html; charset=utf-8', pagina({
      b, titulo: `${i.titulo} · ${cat.label} en ${zona || 'San Miguel de Allende'} · VÉRTICE / SMA`, descripcion, canonical: url,
      imagen: fotos[0] && fotos[0].url, ld, cuerpo
    }));
  } catch (e) { L.fallo(res, e); }
};
