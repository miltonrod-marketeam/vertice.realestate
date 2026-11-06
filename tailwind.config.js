// Build de Tailwind para producción. La configuración del tema vive en assets/tailwind-config.js
// (la misma que usaba el CDN), así que solo hay un lugar donde cambiar colores y tipografías.
const fs = require('fs');
const tailwind = {};
new Function('tailwind', fs.readFileSync(__dirname + '/assets/tailwind-config.js', 'utf8'))(tailwind);
module.exports = { ...tailwind.config, content: ['./index.html', './admin/index.html', './assets/*.js'] };
