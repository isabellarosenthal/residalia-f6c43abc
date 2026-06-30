import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Square, MapPin, ScanLine, ListChecks } from "lucide-react";
import { useEdificios } from "@/lib/queries";
import {
  useMisTurnos, useIniciarTurno, useCerrarTurno, usePuntos, useRondinesLog, useRegistrarPaso,
} from "@/lib/queries-guardia";

export const Route = createFileRoute("/guardia/turno")({ component: MiTurno });

const fmtDT = (s: string | null) => s ? new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" }) : "—";

function MiTurno() {
  const { data: turnos = [], isLoading } = useMisTurnos();
  const { data: edificios = [] } = useEdificios();
  const iniciar = useIniciarTurno();
  const cerrar = useCerrarTurno();
  const registrar = useRegistrarPaso();
  const [codigo, setCodigo] = useState("");
  const [notas, setNotas] = useState("");

  const hoy = new Date().toISOString().slice(0, 10);
  const turnoActivo = useMemo(() =>
    turnos.find((t) => t.estado === "en_curso") ?? turnos.find((t) => t.fecha === hoy && t.estado === "programado"),
  [turnos, hoy]);

  const { data: puntos = [] } = usePuntos(turnoActivo?.condominio_id);
  const { data: log = [] } = useRondinesLog(turnoActivo?.id);

  if (isLoading) return <div className="text-sm text-[#E8E8E8]">Cargando…</div>;

  if (!turnoActivo) {
    return (
      <div className="space-y-3">
        <h2 className="font-display font-extrabold text-lg">Mi turno</h2>
        <div className="bg-[#4A154B] border border-[#350d36] rounded-2xl p-6 text-center text-[#E8E8E8]">
          <p>No tienes turnos programados para hoy.</p>
          {turnos.length > 0 && (
            <div className="mt-3 text-xs text-left">
              <div className="font-semibold text-white mb-1">Próximos turnos:</div>
              {turnos.slice(0, 5).map((t) => (
                <div key={t.id}>· {t.fecha} {t.hora_inicio?.slice(0,5)}–{t.hora_fin?.slice(0,5)}</div>
              ))}
            </div>
          )}
        </div>
        <Link to="/guardia" className="text-sm text-[#ffea5c] underline">Ir a validar pases</Link>
      </div>
    );
  }

  const edif = edificios.find((e) => e.id === turnoActivo.condominio_id);
  const enCurso = turnoActivo.estado === "en_curso";
  const visitados = new Set(log.map((l) => l.punto_id));
  const puntosActivos = puntos.filter((p) => p.activo);
  const faltantes = puntosActivos.filter((p) => !visitados.has(p.id));

  const escanear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    try {
      await registrar.mutateAsync({
        qr_code: codigo,
        turno_id: turnoActivo.id,
        condominio_id: turnoActivo.condominio_id,
        notas: notas.trim() || undefined,
      });
      setCodigo(""); setNotas("");
    } catch {}
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#4A154B] border border-[#350d36] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-[#E8E8E8]">Turno actual</div>
            <div className="font-display font-bold text-xl text-white">{edif?.nombre ?? "—"}</div>
            <div className="text-xs text-[#E8E8E8] mt-1">{turnoActivo.fecha} · {turnoActivo.hora_inicio?.slice(0,5)} – {turnoActivo.hora_fin?.slice(0,5)}</div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${enCurso ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{turnoActivo.estado}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-[#E8E8E8] mt-3">
          <div>Inicio real: <span className="text-white">{fmtDT(turnoActivo.inicio_real)}</span></div>
          <div>Fin real: <span className="text-white">{fmtDT(turnoActivo.fin_real)}</span></div>
        </div>
        <div className="flex gap-2 pt-3 mt-3 border-t border-[#350d36]">
          {!enCurso && turnoActivo.estado === "programado" && (
            <button onClick={() => iniciar.mutate(turnoActivo.id)} disabled={iniciar.isPending}
              className="bg-[#166534] hover:bg-[#1f4d1f] text-white px-4 py-2 rounded-lg inline-flex items-center gap-1"><Play className="w-4 h-4" />Iniciar turno</button>
          )}
          {enCurso && (
            <button onClick={() => confirm("¿Cerrar turno?") && cerrar.mutate(turnoActivo.id)} disabled={cerrar.isPending}
              className="bg-[#b91c1c] hover:bg-[#7f1d1d] text-white px-4 py-2 rounded-lg inline-flex items-center gap-1"><Square className="w-4 h-4" />Cerrar turno</button>
          )}
          <Link to="/guardia" className="border border-[#E8E8E8] text-white px-4 py-2 rounded-lg inline-flex items-center gap-1"><ScanLine className="w-4 h-4" />Validar pases</Link>
        </div>
      </div>

      {enCurso && (
        <div className="bg-[#4A154B] border border-[#350d36] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold"><MapPin className="w-4 h-4 text-[#ffea5c]" />Rondín</div>
          <div className="text-xs text-[#E8E8E8]">Escanea o escribe el código del punto.</div>
          <form onSubmit={escanear} className="space-y-2">
            <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="PUNTO-XXXXXX"
              className="w-full bg-transparent font-mono text-lg tracking-widest uppercase text-white placeholder:text-[#64748B] outline-none border border-[#350d36] rounded-lg px-3 py-2" />
            <input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Nota opcional"
              className="w-full bg-transparent text-sm text-white placeholder:text-[#64748B] outline-none border border-[#350d36] rounded-lg px-3 py-2" />
            <button type="submit" disabled={!codigo.trim() || registrar.isPending}
              className="bg-[#ffea5c] hover:bg-[#e6c200] text-[#4A154B] font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1 disabled:opacity-50">
              <ScanLine className="w-4 h-4" />Registrar paso
            </button>
          </form>

          <div className="pt-3 border-t border-[#350d36]">
            <div className="text-xs text-[#E8E8E8] mb-2"><ListChecks className="w-3 h-3 inline mr-1" />Progreso: {visitados.size}/{puntosActivos.length}</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {puntosActivos.map((p) => {
                const v = visitados.has(p.id);
                return (
                  <div key={p.id} className={`text-xs flex items-center justify-between rounded px-2 py-1 ${v ? "bg-green-500/20 text-white" : "text-[#E8E8E8]"}`}>
                    <span>{v ? "✓" : "○"} {p.nombre}</span>
                    <span className="font-mono opacity-60">{p.qr_code}</span>
                  </div>
                );
              })}
            </div>
            {faltantes.length > 0 && enCurso && (
              <div className="text-[11px] text-[#ffea5c] mt-2">Faltan {faltantes.length} punto(s) por visitar.</div>
            )}
          </div>

          {log.length > 0 && (
            <div className="pt-3 border-t border-[#350d36]">
              <div className="text-xs text-[#E8E8E8] mb-2">Últimos pasos</div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {log.slice(0, 10).map((l) => {
                  const p = puntos.find((x) => x.id === l.punto_id);
                  return (
                    <div key={l.id} className="text-xs text-white flex justify-between">
                      <span>{p?.nombre ?? l.punto_id.slice(0, 8)}</span>
                      <span className="opacity-70">{new Date(l.scanned_at).toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
