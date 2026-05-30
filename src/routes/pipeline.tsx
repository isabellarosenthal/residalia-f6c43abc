import { lazy, Suspense, useState, useEffect, useMemo } from "react";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Phone, MessageCircle, Mail, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEdificios, useProspectos, useUpdateEtapa, ETAPAS_PIPELINE, type Prospecto, type EtapaPipeline } from "@/lib/queries";
import { etapaLabel } from "@/components/crm/ProspectoFormDialog";

const loadForm = () => import("@/components/crm/ProspectoFormDialog");
const ProspectoFormDialog = lazy(() => loadForm().then((m) => ({ default: m.ProspectoFormDialog })));

export const Route = createFileRoute("/pipeline")({ component: PipelinePage });

const COL_COLOR: Record<EtapaPipeline, string> = {
  nuevo: "border-t-slate-400",
  contactado: "border-t-blue-400",
  interesado: "border-t-purple-400",
  visita_agendada: "border-t-indigo-400",
  negociacion: "border-t-amber-400",
  cierre: "border-t-orange-400",
  ganado: "border-t-green-500",
  perdido: "border-t-red-400",
};

const TEMP_DOT: Record<string, string> = { frio: "bg-blue-500", tibio: "bg-amber-500", caliente: "bg-red-500" };

function PipelinePage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useEdificioFilter();
  const { data: prospectos = [] } = useProspectos(edificioId === "all" ? undefined : edificioId);
  const updateEtapa = useUpdateEtapa();
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState<Prospecto | null>(null);
  const [defaultEtapa, setDefaultEtapa] = useState<EtapaPipeline>("nuevo");
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => { loadForm(); }, []);

  const grouped = useMemo(() => {
    const m: Record<EtapaPipeline, Prospecto[]> = {} as any;
    ETAPAS_PIPELINE.forEach((e) => (m[e] = []));
    prospectos.forEach((p) => m[p.etapa_pipeline]?.push(p));
    return m;
  }, [prospectos]);

  const openNew = async (etapa: EtapaPipeline) => {
    setEdit(null); setDefaultEtapa(etapa);
    await loadForm(); setFormOpen(true);
  };
  const openEdit = async (p: Prospecto) => {
    setEdit(p); await loadForm(); setFormOpen(true);
  };

  const onDrop = (etapa: EtapaPipeline) => {
    if (!dragId) return;
    const p = prospectos.find((x) => x.id === dragId);
    if (p && p.etapa_pipeline !== etapa) updateEtapa.mutate({ id: dragId, etapa });
    setDragId(null);
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1600px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#0a1e3f]">Pipeline</h1>
            <p className="text-sm text-[#6b7a99]">Arrastra prospectos entre etapas</p>
          </div>
          <Select value={edificioId} onValueChange={setEdificioId}>
            <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los edificios</SelectItem>
              {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {edificios.length === 0 ? (
          <div className="text-center text-[#6b7a99] py-10"><Users className="w-8 h-8 mx-auto mb-2" />Crea un edificio primero.</div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3 min-w-max">
              {ETAPAS_PIPELINE.map((etapa) => {
                const items = grouped[etapa];
                return (
                  <div
                    key={etapa}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDrop(etapa)}
                    className={`w-72 shrink-0 bg-[#fdfbf8] rounded-xl border border-[#f0e5dc] border-t-4 ${COL_COLOR[etapa]} flex flex-col`}
                  >
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[#0a1e3f] text-sm">{etapaLabel(etapa)}</h3>
                        <span className="text-xs text-[#6b7a99]">{items.length}</span>
                      </div>
                      <button onClick={() => openNew(etapa)} className="p-1 rounded hover:bg-[#fffdf5] text-[#0a1e3f]">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="px-2 pb-2 space-y-2 max-h-[calc(100vh-260px)] overflow-y-auto">
                      {items.map((p) => (
                        <div
                          key={p.id}
                          draggable
                          onDragStart={() => setDragId(p.id)}
                          onDragEnd={() => setDragId(null)}
                          onClick={() => openEdit(p)}
                          className={`bg-white rounded-lg border border-[#f0e5dc] p-3 cursor-grab hover:border-[#ffd60a] hover:shadow-sm transition ${dragId === p.id ? "opacity-50" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm text-[#0a1e3f] truncate">{p.nombre} {p.apellido ?? ""}</p>
                              <p className="text-xs text-[#6b7a99] capitalize">{p.tipo}{p.origen ? ` · ${p.origen}` : ""}</p>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${TEMP_DOT[p.temperatura]}`} title={p.temperatura} />
                          </div>
                          {(p.presupuesto_min || p.presupuesto_max) && (
                            <p className="text-xs text-[#0a1e3f] mt-1 font-medium">
                              L {Number(p.presupuesto_min ?? 0).toLocaleString()} - {Number(p.presupuesto_max ?? 0).toLocaleString()}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 text-[#6b7a99]">
                            {p.telefono && <Phone className="w-3 h-3" />}
                            {p.whatsapp && <MessageCircle className="w-3 h-3" />}
                            {p.email && <Mail className="w-3 h-3" />}
                            <span className="ml-auto text-[10px]">
                              {p.ultimo_contacto ? new Date(p.ultimo_contacto).toLocaleDateString() : "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {items.length === 0 && <p className="text-xs text-[#6b7a99] text-center py-4">Vacío</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        {formOpen && <ProspectoFormDialog open={formOpen} onOpenChange={setFormOpen} prospecto={edit} defaultEtapa={defaultEtapa} />}
      </Suspense>
    </AppShell>
  );
}
