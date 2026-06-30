import { type ReactNode, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { OnboardingWizard, useShouldShowOnboarding } from "@/components/onboarding/OnboardingWizard";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const shouldShow = useShouldShowOnboarding();
  const isAdmin = !!user && role !== "residente" && role !== "guardia";
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    if (role === "residente") navigate({ to: "/portal" });
    else if (role === "guardia") navigate({ to: "/guardia" });
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (isAdmin && shouldShow) setWizardOpen(true);
  }, [isAdmin, shouldShow]);

  useEffect(() => {
    const open = () => setWizardOpen(true);
    window.addEventListener("residalia:open-onboarding", open);
    return () => window.removeEventListener("residalia:open-onboarding", open);
  }, []);

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
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      {isAdmin && <OnboardingWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />}
    </div>
  );
}
