# VÉRTICE · Portal inmobiliario + consola CMS/CRM

Demo estático de un portal de propiedades en San Miguel de Allende y su consola de administración.
Sitio estático (sin build) conectado a Supabase para datos, acceso y fotos.

- **Portal:** `/` (plantilla `portal.html`, servida por `api/inicio.js` con el contenido incluido)
- **Inmueble:** `/propiedad/REF` (`api/propiedad.js`)
- **Consola:** `/admin/` (`admin/index.html`)
- **Stack:** HTML + Tailwind (compilado a `assets/tailwind.css`) + JavaScript sin framework. Vercel sirve los archivos tal cual.

## Estado actual: conectado a Supabase

- **Base de datos:** Supabase, proyecto `vertice-realestate` (`https://qlrcwlrrkdcnrnnvupmd.supabase.co`), separado de otros proyectos.
  Esquema completo, permisos y disparadores en `docs/esquema.sql`.
- **Conexión:** `assets/db.js` define `Vertice.store` con las mismas firmas que usaba el demo
  (`inventario()`, `saveInventario()`, `prospectos()`, `saveProspectos()`, `addProspecto()`).
  Lee todo al cargar la página y guarda los cambios en segundo plano, solo lo que cambió.
  La clave en ese archivo es la pública (*publishable*): lo que cada quien puede leer o escribir lo decide RLS.
- **Consola `/admin/`:** pide correo y contraseña (Supabase Auth). Solo entra quien esté en la tabla `asesores` y activo.
  Tiene "¿Olvidaste tu contraseña?" (correo con enlace) y "Cambiar contraseña" con la sesión abierta.
- **Edición simultánea:** cada guardado compara la versión (`actualizado_en`). Si otra persona guardó antes,
  se avisa y no se sobrescribe; hay que recargar.
- **Formularios:** límite de 3 envíos por teléfono por hora y 30 en total cada 10 minutos (en la base),
  más un campo trampa invisible que descarta bots.
- **Portal:** muestra inmuebles publicados y reservados. Los formularios de inspección y consignación solo pueden
  insertar prospectos (con consentimiento); no pueden leer nada. La base asigna asesor en rotación y crea la primera nota.
- **Fotos:** se comprimen en el navegador y se suben al bucket `inmuebles` (máx. 10 por inmueble, 5 MB, JPG/PNG/WebP).
  Al quitar una foto o borrar el inmueble, el archivo se borra del almacenamiento.

Los inmuebles, asesores y prospectos de ejemplo son ficticios. Las fotos de ejemplo son de Unsplash.
`data/inventario.js` queda solo como configuración (marca, WhatsApp, correo, tipo de cambio) y respaldo de los datos semilla.

## Estructura

```
portal.html           Plantilla del portal público
api/inicio.js         Portada con catálogo, preguntas y datos estructurados en el HTML
api/propiedad.js      Página de cada inmueble (/propiedad/REF) con datos estructurados
api/sitemap.js        sitemap.xml desde la base
api/robots.js         robots.txt
api/llms.js           llms.txt (resumen para motores de IA)
api/_lib.js           Utilidades compartidas de las funciones
assets/dibujos.js     Dibujos técnicos y siluetas de zonas (sustituyen íconos genéricos)
admin/index.html      Consola (inventario, prospectos, bitácora, datos)
assets/core.js        Utilidades, tema claro/oscuro, iconos, modales
assets/db.js          Conexión con Supabase (store, acceso, subida de fotos)
assets/portal.js      Lógica del portal (filtros, ficha, simulador, formularios)
assets/admin.js       Lógica de la consola
assets/vertice.css    Sistema de diseño (tokens, componentes)
assets/tailwind-config.js  Tema de Tailwind (colores, tipografías)
assets/tailwind.css  CSS compilado: se regenera con `npm install && npm run css`
src/tailwind.css     Entrada del build de Tailwind
data/inventario.js    Configuración y datos semilla
docs/esquema.sql      Esquema real de la base (tablas, RLS, disparadores, bucket)
vercel.json           cleanUrls + cabeceras
```

## Pendiente

**Configuración en Supabase (una vez):** Authentication → URL Configuration → poner la dirección del sitio en
*Site URL* y agregar `https://<tu-dominio>/admin/` en *Redirect URLs*. Sin esto, el enlace de "olvidé mi contraseña"
regresa a localhost. El correo integrado de Supabase solo envía a miembros del equipo del proyecto; para que llegue
a otros asesores hay que configurar un SMTP propio (Authentication → Emails → SMTP).

**Datos del negocio:**
1. Aviso de privacidad (LFPDPPP) enlazado desde los formularios: falta responsable y correo de contacto.
2. WhatsApp y correo reales en `data/inventario.js` (`config`).
3. Dominio propio (si aplica) y quitar el aviso "Demo de interfaz" del portal.

**Desarrollo:**
4. Captura por voz del inmueble en la consola.
5. Captcha (Cloudflare Turnstile) si el límite de envíos no basta.

## SEO y GEO

- **Páginas reales:** la portada y cada `/propiedad/REF` salen del servidor con el texto completo, así que
  Google y los motores de IA que no ejecutan JavaScript (ChatGPT, Claude, Perplexity) leen el catálogo.
- **Datos estructurados (schema.org):** `RealEstateListing` con `Offer` en MXN, ubicación con coordenadas,
  características del inmueble, migas de pan, `RealEstateAgent`, `ItemList` de la colección y `FAQPage`.
- **`/sitemap.xml`, `/robots.txt` y `/llms.txt`** se generan desde la base: un inmueble aparece al publicarlo
  en la consola y desaparece al pasarlo a borrador o vendido.
- Las respuestas se guardan 5 minutos en la red de Vercel para no consultar la base en cada visita.
- La dirección del sitio se toma de la petición: sirve igual con el dominio de Vercel o con uno propio.
- Al lanzar: dar de alta el sitio en Google Search Console y enviar `/sitemap.xml`.

## Publicar

**GitHub:** crear repositorio y subir esta carpeta tal cual.
**Vercel:** *Framework Preset Other*, sin comando de build. El CSS compilado va en el repositorio; si cambias clases, corre `npm run css` antes de subir.

## Desarrollo local

```
npm install
npx vercel dev      # sirve el sitio con las funciones de /api
```
Sin funciones, `npx serve .` y abrir `/portal.html` también funciona (sin contenido prerenderizado).
