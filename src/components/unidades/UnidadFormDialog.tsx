import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, IdCard, Calendar, Percent, User, ExternalLink, Users as UsersIcon } from "lucide-react";
import { useSaveUnidad, useResidentes, type Unidad, type Residente } from "@/lib/queries";

const schema = z.object({
  numero: z.string().min(1, "Requerido").max(20),
  piso: z.coerce.number().int().optional().nullable(),
  tipo: z.string().max(40).optional().or(z.literal("")),
  habitaciones: z.coerce.number().int().min(0).default(0),
  banos: z.coerce.number().int().min(0).default(0),
  banos_visita: z.coerce.number().int().min(0).default(0),
  parqueos: z.coerce.number().int().min(0).default(0),
  area_m2_construccion: z.coerce.number().min(0).optional().nullable(),
  area_m2_terreno: z.coerce.number().min(0).optional().nullable(),
  estado_administrativo: z.enum(["ocupada", "disponible", "vacia"]),
  mantenimiento_mensual: z.coerce.number().min(0).optional().nullable(),
  fecha_disponibilidad: z.string().optional().or(z.literal("")),
  estado_comercial: z.enum(["ocupada", "disponible", "en_venta", "en_renta", "en_venta_y_renta", "reservada"]),
  precio_venta: z.coerce.number().min(0).optional().nullable(),
  precio_renta: z.coerce.number().min(0).optional().nullable(),
  deposito: z.coerce.number().min(0).optional().nullable(),
  moneda: z.enum(["L", "USD"]).default("L"),
  precio_negociable: z.boolean().default(false),
  descripcion_comercial: z.string().max(2000).optional().or(z.literal("")),
  propietario_id: z.string().nullable().optional(),
  inquilino_id: z.string().nullable().optional(),
  referido_renta_nombre: z.string().max(120).optional().or(z.literal("")),
  referido_renta_agencia: z.string().max(120).optional().or(z.literal("")),
  referido_renta_url: z.string().url("URL inválida").optional().or(z.literal("")),
  referido_venta_nombre: z.string().max(120).optional().or(z.literal("")),
  referido_venta_agencia: z.string().max(120).optional().or(z.literal("")),
  referido_venta_url: z.string().url("URL inválida").optional().or(z.literal("")),
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

export function UnidadFormDialog({
  open, onOpenChange, edificioId, unidad,
}: { open: boolean; onOpenChange: (v: boolean) => void; edificioId: string; unidad?: Unidad | null }) {
  const save = useSaveUnidad();
  const { data: residentes = [] } = useResidentes();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      numero: "", piso: null, tipo: "apartamento",
      habitaciones: 0, banos: 0, banos_visita: 0, parqueos: 0,
      area_m2_construccion: null, area_m2_terreno: null,
      estado_administrativo: "disponible", mantenimiento_mensual: null, fecha_disponibilidad: "",
      estado_comercial: "disponible", precio_venta: null, precio_renta: null, deposito: null, moneda: "L",
      precio_negociable: false, descripcion_comercial: "",
      propietario_id: null, inquilino_id: null,
      referido_renta_nombre: "", referido_renta_agencia: "", referido_renta_url: "",
      referido_venta_nombre: "", referido_venta_agencia: "", referido_venta_url: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      numero: unidad?.numero ?? "",
      piso: unidad?.piso ?? null,
      tipo: unidad?.tipo ?? "apartamento",
      habitaciones: unidad?.habitaciones ?? 0,
      banos: unidad?.banos ?? 0,
      banos_visita: unidad?.banos_visita ?? 0,
      parqueos: unidad?.parqueos ?? 0,
      area_m2_construccion: unidad?.area_m2_construccion ?? null,
      area_m2_terreno: unidad?.area_m2_terreno ?? null,
      estado_administrativo: unidad?.estado_administrativo ?? "disponible",
      mantenimiento_mensual: unidad?.mantenimiento_mensual ?? null,
      fecha_disponibilidad: unidad?.fecha_disponibilidad ?? "",
      estado_comercial: unidad?.estado_comercial ?? "disponible",
      precio_venta: unidad?.precio_venta ?? null,
      precio_renta: unidad?.precio_renta ?? null,
      deposito: unidad?.deposito ?? null,
      moneda: ((unidad as any)?.moneda as "L" | "USD") ?? "L",
      precio_negociable: unidad?.precio_negociable ?? false,
      descripcion_comercial: unidad?.descripcion_comercial ?? "",
      propietario_id: unidad?.propietario_id ?? null,
      inquilino_id: unidad?.inquilino_id ?? null,
      referido_renta_nombre: (unidad as any)?.referido_renta_nombre ?? "",
      referido_renta_agencia: (unidad as any)?.referido_renta_agencia ?? "",
      referido_renta_url: (unidad as any)?.referido_renta_url ?? "",
      referido_venta_nombre: (unidad as any)?.referido_venta_nombre ?? "",
      referido_venta_agencia: (unidad as any)?.referido_venta_agencia ?? "",
      referido_venta_url: (unidad as any)?.referido_venta_url ?? "",
    });
  }, [open, unidad, form]);

  const onSubmit = async (v: FormOut) => {
    await save.mutateAsync({
      id: unidad?.id,
      condominio_id: edificioId,
      numero: v.numero,
      piso: v.piso ?? null,
      tipo: v.tipo || null,
      habitaciones: v.habitaciones,
      banos: v.banos,
      banos_visita: v.banos_visita,
      parqueos: v.parqueos,
      area_m2_construccion: v.area_m2_construccion ?? null,
      area_m2_terreno: v.area_m2_terreno ?? null,
      estado_administrativo: v.estado_administrativo,
      mantenimiento_mensual: v.mantenimiento_mensual ?? null,
      fecha_disponibilidad: v.fecha_disponibilidad || null,
      estado_comercial: v.estado_comercial,
      precio_venta: v.precio_venta ?? null,
      precio_renta: v.precio_renta ?? null,
      deposito: v.deposito ?? null,
      moneda: v.moneda,
      precio_negociable: v.precio_negociable,
      descripcion_comercial: v.descripcion_comercial || null,
      propietario_id: v.propietario_id || null,
      inquilino_id: v.inquilino_id || null,
      referido_renta_nombre: v.referido_renta_nombre || null,
      referido_renta_agencia: v.referido_renta_agencia || null,
      referido_renta_url: v.referido_renta_url || null,
      referido_venta_nombre: v.referido_venta_nombre || null,
      referido_venta_agencia: v.referido_venta_agencia || null,
      referido_venta_url: v.referido_venta_url || null,
    } as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#0F172A]">{unidad ? `Editar unidad #${unidad.numero}` : "Nueva unidad"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="datos">
            <TabsList className="grid grid-cols-2 w-full bg-[#F8FAFC]">
              <TabsTrigger value="datos">Datos generales</TabsTrigger>
              <TabsTrigger value="admin">Administración</TabsTrigger>
            </TabsList>

            <TabsContent value="datos" className="space-y-3 pt-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Número *</Label>
                  <Input {...form.register("numero")} placeholder="101" />
                </div>
                <div>
                  <Label>Piso</Label>
                  <Input type="number" {...form.register("piso")} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.watch("tipo") || ""} onValueChange={(v) => form.setValue("tipo", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="bodega">Bodega</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div><Label>Habitaciones</Label><Input type="number" min={0} {...form.register("habitaciones")} /></div>
                <div><Label>Baños</Label><Input type="number" min={0} {...form.register("banos")} /></div>
                <div><Label>B. visita</Label><Input type="number" min={0} {...form.register("banos_visita")} /></div>
                <div><Label>Parqueos</Label><Input type="number" min={0} {...form.register("parqueos")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>m² construcción</Label><Input type="number" step="0.01" {...form.register("area_m2_construccion")} /></div>
                <div><Label>m² terreno</Label><Input type="number" step="0.01" {...form.register("area_m2_terreno")} /></div>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-3 pt-4">
              <div>
                <Label>Estado administrativo *</Label>
                <Select value={form.watch("estado_administrativo")} onValueChange={(v) => form.setValue("estado_administrativo", v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="ocupada">Ocupada</SelectItem>
                    <SelectItem value="vacia">Vacía</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Mantenimiento mensual</Label><Input type="number" step="0.01" {...form.register("mantenimiento_mensual")} /></div>
                <div><Label>Fecha disponibilidad</Label><Input type="date" {...form.register("fecha_disponibilidad")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Propietario</Label>
                  <Select
                    value={form.watch("propietario_id") ?? "__none__"}
                    onValueChange={(v) => form.setValue("propietario_id", v === "__none__" ? null : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value="__none__">Sin asignar</SelectItem>
                      {residentes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.nombre} {r.apellido ?? ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Inquilino</Label>
                  <Select
                    value={form.watch("inquilino_id") ?? "__none__"}
                    onValueChange={(v) => form.setValue("inquilino_id", v === "__none__" ? null : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value="__none__">Sin asignar</SelectItem>
                      {residentes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.nombre} {r.apellido ?? ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-[#64748B]">Si la persona aún no existe, créala primero desde el módulo de Residentes.</p>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!form.formState.isValid || save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">
              {save.isPending ? "Guardando…" : "Guardar unidad"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
