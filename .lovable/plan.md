## Cambios en el formulario "Nuevo edificio"

### 1. Dropdowns Departamento → Ciudad (Honduras)
- Nuevo archivo `src/lib/honduras-geo.ts` con los 18 departamentos y sus principales ciudades/municipios.
- Reemplazar los `Input` de Ciudad y Departamento por dos `Select`:
  - **Departamento**: lista los 18 (Francisco Morazán, Cortés, Atlántida, …).
  - **Ciudad**: se habilita al elegir departamento y muestra solo las ciudades de ese depto. Si cambia el depto se limpia la ciudad.
- Opción "Otra…" en ciudad para permitir un valor manual cuando no esté en la lista.

### 2. Pin de Google Maps para la dirección
- Activar el conector **Google Maps Platform** (Lovable Cloud → Connectors). Sin el conector el mapa no carga; lo pediré durante el build.
- Añadir columnas `latitud numeric` y `longitud numeric` a `condominios` (migración Supabase).
- Reemplazar el campo "Dirección" por un componente nuevo `AddressMapPicker`:
  - Input de autocompletado usando **Places API (New)** (`PlaceAutocompleteElement` / `fetchAutocompleteSuggestions`) cargado con el browser key `VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`.
  - Mapa interactivo (`google.maps.Map` + `google.maps.Marker`) bajo el input, alto ~220px.
  - Pin **arrastrable**: al soltar, hace reverse-geocoding vía gateway (`/maps/api/geocode/json?latlng=…`) para rellenar dirección.
  - Al seleccionar una sugerencia, centra el mapa, mueve el pin y autocompleta dirección, y si los componentes lo permiten, sugiere departamento/ciudad (el usuario puede sobreescribir).
  - Botón "Usar mi ubicación" (opcional, geolocation del navegador).
  - Centro inicial: Tegucigalpa (14.0723, -87.1921) con zoom 12; si el edificio se está editando y ya tiene lat/lng, usa esos.
- Guardar `direccion`, `latitud`, `longitud` en el submit del formulario.

### 3. Visualización
- En la ficha del edificio (`/edificios/$edificioId`, tab Resumen) mostrar un mini-mapa estático con el pin si hay coordenadas.

## Detalles técnicos

- Carga del SDK de Maps **solo en el cliente** (dentro de `useEffect`, con `loading=async` y `callback=initMap`) — evita SSR crash.
- Usar `google.maps.Marker` (NO `AdvancedMarkerElement`, requiere `mapId`).
- Reverse geocoding y autocomplete de Places (New) van por el **gateway** `https://connector-gateway.lovable.dev/google_maps` con headers `Authorization: Bearer LOVABLE_API_KEY` + `X-Connection-Api-Key`. Como el browser key sí está autorizado para Places (New), el autocomplete puede ir directo en navegador; el reverse-geocoding **debe** ir por gateway desde una `createServerFn`.
- Nueva `createServerFn` `reverseGeocode({ lat, lng })` en `src/lib/geo.functions.ts`.
- Migración:
  ```sql
  ALTER TABLE public.condominios
    ADD COLUMN latitud numeric,
    ADD COLUMN longitud numeric;
  ```

## Orden de ejecución
1. Pedir activación del conector Google Maps Platform.
2. Migración para `latitud`/`longitud`.
3. `honduras-geo.ts` + dropdowns dependientes.
4. `AddressMapPicker` + `reverseGeocode` server fn.
5. Integrar en `EdificioFormDialog` y mostrar mini-mapa en la ficha.