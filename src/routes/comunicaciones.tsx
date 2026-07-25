import { lazy, Suspense, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Megaphone, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui-pentos";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import { useComunicados, useDeleteComunicado, useEdificios, type Comunicado } from "@/lib/queries";

const loadDialog = () => import("@/components/comunicaciones/ComunicadoFormDialog");
const ComunicadoFormDialog = lazy(() => loadDialog().then((m) => ({ default: m.ComunicadoFormDialog })));

export const Route = createFileRoute("/comunicaciones")({ component: ComunicacionesPage });

const fmtDT = (s: string) => new Date(s).toLocaleString("es-HN", { dateStyle: "medium", timeStyle: "short" });

const badgeVariant = (tipo: string | null) =>
  tipo === "urgente" ? "danger" : tipo === "mantenimiento" ? "warning" : tipo === "evento" ? "success" : "neutral";

function ComunicacionesPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useEdificioFilter();
  const filter = edificioId === "all" ? undefined : edificioId;
  const { data: comunicados = [], isLoading } = useComunicados(filter);
  const del = useDeleteComunicado();

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Comunicado | null>(null);

  useEffect(() => { loadDialog(); }, []);

  const openDialog = async (c: Comunicado | null) => {
    setEdit(c);
    await loadDialog();
    setOpen(true);
  };

  const nombreEdificio = (id: string) => edificios.find((e) => e.id === id)?.nombre ?? "—";

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1000px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#0F172A]">Comunicaciones</h1>
            <p className="text-sm text-[#64748B]">Anuncios publicados en el portal de residentes</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={edificioId} onValueChange={setEdificioId}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los edificios</SelectItem>
                {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => openDialog(null)} className="bg-[#4A154B] hover:bg-[#350d36]">
              <Plus className="w-4 h-4 mr-1" />Nuevo anuncio
            </Button>
          </div>
        </div>

        {isLoading && <div className="text-sm text-[#64748B]">Cargando…</div>}

        {!isLoading && comunicados.length === 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center">
            <Megaphone className="w-8 h-8 mx-auto mb-2 text-[#64748B] opacity-50" />
            <p className="font-display font-bold text-[#0F172A]">Todavía no hay anuncios</p>
            <p className="text-sm text-[#64748B] mt-1">
              Publica avisos de mantenimiento, cortes de agua o recordatorios de pago. Los residentes los ven en su portal.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {comunicados.map((c) => (
            <article key={c.id} className="bg-white border border-[#E2E8F0] rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={badgeVariant(c.tipo)}>{c.tipo ?? "aviso"}</Badge>
                    <span className="text-xs text-[#64748B]">{fmtDT(c.created_at)}</span>
                    {edificioId === "all" && (
                      <span className="text-xs text-[#64748B]">· {nombreEdificio(c.condominio_id)}</span>
                    )}
                  </div>
                  <h2 className="font-display font-bold text-lg text-[#0F172A]">{c.titulo}</h2>
                  {c.cuerpo && <p className="text-sm text-[#4A154B] mt-1 whitespace-pre-wrap">{c.cuerpo}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openDialog(c)} className="h-8 w-8 p-0">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => { if (confirm(`¿Eliminar el anuncio "${c.titulo}"?`)) del.mutate(c.id); }}
                    className="h-8 w-8 p-0 text-[#be185d] hover:text-[#be185d]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Suspense fallback={null}>
        {open && (
          <ComunicadoFormDialog
            open={open}
            onOpenChange={(v) => { setOpen(v); if (!v) setEdit(null); }}
            comunicado={edit}
            defaultCondominioId={filter}
          />
        )}
      </Suspense>
    </AppShell>
  );
}
