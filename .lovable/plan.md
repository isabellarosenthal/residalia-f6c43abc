## Cambio

En `src/routes/configuracion.tsx` (lista `ROLES` que se usa al invitar/asignar roles a usuarios), quitar la entrada `{ value: "residente", label: "Residente" }`.

Los residentes no se invitan desde Configuración: se registran ellos mismos desde `/login` (tab "Soy residente") y se auto-vinculan por email al registro existente en `residentes`.

## Rol guardia

Agregar `{ value: "guardia", label: "Guardia" }` para que el admin sí pueda asignar guardias desde Configuración (además del signup público).

## Resultado de la lista

- Super admin
- Admin condominio
- Junta directiva
- Agente inmobiliario
- Gerente CRM
- Guardia
