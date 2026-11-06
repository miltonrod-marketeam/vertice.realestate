# VÉRTICE · Portal inmobiliario + consola CMS/CRM

Demo estático de un portal de propiedades en San Miguel de Allende y su consola de administración.
Sitio estático (sin build) conectado a Supabase para datos, acceso y fotos.

- **Portal:** `/` (`index.html`)
- **Consola:** `/admin/` (`admin/index.html`)
- **Stack:** HTML + Tailwind (CDN) + JavaScript sin framework. No hay build.

## Estado actual: conectado a Supabase

- **Base de datos:** Supabase, proyecto `vertice-realestate` (`https://qlrcwlrrkdcnrnnvupmd.supabase.co`), separado de otros proyectos.
  Esquema completo, permisos y disparadores en `docs/esquema.sql`.
- **Conexión:** `assets/db.js` define `Vertice.store` con las mismas firmas que usaba el demo
  (`inventario()`, `saveInventario()`, `prospectos()`, `saveProspectos()`, `addProspecto()`).
  Lee todo al cargar la página y guarda los cambios en segundo plano, solo lo que cambió.
  La clave en ese archivo es la pública (*publishable*): lo que cada quien puede leer o escribir lo decide RLS.
- **Consola `/admin/`:** pide correo y contraseña (Supabase Auth). Solo entra quien esté en la tabla `asesores` y activo.
- **Portal:** muestra inmuebles publicados y reservados. Los formularios de inspección y consignación solo pueden
  insertar prospectos (con consentimiento); no pueden leer nada. La base asigna asesor en rotación y crea la primera nota.
- **Fotos:** se comprimen en el navegador y se suben al bucket `inmuebles` (máx. 10 por inmueble, 5 MB, JPG/PNG/WebP).

Los inmuebles, asesores y prospectos de ejemplo son ficticios. Las fotos de ejemplo son de Unsplash.
`data/inventario.js` queda solo como configuración (marca, WhatsApp, correo, tipo de cambio) y respaldo de los datos semilla.

## Estructura

```
index.html            Portal público
admin/index.html      Consola (inventario, prospectos, bitácora, datos)
assets/core.js        Utilidades, tema claro/oscuro, iconos, modales
assets/db.js          Conexión con Supabase (store, acceso, subida de fotos)
assets/portal.js      Lógica del portal (filtros, ficha, simulador, formularios)
assets/admin.js       Lógica de la consola
assets/vertice.css    Sistema de diseño (tokens, componentes)
assets/tailwind-config.js
data/inventario.js    Configuración y datos semilla
docs/esquema.sql      Esquema real de la base (tablas, RLS, disparadores, bucket)
vercel.json           cleanUrls + cabeceras
```

## Pendiente para producción

1. **Edición simultánea.** Si dos personas editan el mismo inmueble a la vez, gana el último en guardar.
   Para un equipo grande conviene guardar por registro con control de versión o usar Supabase Realtime.
2. **Formularios públicos.** Agregar captcha (Cloudflare Turnstile) y límite de peticiones con una Edge Function,
   y publicar el aviso de privacidad (LFPDPPP) enlazado desde los formularios.
3. **Recuperar contraseña** desde la consola (hoy se restablece en el panel de Supabase).
4. **Fotos huérfanas.** Al quitar una foto de un inmueble no se borra el archivo del bucket.
5. **Tailwind.** Sustituir el CDN por build (`tailwindcss` CLI).
6. **SEO.** Los enlaces por propiedad usan hash (`/#/propiedad/REF`); pasar a rutas reales con render en servidor.
7. **Contacto real.** Cambiar WhatsApp y correo en `data/inventario.js` (`config`).
8. **Captura por voz** del inmueble en la consola (siguiente fase).

## Publicar

**GitHub:** crear repositorio y subir esta carpeta tal cual.
**Vercel:** *Add New → Project* → importar el repositorio → Framework Preset *Other* → sin comando de build ni directorio de salida → Deploy.

## Desarrollo local

```
npx serve .
```
