import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui-pentos";
import { fmtL } from "@/lib/format";
import { useGenerarCobrosMensuales, usePreviewCobrosMensuales } from "@/lib/queries";
import { ConceptoRapidoButtons, MesPicker } from "./QuickPickers";

export function GenerarCobrosDialog({
  open, onOpenChange, edificioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; edificioId: string }) {
  const mut = useGenerarCobrosMensuales();
  const today = new Date();
  const venDefault = new Date(today.getFullYear(), today.getMonth() + 1, 5).toISOString().slice(0, 10);
  const [concepto, setConcepto] = useState("Mantenimiento");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const mes = new Date(year, month, 1).toLocaleDateString("es-HN", { month: "long", year: "numeric" });
  const [vencimiento, setVencimiento] = useState(venDefault);
  const [stage, setStage] = useState<"form" | "preview">("form");
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const previewArgs = stage === "preview" && edificioId ? { edificioId, mes, concepto } : null;
  const { data: rows = [], isLoading } = usePreviewCobrosMensuales(previewArgs);

  const selectable = useMemo(() => rows.filter((r) => !r.duplicado), [rows]);
  const selectedIds = useMemo(
    () => selectable.filter((r) => !excluded.has(r.unidad_id)).map((r) => r.unidad_id),
    [selectable, excluded],
  );
  const total = useMemo(
    () => selectable.filter((r) => !excluded.has(r.unidad_id)).reduce((a, r) => a + r.monto, 0),
    [selectable, excluded],
  );

  const toggle = (id: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const confirm = async () => {
    if (!edificioId || selectedIds.length === 0) return;
    await mut.mutateAsync({ edificioId, mes, concepto, vencimiento, unidadIds: selectedIds });
    onOpenChange(false);
    setStage("form");
    setExcluded(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setStage("form"); setExcluded(new Set()); } onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl text-[#0F172A]">Generar cobros mensuales</DialogTitle></DialogHeader>

        {stage === "form" && (
          <div className="space-y-3">
            <p className="text-sm text-[#64748B]">Generaremos un cobro por cada unidad usando su mantenimiento mensual o la cuota base del edificio.</p>
            <div>
              <Label>Concepto</Label>
              <ConceptoRapidoButtons value={concepto} onPick={setConcepto} />
              <Input className="mt-2" value={concepto} onChange={(e) => setConcepto(e.target.value)} />
            </div>
            <div>
              <Label>Periodo</Label>
              <div className="flex justify-center border border-[#E2E8F0] rounded-xl p-3">
                <MesPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
              </div>
              <p className="text-xs text-[#64748B] mt-1 text-center">{mes.charAt(0).toUpperCase() + mes.slice(1)}</p>
            </div>
            <div><Label>Fecha de vencimiento</Label><Input type="date" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} /></div>
          </div>
        )}

        {stage === "preview" && (
          <div className="space-y-3">
            {isLoading && <div className="py-8 text-center text-[#64748B]">Calculando…</div>}
            {!isLoading && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-[#64748B]">{selectedIds.length} de {selectable.length} unidades seleccionadas</div>
                  <div className="font-display font-bold text-[#0F172A]">{fmtL(total)}</div>
                </div>
                <div className="border border-[#E2E8F0] rounded-xl divide-y divide-[#f0e7e1] max-h-[50vh] overflow-y-auto">
                  {rows.length === 0 && <div className="p-6 text-center text-[#64748B] text-sm">El edificio no tiene unidades.</div>}
                  {rows.map((r) => (
                    <label key={r.unidad_id} className={`flex items-center gap-3 p-3 ${r.duplicado ? "opacity-60 bg-[#fafafa]" : "hover:bg-[#fbf6f3] cursor-pointer"}`}>
                      <Checkbox
                        checked={!r.duplicado && !excluded.has(r.unidad_id)}
                        disabled={r.duplicado}
                        onCheckedChange={() => toggle(r.unidad_id)}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#4A154B]">Unidad #{r.unidad_numero}</div>
                        {r.duplicado && <div className="text-xs text-[#be185d] mt-0.5">Ya tiene un cobro de este concepto para este periodo</div>}
                      </div>
                      {r.duplicado && <Badge variant="warning">Duplicado</Badge>}
                      <div className="text-sm font-semibold text-[#4A154B] tabular-nums">{fmtL(r.monto)}</div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {stage === "form" ? (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button onClick={() => setStage("preview")} disabled={!edificioId || !concepto || !mes || !vencimiento} className="bg-[#4A154B] hover:bg-[#350d36]">Previsualizar</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStage("form")}>Volver</Button>
              <Button onClick={confirm} disabled={selectedIds.length === 0 || mut.isPending} className="bg-[#4A154B] hover:bg-[#350d36]">
                {mut.isPending ? "Generando…" : `Generar ${selectedIds.length} cobros`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
