-- VÉRTICE · esquema real en Supabase (proyecto vertice-realestate, ref qlrcwlrrkdcnrnnvupmd)
-- Este archivo refleja lo que está aplicado en la base. Sirve para recrearla en otro proyecto
-- (SQL Editor de Supabase) o como referencia para quien continúe el desarrollo.

-- ---------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------
create type public.categoria_inmueble as enum ('terreno', 'casa', 'bodega', 'rancho');
create type public.estatus_inmueble  as enum ('publicado', 'reservado', 'borrador', 'vendido');
create type public.estatus_prospecto as enum ('Nuevo contacto', 'Cita agendada', 'En negociación', 'Revisión notarial', 'Cerrado / ganado', 'En pausa');
create type public.tipo_interaccion  as enum ('Llamada telefónica', 'Mensaje de WhatsApp', 'Visita al inmueble', 'Envío de dossier', 'Revisión notarial', 'Oferta / negociación', 'Nota interna');
create type public.rol_usuario       as enum ('admin', 'asesor');

-- ---------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------
-- Personal con acceso a la consola. auth_id enlaza con Supabase Auth.
create table public.asesores (
  id      uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete set null,
  nombre  text not null,
  email   text unique not null,
  rol     public.rol_usuario not null default 'asesor',
  activo  boolean not null default true
);

create table public.zonas (
  id     text primary key,          -- 'sma-centro', 'cruz-palmar'…
  nombre text not null
);

create table public.inmuebles (
  id                 uuid primary key default gen_random_uuid(),
  ref                text unique not null check (ref ~ '^[A-Z0-9-]{3,20}$'),
  categoria          public.categoria_inmueble not null,
  zona_id            text references public.zonas(id),
  estatus            public.estatus_inmueble not null default 'borrador',
  vendido_en         timestamptz,          -- lo fija el trigger fecha_vendido al marcar el inmueble como vendido
  destacado          boolean not null default false,
  titulo             text not null,
  ubicacion          text not null,
  lat                numeric(9,6) check (lat between -90 and 90),
  lng                numeric(9,6) check (lng between -180 and 180),
  precio_mxn         numeric(14,2) not null check (precio_mxn > 0),
  superficie_m2      numeric(12,2) not null check (superficie_m2 > 0),
  construccion_m2    numeric(12,2) not null default 0,
  geometria          text, normativa text, asoleamiento text,
  horas_sol          numeric(4,1), topografia text, suelo text,
  uso_suelo          text, densidad text,
  estatus_legal      text, gravamen text,
  tiempo_acceso      text, vialidad text, luz text, agua text,
  plusvalia_zona_pct numeric(5,1) default 0,
  etiqueta           text,
  descripcion        text, dictamen text,
  creado_en          timestamptz not null default now(),
  actualizado_en     timestamptz not null default now()
);
create unique index un_destacado on public.inmuebles (destacado) where destacado;  -- solo uno destacado
create index inmuebles_estatus_categoria_idx on public.inmuebles (estatus, categoria);
create index inmuebles_zona_idx on public.inmuebles (zona_id);

create table public.fotos (
  id          uuid primary key default gen_random_uuid(),
  inmueble_id uuid not null references public.inmuebles(id) on delete cascade,
  orden       smallint not null default 0,   -- 0 = portada
  url         text not null check (url ~ '^https://'),
  alt         text not null default ''
);
create index fotos_inmueble_orden_idx on public.fotos (inmueble_id, orden);

create table public.prospectos (
  id                uuid primary key default gen_random_uuid(),
  creado_en         timestamptz not null default now(),
  nombre            text not null check (char_length(nombre) between 2 and 120),
  telefono          text not null check (char_length(telefono) between 7 and 30),
  email             text check (email is null or char_length(email) <= 160),
  inmueble_id       uuid references public.inmuebles(id) on delete set null,
  interes           text check (interes is null or char_length(interes) <= 500),
  presupuesto       text check (presupuesto is null or char_length(presupuesto) <= 80),
  origen            text check (origen is null or char_length(origen) <= 60),
  asesor_id         uuid references public.asesores(id) on delete set null,
  estatus           public.estatus_prospecto not null default 'Nuevo contacto',
  consentimiento_en timestamptz,             -- aviso de privacidad aceptado (LFPDPPP)
  resumen_inicial   text check (resumen_inicial is null or char_length(resumen_inicial) <= 120),
  nota_inicial      text check (nota_inicial is null or char_length(nota_inicial) <= 1000),
  actualizado_en    timestamptz not null default now()   -- control de versión para edición simultánea
);
create index prospectos_estatus_asesor_idx on public.prospectos (estatus, asesor_id);
create index prospectos_inmueble_idx on public.prospectos (inmueble_id);
create index prospectos_asesor_idx on public.prospectos (asesor_id);
create index prospectos_creado_idx on public.prospectos (creado_en desc);

create table public.bitacora (
  id            uuid primary key default gen_random_uuid(),
  prospecto_id  uuid not null references public.prospectos(id) on delete cascade,
  fecha         timestamptz not null default now(),
  asesor_id     uuid references public.asesores(id) on delete set null,  -- null = Sistema VÉRTICE
  tipo          public.tipo_interaccion not null,
  resumen       text not null,
  detalle       text not null,
  acuerdo       text,
  fecha_proxima timestamptz
);
create index bitacora_prospecto_fecha_idx on public.bitacora (prospecto_id, fecha desc);
create index bitacora_proxima_idx on public.bitacora (fecha_proxima) where fecha_proxima is not null;
create index bitacora_asesor_idx on public.bitacora (asesor_id);

-- ---------------------------------------------------------------
-- Funciones de permisos (esquema privado: no se exponen en la API)
-- ---------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create function private.es_staff() returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.asesores a where a.auth_id = (select auth.uid()) and a.activo) $$;
create function private.es_admin() returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.asesores a where a.auth_id = (select auth.uid()) and a.activo and a.rol = 'admin') $$;
revoke execute on function private.es_staff() from public, anon;
revoke execute on function private.es_admin() from public, anon;
grant execute on function private.es_staff() to authenticated;
grant execute on function private.es_admin() to authenticated;

-- ---------------------------------------------------------------
-- Disparadores
-- ---------------------------------------------------------------
create function public.touch_actualizado() returns trigger language plpgsql set search_path = ''
as $$ begin new.actualizado_en = now(); return new; end $$;
create trigger inmuebles_touch before update on public.inmuebles for each row execute function public.touch_actualizado();
create trigger prospectos_touch before update on public.prospectos for each row execute function public.touch_actualizado();
-- La consola guarda con "update ... where id = X and actualizado_en = <versión cargada>".
-- Si no se actualiza ninguna fila, otra persona guardó antes y se avisa en lugar de sobrescribir.

-- Máximo 10 fotos por inmueble
create function public.limite_fotos() returns trigger language plpgsql set search_path = ''
as $$ begin
  if (select count(*) from public.fotos where inmueble_id = new.inmueble_id) >= 10 then
    raise exception 'Un inmueble admite máximo 10 fotos';
  end if;
  return new;
end $$;
create trigger fotos_limite before insert on public.fotos for each row execute function public.limite_fotos();

-- Solicitudes del portal (sin sesión): asigna asesor en rotación y crea la primera nota de bitácora
create function public.alta_prospecto() returns trigger language plpgsql security definer set search_path = ''
as $$
declare v_asesor uuid;
begin
  if (select auth.uid()) is not null then return new; end if;  -- el personal registra su propia bitácora
  select id into v_asesor from public.asesores a where a.activo
    order by (select count(*) from public.prospectos p where p.asesor_id = a.id), a.nombre limit 1;
  if v_asesor is not null then update public.prospectos set asesor_id = v_asesor where id = new.id; end if;
  insert into public.bitacora (prospecto_id, asesor_id, tipo, resumen, detalle, acuerdo)
  values (new.id, null, 'Nota interna',
          coalesce(nullif(new.resumen_inicial, ''), 'Registro desde el portal'),
          coalesce(nullif(new.nota_inicial, ''), 'Solicitud recibida desde el portal público.'),
          'Contactar en las próximas 24 horas.');
  return new;
end $$;
create trigger prospectos_alta after insert on public.prospectos for each row execute function public.alta_prospecto();

-- Límite de envíos del portal: 3 por teléfono por hora y 30 en total cada 10 minutos.
-- El visitante tampoco puede fijar la fecha de alta.
create function public.limite_envios_portal() returns trigger language plpgsql security definer set search_path = ''
as $$
declare tel text := regexp_replace(new.telefono, '\D', '', 'g');
begin
  if (select auth.uid()) is not null then return new; end if;
  if length(tel) < 8 then raise exception 'Teléfono inválido' using errcode = 'P0001'; end if;
  if (select count(*) from public.prospectos p
      where p.creado_en > now() - interval '1 hour'
        and right(regexp_replace(p.telefono, '\D', '', 'g'), 10) = right(tel, 10)) >= 3 then
    raise exception 'Demasiadas solicitudes con este teléfono. Intenta más tarde.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.prospectos p
      where p.creado_en > now() - interval '10 minutes' and p.consentimiento_en is not null) >= 30 then
    raise exception 'El sistema recibe demasiadas solicitudes. Intenta en unos minutos.' using errcode = 'P0001';
  end if;
  new.creado_en := now();
  return new;
end $$;
create trigger prospectos_limite before insert on public.prospectos for each row execute function public.limite_envios_portal();

revoke execute on function public.limite_envios_portal() from public, anon, authenticated;
revoke execute on function public.alta_prospecto() from public, anon, authenticated;
revoke execute on function public.limite_fotos() from public, anon, authenticated;
revoke execute on function public.touch_actualizado() from public, anon, authenticated;

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
alter table public.asesores   enable row level security;
alter table public.zonas      enable row level security;
alter table public.inmuebles  enable row level security;
alter table public.fotos      enable row level security;
alter table public.prospectos enable row level security;
alter table public.bitacora   enable row level security;

-- Zonas: lectura pública, edición solo admin
create policy zonas_lee on public.zonas for select to anon, authenticated using (true);
create policy zonas_admin_alta on public.zonas for insert to authenticated with check ((select private.es_admin()));
create policy zonas_admin_edita on public.zonas for update to authenticated using ((select private.es_admin())) with check ((select private.es_admin()));
create policy zonas_admin_borra on public.zonas for delete to authenticated using ((select private.es_admin()));

-- Fecha de venta: se fija sola al pasar a "vendido" y se borra si vuelve a otro estatus
create or replace function private.fecha_vendido() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.estatus = 'vendido' then
    if tg_op = 'INSERT' or old.estatus is distinct from 'vendido' then new.vendido_en := now();
    else new.vendido_en := old.vendido_en; end if;
  else new.vendido_en := null; end if;
  return new;
end $$;
create trigger fecha_vendido before insert or update on public.inmuebles
  for each row execute function private.fecha_vendido();

-- Inmuebles: el público ve publicados, reservados y vendidos de los últimos 10 días; el personal ve y edita todo
create policy inmuebles_publico on public.inmuebles for select to anon
  using (estatus in ('publicado','reservado') or (estatus = 'vendido' and vendido_en > now() - interval '10 days'));
create policy inmuebles_auth_lee on public.inmuebles for select to authenticated
  using (estatus in ('publicado','reservado') or (estatus = 'vendido' and vendido_en > now() - interval '10 days') or (select private.es_staff()));
create policy inmuebles_staff_alta on public.inmuebles for insert to authenticated with check ((select private.es_staff()));
create policy inmuebles_staff_edita on public.inmuebles for update to authenticated using ((select private.es_staff())) with check ((select private.es_staff()));
create policy inmuebles_staff_borra on public.inmuebles for delete to authenticated using ((select private.es_staff()));

-- Fotos: mismas reglas que su inmueble
create policy fotos_anon_lee on public.fotos for select to anon
  using (exists (select 1 from public.inmuebles i where i.id = inmueble_id
    and (i.estatus in ('publicado','reservado') or (i.estatus = 'vendido' and i.vendido_en > now() - interval '10 days'))));
create policy fotos_auth_lee on public.fotos for select to authenticated
  using ((select private.es_staff()) or exists (select 1 from public.inmuebles i where i.id = inmueble_id
    and (i.estatus in ('publicado','reservado') or (i.estatus = 'vendido' and i.vendido_en > now() - interval '10 days'))));
create policy fotos_staff_alta on public.fotos for insert to authenticated with check ((select private.es_staff()));
create policy fotos_staff_edita on public.fotos for update to authenticated using ((select private.es_staff())) with check ((select private.es_staff()));
create policy fotos_staff_borra on public.fotos for delete to authenticated using ((select private.es_staff()));

-- Asesores: los lee el personal; solo admin los da de alta o cambia
create policy asesores_lee on public.asesores for select to authenticated using ((select private.es_staff()));
create policy asesores_admin_alta on public.asesores for insert to authenticated with check ((select private.es_admin()));
create policy asesores_admin_edita on public.asesores for update to authenticated using ((select private.es_admin())) with check ((select private.es_admin()));
create policy asesores_admin_borra on public.asesores for delete to authenticated using ((select private.es_admin()));

-- Prospectos: el portal solo inserta (con consentimiento, sin elegir estatus ni asesor) y no puede leer nada
create policy prospectos_alta_publica on public.prospectos for insert to anon
  with check (estatus = 'Nuevo contacto' and asesor_id is null and consentimiento_en is not null);
create policy prospectos_staff on public.prospectos for all to authenticated
  using ((select private.es_staff())) with check ((select private.es_staff()));

create policy bitacora_staff on public.bitacora for all to authenticated
  using ((select private.es_staff())) with check ((select private.es_staff()));

-- ---------------------------------------------------------------
-- Almacenamiento de fotos (bucket público de lectura, escritura solo personal)
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('inmuebles', 'inmuebles', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy fotos_storage_staff_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'inmuebles' and private.es_staff());
create policy fotos_storage_staff_update on storage.objects for update to authenticated
  using (bucket_id = 'inmuebles' and private.es_staff()) with check (bucket_id = 'inmuebles' and private.es_staff());
create policy fotos_storage_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = 'inmuebles' and private.es_staff());

-- ---------------------------------------------------------------
-- Dar acceso a una persona del equipo
-- 1. Supabase → Authentication → Users → Add user (correo y contraseña, "Auto confirm").
-- 2. Enlazarla como asesor:
--    insert into public.asesores (auth_id, nombre, email, rol)
--    select id, 'Nombre Apellido', email, 'asesor' from auth.users where email = 'correo@ejemplo.com';
-- ---------------------------------------------------------------
