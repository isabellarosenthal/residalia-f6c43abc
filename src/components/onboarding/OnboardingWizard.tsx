import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { Building2, Home, Users, Wallet, Check, X, ArrowRight, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  useEdificios, useSaveEdificio, useBulkCreateUnidades, useUnidades,
  useSaveResidente, useGenerarCobrosMensuales,
} from "@/lib/queries";

type Props = { open: boolean; onClose: () => void };

const STEPS = [
  { icon: Building2, label: "Edificio" },
  { icon: Home, label: "Unidades" },
  { icon: Users, label: "Residente" },
  { icon: Wallet, label: "Cobros" },
];

export function OnboardingWizard({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1: edificio
  const [edif, setEdif] = useState({ nombre: "", ciudad: "Tegucigalpa", cuota_base: 2500, moneda: "L" });
  const [edificioId, setEdificioId] = useState<string | null>(null);
  const saveEdif = useSaveEdificio();

  // Step 2: unidades
  const [pisos, setPisos] = useState(5);
  const [porPiso, setPorPiso] = useState(4);
  const [tipo, setTipo] = useState("apartamento");
  const bulkUnidades = useBulkCreateUnidades();
  const { data: unidades = [] } = useUnidades(edificioId ?? undefined);

  // Step 3: residente
  const [res, setRes] = useState({ nombre: "", apellido: "", telefono: "", unidad_id: "" });
  const [tipoRes, setTipoRes] = useState<"propietario" | "inquilino">("propietario");
  const saveRes = useSaveResidente();

  // Step 4: cobros
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const generarCobros = useGenerarCobrosMensuales();

  const close = () => {
    localStorage.setItem("onboarding:done", "1");
    onClose();
  };

  const handleStep1 = async () => {
    if (!edif.nombre) return toast.error("Falta nombre");
    const created = await saveEdif.mutateAsync(edif as any);
    setEdificioId(created.id);
    setStep(1);
  };

  const handleStep2 = async () => {
    if (!edificioId) return;
    const rows = [];
    for (let p = 1; p <= pisos; p++) {
      for (let u = 1; u <= porPiso; u++) {
        rows.push({
          condominio_id: edificioId,
          numero: `${p}${String(u).padStart(2, "0")}`,
          piso: p, tipo,
        } as any);
      }
    }
    await bulkUnidades.mutateAsync(rows);
    setStep(2);
  };

  const handleStep3 = async () => {
    if (!edificioId || !res.nombre || !res.apellido || !res.unidad_id) return toast.error("Completa los campos");
    await saveRes.mutateAsync({
      condominio_id: edificioId,
      nombre: res.nombre, apellido: res.apellido, telefono: res.telefono || null,
      unidad_id: res.unidad_id, tipo: tipoRes,
    } as any);
    // marcar unidad como ocupada
    const patch: any = tipoRes === "propietario" ? { propietario_id: null } : { inquilino_id: null };
    await supabase.from("unidades").update({ estado_administrativo: "ocupada", ...patch }).eq("id", res.unidad_id);
    setStep(3);
  };

  const handleStep4 = async () => {
    if (!edificioId) return;
    const [y, m] = mes.split("-");
    const venc = `${y}-${m}-05`;
    const { data: us } = await supabase.from("unidades").select("id").eq("condominio_id", edificioId);
    const unidadIds = (us ?? []).map((u) => u.id);
    await generarCobros.mutateAsync({ edificioId, mes, concepto: "Mantenimiento", vencimiento: venc, unidadIds });
    toast.success("¡Listo! Tu edificio está operando 🎉");
    close();
    navigate({ to: "/dashboard" });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl bg-[#ffffff] border-[#e8ecf3]">
        <button onClick={close} className="absolute right-4 top-4 text-[#6b7a99] hover:text-[#0a1e3f]"><X className="w-4 h-4" /></button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#0a1e3f]" />
          <span className="text-xs uppercase tracking-widest text-[#6b7a99] font-semibold">Bienvenido a Altura Cloud</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl text-[#0a1e3f]">Configura tu primer edificio en 4 pasos</h2>

        {/* Stepper */}
        <div className="flex items-center justify-between my-4 px-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors font-display font-extrabold ${
                    done ? "bg-[#166534] text-white" : active ? "bg-[#ffd60a] text-[#0a1e3f]" : "bg-[#fffdf5] text-[#6b7a99]"
                  }`}>
                    {done ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs ${active ? "text-[#0a1e3f] font-semibold" : "text-[#6b7a99]"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${done ? "bg-[#166534]" : "bg-[#fffdf5]"}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[#e8ecf3] rounded-2xl p-5 space-y-3">
          {step === 0 && (
            <>
              <h3 className="font-display font-bold text-[#0a1e3f]">Datos del edificio</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Nombre</Label><Input value={edif.nombre} onChange={(e) => setEdif({ ...edif, nombre: e.target.value })} placeholder="Torres del Valle" /></div>
                <div><Label>Ciudad</Label><Input value={edif.ciudad} onChange={(e) => setEdif({ ...edif, ciudad: e.target.value })} /></div>
                <div><Label>Cuota mensual base</Label><Input type="number" value={edif.cuota_base} onChange={(e) => setEdif({ ...edif, cuota_base: Number(e.target.value) })} /></div>
                <div><Label>Moneda</Label><Input value={edif.moneda} onChange={(e) => setEdif({ ...edif, moneda: e.target.value })} /></div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="font-display font-bold text-[#0a1e3f]">Genera tus unidades</h3>
              <p className="text-sm text-[#6b7a99]">Se crearán <b>{pisos * porPiso}</b> unidades numeradas (101, 102, …)</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div><Label>Pisos</Label><Input type="number" min={1} value={pisos} onChange={(e) => setPisos(Math.max(1, Number(e.target.value)))} /></div>
                <div><Label>Unidades por piso</Label><Input type="number" min={1} value={porPiso} onChange={(e) => setPorPiso(Math.max(1, Number(e.target.value)))} /></div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="oficina">Oficina</SelectItem>
                      <SelectItem value="local">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-display font-bold text-[#0a1e3f]">Registra tu primer residente</h3>
              <p className="text-sm text-[#6b7a99]">Puedes agregar más desde el módulo Residentes</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Nombre</Label><Input value={res.nombre} onChange={(e) => setRes({ ...res, nombre: e.target.value })} /></div>
                <div><Label>Apellido</Label><Input value={res.apellido} onChange={(e) => setRes({ ...res, apellido: e.target.value })} /></div>
                <div><Label>Teléfono</Label><Input value={res.telefono} onChange={(e) => setRes({ ...res, telefono: e.target.value })} /></div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={tipoRes} onValueChange={(v) => setTipoRes(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="propietario">Propietario</SelectItem>
                      <SelectItem value="inquilino">Inquilino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Unidad asignada</Label>
                  <Select value={res.unidad_id} onValueChange={(v) => setRes({ ...res, unidad_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecciona unidad" /></SelectTrigger>
                    <SelectContent>
                      {unidades.map(u => <SelectItem key={u.id} value={u.id}>Unidad {u.numero}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="font-display font-bold text-[#0a1e3f]">Genera los cobros del mes</h3>
              <p className="text-sm text-[#6b7a99]">Se crearán cobros de mantenimiento para todas las unidades ocupadas</p>
              <div><Label>Mes (YYYY-MM)</Label><Input value={mes} onChange={(e) => setMes(e.target.value)} /></div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-4">
          <Button variant="ghost" onClick={close} className="text-[#6b7a99]">Omitir</Button>
          <div className="flex gap-2">
            {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)}>Atrás</Button>}
            {step === 0 && <Button className="bg-[#0a1e3f] hover:bg-[#001a4d]" onClick={handleStep1} disabled={saveEdif.isPending}>Continuar <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 1 && <Button className="bg-[#0a1e3f] hover:bg-[#001a4d]" onClick={handleStep2} disabled={bulkUnidades.isPending}>Generar {pisos * porPiso} unidades <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 2 && <Button className="bg-[#0a1e3f] hover:bg-[#001a4d]" onClick={handleStep3} disabled={saveRes.isPending}>Continuar <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 3 && <Button className="bg-[#166534] hover:bg-[#1f4a1f]" onClick={handleStep4} disabled={generarCobros.isPending}>Finalizar <Check className="w-4 h-4 ml-1" /></Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useShouldShowOnboarding() {
  const { data: edificios, isLoading, isFetching, isError, isSuccess } = useEdificios();
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("onboarding:done") === "1") return false;
  if (isLoading || isFetching || isError || !isSuccess || !edificios) return false;
  if (edificios.length > 0) {
    localStorage.setItem("onboarding:done", "1");
    return false;
  }
  return true;
}
