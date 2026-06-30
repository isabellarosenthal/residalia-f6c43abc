import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSaveResidente, useEdificios, useUnidades, usePropietarios, type Residente } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  nombre: z.string().min(1, "Requerido").max(80),
  apellido: z.string().min(1, "Requerido").max(80),
  dni: z.string().max(40).optional().or(z.literal("")),
  telefono: z.string().max(30).optional().or(z.literal("")),
  telefono_alt: z.string().max(30).optional().or(z.literal("")),
  email: z.string().email("Email inválido").max(120).optional().or(z.literal("")),
  tipo: z.enum(["propietario", "inquilino"]),
  condominio_id: z.string().uuid("Selecciona un edificio"),
  unidad_id: z.string().nullable().optional(),
  relacionado_id: z.string().nullable().optional(),
  fecha_ingreso: z.string().min(1, "Requerido"),
  foto_url: z.string().max(500).optional().or(z.literal("")),
  activo: z.boolean().default(true),
  recargo_mora_pct: z.coerce.number().min(0).max(100).default(0),
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export function ResidenteFormDialog({
  open, onOpenChange, residente, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; residente?: Residente | null; defaultCondominioId?: string }) {
  const save = useSaveResidente();
  const { data: edificios = [] } = useEdificios();
  const [confirmDup, setConfirmDup] = useState<null | { values: FormOut; existingUserId: string | null; otrosEdificios: string[] }>(null);

  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nombre: "", apellido: "", dni: "", telefono: "", telefono_alt: "", email: "",
      tipo: "propietario", condominio_id: defaultCondominioId ?? "", unidad_id: null, relacionado_id: null,
      fecha_ingreso: new Date().toISOString().slice(0, 10), foto_url: "", activo: true, recargo_mora_pct: 0,
    },
  });

  const condominioId = form.watch("condominio_id");
  const tipo = form.watch("tipo");
  const unidadId = form.watch("unidad_id");
  const { data: unidades = [] } = useUnidades(condominioId || undefined);
  const { data: propietarios = [] } = usePropietarios(condominioId || undefined, unidadId);
  const unidadesOptions = useMemo(() => unidades, [unidades]);
  const propietariosOptions = useMemo(
    () => propietarios.filter((p) => p.id !== residente?.id),
    [propietarios, residente?.id],
  );

  useEffect(() => {
    if (!open) return;
    form.reset({
      nombre: residente?.nombre ?? "",
      apellido: residente?.apellido ?? "",
      dni: residente?.dni ?? "",
      telefono: residente?.telefono ?? "",
      telefono_alt: residente?.telefono_alt ?? "",
      email: residente?.email ?? "",
      tipo: (residente?.tipo as any) ?? "propietario",
      condominio_id: residente?.condominio_id ?? defaultCondominioId ?? "",
      unidad_id: residente?.unidad_id ?? null,
      relacionado_id: (residente as any)?.relacionado_id ?? null,
      fecha_ingreso: residente?.fecha_ingreso ?? new Date().toISOString().slice(0, 10),
      foto_url: residente?.foto_url ?? "",
      activo: residente?.activo ?? true,
      recargo_mora_pct: Number((residente as any)?.recargo_mora_pct ?? 0),
    });
  }, [open, residente, defaultCondominioId, form]);

  const persist = async (v: FormOut, userIdOverride?: string | null) => {
    await save.mutateAsync({
      id: residente?.id,
      nombre: v.nombre,
      apellido: v.apellido,
      dni: v.dni || null,
      telefono: v.telefono || null,
      telefono_alt: v.telefono_alt || null,
      email: v.email || null,
      tipo: v.tipo,
      condominio_id: v.condominio_id,
      unidad_id: v.unidad_id || null,
      relacionado_id: v.tipo === "inquilino" ? (v.relacionado_id || null) : null,
      fecha_ingreso: v.fecha_ingreso,
      foto_url: v.foto_url || null,
      activo: v.activo,
      ...(userIdOverride !== undefined ? { user_id: userIdOverride } : {}),
    } as any);
    onOpenChange(false);
  };

  const onSubmit = async (v: FormOut) => {
    // Solo en creación, con email, detectar si ya es residente en otro edificio
    if (!residente?.id && v.email) {
      const { data: existentes } = await supabase
        .from("residentes")
        .select("id, condominio_id, user_id, condominio:condominios(nombre)")
        .ilike("email", v.email)
        .neq("condominio_id", v.condominio_id);
      if (existentes && existentes.length > 0) {
        const otros = Array.from(new Set(existentes.map((r: any) => r.condominio?.nombre).filter(Boolean)));
        const existingUserId = (existentes.find((r: any) => r.user_id)?.user_id) ?? null;
        setConfirmDup({ values: v, existingUserId, otrosEdificios: otros });
        return;
      }
    }
    await persist(v);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#0F172A]">{residente ? "Editar residente" : "Nuevo residente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Nombre *</Label><Input {...form.register("nombre")} /></div>
            <div><Label>Apellido *</Label><Input {...form.register("apellido")} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>DNI</Label><Input {...form.register("dni")} /></div>
            <div><Label>Teléfono</Label><Input {...form.register("telefono")} /></div>
            <div><Label>Tel. alterno</Label><Input {...form.register("telefono_alt")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input type="email" {...form.register("email")} /></div>
            <div>
              <Label>Tipo *</Label>
              <Select value={form.watch("tipo")} onValueChange={(v) => form.setValue("tipo", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="propietario">Propietario</SelectItem>
                  <SelectItem value="inquilino">Inquilino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Edificio *</Label>
              <Select value={condominioId} onValueChange={(v) => { form.setValue("condominio_id", v); form.setValue("unidad_id", null); }}>
                <SelectTrigger><SelectValue placeholder="Selecciona edificio" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unidad</Label>
              <Select
                value={form.watch("unidad_id") ?? "__none__"}
                onValueChange={(v) => form.setValue("unidad_id", v === "__none__" ? null : v)}
                disabled={!condominioId}
              >
                <SelectTrigger><SelectValue placeholder={condominioId ? "Sin asignar" : "Selecciona edificio primero"} /></SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="__none__">Sin asignar</SelectItem>
                  {unidadesOptions.map((u) => (
                    <SelectItem key={u.id} value={u.id}>#{u.numero}{u.piso != null ? ` · piso ${u.piso}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {tipo === "inquilino" && (
            <div>
              <Label>Propietario asociado</Label>
              <Select
                value={form.watch("relacionado_id") ?? "__none__"}
                onValueChange={(v) => form.setValue("relacionado_id", v === "__none__" ? null : v)}
                disabled={!condominioId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={condominioId ? "Sin propietario" : "Selecciona edificio primero"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="__none__">Sin propietario asociado</SelectItem>
                  {propietariosOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre} {p.apellido}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Vincula este inquilino al propietario de la unidad.</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Fecha de ingreso *</Label><Input type="date" {...form.register("fecha_ingreso")} /></div>
            <div><Label>Foto URL</Label><Input {...form.register("foto_url")} placeholder="https://…" /></div>
          </div>
          <div className="flex items-center justify-between border border-[#E2E8F0] rounded-lg p-3">
            <Label className="text-sm">Residente activo</Label>
            <Switch checked={form.watch("activo")} onCheckedChange={(v) => form.setValue("activo", v)} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!form.formState.isValid || save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">
              {save.isPending ? "Guardando…" : "Guardar residente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={!!confirmDup} onOpenChange={(o) => !o && setConfirmDup(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Este correo ya es residente en otro edificio</AlertDialogTitle>
          <AlertDialogDescription>
            El correo <strong>{confirmDup?.values.email}</strong> ya está registrado como residente en:{" "}
            <strong>{confirmDup?.otrosEdificios.join(", ")}</strong>.
            <br /><br />
            ¿Deseas vincularlo también a este edificio? El residente podrá cambiar entre edificios desde su portal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!confirmDup) return;
              await persist(confirmDup.values, confirmDup.existingUserId ?? null);
              setConfirmDup(null);
            }}
          >Sí, vincular</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
