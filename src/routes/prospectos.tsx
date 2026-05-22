import { lazy, Suspense, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProspectosTable } from "@/components/crm/ProspectosTable";
import { useEdificios, type Prospecto } from "@/lib/queries";

const loadForm = () => import("@/components/crm/ProspectoFormDialog");
const loadActs = () => import("@/components/crm/ActividadesDialog");
const ProspectoFormDialog = lazy(() => loadForm().then((m) => ({ default: m.ProspectoFormDialog })));
const ActividadesDialog = lazy(() => loadActs().then((m) => ({ default: m.ActividadesDialog })));

export const Route = createFileRoute("/prospectos")({ component: ProspectosPage });

function ProspectosPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editProspecto, setEditProspecto] = useState<Prospecto | null>(null);
  const [actOpen, setActOpen] = useState(false);
  const [actProspecto, setActProspecto] = useState<Prospecto | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadForm(); loadActs(); }, []);

  const openForm = async (p: Prospecto | null) => {
    setEditProspecto(p); setLoading(true);
    await loadForm(); setLoading(false); setFormOpen(true);
  };
  const openActs = async (p: Prospecto) => {
    setActProspecto(p); await loadActs(); setActOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Prospectos</h1>
            <p className="text-sm text-[#9a7060]">CRM de leads y oportunidades</p>
          </div>
          <div className="flex gap-2">
            <Select value={edificioId} onValueChange={setEdificioId}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los edificios</SelectItem>
                {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => openForm(null)} disabled={loading} className="bg-[#c94f0c] hover:bg-[#a33d08]">
              <Plus className="w-4 h-4 mr-1" />{loading ? "Cargando…" : "Nuevo prospecto"}
            </Button>
          </div>
        </div>

        {edificios.length === 0 ? (
          <div className="text-center text-[#9a7060] py-10"><Users className="w-8 h-8 mx-auto mb-2" />Crea un edificio primero.</div>
        ) : (
          <ProspectosTable edificioId={edificioId} onEdit={(p) => openForm(p)} onActivity={openActs} />
        )}
      </div>

      <Suspense fallback={null}>
        {formOpen && <ProspectoFormDialog open={formOpen} onOpenChange={setFormOpen} prospecto={editProspecto} />}
        {actOpen && <ActividadesDialog open={actOpen} onOpenChange={setActOpen} prospecto={actProspecto} />}
      </Suspense>
    </AppShell>
  );
}
