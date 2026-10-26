/* VÉRTICE · lógica de la consola (CMS + CRM)
 * Toda lectura/escritura pasa por Vertice.store: es el punto donde se conecta la API real. */
(function () {
  'use strict';
  const V = Vertice, D = V.data, E = V.esc;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let inv = [], pros = [], editId = null, selPros = null, seccion = 'panel';
  const load = () => { inv = V.store.inventario(); pros = V.store.prospectos(); };

  const CATCOL = { terreno: 'moss', casa: 'ember', bodega: 'tide', rancho: 'ochre' };
  const STCOL = { 'Nuevo contacto': 'tide', 'Cita agendada': 'moss', 'En negociación': 'ember', 'Revisión notarial': 'ochre', 'Cerrado / ganado': 'moss', 'En pausa': 'muted' };
  const chipEst = (e) => `<span class="chip-c whitespace-nowrap" style="--c:var(--${STCOL[e] || 'muted'})">${E(e)}</span>`;
  const nomInm = (id) => { const i = inv.find((x) => x.id === id || x.ref === id); return i ? `${i.ref} · ${i.titulo}` : ''; };
  const tel = (t) => String(t).replace(/\D/g, '');

  /* ---------- Navegación ---------- */
  const SECS = [['panel', 'Panel', 'dash'], ['cartera', 'Cartera', 'building'], ['alta', 'Nuevo inmueble', 'plus'], ['prospectos', 'Prospectos', 'user'], ['datos', 'Datos', 'db']];
  function navHTML() {
    $('#nav').innerHTML = SECS.map(([k, l, ic]) => {
      const on = seccion === k;
      const n = k === 'cartera' ? inv.length : k === 'prospectos' ? pros.length : '';
      return `<button data-nav="${k}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14px] font-medium whitespace-nowrap transition ${on ? 'bg-ember text-white shadow-lg shadow-ember/30' : 'text-muted hover:bg-surface2 hover:text-ink'}" ${on ? 'aria-current="page"' : ''}>${V.icon(ic, 17)}<span>${l}</span>${n !== '' ? `<span class="num text-[11px] ml-auto px-1.5 py-0.5 rounded-md ${on ? 'bg-white/25' : 'bg-surface2'}">${n}</span>` : ''}</button>`;
    }).join('');
  }
  function ir(sec, opts = {}) {
    seccion = sec;
    SECS.forEach(([k]) => $('#sec-' + k).classList.toggle('hidden', k !== sec));
    if (sec === 'panel') panel();
    if (sec === 'cartera') cartera();
    if (sec === 'alta' && !opts.keep) abrirForm(null);
    if (sec === 'prospectos') prospectos();
    if (sec === 'datos') datos();
    navHTML();
    if (!opts.silent) { history.replaceState(null, '', '#' + sec); window.scrollTo({ top: 0 }); }
  }

  /* ---------- Panel ---------- */
  function panel() {
    const act = inv.filter((i) => i.estatus === 'publicado' || i.estatus === 'reservado');
    const valor = act.reduce((a, i) => a + i.precioMxn, 0);
    const ha = act.reduce((a, i) => a + i.superficieM2, 0) / 1e4;
    const ticket = act.length ? valor / act.length : 0;
    const plus = act.length ? act.reduce((a, i) => a + (+i.plusvaliaZonaPct || 0), 0) / act.length : 0;
    const cats = Object.keys(V.CAT).map((k) => { const l = act.filter((i) => i.categoria === k); return { k, n: l.length, v: l.reduce((a, i) => a + i.precioMxn, 0) }; }).filter((c) => c.n);
    const pip = V.ESTATUS_PROSPECTO.map((e) => ({ e, n: pros.filter((p) => p.estatus === e).length }));
    const max = Math.max(1, ...pip.map((x) => x.n));
    const ahora = Date.now();
    const seg = pros.map((p) => { const b = [...(p.bitacora || [])].filter((x) => x.fechaProxima).sort((a, b) => b.fecha.localeCompare(a.fecha))[0]; return b ? { p, b } : null; })
      .filter(Boolean).filter(({ p }) => p.estatus !== 'Cerrado / ganado' && p.estatus !== 'En pausa').sort((a, b) => a.b.fechaProxima.localeCompare(b.b.fechaProxima)).slice(0, 5);
    const act2 = pros.flatMap((p) => (p.bitacora || []).map((b) => ({ p, b }))).sort((a, b) => b.b.fecha.localeCompare(a.b.fecha)).slice(0, 6);

    $('#panelBody').innerHTML = `
    <div class="grid xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 card p-7 sm:p-9 relative">
        <div class="topo" id="panelTopo" style="opacity:.9"></div>
        <div class="relative">
          <p class="eyebrow">Valor de la cartera activa</p>
          <p class="font-display text-5xl sm:text-7xl font-semibold mt-4 leading-none break-words">${V.mxn(valor)}<span class="text-base font-sans font-medium text-muted"> MXN</span></p>
          <p class="num text-sm text-muted mt-3">≈ ${V.usd(valor)} · tipo de cambio referencial ${D.config.tipoCambio}</p>
          <div class="flex h-3 rounded-full overflow-hidden gap-0.5 mt-8" role="img" aria-label="Composición de la cartera por valor">
            ${cats.map((c) => `<div style="width:${(c.v / valor) * 100}%;background:rgb(var(--${CATCOL[c.k]}))" title="${E(V.CAT[c.k].corto)}"></div>`).join('')}
          </div>
          <div class="grid sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-3 mt-5">
            ${cats.map((c) => `<div class="text-sm"><span class="inline-block w-2.5 h-2.5 rounded-full mr-2" style="background:rgb(var(--${CATCOL[c.k]}))"></span><span class="font-medium">${E(V.CAT[c.k].corto)}</span><p class="num text-xs text-muted mt-1 pl-[18px]">${c.n} · ${V.compact(c.v)}</p></div>`).join('') || '<p class="text-sm text-muted">Sin inmuebles activos.</p>'}
          </div>
        </div>
      </div>
      <div class="card p-7">
        <div class="flex items-center justify-between"><p class="eyebrow">Embudo de prospectos</p><button class="text-xs font-semibold text-ember-ink hover:underline" data-nav="prospectos">Ver todos →</button></div>
        <div class="mt-6 space-y-4">${pip.map((x) => `<div><div class="flex justify-between text-sm mb-1.5"><span>${E(x.e)}</span><span class="num font-semibold">${x.n}</span></div><div class="h-2 rounded-full bg-surface2 overflow-hidden"><div class="h-full rounded-full transition-all" style="width:${(x.n / max) * 100}%;background:rgb(var(--${STCOL[x.e]}))"></div></div></div>`).join('')}</div>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 border-y border-line">
      ${[[String(act.length), 'inmuebles activos', 'ember'], [ha.toLocaleString('es-MX', { maximumFractionDigits: 2 }) + ' ha', 'superficie administrada', 'tide'], [V.compact(ticket), 'ticket promedio', 'moss'], ['▲ ' + plus.toFixed(0) + '%', 'plusvalía de zona (est.)', 'ochre']]
        .map(([n, t, c]) => `<div class="py-6 px-4 sm:px-8 first:pl-0 border-l border-line first:border-0 [&:nth-child(3)]:border-l-0 lg:[&:nth-child(3)]:border-l"><p class="font-display text-3xl sm:text-4xl font-semibold leading-none" style="color:rgb(var(--${c}))">${E(n)}</p><p class="text-sm text-muted mt-2">${E(t)}</p></div>`).join('')}
    </div>

    <div class="grid xl:grid-cols-2 gap-6">
      <div class="card p-7"><p class="eyebrow">Próximos seguimientos</p>
        <ul class="mt-5 divide-y divide-line">${seg.map(({ p, b }) => { const venc = new Date(b.fechaProxima).getTime() < ahora;
          return `<li><button data-bit="${E(p.id)}" class="w-full text-left py-3.5 flex items-center justify-between gap-4 hover:opacity-80"><span><span class="font-semibold block">${E(p.nombre)}</span><span class="text-sm text-muted">${E(b.acuerdo || b.resumen)}</span></span><span class="num text-xs whitespace-nowrap ${venc ? 'font-semibold' : 'text-muted'}" ${venc ? 'style="color:#D93F2B"' : ''}>${venc ? 'Vencido · ' : ''}${E(V.fmtFecha(b.fechaProxima, true))}</span></button></li>`; }).join('') || '<li class="py-6 text-sm text-muted">Sin seguimientos programados.</li>'}</ul></div>
      <div class="card p-7"><p class="eyebrow">Actividad reciente</p>
        <ul class="mt-5 space-y-4">${act2.map(({ p, b }) => `<li class="flex gap-3.5"><span class="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style="background:rgb(var(--ember) / .13);color:rgb(var(--ember-ink))">${V.icon(V.iconInteraccion(b.tipo), 16)}</span><div class="min-w-0"><p class="text-sm"><button data-bit="${E(p.id)}" class="font-semibold hover:underline">${E(p.nombre)}</button> <span class="text-muted">· ${E(b.tipo)}</span></p><p class="text-sm text-muted truncate">${E(b.resumen)}</p><p class="num text-[11px] text-muted mt-0.5">${E(V.fmtFecha(b.fecha, true))} · ${E(b.ejecutivo)}</p></div></li>`).join('') || '<li class="text-sm text-muted">Aún no hay actividad.</li>'}</ul></div>
    </div>`;
    V.topo($('#panelTopo'), [{ x: 880, y: 160, n: 11, s: 4 }]);
  }

  /* ---------- Cartera ---------- */
  function cartera() {
    const q = $('#qCartera').value.trim().toLowerCase(), fe = $('#fEstatusInm').value;
    const l = inv.filter((i) => (fe === 'todos' || i.estatus === fe) && (!q || (i.ref + ' ' + i.titulo + ' ' + i.ubicacion).toLowerCase().includes(q)));
    $('#tbInv').innerHTML = l.map((i) => {
      const f = (i.fotos || []).find((x) => V.safeUrl(x.url));
      return `<tr class="cat-${E(i.categoria)}">
        <td><div class="relative w-16 h-12 rounded-lg overflow-hidden bg-surface2">${f ? `<img src="${E(V.safeUrl(f.url))}" alt="" loading="lazy" onerror="Vertice.imgFallback(this)" class="w-full h-full object-cover">` : ''}<span class="absolute bottom-0.5 right-0.5 num text-[10px] px-1 rounded bg-black/70 text-white">${(i.fotos || []).length}</span></div></td>
        <td class="num font-semibold whitespace-nowrap" style="color:rgb(var(--c))">${E(i.ref)}</td>
        <td><div class="font-semibold">${E(i.titulo)}</div><div class="text-xs text-muted">${E(i.ubicacion)}</div></td>
        <td><span class="chip-c whitespace-nowrap">${E(V.CAT[i.categoria]?.label)}</span></td>
        <td class="whitespace-nowrap"><div class="num font-semibold">${V.mxn(i.precioMxn)}</div><div class="num text-xs text-muted">${V.mxn(V.precioM2(i))}/m²</div></td>
        <td class="num whitespace-nowrap">${V.m2(i.superficieM2)}</td>
        <td><select class="input !py-1.5 !text-[13px] w-auto" data-estatus="${E(i.id)}" aria-label="Estatus de ${E(i.ref)}">${V.ESTATUS_INMUEBLE.map((s) => `<option value="${s}" ${i.estatus === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select></td>
        <td class="text-right whitespace-nowrap"><div class="inline-flex gap-1.5">
          <a class="btn btn-ghost btn-sm" href="../#/propiedad/${encodeURIComponent(i.ref)}" target="_blank" rel="noopener" title="Ver en el portal">${V.icon('ext', 14)}</a>
          <button class="btn btn-ghost btn-sm" data-editar="${E(i.id)}">${V.icon('note', 14)}Editar</button>
          <button class="btn btn-danger btn-sm" data-borrar="${E(i.id)}" aria-label="Eliminar ${E(i.ref)}">${V.icon('trash', 14)}</button></div></td></tr>`;
    }).join('') || `<tr><td colspan="8" class="text-center text-muted !py-12">No hay inmuebles con ese filtro.</td></tr>`;
  }

  /* ---------- Formulario de inmueble ---------- */
  const optsCat = Object.entries(V.CAT).map(([k, v]) => [k, v.label]);
  const optsZona = Object.entries(D.zonas);
  const optsEst = V.ESTATUS_INMUEBLE.map((s) => [s, s[0].toUpperCase() + s.slice(1)]);
  const SECC = [
    { t: 'Identificación y ubicación', c: 'ember', f: [
      { k: 'ref', l: 'Código de referencia', req: 1, ph: 'SMA-T3100', w: 2 }, { k: 'titulo', l: 'Título comercial', req: 1, w: 4 },
      { k: 'categoria', l: 'Tipología', type: 'select', opts: optsCat, w: 2 }, { k: 'zona', l: 'Zona', type: 'select', opts: optsZona, w: 2 }, { k: 'estatus', l: 'Estatus', type: 'select', opts: optsEst, w: 2 },
      { k: 'ubicacion', l: 'Ubicación (texto)', req: 1, w: 6, ph: 'Comunidad, municipio' },
      { k: 'lat', l: 'Latitud', type: 'number', step: 'any', req: 1, w: 3, ph: '20.9142' }, { k: 'lng', l: 'Longitud', type: 'number', step: 'any', req: 1, w: 3, ph: '-100.8521' },
      { k: 'destacado', l: 'Pieza destacada en la portada del portal', type: 'check', w: 6 }] },
    { t: 'Galería fotográfica', c: 'tide', fotos: true },
    { t: 'Valores', c: 'moss', f: [
      { k: 'precioMxn', l: 'Precio total (MXN)', type: 'number', req: 1, w: 2, ph: '1450000' }, { k: 'plusvaliaZonaPct', l: 'Plusvalía de zona est. 3 años (%)', type: 'number', w: 2, ph: '40' }, { k: 'etiqueta', l: 'Etiqueta comercial', w: 2, ph: 'Oportunidad de entrada' }] },
    { t: 'Ficha espacial', c: 'tide', f: [
      { k: 'superficieM2', l: 'Superficie de terreno (m²)', type: 'number', step: 'any', req: 1, w: 2 }, { k: 'construccionM2', l: 'Construcción (m²)', type: 'number', step: 'any', w: 2, ph: '0 si es lote' }, { k: 'horasSol', l: 'Horas de sol útil', type: 'number', step: 'any', w: 2 },
      { k: 'geometria', l: 'Geometría', w: 3, ph: 'Frente 25 m · Fondo 40 m' }, { k: 'normativa', l: 'Normativa o programa', w: 3, ph: 'COS 0.40 · Desplante libre' },
      { k: 'asoleamiento', l: 'Asoleamiento', req: 1, w: 2, ph: 'Sur-Poniente' }, { k: 'topografia', l: 'Topografía', req: 1, w: 2 }, { k: 'suelo', l: 'Tipo de suelo', w: 2 },
      { k: 'usoSuelo', l: 'Uso de suelo', req: 1, w: 3 }, { k: 'densidad', l: 'Densidad o zonificación', w: 3 }] },
    { t: 'Situación legal y servicios', c: 'ochre', f: [
      { k: 'estatusLegal', l: 'Situación legal', req: 1, w: 3, ph: 'Escriturado' }, { k: 'gravamen', l: 'Gravamen', req: 1, w: 3, ph: 'Libre de gravamen' },
      { k: 'tiempoAcceso', l: 'Tiempo de acceso', req: 1, w: 2, ph: '20 min al Centro' }, { k: 'vialidad', l: 'Vialidad', w: 4 },
      { k: 'luz', l: 'Energía eléctrica', w: 3 }, { k: 'agua', l: 'Agua y drenaje', w: 3 }] },
    { t: 'Textos', c: 'ember', f: [
      { k: 'descripcion', l: 'Memoria descriptiva', type: 'textarea', req: 1, w: 6 }, { k: 'dictamen', l: 'Dictamen del arquitecto', type: 'textarea', req: 1, w: 6 }] }
  ];
  const SPAN = { 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4', 6: 'md:col-span-6' };
  const campo = (f, v) => {
    const id = 'f_' + f.k, w = SPAN[f.w || 2];
    if (f.type === 'check') return `<div class="col-span-6 ${w} flex items-center gap-3"><input type="checkbox" id="${id}" class="w-5 h-5" style="accent-color:rgb(var(--ember))" ${v ? 'checked' : ''}><label for="${id}" class="text-sm font-medium">${E(f.l)}</label></div>`;
    let ctl;
    if (f.type === 'select') ctl = `<select id="${id}" class="input">${f.opts.map(([k, l]) => `<option value="${E(k)}" ${String(v) === String(k) ? 'selected' : ''}>${E(l)}</option>`).join('')}</select>`;
    else if (f.type === 'textarea') ctl = `<textarea id="${id}" rows="3" class="input">${E(v ?? '')}</textarea>`;
    else ctl = `<input id="${id}" class="input" type="${f.type || 'text'}" ${f.step ? `step="${f.step}"` : ''} placeholder="${E(f.ph || '')}" value="${E(v ?? '')}">`;
    return `<div class="col-span-6 ${w}"><label class="lbl" for="${id}">${E(f.l)}${f.req ? ' *' : ''}</label>${ctl}<p class="text-xs mt-1 min-h-[1em]" id="err_${f.k}" style="color:#D93F2B"></p></div>`;
  };
  function abrirForm(item) {
    editId = item ? item.id : null;
    $('#h-alta').textContent = item ? `Editar ${item.ref}` : 'Nuevo inmueble';
    $('#altaEyebrow').textContent = item ? 'Edición' : 'Alta';
    const base = item || { categoria: 'terreno', zona: 'cruz-palmar', estatus: 'borrador', construccionM2: 0, horasSol: 0, plusvaliaZonaPct: 0, destacado: false, fotos: [] };
    $('#formInm').innerHTML = SECC.map((s, n) => {
      const head = `<div class="flex items-center gap-3 mb-5"><span class="num text-xs font-semibold w-7 h-7 rounded-full flex items-center justify-center text-white" style="background:rgb(var(--${s.c}))">${n + 1}</span><h2 class="font-display text-xl font-semibold">${E(s.t)}</h2></div>`;
      if (s.fotos) {
        const fs = base.fotos || [];
        return `<div class="card p-6 sm:p-7">${head}
          <div class="flex flex-wrap gap-2 mb-5"><button type="button" class="btn btn-ghost btn-sm" id="btnFotosEj">Usar fotos de ejemplo de esta tipología</button><span class="text-xs text-muted self-center">La primera foto es la portada. Se aceptan enlaces https.</span></div>
          <div class="space-y-4">${[0, 1, 2, 3].map((k) => `<div class="grid sm:grid-cols-[96px_1fr_1fr] gap-3 items-start"><div class="w-24 h-16 rounded-lg bg-surface2 overflow-hidden flex items-center justify-center text-[10px] text-muted" id="pv_${k}">${fs[k] && V.safeUrl(fs[k].url) ? `<img src="${E(V.safeUrl(fs[k].url))}" alt="" class="w-full h-full object-cover" onerror="Vertice.imgFallback(this)">` : 'Sin foto'}</div>
            <div><label class="lbl" for="fu_${k}">Foto ${k + 1}${k === 0 ? ' (portada) *' : ''}</label><input id="fu_${k}" class="input" type="url" placeholder="https://…" value="${E(fs[k]?.url || '')}"></div>
            <div><label class="lbl" for="fa_${k}">Descripción de la foto</label><input id="fa_${k}" class="input" value="${E(fs[k]?.alt || '')}" placeholder="Qué muestra la imagen"></div></div>`).join('')}</div>
          <p class="text-xs mt-2" id="err_fotos" style="color:#D93F2B"></p></div>`;
      }
      return `<div class="card p-6 sm:p-7">${head}<div class="grid grid-cols-6 gap-x-4 gap-y-3">${s.f.map((f) => campo(f, base[f.k])).join('')}</div></div>`;
    }).join('') + `<div class="flex flex-wrap justify-end gap-3 sticky bottom-3 z-10"><div class="card p-3 flex gap-3 shadow-xl"><button type="button" class="btn btn-ghost" data-nav="cartera">Cancelar</button><button type="submit" class="btn btn-primary">${item ? 'Guardar cambios' : 'Guardar inmueble'}</button></div></div>`;
  }
  $('#formInm').addEventListener('input', (e) => {
    const m = e.target.id.match(/^fu_(\d)$/); if (!m) return;
    const u = V.safeUrl(e.target.value), pv = $('#pv_' + m[1]);
    pv.innerHTML = u ? `<img src="${E(u)}" alt="" class="w-full h-full object-cover" onerror="Vertice.imgFallback(this)">` : 'Sin foto';
  });
  $('#formInm').addEventListener('click', (e) => {
    if (!e.target.closest('#btnFotosEj')) return;
    const cat = $('#f_categoria').value;
    const ej = (D.inventario.find((i) => i.categoria === cat) || D.inventario[0]).fotos;
    ej.slice(0, 4).forEach((f, k) => { $('#fu_' + k).value = f.url; $('#fa_' + k).value = f.alt; $('#pv_' + k).innerHTML = `<img src="${E(f.url)}" alt="" class="w-full h-full object-cover">`; });
    V.toast('Fotos de ejemplo cargadas');
  });
  $('#formInm').addEventListener('submit', (e) => {
    e.preventDefault();
    $$('[id^="err_"]', e.target).forEach((p) => (p.textContent = ''));
    const g = (k) => ($('#f_' + k).value || '').trim();
    const nm = (k) => { const v = g(k); return v === '' ? null : Number(v); };
    const err = {};
    const ref = g('ref').toUpperCase().replace(/\s+/g, '-');
    if (!/^[A-Z0-9-]{3,20}$/.test(ref)) err.ref = 'Usa 3 a 20 letras, números o guiones.';
    else if (inv.some((x) => x.ref === ref && x.id !== editId)) err.ref = 'Ya existe un inmueble con esa referencia.';
    SECC.flatMap((s) => s.f || []).filter((f) => f.req && f.k !== 'ref' && f.type !== 'number').forEach((f) => { if (!g(f.k)) err[f.k] = 'Campo obligatorio.'; });
    const precio = nm('precioMxn'), sup = nm('superficieM2'), lat = nm('lat'), lng = nm('lng');
    if (!(precio > 0)) err.precioMxn = 'Indica un precio mayor a 0.';
    if (!(sup > 0)) err.superficieM2 = 'Indica una superficie mayor a 0.';
    if (lat === null || isNaN(lat) || lat < -90 || lat > 90) err.lat = 'Latitud inválida.';
    if (lng === null || isNaN(lng) || lng < -180 || lng > 180) err.lng = 'Longitud inválida.';
    const fotos = [0, 1, 2, 3].map((k) => ({ url: V.safeUrl($('#fu_' + k).value), alt: $('#fa_' + k).value.trim() })).filter((f) => f.url);
    if (!fotos.length) err.fotos = 'Agrega al menos la foto de portada con un enlace válido.';
    const keys = Object.keys(err);
    if (keys.length) {
      keys.forEach((k) => { const p = $('#err_' + k); if (p) p.textContent = err[k]; });
      const first = $('#err_' + keys[0]); first && first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      V.toast('Revisa los campos marcados'); return;
    }
    const prev = inv.find((x) => x.id === editId);
    const o = {
      id: editId || ref, ref, estatus: g('estatus'), destacado: $('#f_destacado').checked, categoria: g('categoria'), zona: g('zona'),
      titulo: g('titulo'), ubicacion: g('ubicacion'), lat, lng, precioMxn: precio, superficieM2: sup, construccionM2: nm('construccionM2') || 0,
      geometria: g('geometria'), normativa: g('normativa'), asoleamiento: g('asoleamiento'), horasSol: nm('horasSol') || 0, topografia: g('topografia'), suelo: g('suelo'),
      usoSuelo: g('usoSuelo'), densidad: g('densidad'), estatusLegal: g('estatusLegal'), gravamen: g('gravamen'), tiempoAcceso: g('tiempoAcceso'), vialidad: g('vialidad'),
      luz: g('luz'), agua: g('agua'), plusvaliaZonaPct: nm('plusvaliaZonaPct') || 0, etiqueta: g('etiqueta'), descripcion: g('descripcion'), dictamen: g('dictamen'),
      fotos, creadoEn: prev?.creadoEn || new Date().toISOString().slice(0, 10)
    };
    if (o.destacado) inv.forEach((x) => { if (x.id !== o.id) x.destacado = false; });
    if (prev) inv[inv.indexOf(prev)] = o; else inv.unshift(o);
    V.store.saveInventario(inv);
    V.toast(prev ? `Cambios guardados en ${o.ref}` : `${o.ref} agregado a la cartera${o.estatus === 'borrador' ? ' como borrador' : ''}`);
    ir('cartera');
  });

  /* ---------- Prospectos ---------- */
  function prospectos() {
    const q = $('#qPros').value.trim().toLowerCase(), fe = $('#fEstPros').value, fa = $('#fAsesor').value;
    const l = pros.filter((p) => (fe === 'todos' || p.estatus === fe) && (fa === 'todos' || p.ejecutivo === fa) &&
      (!q || [p.nombre, p.telefono, p.email, nomInm(p.inmuebleId), p.interes, p.ejecutivo].join(' ').toLowerCase().includes(q)));
    $('#cntPros').textContent = `${l.length} ${l.length === 1 ? 'prospecto' : 'prospectos'}`;
    $('#tbPros').innerHTML = l.map((p) => `<tr>
      <td class="num text-xs text-muted whitespace-nowrap">${E(V.fmtFecha(p.creadoEn))}</td>
      <td class="whitespace-nowrap"><div class="font-semibold">${E(p.nombre)}</div><div class="text-xs text-muted">${E(p.email || 'Sin correo')}</div></td>
      <td class="whitespace-nowrap"><a class="num inline-flex items-center gap-1.5 hover:text-ember-ink" style="color:rgb(var(--moss))" href="https://wa.me/${tel(p.telefono)}" target="_blank" rel="noopener">${V.waIcon(14)}${E(p.telefono)}</a></td>
      <td class="max-w-[240px]"><span class="font-medium block truncate" title="${E(nomInm(p.inmuebleId) || p.interes)}">${E(nomInm(p.inmuebleId) || p.interes || 'Búsqueda general')}</span></td>
      <td class="whitespace-nowrap">${E(p.presupuesto)}</td>
      <td class="whitespace-nowrap"><span class="inline-flex items-center gap-1.5 text-[13px]">${V.icon('user', 14)}${E(p.ejecutivo)}</span></td>
      <td>${chipEst(p.estatus)}</td>
      <td><button class="btn btn-ghost btn-sm" data-bit="${E(p.id)}">${V.icon('doc', 14)}Bitácora <span class="num text-[11px] opacity-70">${(p.bitacora || []).length}</span></button></td>
      <td class="text-right"><button class="btn btn-danger btn-sm" data-borrar-p="${E(p.id)}" aria-label="Eliminar a ${E(p.nombre)}">${V.icon('trash', 14)}</button></td></tr>`).join('')
      || `<tr><td colspan="9" class="text-center text-muted !py-12">No hay prospectos con ese filtro.</td></tr>`;
  }

  const mPros = V.modal($('#modalPros'));
  function abrirAltaPros() {
    $('#pInm').innerHTML = `<option value="">Búsqueda general</option>` + inv.map((i) => `<option value="${E(i.id)}">${E(i.ref)} · ${E(i.titulo)}</option>`).join('');
    $('#pAse').innerHTML = D.asesores.map((a) => `<option>${E(a)}</option>`).join('');
    $('#pEst').innerHTML = V.ESTATUS_PROSPECTO.map((s) => `<option>${E(s)}</option>`).join('');
    mPros.open();
  }
  $('#formPros').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = $('#pNombre').value.trim(), telefono = $('#pTel').value.trim(), nota = $('#pNota').value.trim();
    if (nombre.length < 2) { $('#pNombre').focus(); V.toast('Escribe el nombre del cliente'); return; }
    if (telefono.replace(/\D/g, '').length < 8) { $('#pTel').focus(); V.toast('Revisa el teléfono'); return; }
    if (!nota) { $('#pNota').focus(); V.toast('Agrega la primera nota'); return; }
    const ahora = new Date().toISOString(), ej = $('#pAse').value;
    const p = { id: V.uid('p'), creadoEn: ahora, nombre, telefono, email: $('#pMail').value.trim(), inmuebleId: $('#pInm').value || null, interes: '',
      presupuesto: $('#pPres').value.trim() || 'Por definir', origen: $('#pOri').value, ejecutivo: ej, estatus: $('#pEst').value,
      bitacora: [{ id: V.uid('b'), fecha: ahora, ejecutivo: ej, tipo: 'Llamada telefónica', resumen: 'Registro inicial del prospecto', detalle: nota, acuerdo: 'Dar seguimiento en las próximas 24 horas.', fechaProxima: null }] };
    pros.unshift(p); V.store.saveProspectos(pros);
    e.target.reset(); mPros.close(); prospectos(); navHTML(); abrirBit(p.id);
  });

  /* ---------- Bitácora ---------- */
  const mBit = V.modal($('#modalBit'), { onClose() { selPros = null; if (seccion === 'panel') panel(); } });
  function abrirBit(id) {
    const p = pros.find((x) => x.id === id); if (!p) return;
    selPros = id; $('#bitBody').innerHTML = bitHTML(p); mBit.open();
  }
  function timeline(p) {
    const l = [...(p.bitacora || [])].sort((a, b) => b.fecha.localeCompare(a.fecha));
    if (!l.length) return '<p class="text-sm text-muted p-6 text-center">Aún no hay interacciones.</p>';
    return l.map((b) => `<div class="relative pl-8 pb-6 border-l-2 border-line last:pb-0 ml-3">
      <span class="absolute -left-[15px] top-0 w-7 h-7 rounded-full flex items-center justify-center bg-surface" style="border:2px solid rgb(var(--ember));color:rgb(var(--ember-ink))">${V.icon(V.iconInteraccion(b.tipo), 13)}</span>
      <div class="p-4 rounded-2xl border border-line bg-surface2/40">
        <div class="flex flex-wrap items-center justify-between gap-2"><div class="flex flex-wrap items-center gap-2"><span class="chip-c">${E(b.tipo)}</span><span class="font-semibold text-sm">${E(b.resumen)}</span></div><span class="num text-xs text-muted">${E(V.fmtFecha(b.fecha, true))}</span></div>
        <p class="text-xs text-muted mt-2 inline-flex items-center gap-1.5">${V.icon('user', 12)}Atendió ${E(b.ejecutivo)}</p>
        <p class="text-sm leading-relaxed mt-2">${E(b.detalle)}</p>
        ${b.acuerdo ? `<p class="text-sm mt-3 p-3 rounded-lg" style="background:rgb(var(--moss) / .12);color:rgb(var(--moss))"><strong>Acuerdo:</strong> ${E(b.acuerdo)}</p>` : ''}
        ${b.fechaProxima ? `<p class="num text-xs mt-3 inline-flex items-center gap-1.5" style="color:rgb(var(--ochre))">${V.icon('clock', 13)}Próximo contacto: ${E(V.fmtFecha(b.fechaProxima, true))}</p>` : ''}
      </div></div>`).join('');
  }
  function bitHTML(p) {
    const i = nomInm(p.inmuebleId);
    return `<div class="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 sm:px-8 bg-surface/95 backdrop-blur border-b border-line">
      <div><div class="flex items-center gap-2" id="bEstChip">${chipEst(p.estatus)}</div><h3 id="bNombre" class="font-display text-2xl sm:text-3xl font-semibold mt-2">${E(p.nombre)}</h3>
      <p class="text-sm text-muted mt-1">${E(i || p.interes || 'Búsqueda general')} · Presupuesto ${E(p.presupuesto)}</p></div>
      <button class="icon-btn shrink-0" data-cerrar-bit aria-label="Cerrar">${V.icon('x', 18)}</button></div>
    <div class="p-5 sm:p-8 space-y-7">
      <div class="grid sm:grid-cols-3 gap-4 p-4 rounded-2xl border border-line bg-surface2/50">
        <div><p class="lbl">Contacto</p><div class="flex items-center gap-2 flex-wrap"><span class="num text-sm font-semibold">${E(p.telefono)}</span><a class="btn btn-ghost btn-sm" style="color:rgb(var(--moss))" target="_blank" rel="noopener" href="https://wa.me/${tel(p.telefono)}">${V.waIcon(14)}WhatsApp</a></div></div>
        <div><label class="lbl" for="bAsesor">Asesor asignado</label><select id="bAsesor" class="input">${D.asesores.map((a) => `<option ${a === p.ejecutivo ? 'selected' : ''}>${E(a)}</option>`).join('')}</select></div>
        <div><label class="lbl" for="bEstatus">Estatus comercial</label><select id="bEstatus" class="input">${V.ESTATUS_PROSPECTO.map((s) => `<option ${s === p.estatus ? 'selected' : ''}>${E(s)}</option>`).join('')}</select></div>
      </div>
      <form id="formBit" class="p-5 rounded-2xl border-2 space-y-4" style="border-color:rgb(var(--ember) / .5)" novalidate>
        <h4 class="font-display text-lg font-semibold">Registrar interacción</h4>
        <div class="grid sm:grid-cols-3 gap-3">
          <div><label class="lbl" for="bTipo">Tipo</label><select id="bTipo" class="input">${V.TIPOS_INTERACCION.map((t) => `<option>${E(t)}</option>`).join('')}</select></div>
          <div><label class="lbl" for="bEjec">Quién atendió</label><select id="bEjec" class="input">${D.asesores.map((a) => `<option ${a === p.ejecutivo ? 'selected' : ''}>${E(a)}</option>`).join('')}</select></div>
          <div><label class="lbl" for="bRes">Resumen *</label><input id="bRes" class="input" placeholder="Preguntó por toma de CFE y pozo"></div>
        </div>
        <div><label class="lbl" for="bDet">Detalle de la conversación *</label><textarea id="bDet" rows="2" class="input" placeholder="Dudas, objeciones, requerimientos…"></textarea></div>
        <div class="grid sm:grid-cols-2 gap-3">
          <div><label class="lbl" for="bAcu">Acuerdo y siguiente paso</label><input id="bAcu" class="input" placeholder="Enviar cálculo de COS y llamar el viernes"></div>
          <div><label class="lbl" for="bProx">Próximo seguimiento</label><input id="bProx" class="input" type="datetime-local"></div>
        </div>
        <div class="flex justify-end"><button class="btn btn-primary" type="submit">Guardar en la bitácora</button></div>
      </form>
      <div><div class="flex items-center justify-between mb-5"><h4 class="font-display text-lg font-semibold">Historial (<span id="bTotal">${(p.bitacora || []).length}</span>)</h4><span class="text-xs text-muted">Del más reciente al más antiguo</span></div><div id="bTimeline">${timeline(p)}</div></div>
    </div>`;
  }
  const notaAuto = (p, resumen, detalle) => {
    p.bitacora.unshift({ id: V.uid('b'), fecha: new Date().toISOString(), ejecutivo: 'Sistema VÉRTICE', tipo: 'Nota interna', resumen, detalle, acuerdo: '', fechaProxima: null });
  };
  const refrescarBit = (p) => { $('#bTimeline').innerHTML = timeline(p); $('#bTotal').textContent = p.bitacora.length; $('#bEstChip').innerHTML = chipEst(p.estatus); prospectos(); };
  $('#bitBody').addEventListener('click', (e) => { if (e.target.closest('[data-cerrar-bit]')) mBit.close(); });
  $('#bitBody').addEventListener('change', (e) => {
    const p = pros.find((x) => x.id === selPros); if (!p) return;
    if (e.target.id === 'bAsesor' && e.target.value !== p.ejecutivo) {
      const ant = p.ejecutivo; p.ejecutivo = e.target.value; $('#bEjec').value = p.ejecutivo;
      notaAuto(p, `Reasignado a ${p.ejecutivo}`, `El prospecto pasó de ${ant} a ${p.ejecutivo}. El nuevo asesor debe leer el historial completo antes del siguiente contacto.`);
      V.store.saveProspectos(pros); refrescarBit(p);
    }
    if (e.target.id === 'bEstatus' && e.target.value !== p.estatus) {
      const ant = p.estatus; p.estatus = e.target.value;
      notaAuto(p, `Cambio de fase: ${p.estatus}`, `Se actualizó el estatus de "${ant}" a "${p.estatus}".`);
      V.store.saveProspectos(pros); refrescarBit(p);
    }
  });
  $('#bitBody').addEventListener('submit', (e) => {
    if (e.target.id !== 'formBit') return; e.preventDefault();
    const p = pros.find((x) => x.id === selPros); if (!p) return;
    const res = $('#bRes').value.trim(), det = $('#bDet').value.trim();
    if (!res || !det) { (res ? $('#bDet') : $('#bRes')).focus(); V.toast('Completa el resumen y el detalle'); return; }
    const px = $('#bProx').value; const ej = $('#bEjec').value;
    p.bitacora.unshift({ id: V.uid('b'), fecha: new Date().toISOString(), ejecutivo: ej, tipo: $('#bTipo').value, resumen: res, detalle: det, acuerdo: $('#bAcu').value.trim(), fechaProxima: px ? new Date(px).toISOString() : null });
    p.ejecutivo = ej; $('#bAsesor').value = ej;
    V.store.saveProspectos(pros); ['bRes', 'bDet', 'bAcu', 'bProx'].forEach((id) => ($('#' + id).value = '')); refrescarBit(p); V.toast('Interacción guardada');
  });

  /* ---------- Datos ---------- */
  const DEF = { zona: 'cruz-palmar', estatus: 'borrador', geometria: '', normativa: '', asoleamiento: '', horasSol: 0, topografia: '', suelo: '', usoSuelo: '', densidad: '', estatusLegal: '', gravamen: '', tiempoAcceso: '', vialidad: '', luz: '', agua: '', plusvaliaZonaPct: 0, etiqueta: '', descripcion: '', dictamen: '', construccionM2: 0, destacado: false, lat: 20.9144, lng: -100.7452 };
  function validarImport(o) {
    if (!o || !Array.isArray(o.inventario)) throw new Error('El archivo no trae la lista "inventario".');
    const refs = new Set();
    const inventario = o.inventario.map((i, n) => {
      ['ref', 'titulo', 'categoria'].forEach((k) => { if (!i[k]) throw new Error(`Inmueble ${n + 1}: falta "${k}".`); });
      if (!V.CAT[i.categoria]) throw new Error(`Inmueble ${n + 1}: tipología desconocida.`);
      if (!(i.precioMxn > 0) || !(i.superficieM2 > 0)) throw new Error(`Inmueble ${n + 1}: precio o superficie inválidos.`);
      if (refs.has(i.ref)) throw new Error(`Referencia repetida: ${i.ref}.`); refs.add(i.ref);
      return { ...DEF, ...i, id: i.id || i.ref, fotos: (i.fotos || []).filter((f) => V.safeUrl(f.url)).map((f) => ({ url: V.safeUrl(f.url), alt: String(f.alt || '') })), creadoEn: i.creadoEn || new Date().toISOString().slice(0, 10) };
    });
    const prospectos = Array.isArray(o.prospectos) ? o.prospectos.map((p) => ({ ...p, id: p.id || V.uid('p'), nombre: String(p.nombre || 'Sin nombre'), telefono: String(p.telefono || ''), bitacora: Array.isArray(p.bitacora) ? p.bitacora : [], estatus: V.ESTATUS_PROSPECTO.includes(p.estatus) ? p.estatus : 'Nuevo contacto' })) : null;
    return { inventario, prospectos };
  }
  function datos() { $('#jsonOut').value = JSON.stringify({ version: D.config.version, exportadoEn: new Date().toISOString(), inventario: inv, prospectos: pros }, null, 2); }

  /* ---------- Eventos ---------- */
  document.addEventListener('click', (e) => {
    const n = e.target.closest('[data-nav]'); if (n) { ir(n.dataset.nav); return; }
    if (e.target.closest('[data-nuevo]')) { ir('alta'); return; }
    const b = e.target.closest('[data-bit]'); if (b) { abrirBit(b.dataset.bit); return; }
    const ed = e.target.closest('[data-editar]'); if (ed) { const i = inv.find((x) => x.id === ed.dataset.editar); if (i) { abrirForm(i); ir('alta', { keep: true }); } return; }
    const bo = e.target.closest('[data-borrar]');
    if (bo) { const i = inv.find((x) => x.id === bo.dataset.borrar); if (i && confirm(`¿Eliminar ${i.ref} (${i.titulo})? Esta acción no se puede deshacer.`)) { inv = inv.filter((x) => x.id !== i.id); V.store.saveInventario(inv); cartera(); navHTML(); V.toast(`${i.ref} eliminado`); } return; }
    const bp = e.target.closest('[data-borrar-p]');
    if (bp) { const p = pros.find((x) => x.id === bp.dataset.borrarP); if (p && confirm(`¿Eliminar al prospecto "${p.nombre}" y su bitácora?`)) { pros = pros.filter((x) => x.id !== p.id); V.store.saveProspectos(pros); prospectos(); navHTML(); V.toast('Prospecto eliminado'); } return; }
    const c = e.target.closest('[data-cerrar]'); if (c) { mPros.close(); }
  });
  document.addEventListener('change', (e) => {
    const s = e.target.closest('[data-estatus]');
    if (s) { const i = inv.find((x) => x.id === s.dataset.estatus); if (i) { i.estatus = s.value; V.store.saveInventario(inv); V.toast(`${i.ref} ahora está ${s.value}`); } }
  });
  ['qCartera', 'fEstatusInm'].forEach((id) => $('#' + id).addEventListener('input', cartera));
  ['qPros', 'fEstPros', 'fAsesor'].forEach((id) => $('#' + id).addEventListener('input', prospectos));
  $('#btnNuevoPros').addEventListener('click', abrirAltaPros);
  $('#btnCopiar').addEventListener('click', () => { (navigator.clipboard ? navigator.clipboard.writeText($('#jsonOut').value) : Promise.reject()).then(() => V.toast('JSON copiado'), () => { $('#jsonOut').select(); V.toast('Selecciona y copia con Ctrl+C'); }); });
  $('#btnDescargar').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([$('#jsonOut').value], { type: 'application/json' })); a.download = 'vertice-datos.json'; document.body.appendChild(a); a.click(); a.remove();
  });
  $('#fileImportar').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const o = validarImport(JSON.parse(r.result));
        if (!confirm(`Se reemplazarán los datos actuales por ${o.inventario.length} inmuebles${o.prospectos ? ' y ' + o.prospectos.length + ' prospectos' : ''}. ¿Continuar?`)) return;
        V.store.saveInventario(o.inventario); if (o.prospectos) V.store.saveProspectos(o.prospectos);
        load(); datos(); navHTML(); V.toast('Datos importados');
      } catch (err) { V.toast('No se pudo importar: ' + err.message); }
    };
    r.readAsText(f); e.target.value = '';
  });
  $('#btnReset').addEventListener('click', () => { if (confirm('Se restablecerán los inmuebles y prospectos de ejemplo. ¿Continuar?')) { V.store.reset(); load(); datos(); navHTML(); V.toast('Datos de demo restablecidos'); } });
  $$('[data-cerrar]').forEach((b) => b.addEventListener('click', () => mPros.close()));
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith('vertice.v2') || seccion === 'alta' || mBit.isOpen || mPros.isOpen) return;
    load(); ir(seccion, { silent: true, keep: true });
  });

  /* ---------- Arranque ---------- */
  $('#icoPortalM').innerHTML = V.icon('ext', 18);
  $('#lnkPortal').innerHTML = V.icon('ext', 14) + ' Ver portal';
  $('#xPros').innerHTML = V.icon('x', 18);
  $('#btnCopiar').innerHTML = V.icon('link', 14) + 'Copiar';
  $('#btnDescargar').innerHTML = V.icon('download', 14) + 'Descargar';
  $('#lblImportar').insertAdjacentHTML('beforeend', V.icon('upload', 14) + 'Importar');
  $('#fEstatusInm').innerHTML += optsEst.map(([k, l]) => `<option value="${k}">${l}</option>`).join('');
  $('#fEstPros').innerHTML = `<option value="todos">Todos los estatus</option>` + V.ESTATUS_PROSPECTO.map((s) => `<option>${E(s)}</option>`).join('');
  $('#fAsesor').innerHTML = `<option value="todos">Todos los asesores</option>` + D.asesores.map((a) => `<option>${E(a)}</option>`).join('');
  load();
  const h = location.hash.replace('#', '');
  ir(SECS.some(([k]) => k === h) && h !== 'alta' ? h : 'panel', { silent: true });
})();
