/* llms.txt: resumen en texto plano para motores de IA (propuesta llmstxt.org), generado desde la base */
const L = require('./_lib');

module.exports = async (req, res) => {
  try {
    const [inv, zonas] = await Promise.all([L.inmuebles(), L.zonas()]);
    const b = L.base(req), D = L.datos();
    const porZona = Object.entries(zonas).map(([id, nombre]) => {
      const l = inv.filter((i) => i.zona_id === id);
      return `- ${nombre}: ${l.length} ${l.length === 1 ? 'inmueble' : 'inmuebles'}${l.length ? `, desde ${L.mxn(Math.min(...l.map((i) => +i.precio_mxn)))} MXN` : ''}`;
    });
    const txt = [
      `# ${D.config.marca}`,
      '',
      '> Portal inmobiliario de San Miguel de Allende y el Bajío (Guanajuato, México): terrenos campestres, casas de autor, bodegas y ranchos. Cada inmueble se publica con ficha técnica: topografía, asoleamiento, servicios, uso de suelo y situación legal.',
      '',
      'Precios en pesos mexicanos (MXN). La disponibilidad cambia: la página de cada inmueble es la fuente vigente.',
      '',
      '## Inmuebles',
      '',
      ...inv.map((i) => `- [${i.titulo}](${L.urlInmueble(b, i.ref)}): ${L.CAT[i.categoria]?.label || i.categoria} en ${zonas[i.zona_id] || 'San Miguel de Allende'}. ${L.mxn(i.precio_mxn)} MXN, ${L.m2(i.superficie_m2)} de terreno${+i.construccion_m2 > 0 ? `, ${L.m2(i.construccion_m2)} construidos` : ''}. ${i.estatus_legal || ''}.${i.estatus === 'reservado' ? ' Reservado.' : ''}`),
      '',
      '## Zonas',
      '',
      ...porZona,
      '',
      '## Preguntas frecuentes',
      '',
      ...(D.faq || []).flatMap(([q, a]) => [`### ${q}`, '', a, '']),
      '## Contacto',
      '',
      `- Correo: ${D.config.email}`,
      `- WhatsApp: https://wa.me/${D.config.whatsapp}`,
      `- Sitio: ${b}/`,
      ''
    ].join('\n');
    L.enviar(res, 200, 'text/plain; charset=utf-8', txt);
  } catch (e) { L.fallo(res, e); }
};
