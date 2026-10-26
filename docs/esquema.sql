-- VÉRTICE · esquema PostgreSQL propuesto (Supabase / Neon / cualquier Postgres)
-- Refleja 1:1 el modelo de data/inventario.js y de Vertice.store.
-- Los datos del demo viven en localStorage; este esquema es el destino de producción.

create extension if not exists "pgcrypto";

create type categoria_inmueble as enum ('terreno', 'casa', 'bodega', 'rancho');
create type estatus_inmueble  as enum ('publicado', 'reservado', 'borrador', 'vendido');
create type estatus_prospecto as enum ('Nuevo contacto', 'Cita agendada', 'En negociación', 'Revisión notarial', 'Cerrado / ganado', 'En pausa');
create type tipo_interaccion  as enum ('Llamada telefónica', 'Mensaje de WhatsApp', 'Visita al inmueble', 'Envío de dossier', 'Revisión notarial', 'Oferta / negociación', 'Nota interna');
create type rol_usuario       as enum ('admin', 'asesor');

-- Usuarios internos (enlazar con el proveedor de auth: Supabase Auth, Auth.js, etc.)
create table asesores (
  id          uuid primary key default gen_random_uuid(),
  auth_id     uuid unique,                -- id del proveedor de autenticación
  nombre      text not null,
  email       text unique not null,
  rol         rol_usuario not null default 'asesor',
  activo      boolean not null default true
);

create table zonas (
  id      text primary key,               -- 'sma-centro', 'cruz-palmar'…
  nombre  text not null
);

create table inmuebles (
  id                uuid primary key default gen_random_uuid(),
  ref               text unique not null check (ref ~ '^[A-Z0-9-]{3,20}$'),
  categoria         categoria_inmueble not null,
  zona_id           text references zonas(id),
  estatus           estatus_inmueble not null default 'borrador',
  destacado         boolean not null default false,
  titulo            text not null,
  ubicacion         text not null,
  lat               numeric(9,6) check (lat between -90 and 90),
  lng               numeric(9,6) check (lng between -180 and 180),
  precio_mxn        numeric(14,2) not null check (precio_mxn > 0),
  superficie_m2     numeric(12,2) not null check (superficie_m2 > 0),
  construccion_m2   numeric(12,2) not null default 0,
  geometria         text, normativa text, asoleamiento text,
  horas_sol         numeric(4,1), topografia text, suelo text,
  uso_suelo         text, densidad text,
  estatus_legal     text, gravamen text,
  tiempo_acceso     text, vialidad text, luz text, agua text,
  plusvalia_zona_pct numeric(5,1) default 0,
  etiqueta          text,
  descripcion       text, dictamen text,
  creado_en         timestamptz not null default now(),
  actualizado_en    timestamptz not null default now()
);
-- Solo un inmueble destacado a la vez
create unique index un_destacado on inmuebles (destacado) where destacado;
create index on inmuebles (estatus, categoria);

create table fotos (
  id          uuid primary key default gen_random_uuid(),
  inmueble_id uuid not null references inmuebles(id) on delete cascade,
  orden       smallint not null default 0, -- 0 = portada
  url         text not null check (url ~ '^https://'),
  alt         text not null default ''
);
create index on fotos (inmueble_id, orden);

create table prospectos (
  id            uuid primary key default gen_random_uuid(),
  creado_en     timestamptz not null default now(),
  nombre        text not null,
  telefono      text not null,
  email         text,
  inmueble_id   uuid references inmuebles(id) on delete set null,
  interes       text,
  presupuesto   text,
  origen        text,
  asesor_id     uuid references asesores(id),
  estatus       estatus_prospecto not null default 'Nuevo contacto',
  -- consentimiento (aviso de privacidad, LFPDPPP en México)
  consentimiento_en timestamptz
);
create index on prospectos (estatus, asesor_id);

create table bitacora (
  id             uuid primary key default gen_random_uuid(),
  prospecto_id   uuid not null references prospectos(id) on delete cascade,
  fecha          timestamptz not null default now(),
  asesor_id      uuid references asesores(id),
  tipo           tipo_interaccion not null,
  resumen        text not null,
  detalle        text not null,
  acuerdo        text,
  fecha_proxima  timestamptz
);
create index on bitacora (prospecto_id, fecha desc);
create index on bitacora (fecha_proxima) where fecha_proxima is not null;

-- ---------------------------------------------------------------
-- Seguridad (Row Level Security) — ejemplo con Supabase
-- ---------------------------------------------------------------
alter table inmuebles  enable row level security;
alter table fotos      enable row level security;
alter table prospectos enable row level security;
alter table bitacora   enable row level security;

-- El público solo lee inmuebles publicados o reservados
create policy "publico_lee_inmuebles" on inmuebles for select using (estatus in ('publicado','reservado'));
create policy "publico_lee_fotos" on fotos for select
  using (exists (select 1 from inmuebles i where i.id = inmueble_id and i.estatus in ('publicado','reservado')));

-- El personal autenticado administra todo (ajustar por rol en producción)
create policy "staff_inmuebles"  on inmuebles  for all to authenticated using (true) with check (true);
create policy "staff_fotos"      on fotos      for all to authenticated using (true) with check (true);
create policy "staff_prospectos" on prospectos for all to authenticated using (true) with check (true);
create policy "staff_bitacora"   on bitacora   for all to authenticated using (true) with check (true);

-- Los formularios públicos NO insertan directo: usar una función/endpoint con
-- validación, captcha y límite de peticiones, que inserte en prospectos.
