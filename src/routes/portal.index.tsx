import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, KeyRound, Zap } from "lucide-react";
import { useMiResidente, useMisPases, useSaveAcceso } from "@/lib/queries";
import { Badge } from "@/components/ui-pentos";
import { MiQRRotativo } from "@/components/portal/MiQRRotativo";
import { PortalLoading, PortalSinResidente } from "@/components/portal/PortalStates";
import { QuickAccessGrid, type QuickService } from "@/components/accesos/QuickAccessButtons";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/portal/")({ component: PortalIndex });

const fmtDT = (s: string | null) => s ? new Date(s).toLocaleString("es-HN", { dateStyle: "short", timeStyle: "short" }) : "—";

function PortalIndex() {
  const { data: residente, isLoading } = useMiResidente();
  const { data: pases = [] } = useMisPases();
  const save = useSaveAcceso();
  const navigate = useNavigate();

  if (isLoading) return <PortalLoading />;

  if (!residente) return <PortalSinResidente />;

  const condo = residente.condominio;
  const uni = residente.unidad;

  const handleQuick = async (s: QuickService) => {
    try {
      const { data: u } = await supabase.auth.getUser();
      const now = new Date();
      const exp = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const r = await save.mutateAsync({
        condominio_id: residente.condominio_id,
        unidad_id: residente.unidad_id,
        visitante_nombre: s.label,
        tipo: s.tipo,
        metodo: "qr",
        qr_code: `${s.key.toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        fecha_entrada: now.toISOString(),
        fecha_salida: exp.toISOString(),
        usos_maximos: 1,
        minutos_max_estadia: s.minutos,
        autorizado_por: u.user?.id ?? null,
      } as Parameters<typeof save.mutateAsync>[0]);
      toast.success(`Pase para ${s.label} creado`);
      navigate({ to: "/portal/pase/$paseId", params: { paseId: r.id } });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "No se pudo crear el pase");
    }
  };

  const pasesActivos = pases.filter((p) => !p.fecha_salida && (p.usos_actuales ?? 0) < (p.usos_maximos ?? 1));

  return (
    <div className="space-y-5">
      <MiQRRotativo
        residenteId={residente.id}
        nombre={`${residente.nombre} ${residente.apellido ?? ""}`.trim()}
        subtitulo={`${condo?.nombre ?? ""}${uni ? ` · #${uni.numero}` : ""}`}
      />

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-[#f59e0b]" />
          <div className="font-display font-bold text-[#0F172A]">Acceso rápido</div>
        </div>
        <p className="text-xs text-[#64748B] mb-3">Genera un pase al instante para delivery o transporte</p>
        <QuickAccessGrid onPick={handleQuick} disabled={save.isPending} columns={6} />
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
        <div className="text-xs text-[#64748B]">Residente en</div>
        <div className="font-display font-bold text-xl text-[#0F172A]">{condo?.nombre ?? "—"}</div>
        <div className="text-sm text-[#64748B]">Unidad #{uni?.numero ?? "—"}</div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-extrabold text-lg text-[#0F172A]">Mis pases</h2>
          {pasesActivos.length > 0 && (
            <p className="text-xs text-[#64748B]">{pasesActivos.length} activo{pasesActivos.length === 1 ? "" : "s"}</p>
          )}
        </div>
        <Link to="/portal/nuevo" className="bg-[#4A154B] hover:bg-[#350d36] text-white text-sm px-4 py-2 rounded-full inline-flex items-center gap-1">
          <Plus className="w-4 h-4" />Crear pase
        </Link>
      </div>

      {pases.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center text-[#64748B]">
          <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-medium text-[#4A154B]">Aún no has creado ningún pase</p>
          <p className="text-sm mt-1">Crea uno para visitas, delivery o proveedores.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pases.map((p) => {
            const usados = p.usos_actuales ?? 0;
            const max = p.usos_maximos ?? 1;
            const tone = p.fecha_salida ? "neutral" : usados >= max ? "danger" : "success";
            const label = p.fecha_salida ? "Ya salió" : usados >= max ? "Agotado" : `${usados}/${max} usos`;
            return (
              <Link key={p.id} to="/portal/pase/$paseId" params={{ paseId: p.id }}
                className="block bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:border-[#4A154B] transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-[#4A154B]">{p.visitante_nombre}</div>
                    <div className="text-xs text-[#64748B] font-mono">{p.qr_code}</div>
                    <div className="text-xs text-[#64748B] mt-1 capitalize">{p.tipo ?? "visita"} · Entrada: {fmtDT(p.fecha_entrada)}</div>
                  </div>
                  <Badge variant={tone as "neutral" | "danger" | "success"}>{label}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
