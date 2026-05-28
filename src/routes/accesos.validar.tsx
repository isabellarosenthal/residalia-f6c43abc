import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowLeft, LogIn, LogOut, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui-pentos";
import { useValidarPase, useRegistrarUso, useMarcarSalida, useEdificios, useUnidades, type Acceso } from "@/lib/queries";

export const Route = createFileRoute("/accesos/validar")({ component: ValidarPage });

const fmtDT = (s: string | null) => s ? new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" }) : "—";

function ValidarPage() {
  const [codigo, setCodigo] = useState("");
  const [acceso, setAcceso] = useState<Acceso | null>(null);
  const [notFound, setNotFound] = useState(false);
  const validar = useValidarPase();
  const registrarUso = useRegistrarUso();
  const marcarSalida = useMarcarSalida();
  const { data: edificios = [] } = useEdificios();
  const { data: unidades = [] } = useUnidades();

  const edif = edificios.find((e) => e.id === acceso?.condominio_id);
  const uni = unidades.find((u) => u.id === acceso?.unidad_id);

  const estado = useMemo(() => {
    if (!acceso) return null;
    if (acceso.fecha_salida) return { tone: "neutral" as const, label: "Ya salió" };
    const usados = acceso.usos_actuales ?? 0;
    const max = acceso.usos_maximos ?? 1;
    if (usados >= max) return { tone: "danger" as const, label: "Pase agotado" };
    if (acceso.minutos_max_estadia && acceso.fecha_entrada) {
      const vence = new Date(acceso.fecha_entrada).getTime() + acceso.minutos_max_estadia * 60000;
      const restante = Math.round((vence - Date.now()) / 60000);
      if (restante <= 0) return { tone: "danger" as const, label: "Tiempo vencido" };
      return { tone: "success" as const, label: `Válido · ${restante} min restantes` };
    }
    return { tone: "success" as const, label: `Válido · ${usados}/${max} usos` };
  }, [acceso]);

  const buscar = async () => {
    const c = codigo.trim().toUpperCase();
    if (!c) return;
    setNotFound(false);
    setAcceso(null);
    try {
      const res = await validar.mutateAsync(c);
      setAcceso(res);
      if (!res) setNotFound(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Error al validar el pase");
    }
  };

  const onUsar = async () => {
    if (!acceso) return;
    const updated = await registrarUso.mutateAsync(acceso);
    setAcceso(updated);
  };

  const onSalida = async () => {
    if (!acceso) return;
    const updated = await marcarSalida.mutateAsync(acceso.id);
    setAcceso(updated);
  };

  return (
    <AppShell>
      <div className="max-w-[640px] mx-auto space-y-5">
        <Link to="/accesos" className="inline-flex items-center text-sm text-[#9a7060] hover:text-[#c94f0c]"><ArrowLeft className="w-4 h-4 mr-1" />Volver a accesos</Link>
        <div>
          <h1 className="font-display font-extrabold text-2xl text-[#2d1200] flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-[#c94f0c]" />Validar pase</h1>
          <p className="text-sm text-[#9a7060]">Ingresa el código del visitante para autorizar entrada o salida.</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); buscar(); }}
          className="flex gap-2 bg-white border border-[#e8ddd8] rounded-2xl p-3"
        >
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="PASE-XXXXXX"
            className="font-mono text-lg tracking-widest uppercase"
            autoFocus
          />
          <Button type="submit" disabled={!codigo.trim() || validar.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08]">
            <Search className="w-4 h-4 mr-1" />Buscar
          </Button>
        </form>

        {notFound && (
          <div className="bg-[#fde8e2] border border-[#f5b8a8] text-[#7a2a10] rounded-2xl p-4 text-sm">
            No se encontró ningún pase con ese código.
          </div>
        )}

        {acceso && estado && (
          <div className="bg-white border border-[#e8ddd8] rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-[#9a7060]">Visitante</div>
                <div className="font-display font-bold text-xl text-[#2d1200]">{acceso.visitante_nombre}</div>
                <div className="text-xs text-[#9a7060] font-mono mt-1">{acceso.qr_code}</div>
              </div>
              <Badge variant={estado.tone}>{estado.label}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Edificio" value={edif?.nombre ?? "—"} />
              <Info label="Unidad" value={uni ? `#${uni.numero}` : "—"} />
              <Info label="Tipo" value={acceso.tipo ?? "—"} />
              <Info label="Método" value={acceso.metodo ?? "—"} />
              <Info label="Entrada" value={fmtDT(acceso.fecha_entrada)} />
              <Info label="Salida" value={fmtDT(acceso.fecha_salida)} />
              <Info label="Usos" value={`${acceso.usos_actuales ?? 0} / ${acceso.usos_maximos ?? 1}`} />
              <Info label="Max. estadía" value={acceso.minutos_max_estadia ? `${acceso.minutos_max_estadia} min` : "Sin límite"} />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f0e6e0]">
              {estado.tone === "success" && (
                <Button onClick={onUsar} disabled={registrarUso.isPending} className="bg-[#2d6a2d] hover:bg-[#1f4d1f]">
                  <LogIn className="w-4 h-4 mr-1" />Autorizar entrada
                </Button>
              )}
              {!acceso.fecha_salida && (
                <Button onClick={onSalida} disabled={marcarSalida.isPending} variant="outline">
                  <LogOut className="w-4 h-4 mr-1" />Registrar salida
                </Button>
              )}
              <Button variant="ghost" onClick={() => { setAcceso(null); setCodigo(""); }}>Limpiar</Button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[#9a7060]">{label}</div>
      <div className="text-[#2d1200] capitalize">{value}</div>
    </div>
  );
}
