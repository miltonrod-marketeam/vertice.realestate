/* Portada: sirve portal.html con el contenido ya incluido en el HTML.
 * Los buscadores y los motores de IA que no ejecutan JavaScript ven el catálogo, las preguntas frecuentes
 * y los datos estructurados; en el navegador, portal.js reemplaza ese contenido con la versión interactiva.
 */
const fs = require('fs');
const path = require('path');
const L = require('./_lib');

let plantilla;

module.exports = async (req, res) => {
  try {
    plantilla = plantilla || fs.readFileSync(path.join(L.ROOT, 'portal.html'), 'utf8');
    const [inv, zonas] = await Promise.all([L.inmuebles(), L.zonas()]);
    const b = L.base(req), D = L.datos();
    const destacada = inv.find((i) => i.destacado) || inv[0];
    const img = destacada && destacada.fotos[0] ? destacada.fotos[0].url : null;

    const tarjetas = inv.map((i) => `<article class="card p-6">
      <p class="num text-xs text-muted">${L.esc(i.ref)} · ${L.esc(zonas[i.zona_id] || '')}</p>
      <h3 class="font-display text-2xl font-semibold mt-2"><a href="/propiedad/${encodeURIComponent(i.ref)}">${L.esc(i.titulo)}</a></h3>
      <p class="mt-1 text-sm">${L.esc(L.CAT[i.categoria]?.label || i.categoria)} · ${L.mxn(i.precio_mxn)} MXN · ${L.m2(i.superficie_m2)}${i.estatus === 'reservado' ? ' · Reservado' : ''}</p>
      <p class="mt-3 text-sm text-muted">${L.esc(i.descripcion || '')}</p></article>`).join('');
    const faqs = (D.faq || []).map(([q, a]) => `<details class="faq card"><summary><span>${L.esc(q)}</span><i aria-hidden="true"></i></summary><p>${L.esc(a)}</p></details>`).join('');

    const ld = L.jsonld({
      '@context': 'https://schema.org',
      '@graph': [
        L.agencia(b),
        { '@type': 'WebSite', '@id': `${b}/#sitio`, url: `${b}/`, name: D.config.marca, inLanguage: 'es-MX', publisher: { '@id': `${b}/#agencia` } },
        {
          '@type': 'ItemList', '@id': `${b}/#coleccion`, name: 'Inmuebles en San Miguel de Allende y el Bajío',
          numberOfItems: inv.length,
          itemListElement: inv.map((i, k) => ({ '@type': 'ListItem', position: k + 1, url: L.urlInmueble(b, i.ref), name: i.titulo }))
        },
        { '@type': 'FAQPage', '@id': `${b}/#preguntas`, mainEntity: (D.faq || []).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
      ]
    });
    const head = [
      `<link rel="canonical" href="${b}/">`,
      `<meta property="og:url" content="${b}/">`,
      `<meta property="og:locale" content="es_MX">`,
      `<meta property="og:site_name" content="${L.esc(D.config.marca)}">`,
      img ? `<meta property="og:image" content="${L.esc(img)}">` : '',
      `<meta name="twitter:card" content="summary_large_image">`,
      `<link rel="alternate" type="text/plain" title="Resumen para motores de IA" href="${b}/llms.txt">`,
      ld
    ].filter(Boolean).join('\n  ');

    let html = plantilla.replace('</head>', `  ${head}\n</head>`);
    html = html.replace(/(<div id="grid"[^>]*>)(<\/div>)/, `$1${tarjetas}$2`);
    html = html.replace(/(<div id="faqList"[^>]*>)(<\/div>)/, `$1${faqs}$2`);
    html = html.replace(/(<strong id="heroCount"[^>]*>)[^<]*(<\/strong>)/, `$1${inv.length} ${inv.length === 1 ? 'inmueble' : 'inmuebles'}$2`);
    L.enviar(res, 200, 'text/html; charset=utf-8', html);
  } catch (e) {
    // Si la base no responde, la portada se sirve igual: el navegador carga los datos por su cuenta
    try { L.enviar(res, 200, 'text/html; charset=utf-8', plantilla || fs.readFileSync(path.join(L.ROOT, 'portal.html'), 'utf8'), 'no-store'); console.error(e); }
    catch (e2) { L.fallo(res, e2); }
  }
};
