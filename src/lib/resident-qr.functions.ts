import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TOKEN_TTL_MS = 20_000; // expires after 20s; client refreshes every 15s
const SECRET = () =>
  process.env.RESIDENT_QR_SECRET ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "residalia-qr-fallback-change-me";

const b64url = (buf: Buffer) =>
  buf.toString("base64").replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const fromB64url = (s: string) =>
  Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4), "base64");

const sign = (payload: string) =>
  b64url(createHmac("sha256", SECRET()).update(payload).digest()).slice(0, 16);

export const mintResidentQR = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ residenteId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: res, error } = await supabase
      .from("residentes")
      .select("id, user_id, nombre, apellido, condominio_id, unidad_id")
      .eq("id", data.residenteId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!res) throw new Error("Residente no encontrado");
    if (res.user_id !== userId) throw new Error("No autorizado");

    const exp = Date.now() + TOKEN_TTL_MS;
    const payload = b64url(Buffer.from(JSON.stringify({ r: res.id, e: exp })));
    const sig = sign(payload);
    return { token: `RQR.${payload}.${sig}`, expiresAt: exp };
  });

export const validateResidentQR = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ token: z.string().min(10).max(512) }).parse(data))
  .handler(async ({ data, context }) => {
    const parts = data.token.split(".");
    if (parts.length !== 3 || parts[0] !== "RQR") throw new Error("QR inválido");
    const [, payload, sig] = parts;
    const expected = sign(payload);
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      throw new Error("Firma inválida");
    }
    let parsed: { r: string; e: number };
    try {
      parsed = JSON.parse(fromB64url(payload).toString("utf8"));
    } catch {
      throw new Error("QR malformado");
    }
    if (Date.now() > parsed.e) throw new Error("QR expirado — pide al residente uno nuevo");

    const { data: res, error } = await context.supabase
      .from("residentes")
      .select("id, nombre, apellido, tipo, condominio_id, unidad_id, condominio:condominios(nombre), unidad:unidades(numero)")
      .eq("id", parsed.r)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!res) throw new Error("Residente no encontrado");
    return { residente: res, expiresAt: parsed.e };
  });
