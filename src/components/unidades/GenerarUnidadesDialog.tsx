import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useBulkCreateUnidades } from "@/lib/queries";

export function GenerarUnidadesDialog({
  open, onOpenChange, edificioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; edificioId: string }) {
  const [pisoInicial, setPisoInicial] = useState(1);
  const [pisoFinal, setPisoFinal] = useState(5);
  const [porPiso, setPorPiso] = useState(4);
  const [prefijo, setPrefijo] = useState("");
  const bulk = useBulkCreateUnidades();

  const total = Math.max(0, (pisoFinal - pisoInicial + 1)) * Math.max(0, porPiso);

  const generar = async () => {
    const rows = [];
    for (let p = pisoInicial; p <= pisoFinal; p++) {
      for (let i = 1; i <= porPiso; i++) {
        const num = `${prefijo}${p}${String(i).padStart(2, "0")}`;
        rows.push({
          condominio_id: edificioId,
          numero: num,
          piso: p,
          tipo: "apartamento",
          estado_administrativo: "disponible" as const,
          estado_comercial: "disponible" as const,
        });
      }
    }
    await bulk.mutateAsync(rows);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#2d1200]">Generar unidades en bloque</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Piso inicial</Label><Input type="number" min={0} value={pisoInicial} onChange={(e) => setPisoInicial(Number(e.target.value))} /></div>
            <div><Label>Piso final</Label><Input type="number" min={0} value={pisoFinal} onChange={(e) => setPisoFinal(Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Unidades por piso</Label><Input type="number" min={1} value={porPiso} onChange={(e) => setPorPiso(Number(e.target.value))} /></div>
            <div><Label>Prefijo (opcional)</Label><Input value={prefijo} onChange={(e) => setPrefijo(e.target.value)} placeholder="A-" /></div>
          </div>
          <div className="bg-[#f5ede8] rounded-lg p-3 text-sm text-[#4a2800]">
            Se crearán <b className="text-[#c94f0c]">{total}</b> unidades. Ejemplo: <code className="text-xs bg-white px-1.5 py-0.5 rounded">{prefijo}{pisoInicial}01</code>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={generar} disabled={total === 0 || bulk.isPending} className="bg-[#c94f0c] hover:bg-[#a33d08]">
            {bulk.isPending ? "Generando…" : `Generar ${total}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
