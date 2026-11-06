/* sitemap.xml generado desde la base: cada inmueble publicado o reservado aparece al guardarlo en la consola */
const L = require('./_lib');

module.exports = async (req, res) => {
  try {
    const inv = await L.inmuebles();
    const b = L.base(req);
    const fecha = (s) => new Date(s).toISOString().slice(0, 10);
    const ultima = inv.reduce((m, i) => (i.actualizado_en > m ? i.actualizado_en : m), inv[0] ? inv[0].actualizado_en : new Date().toISOString());
    const urls = [`  <url><loc>${b}/</loc><lastmod>${fecha(ultima)}</lastmod></url>`]
      .concat(inv.map((i) => `  <url><loc>${L.esc(L.urlInmueble(b, i.ref))}</loc><lastmod>${fecha(i.actualizado_en || i.creado_en)}</lastmod>${i.fotos.slice(0, 5).map((f) => `<image:image><image:loc>${L.esc(f.url)}</image:loc></image:image>`).join('')}</url>`));
    L.enviar(res, 200, 'application/xml; charset=utf-8',
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`);
  } catch (e) { L.fallo(res, e); }
};
