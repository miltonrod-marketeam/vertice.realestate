/* robots.txt: todo el sitio abierto a buscadores y a motores de IA, excepto la consola */
const L = require('./_lib');

module.exports = (req, res) => {
  const b = L.base(req);
  L.enviar(res, 200, 'text/plain; charset=utf-8', [
    '# Buscadores y motores de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) pueden leer el portal.',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${b}/sitemap.xml`,
    ''
  ].join('\n'), 'public, s-maxage=86400');
};
