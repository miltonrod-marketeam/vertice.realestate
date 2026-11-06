/* VÉRTICE · utilidades compartidas de las funciones de Vercel (páginas para buscadores y motores de IA).
 * Los archivos de /api que empiezan con "_" no se publican como rutas.
 * Lee de Supabase con la clave pública: solo ve lo que RLS permite al público (publicados y reservados).
 */
const fs = require('fs');
const path = require('path');

const SB_URL = 'https://qlrcwlrrkdcnrnnvupmd.supabase.co';
const SB_KEY = 'sb_publishable_CqNK64R-RffqpgeMcIk38A_FNuX6dXd';
const ROOT = path.join(__dirname, '..');
const PARROQUIA = [20.9144, -100.7452];

let _cfg;
function datos() {
  if (_cfg) return _cfg;
  const w = {};
  new Function('window', fs.readFileSync(path.join(ROOT, 'data/inventario.js'), 'utf8'))(w);
  return (_cfg = w.VERTICE_DATA);
}

async function sb(q, token) {
  // Con el token del personal (cookie de la consola) la base deja ver también vendidos vencidos y borradores
  const r = await fetch(`${SB_URL}/rest/v1/${q}`, { headers: { apikey: SB_KEY, Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return r.json();
}
const SELECT = 'select=*,fotos(url,alt,orden)';
async function inmuebles() {
  const l = await sb(`inmuebles?${SELECT}&estatus=in.(publicado,reservado)&order=destacado.desc,creado_en.desc`);
  l.forEach((i) => { i.fotos = (i.fotos || []).sort((a, b) => a.orden - b.orden); });
  return l;
}
const VENDIDO_DIAS = 10;
const enVentana = (i) => !!i.vendido_en && new Date(i.vendido_en).getTime() + VENDIDO_DIAS * 864e5 > Date.now();
const publico = (i) => i.estatus === 'publicado' || i.estatus === 'reservado' || (i.estatus === 'vendido' && enVentana(i));
// Un inmueble por referencia. Con token: el personal lo ve aunque ya no sea público; si el token venció, se cae a lo público.
async function inmueble(ref, token) {
  const q = `inmuebles?${SELECT}&ref=eq.${encodeURIComponent(ref)}&limit=1`;
  let l;
  try { l = await sb(q, token); } catch (e) { if (!token) throw e; l = await sb(q); }
  const i = l[0];
  if (i) i.fotos = (i.fotos || []).sort((a, b) => a.orden - b.orden);
  return i || null;
}
const cookie = (req, nombre) => {
  const m = String(req.headers.cookie || '').split(/;\s*/).find((c) => c.startsWith(nombre + '='));
  return m ? m.slice(nombre.length + 1) : '';
};
async function zonas() {
  const l = await sb('zonas?select=id,nombre&order=nombre');
  return Object.fromEntries(l.map((z) => [z.id, z.nombre]));
}

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const base = (req) => `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
const urlInmueble = (b, ref) => `${b}/propiedad/${encodeURIComponent(ref)}`;
const mxn = (n) => '$' + Math.round(+n).toLocaleString('es-MX');
const usd = (n) => 'US$' + Math.round(+n / datos().config.tipoCambio).toLocaleString('en-US');
const m2 = (n) => Number(n).toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' m²';
const CAT = {
  terreno: { label: 'Terreno campestre', plural: 'Terrenos', c: 'moss' },
  casa: { label: 'Casa de autor', plural: 'Casas de autor', c: 'ember' },
  bodega: { label: 'Bodega y nave', plural: 'Bodegas y naves', c: 'tide' },
  rancho: { label: 'Rancho y finca', plural: 'Ranchos y fincas', c: 'ochre' }
};
const km = (a, b) => {
  const r = Math.PI / 180, dl = (b[0] - a[0]) * r, dn = (b[1] - a[1]) * r;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dn / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
// JSON-LD seguro dentro de <script>: evita cerrar la etiqueta desde los datos
const jsonld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

function agencia(b) {
  const c = datos().config;
  return {
    '@type': 'RealEstateAgent', '@id': `${b}/#agencia`, name: c.marca, url: `${b}/`,
    email: c.email, telephone: '+' + c.whatsapp,
    areaServed: [{ '@type': 'City', name: 'San Miguel de Allende' }, { '@type': 'State', name: 'Guanajuato' }],
    address: { '@type': 'PostalAddress', addressLocality: 'San Miguel de Allende', addressRegion: 'Guanajuato', addressCountry: 'MX' }
  };
}

function enviar(res, status, tipo, cuerpo, cache = 'public, s-maxage=300, stale-while-revalidate=3600') {
  res.statusCode = status;
  res.setHeader('Content-Type', tipo);
  res.setHeader('Cache-Control', cache);
  res.end(cuerpo);
}
function fallo(res, e) {
  console.error(e);
  enviar(res, 503, 'text/plain; charset=utf-8', 'Servicio no disponible por el momento. Intenta en unos minutos.', 'no-store');
}

module.exports = { VENDIDO_DIAS, enVentana, publico, inmueble, cookie, ROOT, PARROQUIA, datos, inmuebles, zonas, esc, base, urlInmueble, mxn, usd, m2, CAT, km, jsonld, agencia, enviar, fallo };
