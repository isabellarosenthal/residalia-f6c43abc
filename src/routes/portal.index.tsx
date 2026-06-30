import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, KeyRound, AlertCircle, Zap } from "lucide-react";
import { useMiResidente, useMisPases, useSaveAcceso } from "@/lib/queries";
import { Badge } from "@/components/ui-pentos";
import { MiQRRotativo } from "@/components/portal/MiQRRotativo";
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

  if (isLoading) return <div className="text-sm text-[#64748B]">Cargando…</div>;

  if (!residente) {
    return (
      <div className="bg-[#fde8e2] border border-[#f5b8a8] text-[#7a2a10] rounded-2xl p-5 flex gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold mb-1">Tu cuenta aún no está vinculada a un residente</div>
          <p className="text-sm">Pide al administrador del edificio que te agregue como residente con tu correo electrónico. Luego cierra sesión y vuelve a entrar.</p>
        </div>
      </div>
    );
  }

  const condo = (residente as any).condominio;
  const uni = (residente as any).unidad;

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
      } as any);
      toast.success(`Pase para ${s.label} creado`);
      navigate({ to: "/portal/pase/$paseId", params: { paseId: r.id } });
    } catch (e: any) {
      toast.error(e?.message ?? "No se pudo crear el pase");
    }
  };

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
          <div className="font-display font-bold text-[#0F172A]">Acceso Rápido</div>
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
        <h2 className="font-display font-extrabold text-lg text-[#0F172A]">Mis pases</h2>
        <Link to="/portal/nuevo" className="bg-[#4A154B] hover:bg-[#350d36] text-white text-sm px-4 py-2 rounded-full inline-flex items-center gap-1"><Plus className="w-4 h-4" />Crear pase</Link>
      </div>

      {pases.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center text-[#64748B]">
          <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aún no has creado ningún pase.
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
                    <div className="text-xs text-[#64748B] mt-1">Entrada: {fmtDT(p.fecha_entrada)}</div>
                  </div>
                  <Badge variant={tone as any}>{label}</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
