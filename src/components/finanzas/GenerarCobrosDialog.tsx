import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGenerarCobrosMensuales } from "@/lib/queries";

export function GenerarCobrosDialog({
  open, onOpenChange, edificioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; edificioId: string }) {
  const mut = useGenerarCobrosMensuales();
  const today = new Date();
  const mesActual = today.toLocaleDateString("es-HN", { month: "long", year: "numeric" });
  const venDefault = new Date(today.getFullYear(), today.getMonth() + 1, 5).toISOString().slice(0, 10);
  const [concepto, setConcepto] = useState("Cuota de mantenimiento");
  const [mes, setMes] = useState(mesActual);
  const [vencimiento, setVencimiento] = useState(venDefault);

  const submit = async () => {
    if (!edificioId) return;
    await mut.mutateAsync({ edificioId, mes, concepto, vencimiento });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#2d1200]">Generar cobros mensuales</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-[#9a7060]">Se creará un cobro por cada unidad del edificio usando su mantenimiento mensual o la cuota base del edificio.</p>
          <div><Label>Concepto</Label><Input value={concepto} onChange={(e) => setConcepto(e.target.value)} /></div>
          <div><Label>Periodo</Label><Input value={mes} onChange={(e) => setMes(e.target.value)} placeholder="octubre 2025" /></div>
          <div><Label>Fecha de vencimiento</Label><Input type="date" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!edificioId || mut.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08]">{mut.isPending ? "Generando…" : "Generar cobros"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
