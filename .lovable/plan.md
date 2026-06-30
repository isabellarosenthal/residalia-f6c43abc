## Mora masiva desde Configuración

Agregar en `src/routes/configuracion.tsx` una sección "Mora por atraso (masivo)" con:
- Input de % de mora.
- Botón **Aplicar a todos los residentes** del edificio actual (sobrescribe `recargo_mora_pct` en todos).
- Botón **Aplicar solo a los que no tienen** (actualiza solo donde `recargo_mora_pct` es 0 o NULL).
- Confirmación antes de ejecutar + toast con cantidad actualizada.

### Backend
Nueva función RPC `aplicar_mora_masiva(_condo_id uuid, _pct numeric, _solo_vacios boolean)`:
- `SECURITY DEFINER`, valida `can_manage_condominio`.
- `UPDATE public.residentes SET recargo_mora_pct = _pct WHERE condominio_id = _condo_id [AND (recargo_mora_pct IS NULL OR recargo_mora_pct = 0)]`.
- Devuelve `integer` con filas afectadas.

### Frontend
- Hook `useAplicarMoraMasiva` en `src/lib/queries.ts` que llama el RPC e invalida `residentes`.
- UI en Configuración bajo la tarjeta del edificio, usando el `condominio_id` activo.

No cambia el flujo individual existente en el form del residente ni el botón "Aplicar mora" en cobros.