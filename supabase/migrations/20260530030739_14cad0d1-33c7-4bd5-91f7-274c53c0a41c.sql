-- Insert new plans first
INSERT INTO public.planes (nombre, precio_mensual, max_unidades, max_residentes, activo)
VALUES
  ('Lobby', 890, 50, 150, true),
  ('Torre', 2490, 300, 900, true),
  ('Penthouse', 4990, NULL, NULL, true);

-- Move all subscriptions to Lobby
UPDATE public.suscripciones
SET plan_id = (SELECT id FROM public.planes WHERE nombre = 'Lobby');

-- Now safe to remove old plans
DELETE FROM public.planes WHERE nombre IN ('Free','Pro','Enterprise');