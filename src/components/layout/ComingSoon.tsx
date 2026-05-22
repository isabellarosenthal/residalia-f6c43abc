import { type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui-pentos";
import { Sparkles } from "lucide-react";

export function ComingSoon({ title, icon }: { title: string; icon?: ReactNode }) {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto pt-12">
        <EmptyState
          icon={icon ?? <Sparkles className="w-7 h-7" />}
          title={title}
          hint="Este módulo está siendo construido. Dime cuál quieres priorizar y lo termino primero."
        />
      </div>
    </AppShell>
  );
}
