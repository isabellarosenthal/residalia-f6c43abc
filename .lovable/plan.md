Actualizar todos los tokens de color de la app a la paleta Slack (purple #4A154B, burgundy #611f69) y reemplazar los hex codes hardcoded en componentes para que todo sea coherente.

Cambios:
1. `src/styles.css`: reemplazar tokens `--primary`, `--primary-dark`, `--primary-light`, `--primary-glow`, `--accent`, `--ring`, `--sidebar`, `--sidebar-accent`, `--gradient-*`, `--shadow-*`, `--secondary-foreground`, `--accent-foreground` por valores derivados de Slack purple y burgundy.
2. `src/routes/login.tsx`: reemplazar todos los hex codes hardcoded (`#4F46E5`, `#0a1e3e`, etc.) por tokens CSS o clases Tailwind para que herede la nueva paleta automáticamente.
3. Revisar otros componentes clave (Sidebar, PlanLimitsBanner, __root, etc.) para eliminar hardcodes del antiguo indigo y aplicar los nuevos tokens.
4. Mantener colores funcionales intactos: success, danger, warning.