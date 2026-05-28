import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useValidarPase, useRegistrarUso, useMarcarSalida, useEdificios, useUnidades, type Acceso } from "@/lib/queries";
import { Search, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/guardia/")({ component: GuardiaValidar });

const fmtDT = (s: string | null) => s ? new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" }) : "—";

function GuardiaValidar() {
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
      return { tone: "success" as const, label: `Válido · ${restante} min` };
    }
    return { tone: "success" as const, label: `Válido · ${usados}/${max}` };
  }, [acceso]);

  const buscar = async () => {
    const c = codigo.trim().toUpperCase();
    if (!c) return;
    setNotFound(false); setAcceso(null);
    try {
      const res = await validar.mutateAsync(c);
      setAcceso(res);
      if (!res) setNotFound(true);
    } catch (e: any) { toast.error(e?.message ?? "Error"); }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={(e) => { e.preventDefault(); buscar(); }} className="flex gap-2 bg-[#2d1200] border border-[#3d2410] rounded-2xl p-3">
        <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="PASE-XXXXXX"
          className="flex-1 bg-transparent font-mono text-lg tracking-widest uppercase text-white placeholder:text-[#9a7060] outline-none px-2" autoFocus />
        <button type="submit" disabled={!codigo.trim() || validar.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08] text-white px-4 py-2 rounded-lg inline-flex items-center gap-1 disabled:opacity-50">
          <Search className="w-4 h-4" />Buscar
        </button>
      </form>

      {notFound && <div className="bg-[#7a2a10] border border-[#c94f0c] text-white rounded-2xl p-4 text-sm">No se encontró el pase.</div>}

      {acceso && estado && (
        <div className="bg-white text-[#2d1200] rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-[#9a7060]">Visitante</div>
              <div className="font-display font-bold text-2xl">{acceso.visitante_nombre}</div>
              <div className="text-xs text-[#9a7060] font-mono mt-1">{acceso.qr_code}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estado.tone === "success" ? "bg-green-100 text-green-800" : estado.tone === "danger" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"}`}>{estado.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-[#9a7060]">Edificio</div><div>{edif?.nombre ?? "—"}</div></div>
            <div><div className="text-xs text-[#9a7060]">Unidad</div><div>{uni ? `#${uni.numero}` : "—"}</div></div>
            <div><div className="text-xs text-[#9a7060]">Tipo</div><div className="capitalize">{acceso.tipo ?? "—"}</div></div>
            <div><div className="text-xs text-[#9a7060]">Usos</div><div>{acceso.usos_actuales ?? 0} / {acceso.usos_maximos ?? 1}</div></div>
            <div><div className="text-xs text-[#9a7060]">Entrada</div><div>{fmtDT(acceso.fecha_entrada)}</div></div>
            <div><div className="text-xs text-[#9a7060]">Salida</div><div>{fmtDT(acceso.fecha_salida)}</div></div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f0e6e0]">
            {estado.tone === "success" && (
              <button onClick={async () => setAcceso(await registrarUso.mutateAsync(acceso))} disabled={registrarUso.isPending}
                className="bg-[#2d6a2d] hover:bg-[#1f4d1f] text-white px-4 py-2 rounded-lg inline-flex items-center gap-1"><LogIn className="w-4 h-4" />Autorizar entrada</button>
            )}
            {!acceso.fecha_salida && (
              <button onClick={async () => setAcceso(await marcarSalida.mutateAsync(acceso.id))} disabled={marcarSalida.isPending}
                className="border border-[#c9b8b0] text-[#2d1200] px-4 py-2 rounded-lg inline-flex items-center gap-1"><LogOut className="w-4 h-4" />Registrar salida</button>
            )}
            <button onClick={() => { setAcceso(null); setCodigo(""); }} className="text-[#9a7060] hover:text-[#c94f0c] px-3 py-2">Limpiar</button>
          </div>
        </div>
      )}
    </div>
  );
}
