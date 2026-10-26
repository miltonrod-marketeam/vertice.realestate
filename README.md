# VÉRTICE · Portal inmobiliario + consola CMS/CRM (demo)

Demo estático de un portal de propiedades en San Miguel de Allende y su consola de administración.
Pensado para mostrar la interfaz y para que otro desarrollador lo conecte a una base de datos real.

- **Portal:** `/` (`index.html`)
- **Consola:** `/admin/` (`admin/index.html`)
- **Stack:** HTML + Tailwind (CDN) + JavaScript sin framework. No hay build.

## Estado actual: demo

Los datos viven en `localStorage` del navegador (claves `vertice.v2.inventario` y `vertice.v2.prospectos`),
sembrados desde `data/inventario.js`. Lo que se edite en `/admin/` se refleja en el portal del mismo navegador.
En la pestaña **Datos** de la consola se puede exportar, importar y restablecer.

Todos los nombres, teléfonos y prospectos son ficticios. Las fotos son de Unsplash (stock).
Las cifras de plusvalía y el simulador son ilustrativos.

## Estructura

```
index.html            Portal público
admin/index.html      Consola (inventario, prospectos, bitácora, datos)
assets/core.js        Utilidades, tema claro/oscuro, store de datos, modales
assets/portal.js      Lógica del portal (filtros, ficha, simulador, formularios)
assets/admin.js       Lógica de la consola
assets/vertice.css    Sistema de diseño (tokens, componentes)
assets/tailwind-config.js
data/inventario.js    Datos semilla
docs/esquema.sql      Esquema PostgreSQL propuesto
vercel.json           cleanUrls + cabeceras
```

## Pendiente para producción

1. **Base de datos.** Reemplazar `Vertice.store` (en `assets/core.js`) por llamadas a una API.
   La interfaz ya usa únicamente `inventario()`, `saveInventario()`, `prospectos()`, `saveProspectos()`,
   `addProspecto()` y `reset()`. Esquema sugerido en `docs/esquema.sql`.
2. **Autenticación.** `/admin/` hoy es público. Añadir login (Supabase Auth, Auth.js, Clerk…) y roles
   (admin / asesor). Proteger la API, no solo la página. Ver políticas RLS de ejemplo.
3. **Formularios públicos.** Hoy guardan en localStorage. Enviar a un endpoint con validación en servidor,
   captcha y límite de peticiones; agregar aviso de privacidad (LFPDPPP).
4. **Imágenes.** Subir a almacenamiento propio (Supabase Storage, Cloudinary, S3) en vez de enlaces externos.
5. **Tailwind.** Sustituir el CDN por build (`tailwindcss` CLI) para producción.
6. **Seguridad.** El código ya escapa todo el HTML dinámico (`Vertice.esc`) y filtra URLs (`Vertice.safeUrl`);
   mantener esa disciplina o migrar a un framework con escape por defecto. Añadir CSP al cerrar dependencias.
7. **SEO.** Los enlaces por propiedad usan hash (`/#/propiedad/REF`). Con backend, pasar a rutas reales con
   render en servidor y metadatos por propiedad.
8. **Contacto real.** Cambiar WhatsApp y correo en `data/inventario.js` (`config`).

## Publicar

**GitHub:** crear repositorio y subir esta carpeta tal cual.
**Vercel:** *Add New → Project* → importar el repositorio → Framework Preset *Other* → sin comando de build ni directorio de salida → Deploy.

## Desarrollo local

```
npx serve .
```
