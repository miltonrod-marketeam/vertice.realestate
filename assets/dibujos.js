/* VÉRTICE · dibujos técnicos propios (sustituyen a los íconos genéricos)
 * Trazo fino en el color de cada sección (currentColor = rgb(var(--c))), en el lenguaje
 * de un plano: cotas, cortes de terreno, sellos y siluetas de cada zona.
 * Uso: Vertice.dib.nombre() devuelve el <svg>; los elementos con data-dib="nombre" se llenan solos.
 */
(function () {
  'use strict';
  const V = (window.Vertice = window.Vertice || {});
  const p = (d, extra = '') => `<path d="${d}" ${extra}/>`;
  const t = (x, y, txt, extra = '') => `<text x="${x}" y="${y}" ${extra}>${txt}</text>`;
  const svg = (vb, cuerpo, label) =>
    `<svg class="dibujo" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}">${cuerpo}</svg>`;
  const tenue = 'class="tn"';
  // Cota horizontal con marcas en los extremos y texto centrado en un hueco
  const cota = (x1, x2, y, txt, fs = 9) => {
    const m = (x1 + x2) / 2, w = txt.length * fs * 0.32 + 4;
    return p(`M${x1} ${y - 3} V${y + 3} M${x2} ${y - 3} V${y + 3} M${x1} ${y} H${m - w} M${m + w} ${y} H${x2}`, tenue) +
      t(m, y + fs * 0.35, txt, `text-anchor="middle" font-size="${fs}"`);
  };
  // Achurado bajo un perfil de terreno (lista de puntos)
  const achurado = (pts, paso, largo) => {
    let d = '';
    for (let x = pts[0][0] + 4; x < pts[pts.length - 1][0]; x += paso) {
      let k = 0; while (pts[k + 1][0] < x) k++;
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], y = y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
      d += `M${x.toFixed(1)} ${(y + 2).toFixed(1)} l${-largo * 0.6} ${largo}`;
    }
    return p(d, tenue);
  };
  const check = (x, y) => p(`M${x} ${y} h7 v7 h-7 Z`) + p(`M${x + 1.5} ${y + 3.6} l1.9 1.9 l3.3 -4`);
  const pendiente = (x, y) => p(`M${x} ${y} h7 v7 h-7 Z`) + p(`M${x + 2} ${y + 3.5} h3`);

  const dib = {
    /* ---------- Ruta de compra ---------- */
    r1: () => svg('0 0 200 80',
      p('M30 14 L132 10 L140 56 L24 60 Z') +
      p('M33 44 C60 30 92 46 136 30', tenue) + p('M28 53 C62 42 98 56 138 45', tenue) + p('M32 30 C62 20 96 30 133 18', tenue) +
      p('M168 66 C160 52 128 46 98 40', 'stroke-dasharray="1.5 3.5"') +
      p('M176 12 L181 28 L176 24.5 L171 28 Z', 'fill="currentColor"') + t(176, 40, 'N', 'text-anchor="middle" font-size="9"') +
      cota(24, 140, 71, '25.5 m'), 'Plano del lote con curvas de nivel, recorrido y norte'),
    r2: () => svg('0 0 200 80',
      p('M24 6 H74 L86 18 V74 H24 Z') + p('M74 6 V18 H86', tenue) +
      t(32, 21, 'OFERTA', 'font-size="8"') + p('M32 30 H78 M32 37 H78 M32 44 H64', tenue) +
      p('M32 61 c4 -9 8 6 12 -2 s6 -7 10 1 s8 -4 12 -1') + p('M30 66 H80', tenue) +
      p('M92 40 H110 M106 36 L110 40 L106 44') +
      p('M116 26 H182 V54 H116 L106 40 Z') + p('M122 40 a3 3 0 1 0 0.01 0', tenue) +
      t(152, 44, '$6.8 M', 'text-anchor="middle" font-size="10"'), 'Carta oferta firmada y precio propuesto'),
    r3: () => svg('0 0 200 80',
      p('M60 8 a28 28 0 1 0 0.01 0') + p('M60 15 a21 21 0 1 0 0.01 0', 'class="tn" stroke-dasharray="2 2.5"') +
      t(60, 35, 'NOTARÍA', 'text-anchor="middle" font-size="7"') + t(60, 45, 'Nº 12', 'text-anchor="middle" font-size="9"') +
      p('M50 61 L44 75 L51 71.5 L55 76 L57 63') + p('M70 61 L76 75 L69 71.5 L65 76 L63 63') +
      check(104, 16) + t(118, 22.5, 'ESCRITURA', 'font-size="8"') +
      check(104, 34) + t(118, 40.5, 'PREDIAL', 'font-size="8"') +
      check(104, 52) + t(118, 58.5, 'GRAVAMEN', 'font-size="8"'), 'Sello notarial y revisión de documentos'),
    r4: () => svg('0 0 200 80',
      p('M18 10 H182 M18 18 H160 M18 26 H174', tenue) +
      p('M24 52 c6 -13 10 9 16 -2 s8 -11 12 0 s6 4 10 -5') + p('M18 58 H90') + t(54, 70, 'VENDE', 'text-anchor="middle" font-size="8"') +
      p('M118 52 c4 -11 9 7 13 -3 s9 -9 14 1 s7 2 11 -6') + p('M110 58 H182') + t(146, 70, 'COMPRA', 'text-anchor="middle" font-size="8"'),
      'Contrato con dos firmas'),
    r5: () => svg('0 0 200 80',
      `<g transform="rotate(-6 100 40)">` + p('M34 16 H166 V64 H34 Z') + p('M39 21 H161 V59 H39 Z', tenue) +
      t(100, 40, 'INSCRITO', 'text-anchor="middle" font-size="13" letter-spacing="2"') +
      t(100, 53, 'RPP · FOLIO 0412', 'text-anchor="middle" font-size="8"') + `</g>`, 'Sello de inscripción en el Registro Público'),

    /* ---------- Método ---------- */
    m1: () => {
      const suelo = [[8, 66], [60, 61], [110, 53], [160, 47], [212, 43]];
      return svg('0 0 220 84',
        p('M26 66 A86 58 0 0 1 198 66', 'class="tn" stroke-dasharray="2 4"') + p('M150 16 a6 6 0 1 0 0.01 0') +
        p('M' + suelo.map((q) => q.join(' ')).join(' L')) + achurado(suelo, 7, 9) +
        t(14, 47, 'PENDIENTE +4%', 'font-size="7"') + t(160, 19, 'SO · 6.5 h', 'font-size="7"'), 'Corte del terreno con pendiente y recorrido del sol');
    },
    m2: () => svg('0 0 220 84',
      p('M20 22 H76 V78 H20 Z', tenue) + p('M28 15 H84 V71 H28 Z', tenue) +
      p('M36 8 H82 L92 18 V64 H36 Z') + p('M82 8 V18 H92', tenue) + p('M43 28 H84 M43 35 H84 M43 42 H72', tenue) +
      t(43, 56, 'FOLIO', 'font-size="7"') +
      check(116, 16) + t(130, 22.5, 'ESCRITURA', 'font-size="7.5"') +
      check(116, 34) + t(130, 40.5, 'PREDIAL', 'font-size="7.5"') +
      pendiente(116, 52) + t(130, 58.5, 'EN TRÁMITE', 'font-size="7.5"'), 'Expediente con documentos revisados y uno en trámite'),
    m3: () => svg('0 0 220 84',
      p('M8 64 H212 M8 78 H212') + p('M8 71 H212', 'class="tn" stroke-dasharray="6 5"') +
      p('M36 10 H112 V52 H36 Z') + p('M70 52 V64', tenue) + t(74, 34, 'LOTE', 'text-anchor="middle" font-size="7.5"') +
      p('M166 26 a4 4 0 1 0 0.01 0') + p('M163 23 l6 6 M169 23 l-6 6', tenue) + t(166, 44, 'CFE', 'text-anchor="middle" font-size="7.5"') +
      cota(112, 162, 18, '35 m', 7.5) + t(206, 58, '20 MIN AL CENTRO →', 'text-anchor="end" font-size="6.5" class="tf"'),
      'Plano de acceso con distancia a la red eléctrica'),

    /* ---------- Siluetas por zona ---------- */
    'sma-centro': () => svg('0 0 240 112',
      p('M0 104 H240') +
      p('M0 104 V82 H28 V76 H58 V84 H80', tenue) + p('M160 86 H186 V78 H212 V88 H240 V104', tenue) +
      p('M10 90 h6 v6 h-6 Z M40 86 h6 v6 h-6 Z M194 90 h6 v6 h-6 Z M222 94 h6 v6 h-6 Z', tenue) +
      p('M80 104 V60 L87 46 L94 60 V104 M146 104 V60 L153 46 L160 60 V104') +
      p('M100 104 V44 H140 V104 M96 64 H144 M100 44 L120 10 L140 44 M104 44 L107 33 L110 44 M130 44 L133 33 L136 44') +
      p('M120 10 V3 M117 5.5 H123') + p('M112 104 V92 Q120 80 128 92 V104') + p('M115 58 Q120 50 125 58 V70 H115 Z', tenue),
      'Silueta de la Parroquia de San Miguel Arcángel'),
    'cruz-palmar': () => svg('0 0 240 112',
      p('M0 86 C34 80 64 84 96 81 C140 77 190 83 240 78', 'class="tn" stroke-dasharray="3 4"') +
      p('M0 104 C70 100 170 102 240 98') +
      p('M122 102 C120 88 116 80 106 72 M122 102 C124 90 130 82 142 74 M112 78 C102 72 94 68 86 64 M128 86 C136 82 146 80 156 76') +
      p('M58 62 C52 56 62 48 74 50 C80 40 98 40 104 46 C112 36 136 38 140 46 C150 40 172 44 172 52 C186 52 190 62 176 64 C166 70 150 64 140 67 C124 71 110 66 98 69 C84 72 70 70 64 66 C60 66 56 64 58 62 Z') +
      p('M30 102 c3 -8 9 -8 12 0 M196 99 c3 -7 8 -7 11 0', tenue), 'Silueta de un mezquite en campo abierto'),
    'atotonilco': () => {
      // Olivo: tronco corto y torcido que se abre en dos, copa ancha de varios lóbulos
      const olivo = (x, s) => {
        const P = (dx, dy) => `${(x + dx * s).toFixed(1)} ${(102 - dy * s).toFixed(1)}`;
        return p(`M${P(-3, 0)} C${P(-5, 8)} ${P(2, 10)} ${P(-1, 18)} M${P(3, 0)} C${P(5, 7)} ${P(0, 12)} ${P(4, 19)}`) +
          p(`M${P(-1, 18)} C${P(-6, 22)} ${P(-12, 22)} ${P(-14, 24)} M${P(4, 19)} C${P(9, 22)} ${P(14, 22)} ${P(17, 24)}`, tenue) +
          p(`M${P(-30, 24)} C${P(-36, 30)} ${P(-28, 38)} ${P(-20, 36)} C${P(-20, 46)} ${P(-6, 48)} ${P(-2, 42)} C${P(4, 50)} ${P(20, 48)} ${P(20, 40)} ` +
            `C${P(30, 42)} ${P(36, 32)} ${P(28, 26)} C${P(32, 18)} ${P(18, 16)} ${P(12, 20)} C${P(6, 15)} ${P(-6, 15)} ${P(-10, 20)} C${P(-18, 16)} ${P(-30, 18)} ${P(-30, 24)} Z`);
      };
      return svg('0 0 240 112',
        p('M0 66 C40 50 80 58 120 52 C160 46 200 56 240 50', 'class="tn" stroke-dasharray="3 4"') +
        p('M0 104 H240') + p('M10 110 L80 104 M90 110 L130 104 M150 110 L176 104', tenue) +
        olivo(58, 1.15) + olivo(136, 0.9) + olivo(196, 0.68), 'Olivos en hilera con lomas al fondo');
    },
    'corredor-industrial': () => svg('0 0 240 112',
      p('M0 104 H240') + p('M0 110 H240', 'class="tn" stroke-dasharray="8 6"') +
      p('M30 104 V60 L50 44 V60 L70 44 V60 L90 44 V60 L110 44 V60 L130 44 V60 L150 44 V60 L170 44 V104') +
      p('M40 104 V80 H60 V104 M70 104 V80 H90 V104 M100 104 V80 H120 V104', tenue) +
      p('M42 86 H58 M42 92 H58 M72 86 H88 M72 92 H88 M102 86 H118 M102 92 H118', tenue) +
      p('M186 98 V80 H220 V98 Z M220 98 V86 H230 L234 92 V98 H220') + p('M196 101 a3 3 0 1 0 0.01 0 M226 101 a3 3 0 1 0 0.01 0'),
      'Nave industrial con techo de dientes de sierra y tráiler')
  };
  V.dib = dib;
  // Llenar los marcadores estáticos del HTML
  document.querySelectorAll('[data-dib]').forEach((el) => { if (dib[el.dataset.dib]) el.innerHTML = dib[el.dataset.dib](); });
})();
