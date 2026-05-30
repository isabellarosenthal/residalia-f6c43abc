import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const residentSignupSchema = z.object({
  email: z.string().email().max(255).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(6).max(128),
  fullName: z.string().min(1).max(200).transform((value) => value.trim()),
  invitationCode: z.string().min(6).max(6).regex(/^[A-Z0-9]+$/).transform((value) => value.trim().toUpperCase()),
});

export const createResidentAccount = createServerFn({ method: "POST" })
  .inputValidator((input) => residentSignupSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("invitaciones_residente")
      .select("id,email,residente_id,unidad_id,condominio_id,estado,expira_en")
      .eq("codigo", data.invitationCode)
      .maybeSingle();

    if (invitationError) throw new Error(invitationError.message);
    if (!invitation) throw new Error("Código de invitación inválido.");
    if (invitation.email.toLowerCase() !== data.email) throw new Error("El correo no coincide con la invitación.");
    if (invitation.estado !== "pendiente") throw new Error("Este código ya fue usado o no está disponible.");
    if (new Date(invitation.expira_en).getTime() < Date.now()) throw new Error("El código de invitación expiró.");
    if (!invitation.residente_id) throw new Error("La invitación no está vinculada a un residente.");

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        role: "residente",
        invitation_code: data.invitationCode,
      },
    });

    if (createError) throw new Error(createError.message);
    const userId = created.user.id;

    const rollback = async () => {
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
    };

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: data.fullName,
      email: data.email,
    }, { onConflict: "id" });
    if (profileError) {
      await rollback();
      throw new Error(profileError.message);
    }

    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "residente" });
    if (roleError) {
      await rollback();
      throw new Error(roleError.message);
    }

    const { error: residentError } = await supabaseAdmin
      .from("residentes")
      .update({ user_id: userId })
      .eq("id", invitation.residente_id);
    if (residentError) {
      await rollback();
      throw new Error(residentError.message);
    }

    const { error: memberError } = await supabaseAdmin.from("condominio_members").upsert({
      condominio_id: invitation.condominio_id,
      user_id: userId,
      role: "member",
    }, { onConflict: "condominio_id,user_id" });
    if (memberError) {
      await rollback();
      throw new Error(memberError.message);
    }

    const { error: invitationUpdateError } = await supabaseAdmin
      .from("invitaciones_residente")
      .update({ estado: "usada", usada_en: new Date().toISOString(), usada_por: userId })
      .eq("id", invitation.id);
    if (invitationUpdateError) {
      await rollback();
      throw new Error(invitationUpdateError.message);
    }

    return { ok: true };
  });