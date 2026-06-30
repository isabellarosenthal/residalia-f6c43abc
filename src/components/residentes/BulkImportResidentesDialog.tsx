import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Upload, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { useEdificios, useResidentes, useUnidades } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type Row = {
  nombre: string;
  apellido: string;
  tipo: "propietario" | "inquilino";
  unidad_numero: string;
  piso: string;
  email: string;
  telefono: string;
  telefono_alt: string;
  dni: string;
  recargo_mora_pct: string;
  relacionado_con: string;
  _row: number;
  _errors: string[];
  _warnings: string[];
};

const TEMPLATE_HEADERS = [
  "nombre",
  "apellido",
  "tipo",
  "unidad_numero",
  "piso",
  "email",
  "telefono",
  "telefono_alt",
  "dni",
  "recargo_mora_pct",
  "relacionado_con",
];

const SAMPLE = [
  ["Juan", "Pérez", "propietario", "101", "1", "juan@ej.com", "+50488881111", "", "0801198801234", "5", ""],
  ["María", "López", "inquilino", "101", "1", "maria@ej.com", "+50488882222", "", "", "", "juan@ej.com"],
  ["Carlos", "Mendoza", "propietario", "B2-15", "2", "carlos@ej.com", "+50488883333", "", "", "", ""],
];

function downloadTemplate() {
  const rows = [TEMPLATE_HEADERS, ...SAMPLE];
  const csv = rows
    .map((r) => r.map((c) => (/[,"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla-residentes.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); out.push(row); row = []; cur = ""; }
      else if (c === "\r") { /* skip */ }
      else cur += c;
    }
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); out.push(row); }
  return out.filter((r) => r.some((c) => c && c.trim() !== ""));
}

export function BulkImportResidentesDialog({
  open, onOpenChange, defaultEdificioId,
}: { open: boolean; onOpenChange: (v: boolean) => void; defaultEdificioId?: string }) {
  const qc = useQueryClient();
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useState<string>(defaultEdificioId && defaultEdificioId !== "all" ? defaultEdificioId : "");
  const { data: unidades = [] } = useUnidades(edificioId || undefined);
  const { data: existentes = [] } = useResidentes();
  const [rows, setRows] = useState<Row[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [importing, setImporting] = useState(false);

  const unidadByNumero = useMemo(() => {
    const m = new Map<string, string>();
    unidades.forEach((u) => m.set(u.numero.toLowerCase().trim(), u.id));
    return m;
  }, [unidades]);

  const existentesByEmail = useMemo(() => {
    const m = new Map<string, string>();
    existentes.filter((r) => (r as any).condominio_id === edificioId).forEach((r) => {
      if (r.email) m.set(r.email.toLowerCase().trim(), r.id);
    });
    return m;
  }, [existentes, edificioId]);

  const validateRows = (parsed: Row[]) => {
    return parsed.map((r) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      if (!r.nombre.trim()) errors.push("Nombre requerido");
      if (!r.apellido.trim()) errors.push("Apellido requerido");
      if (r.tipo && !["propietario", "inquilino"].includes(r.tipo)) errors.push(`Tipo inválido: ${r.tipo}`);
      if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())) errors.push("Email inválido");
      if (r.unidad_numero && !unidadByNumero.has(r.unidad_numero.toLowerCase().trim())) {
        warnings.push(`Unidad "${r.unidad_numero}" no existe — se importará sin unidad`);
      }
      if (r.recargo_mora_pct && isNaN(Number(r.recargo_mora_pct))) errors.push("Mora % inválido");
      return { ...r, _errors: errors, _warnings: warnings };
    });
  };

  const onFile = async (file: File) => {
    setFilename(file.name);
    const text = await file.text();
    const data = parseCSV(text);
    if (data.length < 2) { toast.error("Archivo vacío"); return; }
    const headers = data[0].map((h) => h.toLowerCase().trim());
    const idx = (key: string) => headers.indexOf(key);
    const parsed: Row[] = data.slice(1).map((cols, i) => {
      const get = (k: string) => (idx(k) >= 0 ? (cols[idx(k)] ?? "").trim() : "");
      const tipoRaw = (get("tipo") || "propietario").toLowerCase();
      return {
        nombre: get("nombre"),
        apellido: get("apellido"),
        tipo: (tipoRaw === "inquilino" ? "inquilino" : "propietario") as "propietario" | "inquilino",
        unidad_numero: get("unidad_numero"),
        piso: get("piso"),
        email: get("email"),
        telefono: get("telefono"),
        telefono_alt: get("telefono_alt"),
        dni: get("dni"),
        recargo_mora_pct: get("recargo_mora_pct"),
        relacionado_con: get("relacionado_con"),
        _row: i + 2,
        _errors: [],
        _warnings: [],
      };
    });
    setRows(validateRows(parsed));
  };

  const okRows = rows.filter((r) => r._errors.length === 0);
  const errorCount = rows.length - okRows.length;

  const doImport = async () => {
    if (!edificioId) { toast.error("Selecciona un edificio"); return; }
    if (okRows.length === 0) { toast.error("No hay filas válidas"); return; }
    setImporting(true);
    let creados = 0, actualizados = 0, fallidos = 0;

    // Pase 1: titulares (sin relacionado_con)
    const titulares = okRows.filter((r) => !r.relacionado_con.trim());
    const afiliados = okRows.filter((r) => r.relacionado_con.trim());
    const emailToId = new Map<string, string>(existentesByEmail);

    for (const r of titulares) {
      try {
        const unidad_id = r.unidad_numero ? unidadByNumero.get(r.unidad_numero.toLowerCase().trim()) ?? null : null;
        const payload: any = {
          condominio_id: edificioId,
          nombre: r.nombre.trim(),
          apellido: r.apellido.trim(),
          tipo: r.tipo,
          unidad_id,
          email: r.email.trim() || null,
          telefono: r.telefono.trim() || null,
          telefono_alt: r.telefono_alt.trim() || null,
          dni: r.dni.trim() || null,
          recargo_mora_pct: r.recargo_mora_pct ? Number(r.recargo_mora_pct) : 0,
        };
        const existingId = r.email ? existentesByEmail.get(r.email.toLowerCase().trim()) : undefined;
        if (existingId) {
          const { error } = await supabase.from("residentes").update(payload).eq("id", existingId);
          if (error) throw error;
          actualizados++;
          if (r.email) emailToId.set(r.email.toLowerCase().trim(), existingId);
        } else {
          const { data, error } = await supabase.from("residentes").insert(payload).select("id").single();
          if (error) throw error;
          creados++;
          if (data && r.email) emailToId.set(r.email.toLowerCase().trim(), data.id);
        }
      } catch (e: any) {
        fallidos++;
        console.error("Import titular:", r, e);
      }
    }

    // Pase 2: afiliados
    for (const r of afiliados) {
      try {
        const unidad_id = r.unidad_numero ? unidadByNumero.get(r.unidad_numero.toLowerCase().trim()) ?? null : null;
        const rel = r.relacionado_con.trim().toLowerCase();
        let relacionado_id: string | null = emailToId.get(rel) ?? null;
        if (!relacionado_id) {
          // match por nombre completo
          const match = [...existentes, ...okRows.filter((x) => !x.relacionado_con.trim())].find((x: any) => {
            const full = `${x.nombre ?? ""} ${x.apellido ?? ""}`.toLowerCase().trim();
            return full === rel;
          });
          if (match && (match as any).id) relacionado_id = (match as any).id;
        }
        const payload: any = {
          condominio_id: edificioId,
          nombre: r.nombre.trim(),
          apellido: r.apellido.trim(),
          tipo: r.tipo,
          unidad_id,
          email: r.email.trim() || null,
          telefono: r.telefono.trim() || null,
          telefono_alt: r.telefono_alt.trim() || null,
          dni: r.dni.trim() || null,
          recargo_mora_pct: r.recargo_mora_pct ? Number(r.recargo_mora_pct) : 0,
          relacionado_id,
        };
        const existingId = r.email ? existentesByEmail.get(r.email.toLowerCase().trim()) : undefined;
        if (existingId) {
          const { error } = await supabase.from("residentes").update(payload).eq("id", existingId);
          if (error) throw error;
          actualizados++;
        } else {
          const { error } = await supabase.from("residentes").insert(payload);
          if (error) throw error;
          creados++;
        }
      } catch (e: any) {
        fallidos++;
        console.error("Import afiliado:", r, e);
      }
    }

    setImporting(false);
    qc.invalidateQueries({ queryKey: ["residentes-list"] });
    qc.invalidateQueries({ queryKey: ["residentes-map"] });
    toast.success(`Importación: ${creados} creados, ${actualizados} actualizados${fallidos ? `, ${fallidos} fallidos` : ""}`);
    if (!fallidos) {
      setRows([]); setFilename("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-[#0F172A]">Importar residentes (CSV)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
            <p className="text-sm text-[#1E293B]">
              <strong>1.</strong> Descargá la plantilla, completala con tus residentes y subila acá.
              Para afiliados (familiares o inquilinos vinculados a un propietario), poné en
              <code className="px-1 mx-1 bg-white border rounded text-xs">relacionado_con</code>
              el email o "Nombre Apellido" del titular.
            </p>
            <Button type="button" variant="outline" onClick={downloadTemplate} className="border-[#4A154B] text-[#4A154B]">
              <Download className="w-4 h-4 mr-1" /> Descargar plantilla
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Edificio destino</Label>
              <Select value={edificioId} onValueChange={setEdificioId}>
                <SelectTrigger><SelectValue placeholder="Seleccioná un edificio" /></SelectTrigger>
                <SelectContent>
                  {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Archivo CSV</Label>
              <label className="flex items-center justify-center gap-2 w-full h-10 px-3 border border-dashed border-[#cbd5e1] rounded-md cursor-pointer hover:bg-[#F8FAFC] text-sm text-[#1E293B]">
                <Upload className="w-4 h-4" />
                {filename || "Subir CSV"}
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
              </label>
            </div>
          </div>

          {rows.length > 0 && (
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-[#F8FAFC] text-xs text-[#1E293B]">
                <span>{rows.length} filas · <span className="text-emerald-700">{okRows.length} válidas</span>{errorCount ? <> · <span className="text-rose-700">{errorCount} con errores</span></> : null}</span>
              </div>
              <div className="max-h-[280px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white sticky top-0">
                    <tr className="text-left text-[#64748B]">
                      <th className="px-2 py-1">#</th>
                      <th className="px-2 py-1">Nombre</th>
                      <th className="px-2 py-1">Tipo</th>
                      <th className="px-2 py-1">Unidad</th>
                      <th className="px-2 py-1">Email</th>
                      <th className="px-2 py-1">Afiliado a</th>
                      <th className="px-2 py-1">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className={r._errors.length ? "bg-rose-50" : r._warnings.length ? "bg-amber-50" : ""}>
                        <td className="px-2 py-1 text-[#64748B]">{r._row}</td>
                        <td className="px-2 py-1">{r.nombre} {r.apellido}</td>
                        <td className="px-2 py-1 capitalize">{r.tipo}</td>
                        <td className="px-2 py-1">{r.unidad_numero || "—"}</td>
                        <td className="px-2 py-1">{r.email || "—"}</td>
                        <td className="px-2 py-1">{r.relacionado_con || "—"}</td>
                        <td className="px-2 py-1">
                          {r._errors.length > 0 ? (
                            <span className="flex items-center gap-1 text-rose-700"><XCircle className="w-3 h-3" />{r._errors[0]}</span>
                          ) : r._warnings.length > 0 ? (
                            <span className="flex items-center gap-1 text-amber-700"><AlertTriangle className="w-3 h-3" />{r._warnings[0]}</span>
                          ) : (
                            <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3 h-3" />OK</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={doImport} disabled={!edificioId || okRows.length === 0 || importing} className="bg-[#4A154B] hover:bg-[#350d36]">
            {importing ? "Importando…" : `Importar ${okRows.length} residente(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
