import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { fmtL, fmtDate } from "@/lib/format";
import { usePagosDeCobro, useRegistrarPago, useAnularPago, type Cobro } from "@/lib/queries";

const METODOS = ["efectivo", "transferencia", "cheque", "tarjeta", "depósito", "otro"];

export function RegistrarPagoDialog({
  open, onOpenChange, cobro,
}: { open: boolean; onOpenChange: (v: boolean) => void; cobro: Cobro | null }) {
  const { data: pagos = [] } = usePagosDeCobro(cobro?.id);
  const reg = useRegistrarPago();
  const anular = useAnularPago();

  const abonado = useMemo(() => pagos.reduce((a, p) => a + Number(p.monto), 0), [pagos]);
  const saldo = cobro ? Math.max(0, Number(cobro.monto) - abonado) : 0;

  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("efectivo");
  const [referencia, setReferencia] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");

  if (!cobro) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(monto);
    if (!m || m <= 0) return;
    reg.mutate(
      { cobro_id: cobro.id, monto: m, metodo, referencia: referencia || null, fecha, notas: notas || null } as any,
      {
        onSuccess: () => {
          setMonto(""); setReferencia(""); setNotas("");
          if (m >= saldo) onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar pago · {cobro.concepto}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2 text-sm mb-3">
          <div className="p-2 rounded-lg bg-[#F8FAFC]"><div className="text-xs text-[#64748B]">Total</div><div className="font-bold">{fmtL(cobro.monto)}</div></div>
          <div className="p-2 rounded-lg bg-[#F8FAFC]"><div className="text-xs text-[#64748B]">Abonado</div><div className="font-bold text-[#166534]">{fmtL(abonado)}</div></div>
          <div className="p-2 rounded-lg bg-[#F8FAFC]"><div className="text-xs text-[#64748B]">Saldo</div><div className="font-bold text-[#4A154B]">{fmtL(saldo)}</div></div>
        </div>

        {saldo > 0 && (
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-[#E2E8F0] pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Monto *</Label>
                <Input type="number" step="0.01" min="0.01" max={saldo} value={monto} onChange={(e) => setMonto(e.target.value)} required />
                <button type="button" onClick={() => setMonto(String(saldo))} className="text-xs text-[#4A154B] hover:underline mt-1">Usar saldo {fmtL(saldo)}</button>
              </div>
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div>
                <Label>Método</Label>
                <Select value={metodo} onValueChange={setMetodo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{METODOS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Referencia</Label>
                <Input value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="# transferencia, cheque…" />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Input value={notas} onChange={(e) => setNotas(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
              <Button type="submit" disabled={reg.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">Registrar pago</Button>
            </DialogFooter>
          </form>
        )}

        {pagos.length > 0 && (
          <div className="border-t border-[#E2E8F0] pt-3 mt-3">
            <div className="text-xs uppercase tracking-wider text-[#64748B] mb-2">Historial de pagos</div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {pagos.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-[#faf6f3] rounded-lg px-3 py-2 text-sm">
                  <div>
                    <div className="font-semibold text-[#4A154B]">{fmtL(p.monto)} <span className="text-xs text-[#64748B] font-normal">· {p.metodo}</span></div>
                    <div className="text-xs text-[#64748B]">{fmtDate(p.fecha)}{p.referencia ? ` · ${p.referencia}` : ""}</div>
                  </div>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { if (confirm("¿Anular este pago?")) anular.mutate(p.id); }} className="h-8 w-8 p-0 text-[#be185d]">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {saldo === 0 && (
          <div className="text-center text-sm text-[#166534] font-medium py-2">Cobro liquidado.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
