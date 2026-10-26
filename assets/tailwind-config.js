/* Configuración de Tailwind (CDN) compartida por portal y consola.
 * Los colores salen de variables CSS (assets/vertice.css) para que el tema claro/oscuro
 * cambie sin duplicar clases. Para producción: mover a tailwind.config.js con build. */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surface2: 'rgb(var(--surface2) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ember: { DEFAULT: 'rgb(var(--ember) / <alpha-value>)', ink: 'rgb(var(--ember-ink) / <alpha-value>)' },
        tide: 'rgb(var(--tide) / <alpha-value>)',
        moss: 'rgb(var(--moss) / <alpha-value>)',
        ochre: 'rgb(var(--ochre) / <alpha-value>)'
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      }
    }
  }
};
