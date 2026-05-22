## Causa del delay de 20s

Confirmado por el síntoma (solo en preview de Lovable, URL cambia y header aparece pero contenido vacío): **Vite del sandbox compila el chunk de la ruta `/edificios` la primera vez que entras**. El bundle incluye `EdificiosTable`, `EdificioCard`, `EdificioPlaceholder` y arrastra `EdificioFormDialog` (lazy pero pre-resuelto). En preview eso son ~15-20s reales de compilación. **En el sitio publicado es instantáneo** porque los chunks ya están pre-compilados y servidos por CDN.

Esto no es un bug de tu código ni de la base de datos (verifiqué: 1 condominio, 18 unidades, las queries tardan ms). Es inherente al dev server.

## Lo que sí puedo hacer ahora

Dos mejoras pequeñas que reducen el tiempo de "pantalla vacía" en preview y ayudan también en producción al hacer el primer paint más liviano:

### 1. `pendingComponent` en `/edificios` y `/edificios/$edificioId`
Agregar un skeleton del listado que se muestra **inmediatamente** al hacer clic, mientras Vite compila/descarga el chunk. Así no ves "header + vacío" sino "header + skeleton" desde el primer frame.

Archivos: `src/routes/edificios.index.tsx`, `src/routes/edificios.$edificioId.tsx`.

### 2. Adelgazar el chunk de la ruta
- Hacer `EdificiosTable` lazy (solo se carga si cambias a vista tabla).
- Quitar el import directo de `EdificioFormDialog` desde `EdificiosTable` y dejarlo solo lazy.

Archivos: `src/routes/edificios.index.tsx`, `src/components/edificios/EdificiosTable.tsx`.

## Lo que recomiendo de verdad

**Publica el proyecto y abre la URL publicada.** Vas a ver que la navegación entre módulos es prácticamente instantánea. Los 20s que estás midiendo no existen fuera del preview del editor.

```
<presentation-actions>
<presentation-open-publish>Publicar app</presentation-open-publish>
</presentation-actions>
```

¿Aplico las dos mejoras de arriba o prefieres publicar primero y verificar?
