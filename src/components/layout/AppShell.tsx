import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { EdificioFilterProvider } from "@/lib/edificio-filter-context";
import { PlanProvider } from "@/lib/plan-context";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ReadOnlyBanner } from "./ReadOnlyBanner";
import { OnboardingWizard, useShouldShowOnboarding } from "@/components/onboarding/OnboardingWizard";
import { useCanWrite } from "@/lib/plan-context";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <PlanProvider>
      <EdificioFilterProvider>
        <AppShellInner>{children}</AppShellInner>
      </EdificioFilterProvider>
    </PlanProvider>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const shouldShow = useShouldShowOnboarding();
  const canWrite = useCanWrite();
  const isAdmin = !!user && role !== "residente" && role !== "guardia";
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (role === "residente") navigate({ to: "/portal" });
    else if (role === "guardia") navigate({ to: "/guardia" });
    else if (role === "agente_inmobiliario" || role === "gerente_crm") navigate({ to: "/login" });
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (isAdmin && shouldShow && canWrite) setWizardOpen(true);
  }, [isAdmin, shouldShow, canWrite]);

  useEffect(() => {
    const open = () => { if (canWrite) setWizardOpen(true); };
    window.addEventListener("residalia:open-onboarding", open);
    return () => window.removeEventListener("residalia:open-onboarding", open);
  }, [canWrite]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ffffff]">
        <div className="text-[#64748B] text-sm">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#ffffff]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <ReadOnlyBanner />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
      {isAdmin && canWrite && <OnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />}
    </div>
  );
}
