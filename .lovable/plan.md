## Plan

1. **Generar versión sin fondo** de la imagen subida usando `imagegen--edit_image` con `transparent_background: true` → guardar como `src/assets/hero-astronaut.png`.
2. **Actualizar `src/components/landing/LandingPage.tsx`**:
   - Reemplazar el import de `hero-condo.jpg` por `hero-astronaut.png` en la sección hero.
   - Quitar el contenedor con fondo/marco de la imagen (sin `rounded`, sin `shadow`, sin `bg`) para que el PNG transparente fluya con el fondo crema de la landing.
3. **Verificar el resto de la landing**: confirmé con búsqueda que no existen otras imágenes ni emojis de astronauta en el código (`rg` no encontró coincidencias). La única imagen visual en la landing es el hero, así que no hay otros astronautas que remover.

Nota: si te referías a otra cosa con "el resto de los astronautas" (ej. tarjetas de features o ilustraciones que ves en preview), avísame qué sección y la quito.