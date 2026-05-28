
-- 1. Add guardia to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'guardia';
