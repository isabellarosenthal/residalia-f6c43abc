## Plan

**1. Hero — nueva imagen del astronauta (paleta morado/azul)**
- Copiar `user-uploads://image-51.png` → `src/assets/hero-astronaut.png` (sobrescribe la actual).
- Remover fondo con `rembg` para que fluya sobre el fondo de la landing, conservando astronauta + edificio + nube + tarjetas flotantes.

**2. Aplicar nuevo brand kit Altura Cloud v1.0 globalmente**

Paleta (reemplazos hex via find-and-replace en todo `src/`):
- `#2D3748` (slate actual primario) → `#4F46E5` (Royal Blue / Primario)
- `#1F2937` (secundario actual) → `#4338CA` (Deep Indigo)
- `#64748B` (terciario) → `#475569` (Text Secondary) — coincide igual, mantener
- `#D97757` (terracotta) → `#8B5CF6` (Neutral morado / acento)
- `#E8916F` → `#7AA2FF` (Cornflower Blue)
- `#B85A3E` → `#4338CA` (Deep Indigo, hover oscuro)
- `#F8F7F5` (crema fondo) → `#F1F5F9` (Surface)
- Fondo página → `#FFFFFF`
- Texto principal → `#0F172A` (Text Primary)
- Bordes → `#E2E8F0` (Border)
- Estados: success `#16A34A`, info `#3B82F6`, warning `#F59E0B`, error `#EF4444`

**3. Tipografía**
- Headings: Poppins (SemiBold/Bold/ExtraBold)
- Body: Inter (Regular/Medium/SemiBold)
- Agregar `@import` de Google Fonts en `src/styles.css` y definir variables `--font-heading` / `--font-body`.
- Aplicar a `body` y a clases de heading (h1-h6).

**4. Tokens en `src/styles.css`**
- Actualizar variables `oklch`/`hex` del design system (`--primary`, `--secondary`, `--accent`, `--background`, `--foreground`, `--muted`, `--border`) para que shadcn use la nueva paleta.

**5. Hero (landing)**
- Mantener layout limpio (sin máscara radial, sin logos flotantes que añadimos antes), botón primario Royal Blue con texto blanco, botón secundario outline indigo.

No tocar lógica de negocio — solo imagen, colores, tipografía y tokens.