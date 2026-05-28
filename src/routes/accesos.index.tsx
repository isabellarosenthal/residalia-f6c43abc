import { lazy, Suspense, useState, useEffect } from "react";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, KeyRound, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AccesosTable } from "@/components/accesos/AccesosTable";
import { useEdificios, type Acceso } from "@/lib/queries";

const loadDialog = () => import("@/components/accesos/AccesoFormDialog");
const AccesoFormDialog = lazy(() => loadDialog().then(m => ({ default: m.AccesoFormDialog })));

export const Route = createFileRoute("/accesos/")({ component: AccesosPage });

function AccesosPage() {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useEdificioFilter();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Acceso | null>(null);

  useEffect(() => { loadDialog(); }, []);

  return (
    <AppShell>
      <div className="space-y-5 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[#2d1200]">Control de Accesos</h1>
            <p className="text-sm text-[#9a7060]">Registro de visitantes, deliveries y proveedores</p>
          </div>
          <div className="flex gap-2">
            <Select value={edificioId} onValueChange={setEdificioId}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los edificios</SelectItem>
                {edificios.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button asChild variant="outline">
              <Link to="/accesos/validar"><ShieldCheck className="w-4 h-4 mr-1" />Validar pase</Link>
            </Button>
            <Button onClick={() => { setEdit(null); setOpen(true); }} className="bg-[#c94f0c] hover:bg-[#a33d08]">
              <Plus className="w-4 h-4 mr-1" />Registrar acceso
            </Button>
          </div>
        </div>

        {edificios.length === 0 ? (
          <div className="text-center text-[#9a7060] py-10"><KeyRound className="w-8 h-8 mx-auto mb-2" />Crea un edificio primero.</div>
        ) : (
          <AccesosTable edificioId={edificioId} onEdit={(a) => { setEdit(a); setOpen(true); }} />
        )}
      </div>

      <Suspense fallback={null}>
        {open && <AccesoFormDialog open={open} onOpenChange={setOpen} acceso={edit} defaultCondominioId={edificioId !== "all" ? edificioId : undefined} />}
      </Suspense>
    </AppShell>
  );
}