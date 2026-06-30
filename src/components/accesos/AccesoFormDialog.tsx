import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSaveAcceso, useEdificios, useUnidades, type Acceso } from "@/lib/queries";
import { QuickAccessGrid, type QuickService } from "@/components/accesos/QuickAccessButtons";
import { Zap } from "lucide-react";

const schema = z.object({
  condominio_id: z.string().uuid("Selecciona edificio"),
  unidad_id: z.string().nullable().optional(),
  visitante_nombre: z.string().min(1, "Requerido").max(120),
  tipo: z.string().min(1),
  metodo: z.string().min(1),
  qr_code: z.string().max(120).optional().or(z.literal("")),
  vigencia: z.enum(["temporal", "permanente"]),
  fecha_entrada: z.string().min(1, "Requerido"),
  fecha_salida: z.string().optional().or(z.literal("")),
  usos_maximos: z.coerce.number().int().min(1).max(999),
  minutos_max_estadia: z.coerce.number().int().min(0).max(10080).optional().or(z.literal("")),
  dias_semana: z.array(z.number().int().min(0).max(6)).default([]),
  hora_inicio: z.string().optional().or(z.literal("")),
  hora_fin: z.string().optional().or(z.literal("")),
});
type FormVals = z.input<typeof schema>;
type FormOut = z.output<typeof schema>;

const MINUTOS_DEFAULT: Record<string, number | null> = {
  delivery: 15, proveedor: 120, servicio: 240, visita: null, otro: null, permanente: null,
};

const DIAS = [
  { v: 1, label: "Lun" }, { v: 2, label: "Mar" }, { v: 3, label: "Mié" },
  { v: 4, label: "Jue" }, { v: 5, label: "Vie" }, { v: 6, label: "Sáb" }, { v: 0, label: "Dom" },
];

const nowLocal = () => {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export function AccesoFormDialog({
  open, onOpenChange, acceso, defaultCondominioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; acceso?: Acceso | null; defaultCondominioId?: string }) {
  const save = useSaveAcceso();
  const { data: edificios = [] } = useEdificios();
  const form = useForm<FormVals, any, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: {
      condominio_id: defaultCondominioId ?? "", unidad_id: null,
      visitante_nombre: "", tipo: "visita", metodo: "manual", qr_code: "",
      vigencia: "temporal",
      fecha_entrada: nowLocal(), fecha_salida: "",
      usos_maximos: 1, minutos_max_estadia: "",
      dias_semana: [1, 2, 3, 4, 5], hora_inicio: "", hora_fin: "",
    },
  });
  const condominioId = form.watch("condominio_id");
  const tipo = form.watch("tipo");
  const vigencia = form.watch("vigencia");
  const diasSel = form.watch("dias_semana") ?? [];
  const { data: unidades = [] } = useUnidades(condominioId || undefined);

  useEffect(() => {
    if (!open) return;
    const a = acceso as any;
    form.reset({
      condominio_id: acceso?.condominio_id ?? defaultCondominioId ?? "",
      unidad_id: acceso?.unidad_id ?? null,
      visitante_nombre: acceso?.visitante_nombre ?? "",
      tipo: acceso?.tipo ?? "visita",
      metodo: acceso?.metodo ?? "manual",
      qr_code: acceso?.qr_code ?? "",
      vigencia: a?.es_permanente ? "permanente" : "temporal",
      fecha_entrada: acceso?.fecha_entrada ? new Date(acceso.fecha_entrada).toISOString().slice(0, 16) : nowLocal(),
      fecha_salida: acceso?.fecha_salida ? new Date(acceso.fecha_salida).toISOString().slice(0, 16) : "",
      usos_maximos: acceso?.usos_maximos ?? 1,
      minutos_max_estadia: acceso?.minutos_max_estadia ?? "",
      dias_semana: a?.dias_semana ?? [1, 2, 3, 4, 5],
      hora_inicio: a?.hora_inicio ?? "",
      hora_fin: a?.hora_fin ?? "",
    });
  }, [open, acceso, defaultCondominioId, form]);

  useEffect(() => {
    if (acceso) return;
    const def = MINUTOS_DEFAULT[tipo];
    form.setValue("minutos_max_estadia", def == null ? "" : String(def) as any);
  }, [tipo, acceso, form]);

  const toggleDia = (d: number) => {
    const curr = new Set(form.getValues("dias_semana") ?? []);
    if (curr.has(d)) curr.delete(d); else curr.add(d);
    form.setValue("dias_semana", Array.from(curr).sort());
  };

  const genCodigo = () => `PASE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const onSubmit = async (v: FormOut) => {
    const esPerm = v.vigencia === "permanente";
    await save.mutateAsync({
      id: acceso?.id,
      condominio_id: v.condominio_id,
      unidad_id: v.unidad_id || null,
      visitante_nombre: v.visitante_nombre,
      tipo: v.tipo, metodo: v.metodo,
      qr_code: v.qr_code?.trim() || acceso?.qr_code || genCodigo(),
      fecha_entrada: new Date(v.fecha_entrada).toISOString(),
      fecha_salida: esPerm ? null : (v.fecha_salida ? new Date(v.fecha_salida).toISOString() : null),
      usos_maximos: esPerm ? 999 : v.usos_maximos,
      minutos_max_estadia: v.minutos_max_estadia === "" || v.minutos_max_estadia == null ? null : Number(v.minutos_max_estadia),
      es_permanente: esPerm,
      dias_semana: esPerm ? (v.dias_semana ?? []) : [],
      hora_inicio: esPerm && v.hora_inicio ? v.hora_inicio : null,
      hora_fin: esPerm && v.hora_fin ? v.hora_fin : null,
    } as any);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#0F172A]">{acceso ? "Editar acceso" : "Registrar acceso"}</DialogTitle></DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!acceso && (
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-sm font-semibold text-[#0F172A]">Acceso Rápido</span>
                <span className="text-xs text-[#64748B]">— prellena el formulario</span>
              </div>
              <QuickAccessGrid
                columns={6}
                onPick={(s: QuickService) => {
                  form.setValue("visitante_nombre", s.label);
                  form.setValue("tipo", s.tipo === "delivery" ? "delivery" : "otro");
                  form.setValue("vigencia", "temporal");
                  form.setValue("usos_maximos", 1);
                  form.setValue("minutos_max_estadia", String(s.minutos) as any);
                  const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                  form.setValue("fecha_entrada", now.toISOString().slice(0, 16));
                  const exp = new Date(Date.now() + 2 * 60 * 60 * 1000);
                  exp.setMinutes(exp.getMinutes() - exp.getTimezoneOffset());
                  form.setValue("fecha_salida", exp.toISOString().slice(0, 16));
                }}
              />
            </div>
          )}
          <div>
            <Label>Edificio *</Label>
            <Select value={condominioId} onValueChange={(v) => { form.setValue("condominio_id", v); form.setValue("unidad_id", null); }}>
              <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
              <SelectContent className="max-h-72">{edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Nombre del visitante *</Label><Input {...form.register("visitante_nombre")} /></div>

          <div>
            <Label>Vigencia</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(["temporal", "permanente"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => form.setValue("vigencia", v)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${vigencia === v ? "bg-[#4A154B] text-white border-[#4A154B]" : "bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}
                >
                  {v === "temporal" ? "Temporal (visita)" : "Permanente (recurrente)"}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              {vigencia === "permanente"
                ? "Acceso recurrente (ej. empleada, niñera, entrenador). Define días y horario permitidos."
                : "Visita por una sola ocasión con fecha de entrada y salida."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => form.setValue("tipo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="proveedor">Proveedor</SelectItem>
                  <SelectItem value="servicio">Servicio</SelectItem>
                  <SelectItem value="empleado">Empleado/a</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Método</Label>
              <Select value={form.watch("metodo")} onValueChange={(v) => form.setValue("metodo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="qr">QR</SelectItem>
                  <SelectItem value="biometrico">Biométrico</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Unidad destino</Label>
            <Select value={form.watch("unidad_id") ?? "__none__"} onValueChange={(v) => form.setValue("unidad_id", v === "__none__" ? null : v)} disabled={!condominioId}>
              <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="__none__">Sin asignar</SelectItem>
                {unidades.map((u) => <SelectItem key={u.id} value={u.id}>#{u.numero}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {vigencia === "temporal" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Entrada *</Label><Input type="datetime-local" {...form.register("fecha_entrada")} /></div>
                <div><Label>Salida</Label><Input type="datetime-local" {...form.register("fecha_salida")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Entradas permitidas *</Label>
                  <Input type="number" min={1} {...form.register("usos_maximos")} />
                  <p className="text-xs text-[#64748B] mt-1">Por defecto 1 (un solo ingreso)</p>
                </div>
                <div>
                  <Label>Tiempo máx. adentro (min)</Label>
                  <Input type="number" min={0} placeholder="Sin límite" {...form.register("minutos_max_estadia")} />
                  <p className="text-xs text-[#64748B] mt-1">Delivery: 15 min sugerido</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Días permitidos *</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DIAS.map((d) => {
                    const sel = diasSel.includes(d.v);
                    return (
                      <button
                        key={d.v}
                        type="button"
                        onClick={() => toggleDia(d.v)}
                        className={`w-12 h-10 rounded-lg border text-sm font-semibold transition ${sel ? "bg-[#4A154B] text-white border-[#4A154B]" : "bg-white text-[#1E293B] border-[#E2E8F0] hover:bg-[#F8FAFC]"}`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                {diasSel.length === 0 && <p className="text-xs text-[#be185d] mt-1">Selecciona al menos un día</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Hora desde</Label><Input type="time" {...form.register("hora_inicio")} /></div>
                <div><Label>Hora hasta</Label><Input type="time" {...form.register("hora_fin")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Vigente desde *</Label>
                  <Input type="datetime-local" {...form.register("fecha_entrada")} />
                </div>
                <div>
                  <Label>Tiempo máx. adentro (min)</Label>
                  <Input type="number" min={0} placeholder="Sin límite" {...form.register("minutos_max_estadia")} />
                </div>
              </div>
            </>
          )}

          <div><Label>Código del pase</Label><Input {...form.register("qr_code")} placeholder="Se genera automáticamente si lo dejas vacío" /></div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">{save.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
