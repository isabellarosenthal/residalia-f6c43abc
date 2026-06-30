import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import {
  Building2, Home, Users, Wallet, Check, X, ArrowRight, Sparkles,
  Rocket, ShieldCheck, KeyRound, Settings, Mail, PartyPopper,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import {
  useEdificios, useSaveEdificio, useBulkCreateUnidades, useUnidades,
  useSaveResidente, useGenerarCobrosMensuales,
} from "@/lib/queries";

type Props = { open: boolean; onClose: () => void };

const STEPS = [
  { icon: Rocket, label: "Bienvenida" },
  { icon: Building2, label: "Edificio" },
  { icon: Home, label: "Unidades" },
  { icon: Users, label: "Residente" },
  { icon: Wallet, label: "Cobros" },
  { icon: PartyPopper, label: "Listo" },
];

export function OnboardingWizard({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Edificio
  const [edif, setEdif] = useState({ nombre: "", ciudad: "Tegucigalpa", cuota_base: 2500, moneda: "L" });
  const [usdRate, setUsdRate] = useState<string>("24.5");
  const [edificioId, setEdificioId] = useState<string | null>(null);
  const saveEdif = useSaveEdificio();

  // Unidades
  const [pisos, setPisos] = useState(5);
  const [porPiso, setPorPiso] = useState(4);
  const [tipo, setTipo] = useState("apartamento");
  const bulkUnidades = useBulkCreateUnidades();
  const { data: unidades = [] } = useUnidades(edificioId ?? undefined);

  // Residente
  const [res, setRes] = useState({ nombre: "", apellido: "", telefono: "", unidad_id: "" });
  const [tipoRes, setTipoRes] = useState<"propietario" | "inquilino">("propietario");
  const saveRes = useSaveResidente();

  // Cobros
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));
  const generarCobros = useGenerarCobrosMensuales();

  const close = () => {
    localStorage.setItem("onboarding:done", "1");
    onClose();
  };

  const handleEdificio = async () => {
    if (!edif.nombre) return toast.error("Falta nombre");
    const rate = Number(usdRate);
    if (!Number.isFinite(rate) || rate <= 0) return toast.error("Tasa USD inválida");
    const created = await saveEdif.mutateAsync(edif as any);
    setEdificioId(created.id);
    const { data: u } = await supabase.auth.getUser();
    if (u?.user) await supabase.from("profiles").update({ usd_rate: rate } as any).eq("id", u.user.id);
    setStep(2);
  };

  const handleUnidades = async () => {
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
    setStep(3);
  };

  const handleResidente = async () => {
    if (!edificioId || !res.nombre || !res.apellido || !res.unidad_id) return toast.error("Completa los campos");
    await saveRes.mutateAsync({
      condominio_id: edificioId,
      nombre: res.nombre, apellido: res.apellido, telefono: res.telefono || null,
      unidad_id: res.unidad_id, tipo: tipoRes,
    } as any);
    const patch: any = tipoRes === "propietario" ? { propietario_id: null } : { inquilino_id: null };
    await supabase.from("unidades").update({ estado_administrativo: "ocupada", ...patch }).eq("id", res.unidad_id);
    setStep(4);
  };

  const handleCobros = async () => {
    if (!edificioId) return;
    const [y, m] = mes.split("-");
    const venc = `${y}-${m}-05`;
    const { data: us } = await supabase.from("unidades").select("id").eq("condominio_id", edificioId);
    const unidadIds = (us ?? []).map((u) => u.id);
    await generarCobros.mutateAsync({ edificioId, mes, concepto: "Mantenimiento", vencimiento: venc, unidadIds });
    toast.success("¡Cobros generados!");
    setStep(5);
  };

  const goTo = (to: string) => {
    close();
    navigate({ to });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-2xl bg-[#ffffff] border-[#E2E8F0] max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Bienvenido a Residalia</DialogTitle>
          <DialogDescription>Asistente de primeros pasos</DialogDescription>
        </VisuallyHidden>
        <button onClick={close} className="absolute right-4 top-4 text-[#64748B] hover:text-[#4A154B]"><X className="w-4 h-4" /></button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-[#4A154B]" />
          <span className="text-xs uppercase tracking-widest text-[#64748B] font-semibold">Bienvenido a Residalia</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl text-[#0F172A]">
          {step === 0 ? "Vamos a configurar tu cuenta" : step === 5 ? "¡Todo listo! 🎉" : "Primeros pasos"}
        </h2>

        {/* Stepper */}
        <div className="flex items-center justify-between my-4 px-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors font-display font-extrabold ${
                    done ? "bg-[#166534] text-white" : active ? "bg-[#4A154B] text-white" : "bg-[#F8FAFC] text-[#64748B]"
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] ${active ? "text-[#4A154B] font-semibold" : "text-[#64748B]"}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${done ? "bg-[#166534]" : "bg-[#F8FAFC]"}`} />}
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-3">
          {step === 0 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Te damos la bienvenida</h3>
              <p className="text-sm text-[#64748B]">
                Vamos a dejar tu condominio operando en menos de 5 minutos. Estos son los pasos:
              </p>
              <div className="grid sm:grid-cols-2 gap-2 pt-2">
                {[
                  { i: Building2, t: "Crear tu edificio", d: "Nombre, ciudad y cuota base" },
                  { i: Home, t: "Generar unidades", d: "Pisos × apartamentos automáticos" },
                  { i: Users, t: "Tu primer residente", d: "Asignado a una unidad" },
                  { i: Wallet, t: "Cobros del mes", d: "Mantenimiento para todas las unidades" },
                ].map(({ i: Ic, t, d }) => (
                  <div key={t} className="flex gap-3 items-start p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <Ic className="w-5 h-5 text-[#4A154B] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">{t}</div>
                      <div className="text-xs text-[#64748B]">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#64748B] pt-2">
                Tienes <b className="text-[#4A154B]">14 días de prueba gratis</b>. Puedes omitir cualquier paso y volver luego.
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Datos del edificio</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Nombre</Label><Input value={edif.nombre} onChange={(e) => setEdif({ ...edif, nombre: e.target.value })} placeholder="Torres del Valle" /></div>
                <div><Label>Ciudad</Label><Input value={edif.ciudad} onChange={(e) => setEdif({ ...edif, ciudad: e.target.value })} /></div>
                <div><Label>Cuota mensual base</Label><Input type="number" value={edif.cuota_base} onChange={(e) => setEdif({ ...edif, cuota_base: Number(e.target.value) })} /></div>
                <div>
                  <Label>Moneda</Label>
                  <Select value={edif.moneda} onValueChange={(v) => setEdif({ ...edif, moneda: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">L (Lempiras)</SelectItem>
                      <SelectItem value="$">$ (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Tasa de conversión USD → L</Label>
                  <Input type="number" step="0.0001" value={usdRate} onChange={(e) => setUsdRate(e.target.value)} />
                  <p className="text-xs text-[#64748B] mt-1">Cuántos Lempiras equivalen a 1 USD. Lo usamos para convertir precios entre monedas.</p>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Genera tus unidades</h3>
              <p className="text-sm text-[#64748B]">Se crearán <b>{pisos * porPiso}</b> unidades numeradas (101, 102, …)</p>
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

          {step === 3 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Registra tu primer residente</h3>
              <p className="text-sm text-[#64748B]">Puedes agregar más desde el módulo Residentes</p>
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

          {step === 4 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Genera los cobros del mes</h3>
              <p className="text-sm text-[#64748B]">Se crearán cobros de mantenimiento para todas las unidades ocupadas</p>
              <div><Label>Mes (YYYY-MM)</Label><Input value={mes} onChange={(e) => setMes(e.target.value)} /></div>
            </>
          )}

          {step === 5 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Ya tienes lo básico configurado</h3>
              <p className="text-sm text-[#64748B]">Ahora explora el resto del sistema. Puedes saltar a cualquier módulo:</p>
              <div className="grid sm:grid-cols-2 gap-2 pt-2">
                {[
                  { i: Mail, t: "Invitar residentes", d: "Envía códigos al portal de residentes", to: "/residentes" },
                  { i: KeyRound, t: "Control de accesos", d: "Visitas, permisos y QR", to: "/accesos" },
                  { i: ShieldCheck, t: "Turnos y rondines", d: "Programa guardias y puntos de control", to: "/accesos/turnos" },
                  { i: Settings, t: "Configuración", d: "Plan, moneda, datos del condominio", to: "/configuracion" },
                ].map(({ i: Ic, t, d, to }) => (
                  <button
                    key={t}
                    onClick={() => goTo(to)}
                    className="text-left flex gap-3 items-start p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#4A154B] hover:bg-[#FAF5FB] transition"
                  >
                    <Ic className="w-5 h-5 text-[#4A154B] mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">{t}</div>
                      <div className="text-xs text-[#64748B]">{d}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-4">
          <Button variant="ghost" onClick={close} className="text-[#64748B]">Omitir</Button>
          <div className="flex gap-2">
            {step > 0 && step < 5 && <Button variant="outline" onClick={() => setStep(step - 1)}>Atrás</Button>}
            {step === 0 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={() => setStep(1)}>Empezar <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 1 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={handleEdificio} disabled={saveEdif.isPending}>Continuar <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 2 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={handleUnidades} disabled={bulkUnidades.isPending}>Generar {pisos * porPiso} unidades <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 3 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={handleResidente} disabled={saveRes.isPending}>Continuar <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 4 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={handleCobros} disabled={generarCobros.isPending}>Generar cobros <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 5 && <Button className="bg-[#166534] hover:bg-[#1f4a1f] text-white" onClick={() => { close(); navigate({ to: "/dashboard" }); }}>Ir al dashboard <Check className="w-4 h-4 ml-1" /></Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useShouldShowOnboarding() {
  const { data: edificios, isLoading, isFetching, isError, isSuccess } = useEdificios();
  if (typeof window === "undefined") return false;
  if (isLoading || isFetching || isError || !isSuccess || !edificios) return false;
  if (edificios.length > 0) {
    localStorage.setItem("onboarding:done", "1");
    return false;
  }
  // Sin edificios → siempre mostrar (ignoramos done para que reaparezca hasta crear el primero)
  return true;
}
