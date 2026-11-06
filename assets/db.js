/* VÉRTICE · capa de datos con Supabase (reemplaza al localStorage del demo)
 *
 * Mantiene las mismas firmas de Vertice.store que usan portal.js y admin.js:
 * las lecturas son síncronas (leen de una copia en memoria cargada al arrancar)
 * y las escrituras se aplican en la base de datos en segundo plano, en orden.
 *
 * La clave que aparece abajo es la clave PÚBLICA (publishable). Es segura en el navegador:
 * lo que cada persona puede leer o escribir lo decide Row Level Security en la base de datos.
 */
(function () {
  'use strict';
  const V = window.Vertice, D = V.data;
  const SB_URL = 'https://qlrcwlrrkdcnrnnvupmd.supabase.co';
  const SB_KEY = 'sb_publishable_CqNK64R-RffqpgeMcIk38A_FNuX6dXd';
  const BUCKET = 'inmuebles';
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const SISTEMA = 'Sistema VÉRTICE';

  let sb = null;
  let INV = [], PRO = [];
  const uuidOf = new Map();   // id del front (la referencia) -> uuid en la base
  const idOf = new Map();     // uuid -> id del front
  const snapI = new Map();    // id -> JSON del último estado guardado
  const snapP = new Map();    // id prospecto -> { row, bit:Set }
  let asesorPorNombre = new Map(), asesorPorId = new Map();

  V.uid = () => crypto.randomUUID(); // la base usa uuid como llave

  const emit = () => window.dispatchEvent(new CustomEvent('vertice:data'));
  const s = (v) => (v == null ? '' : String(v));
  const cut = (v, n) => { const t = s(v).trim(); return t ? t.slice(0, n) : null; };

  /* ---------- Mapeo base de datos <-> modelo del front ---------- */
  const TXT = [['geometria', 'geometria'], ['normativa', 'normativa'], ['asoleamiento', 'asoleamiento'], ['topografia', 'topografia'],
    ['suelo', 'suelo'], ['usoSuelo', 'uso_suelo'], ['densidad', 'densidad'], ['estatusLegal', 'estatus_legal'], ['gravamen', 'gravamen'],
    ['tiempoAcceso', 'tiempo_acceso'], ['vialidad', 'vialidad'], ['luz', 'luz'], ['agua', 'agua'], ['etiqueta', 'etiqueta'],
    ['descripcion', 'descripcion'], ['dictamen', 'dictamen']];

  function inmuebleDesdeDb(r) {
    const i = {
      id: r.ref, ref: r.ref, categoria: r.categoria, zona: r.zona_id || '', estatus: r.estatus, destacado: !!r.destacado,
      titulo: r.titulo, ubicacion: r.ubicacion, lat: +r.lat, lng: +r.lng, precioMxn: +r.precio_mxn, superficieM2: +r.superficie_m2,
      construccionM2: +(r.construccion_m2 || 0), horasSol: +(r.horas_sol || 0), plusvaliaZonaPct: +(r.plusvalia_zona_pct || 0)
    };
    TXT.forEach(([j, d]) => { i[j] = s(r[d]); });
    i.fotos = (r.fotos || []).slice().sort((a, b) => a.orden - b.orden).map((f) => ({ url: f.url, alt: s(f.alt) }));
    i.creadoEn = r.creado_en;
    uuidOf.set(i.id, r.id); idOf.set(r.id, i.id);
    return i;
  }
  function inmuebleADb(i) {
    const r = {
      id: uuidOf.get(i.id), ref: i.ref, categoria: i.categoria, zona_id: i.zona || null, estatus: i.estatus, destacado: !!i.destacado,
      titulo: i.titulo, ubicacion: i.ubicacion, lat: i.lat, lng: i.lng, precio_mxn: i.precioMxn, superficie_m2: i.superficieM2,
      construccion_m2: i.construccionM2 || 0, horas_sol: i.horasSol || null, plusvalia_zona_pct: i.plusvaliaZonaPct || 0
    };
    TXT.forEach(([j, d]) => { r[d] = s(i[j]).trim() || null; });
    if (i.creadoEn) r.creado_en = i.creadoEn;
    return r;
  }
  const filaProspecto = (p) => ({
    id: p.id, nombre: cut(p.nombre, 120), telefono: cut(p.telefono, 30), email: cut(p.email, 160),
    inmueble_id: uuidOf.get(p.inmuebleId) || null, interes: cut(p.interes, 500), presupuesto: cut(p.presupuesto, 80),
    origen: cut(p.origen, 60), asesor_id: asesorPorNombre.get(p.ejecutivo) || null, estatus: p.estatus, creado_en: p.creadoEn
  });
  const filaBitacora = (b, prospectoId) => ({
    id: b.id, prospecto_id: prospectoId, fecha: b.fecha, asesor_id: asesorPorNombre.get(b.ejecutivo) || null, tipo: b.tipo,
    resumen: b.resumen, detalle: b.detalle, acuerdo: cut(b.acuerdo, 1000), fecha_proxima: b.fechaProxima || null
  });
  function prospectoDesdeDb(r) {
    return {
      id: r.id, creadoEn: r.creado_en, nombre: r.nombre, telefono: r.telefono, email: s(r.email),
      inmuebleId: r.inmueble_id ? idOf.get(r.inmueble_id) || null : null, interes: s(r.interes), presupuesto: s(r.presupuesto) || 'Por definir',
      origen: s(r.origen), ejecutivo: r.asesor_id ? asesorPorId.get(r.asesor_id) || '' : '', estatus: r.estatus,
      bitacora: (r.bitacora || []).map((b) => ({
        id: b.id, fecha: b.fecha, ejecutivo: b.asesor_id ? asesorPorId.get(b.asesor_id) || SISTEMA : SISTEMA, tipo: b.tipo,
        resumen: b.resumen, detalle: b.detalle, acuerdo: s(b.acuerdo), fechaProxima: b.fecha_proxima
      })).sort((a, b) => b.fecha.localeCompare(a.fecha))
    };
  }
  const guardarSnapP = (p) => snapP.set(p.id, { row: JSON.stringify(filaProspecto(p)), bit: new Set(p.bitacora.map((b) => b.id)) });

  /* ---------- Carga inicial ---------- */
  async function cargar(staff) {
    const [z, i] = await Promise.all([
      sb.from('zonas').select('id,nombre').order('nombre'),
      sb.from('inmuebles').select('*, fotos(url,alt,orden)').order('creado_en', { ascending: false })
    ]);
    if (z.error) throw z.error;
    if (i.error) throw i.error;
    if (z.data.length) D.zonas = Object.fromEntries(z.data.map((x) => [x.id, x.nombre]));
    INV = i.data.map(inmuebleDesdeDb);
    INV.forEach((x) => snapI.set(x.id, JSON.stringify(x)));
    if (!staff) return;
    const a = await sb.from('asesores').select('id,nombre,activo').order('nombre');
    if (a.error) throw a.error;
    asesorPorNombre = new Map(a.data.map((x) => [x.nombre, x.id]));
    asesorPorId = new Map(a.data.map((x) => [x.id, x.nombre]));
    const act = a.data.filter((x) => x.activo).map((x) => x.nombre);
    if (act.length) D.asesores = act;
    const p = await sb.from('prospectos').select('*, bitacora(*)').order('creado_en', { ascending: false });
    if (p.error) throw p.error;
    PRO = p.data.map(prospectoDesdeDb);
    PRO.forEach(guardarSnapP);
  }

  /* ---------- Escritura en segundo plano, en orden ---------- */
  let cola = Promise.resolve();
  const encolar = (fn) => { cola = cola.then(fn).catch((e) => { console.error(e); V.toast('No se pudo guardar en la base de datos: ' + (e.message || e) + '. Recarga la página.'); }); return cola; };
  const ok = (r) => { if (r.error) throw r.error; return r; };

  async function subirFoto(ref, f) {
    const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(f.url);
    if (!m) throw new Error('Formato de imagen no permitido: usa JPG, PNG o WebP.');
    const bin = atob(m[2]), arr = new Uint8Array(bin.length);
    for (let k = 0; k < bin.length; k++) arr[k] = bin.charCodeAt(k);
    const path = `${ref}/${crypto.randomUUID()}.${m[1] === 'image/jpeg' ? 'jpg' : m[1].slice(6)}`;
    ok(await sb.storage.from(BUCKET).upload(path, arr, { contentType: m[1], upsert: false }));
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function syncInventario(lista) {
    const ids = new Set(lista.map((i) => i.id));
    for (const id of [...snapI.keys()]) {
      if (ids.has(id)) continue;
      ok(await sb.from('inmuebles').delete().eq('id', uuidOf.get(id)));
      snapI.delete(id); idOf.delete(uuidOf.get(id)); uuidOf.delete(id);
    }
    // primero los que dejan de ser destacados: solo puede haber uno
    const cambios = lista.filter((i) => snapI.get(i.id) !== JSON.stringify(i)).sort((a, b) => (a.destacado ? 1 : 0) - (b.destacado ? 1 : 0));
    for (const i of cambios) {
      if (!uuidOf.has(i.id)) { const u = crypto.randomUUID(); uuidOf.set(i.id, u); idOf.set(u, i.id); }
      const prev = snapI.get(i.id) ? JSON.stringify(JSON.parse(snapI.get(i.id)).fotos) : null;
      for (const f of i.fotos) {
        if (f.url.startsWith('data:')) f.url = await subirFoto(i.ref, f);
        else if (f.url.startsWith('http:')) f.url = 'https:' + f.url.slice(5);
      }
      ok(await sb.from('inmuebles').upsert(inmuebleADb(i)));
      if (JSON.stringify(i.fotos) !== prev) {
        ok(await sb.from('fotos').delete().eq('inmueble_id', uuidOf.get(i.id)));
        if (i.fotos.length) ok(await sb.from('fotos').insert(i.fotos.slice(0, 10).map((f, k) => ({ inmueble_id: uuidOf.get(i.id), orden: k, url: f.url, alt: f.alt || '' }))));
      }
      snapI.set(i.id, JSON.stringify(i));
    }
  }

  async function syncProspectos(lista) {
    const ids = new Set(lista.map((p) => p.id));
    for (const id of [...snapP.keys()]) {
      if (ids.has(id)) continue;
      ok(await sb.from('prospectos').delete().eq('id', id));
      snapP.delete(id);
    }
    for (const p of lista) {
      const snap = snapP.get(p.id);
      const fila = filaProspecto(p), json = JSON.stringify(fila);
      if (!snap || snap.row !== json) ok(await sb.from('prospectos').upsert(fila));
      const actuales = new Set(p.bitacora.map((b) => b.id));
      const borrar = snap ? [...snap.bit].filter((id) => !actuales.has(id)) : [];
      const nuevas = p.bitacora.filter((b) => !snap || !snap.bit.has(b.id));
      if (borrar.length) ok(await sb.from('bitacora').delete().in('id', borrar));
      if (nuevas.length) ok(await sb.from('bitacora').insert(nuevas.map((b) => filaBitacora(b, p.id))));
      guardarSnapP(p);
    }
  }
  // ids heredados del demo ('p1', 'b1_1'…) no son uuid: se reemplazan antes de guardar
  const normalizarIds = (lista) => lista.forEach((p) => {
    if (!UUID.test(p.id)) p.id = crypto.randomUUID();
    (p.bitacora || []).forEach((b) => { if (!UUID.test(b.id)) b.id = crypto.randomUUID(); });
  });

  /* ---------- Store con las mismas firmas del demo ---------- */
  V.store = {
    inventario() { return INV; },
    prospectos() { return PRO; },
    saveInventario(l) { INV = l; encolar(() => syncInventario(l)); emit(); return true; },
    saveProspectos(l) { normalizarIds(l); PRO = l; encolar(() => syncProspectos(l)); emit(); return true; },
    // Formularios públicos: solo insertan. El trigger de la base crea la primera nota y asigna asesor.
    async addProspecto(d) {
      const fila = {
        id: crypto.randomUUID(), nombre: cut(d.nombre, 120), telefono: cut(d.telefono, 30), email: cut(d.email, 160),
        inmueble_id: uuidOf.get(d.inmuebleId) || null, interes: cut(d.interes, 500), presupuesto: cut(d.presupuesto, 80),
        origen: cut(d.origen || 'Portal web', 60), consentimiento_en: new Date().toISOString(),
        resumen_inicial: cut(d.resumen, 120), nota_inicial: cut(d.nota, 1000)
      };
      ok(await sb.from('prospectos').insert(fila));
    },
    reset() { V.toast('Con la base de datos conectada ya no hay datos de demo que restablecer.'); }
  };

  /* ---------- Sesión de la consola ---------- */
  async function esPersonal(user) {
    const r = await sb.from('asesores').select('id').eq('auth_id', user.id).eq('activo', true).maybeSingle();
    return !r.error && !!r.data;
  }
  function pantallaAcceso() {
    return new Promise((resolve) => {
      const el = document.createElement('div');
      el.className = 'fixed inset-0 z-[100] bg-paper flex items-center justify-center p-6';
      el.innerHTML = `<form class="card p-7 sm:p-9 w-full max-w-sm space-y-4" novalidate>
        <div><h1 class="font-display text-2xl font-semibold">Consola VÉRTICE</h1><p class="text-sm text-muted mt-1">Acceso solo para el equipo.</p></div>
        <div><label class="lbl" for="lgMail">Correo</label><input id="lgMail" class="input" type="email" autocomplete="username" required></div>
        <div><label class="lbl" for="lgPass">Contraseña</label><input id="lgPass" class="input" type="password" autocomplete="current-password" required></div>
        <p id="lgErr" class="text-sm min-h-[1.25rem]" style="color:rgb(var(--ember))" role="alert"></p>
        <button class="btn btn-primary w-full" type="submit">Entrar</button></form>`;
      document.body.appendChild(el);
      const f = el.querySelector('form'), err = el.querySelector('#lgErr'), btn = el.querySelector('button');
      el.querySelector('#lgMail').focus();
      f.addEventListener('submit', async (e) => {
        e.preventDefault(); err.textContent = ''; btn.disabled = true;
        const { data, error } = await sb.auth.signInWithPassword({ email: el.querySelector('#lgMail').value.trim(), password: el.querySelector('#lgPass').value });
        if (error || !data.user) { err.textContent = 'Correo o contraseña incorrectos.'; btn.disabled = false; return; }
        if (!(await esPersonal(data.user))) { await sb.auth.signOut(); err.textContent = 'Esta cuenta no tiene acceso a la consola.'; btn.disabled = false; return; }
        el.remove(); resolve();
      });
    });
  }
  async function exigirAcceso() {
    const { data } = await sb.auth.getSession();
    if (data.session && (await esPersonal(data.session.user))) return;
    await pantallaAcceso();
  }

  /* ---------- Arranque: carga los datos y después el script de la página ---------- */
  function avisoError(e) {
    console.error(e);
    const d = document.createElement('div');
    d.setAttribute('role', 'alert');
    d.className = 'fixed inset-x-0 top-0 z-[100] p-4 text-center text-sm font-medium text-white';
    d.style.background = 'rgb(var(--ember))';
    d.textContent = 'No se pudo conectar con la base de datos. Recarga la página en un momento.';
    document.body.appendChild(d);
  }
  V.boot = async function (src, opciones) {
    const staff = !!(opciones && opciones.admin);
    try {
      if (!window.supabase) throw new Error('No cargó el cliente de Supabase');
      sb = window.supabase.createClient(SB_URL, SB_KEY);
      if (staff) await exigirAcceso();
      await cargar(staff);
      document.querySelectorAll('[data-salir]').forEach((b) => b.addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); }));
    } catch (e) { avisoError(e); return; }
    const t = document.createElement('script'); t.src = src; document.body.appendChild(t);
  };
})();
