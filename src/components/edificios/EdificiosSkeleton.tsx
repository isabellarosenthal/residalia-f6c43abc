import { AppShell } from "@/components/layout/AppShell";

export function EdificiosSkeleton() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-7 w-40 rounded-md shimmer" />
            <div className="h-4 w-72 rounded-md shimmer" />
          </div>
          <div className="h-10 w-36 rounded-lg shimmer" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="h-10 flex-1 min-w-[220px] rounded-lg shimmer" />
          <div className="h-10 w-[200px] rounded-lg shimmer" />
          <div className="h-10 w-40 rounded-lg shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-2xl shimmer" />)}
        </div>
      </div>
    </AppShell>
  );
}

export function EdificioDetailSkeleton() {
  return (
    <AppShell>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="h-5 w-32 rounded-md shimmer" />
        <div className="h-40 w-full rounded-2xl shimmer" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
        </div>
        <div className="h-96 w-full rounded-2xl shimmer" />
      </div>
    </AppShell>
  );
}
