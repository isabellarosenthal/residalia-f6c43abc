import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import toast from "react-hot-toast";
import {
  Building2, Home, Users, Wallet, Check, X, ArrowRight, Sparkles,
  Rocket, ShieldCheck, KeyRound, Settings, Mail, PartyPopper, AlertCircle, SkipForward,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CityAutocomplete } from "@/components/CityAutocomplete";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
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
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    setError(null);
    onClose();
  };

  const advance = (n: number) => { setError(null); setStep(n); };
  const skip = () => advance(Math.min(step + 1, 5));

  const handleEdificio = async () => {
    setError(null);
    if (!edif.nombre.trim()) return setError("Escribí el nombre del edificio para continuar.");
    const rate = Number(usdRate);
    if (!Number.isFinite(rate) || rate <= 0) return setError("La tasa USD debe ser un número mayor a 0.");
    setBusy(true);
    try {
      const created: any = await saveEdif.mutateAsync(edif as any);
      if (!created?.id) throw new Error("No se recibió el edificio creado.");
      setEdificioId(created.id);
      try {
        const { data: u } = await supabase.auth.getUser();
        if (u?.user) await supabase.from("profiles").update({ usd_rate: rate } as any).eq("id", u.user.id);
      } catch { /* tasa USD es opcional */ }
      advance(2);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo crear el edificio.");
    } finally { setBusy(false); }
  };

  const handleUnidades = async () => {
    setError(null);
    if (!edificioId) return setError("Primero creá el edificio.");
    if (pisos < 1 || porPiso < 1) return setError("Pisos y unidades por piso deben ser al menos 1.");
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
    setBusy(true);
    try {
      await bulkUnidades.mutateAsync(rows);
      await qc.invalidateQueries({ queryKey: ["unidades"] });
      advance(3);
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron crear las unidades. Puede que excedan el límite de tu plan.");
    } finally { setBusy(false); }
  };

  const handleResidente = async () => {
    setError(null);
    if (!edificioId) return setError("Primero creá el edificio.");
    if (!res.nombre.trim() || !res.apellido.trim()) return setError("Completá nombre y apellido.");
    if (!res.unidad_id) return setError("Seleccioná la unidad.");
    setBusy(true);
    try {
      await saveRes.mutateAsync({
        condominio_id: edificioId,
        nombre: res.nombre.trim(),
        apellido: res.apellido.trim(),
        telefono: res.telefono || null,
        unidad_id: res.unidad_id,
        tipo: tipoRes,
      } as any);
      advance(4);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo registrar el residente.");
    } finally { setBusy(false); }
  };

  const handleCobros = async () => {
    setError(null);
    if (!edificioId) return setError("Primero creá el edificio.");
    if (!/^\d{4}-\d{2}$/.test(mes)) return setError("Mes inválido. Formato: YYYY-MM.");
    setBusy(true);
    try {
      const [y, m] = mes.split("-");
      const venc = `${y}-${m}-05`;
      const { data: us } = await supabase.from("unidades").select("id").eq("condominio_id", edificioId);
      const unidadIds = (us ?? []).map((u) => u.id);
      if (unidadIds.length === 0) {
        setError("No hay unidades para cobrar. Volvé al paso anterior.");
        return;
      }
      await generarCobros.mutateAsync({ edificioId, mes, concepto: "Mantenimiento", vencimiento: venc, unidadIds });
      toast.success("¡Cobros generados!");
      advance(5);
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron generar los cobros.");
    } finally { setBusy(false); }
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

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B] text-sm px-3 py-2 mb-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-[#991B1B] opacity-70 hover:opacity-100"><X className="w-3 h-3" /></button>
          </div>
        )}

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
                Tienes <b className="text-[#4A154B]">14 días de prueba gratis</b>. Podés saltarte cualquier paso o cerrar el asistente y volver luego.
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Datos del edificio</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Nombre *</Label><Input value={edif.nombre} onChange={(e) => setEdif({ ...edif, nombre: e.target.value })} placeholder="Torres del Valle" /></div>
                <div><Label>Ciudad</Label><CityAutocomplete value={edif.ciudad} onChange={(v) => setEdif({ ...edif, ciudad: v })} /></div>
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
                  <p className="text-xs text-[#64748B] mt-1">Cuántos Lempiras equivalen a 1 USD. La usamos para convertir precios entre monedas.</p>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Generá tus unidades</h3>
              <p className="text-sm text-[#64748B]">Se crearán <b>{pisos * porPiso}</b> unidades numeradas (101, 102, …). Después podés agregar más o importarlas.</p>
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
              <h3 className="font-display font-bold text-[#0F172A]">Registrá tu primer residente</h3>
              <p className="text-sm text-[#64748B]">{unidades.length > 0 ? `${unidades.length} unidades disponibles. ` : ""}Podés agregar más desde el módulo Residentes.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Nombre *</Label><Input value={res.nombre} onChange={(e) => setRes({ ...res, nombre: e.target.value })} /></div>
                <div><Label>Apellido *</Label><Input value={res.apellido} onChange={(e) => setRes({ ...res, apellido: e.target.value })} /></div>
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
                  <Label>Unidad asignada *</Label>
                  <Select value={res.unidad_id} onValueChange={(v) => setRes({ ...res, unidad_id: v })}>
                    <SelectTrigger><SelectValue placeholder={unidades.length === 0 ? "Cargando unidades…" : "Selecciona unidad"} /></SelectTrigger>
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
              <h3 className="font-display font-bold text-[#0F172A]">Generá los cobros del mes</h3>
              <p className="text-sm text-[#64748B]">Se crearán cobros de mantenimiento para todas las unidades del edificio.</p>
              <div><Label>Mes (YYYY-MM)</Label><Input value={mes} onChange={(e) => setMes(e.target.value)} placeholder="2026-06" /></div>
            </>
          )}

          {step === 5 && (
            <>
              <h3 className="font-display font-bold text-[#0F172A]">Ya tenés lo básico configurado</h3>
              <p className="text-sm text-[#64748B]">Ahora explorá el resto del sistema. Podés saltar a cualquier módulo:</p>
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
          <Button variant="ghost" onClick={close} className="text-[#64748B]">Cerrar</Button>
          <div className="flex gap-2">
            {step > 0 && step < 5 && <Button variant="outline" onClick={() => advance(step - 1)} disabled={busy}>Atrás</Button>}
            {step > 0 && step < 5 && (
              <Button variant="ghost" onClick={skip} disabled={busy} className="text-[#64748B]">
                <SkipForward className="w-4 h-4 mr-1" /> Saltar
              </Button>
            )}
            {step === 0 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={() => advance(1)}>Empezar <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 1 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={handleEdificio} disabled={busy || saveEdif.isPending}>{busy ? "Creando…" : "Continuar"} <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 2 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={handleUnidades} disabled={busy || bulkUnidades.isPending}>{busy ? "Generando…" : `Generar ${pisos * porPiso} unidades`} <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 3 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={handleResidente} disabled={busy || saveRes.isPending}>{busy ? "Guardando…" : "Continuar"} <ArrowRight className="w-4 h-4 ml-1" /></Button>}
            {step === 4 && <Button className="bg-[#4A154B] hover:bg-[#350d36] text-white" onClick={handleCobros} disabled={busy || generarCobros.isPending}>{busy ? "Generando…" : "Generar cobros"} <ArrowRight className="w-4 h-4 ml-1" /></Button>}
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
  if (localStorage.getItem("onboarding:done") === "1") return false;
  return true;
}
