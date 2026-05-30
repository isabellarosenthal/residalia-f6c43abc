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
    const findUserByEmail = async () => {
      let page = 1;
      const perPage = 1000;

      while (page <= 10) {
        const { data: usersPage, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (error) throw new Error(error.message);

        const match = usersPage.users.find((user) => user.email?.toLowerCase() === data.email);
        if (match) return match;
        if (usersPage.users.length < perPage) return null;
        page += 1;
      }

      return null;
    };

    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from("invitaciones_residente")
      .select("id,email,residente_id,unidad_id,condominio_id,estado,expira_en,usada_por")
      .eq("codigo", data.invitationCode)
      .maybeSingle();

    if (invitationError) throw new Error(invitationError.message);
    if (!invitation) throw new Error("Código de invitación inválido.");
    if (invitation.email.toLowerCase() !== data.email) throw new Error("El correo no coincide con la invitación.");
    if (new Date(invitation.expira_en).getTime() < Date.now()) throw new Error("El código de invitación expiró.");
    if (!invitation.residente_id) throw new Error("La invitación no está vinculada a un residente.");

    const existingUser = await findUserByEmail();

    if (invitation.estado !== "pendiente") {
      if (invitation.estado !== "usada" || !invitation.usada_por) {
        throw new Error("Este código ya fue usado o no está disponible.");
      }

      if (invitation.usada_por !== existingUser?.id) {
        const { data: usedBy } = await supabaseAdmin.auth.admin.getUserById(invitation.usada_por);
        if (usedBy.user) throw new Error("Este código ya fue usado o no está disponible.");
      }
    }

    let userId = existingUser?.id;
    let createdNewUser = false;

    if (userId) {
      const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
          role: "residente",
        },
      });
      if (updateUserError) throw new Error(updateUserError.message);
    } else {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
          role: "residente",
        },
      });

      if (createError) throw new Error(createError.message);
      userId = created.user.id;
      createdNewUser = true;
    }

    if (!userId) throw new Error("No se pudo crear o recuperar la cuenta de residente.");

    const rollback = async () => {
      if (createdNewUser && userId) await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => undefined);
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

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: "residente" }, { onConflict: "user_id,role", ignoreDuplicates: true });
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