import { createFileRoute } from "@tanstack/react-router";
import { useMiResidente, useMisCobros } from "@/lib/queries";
import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui-pentos";

export const Route = createFileRoute("/portal/cuenta")({ component: MiCuenta });

const fmt = (n: number, m = "L") => `${m} ${n.toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtD = (s: string) => new Date(s).toLocaleDateString("es-HN", { dateStyle: "medium" });

function MiCuenta() {
  const { data: residente } = useMiResidente();
  const { data: cobros = [], isLoading } = useMisCobros();
  const moneda = (residente as any)?.condominio?.moneda ?? "L";

  const pendientes = cobros.filter((c) => c.estado !== "pagado");
  const pagados = cobros.filter((c) => c.estado === "pagado");
  const totalPend = pendientes.reduce((s, c) => s + Number(c.monto), 0);
  const vencidos = pendientes.filter((c) => c.estado === "vencido").length;

  if (isLoading) return <div className="text-sm text-[#64748B]">Cargando…</div>;
  if (!residente) return <div className="text-sm text-[#7a2a10]">Tu cuenta no está vinculada a un residente.</div>;

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl p-5 ${totalPend > 0 ? "bg-[#fde8e2] border border-[#f5b8a8]" : "bg-[#e8f5e9] border border-[#a5d6a7]"}`}>
        <div className="flex items-center gap-2 text-xs text-[#64748B]"><Wallet className="w-4 h-4" />Saldo pendiente</div>
        <div className="font-display font-extrabold text-3xl text-[#0F172A] mt-1">{fmt(totalPend, moneda)}</div>
        {vencidos > 0 && <div className="text-sm text-[#7a2a10] mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{vencidos} cobro(s) vencido(s)</div>}
        {totalPend === 0 && <div className="text-sm text-[#166534] mt-1 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" />Estás al día. ¡Gracias!</div>}
      </div>

      <div>
        <h2 className="font-display font-extrabold text-lg text-[#0F172A] mb-2">Pendientes</h2>
        {pendientes.length === 0 ? (
          <div className="text-sm text-[#64748B] bg-white border border-[#E2E8F0] rounded-2xl p-5">No tienes cobros pendientes.</div>
        ) : (
          <div className="space-y-2">
            {pendientes.map((c) => (
              <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#4A154B]">{c.concepto}</div>
                  <div className="text-xs text-[#64748B]">Vence {fmtD(c.fecha_vencimiento)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#4A154B]">{fmt(Number(c.monto), moneda)}</div>
                  <Badge variant={c.estado === "vencido" ? "danger" : c.estado === "parcial" ? "warning" : "neutral"}>{c.estado}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagados.length > 0 && (
        <div>
          <h2 className="font-display font-extrabold text-lg text-[#0F172A] mb-2">Historial</h2>
          <div className="space-y-2">
            {pagados.slice(0, 12).map((c) => (
              <div key={c.id} className="bg-white border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between text-sm">
                <div>
                  <div className="text-[#4A154B]">{c.concepto}</div>
                  <div className="text-xs text-[#64748B]">Pagado {c.fecha_pago ? fmtD(c.fecha_pago) : "—"}</div>
                </div>
                <div className="font-semibold text-[#166534]">{fmt(Number(c.monto), moneda)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[#64748B] text-center pt-2">
        Para registrar un pago contacta a la administración del edificio.
      </p>
    </div>
  );
}
