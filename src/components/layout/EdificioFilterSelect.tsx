import { Building2 } from "lucide-react";
import { useEdificios } from "@/lib/queries";
import { useEdificioFilter } from "@/hooks/useEdificioFilter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  className?: string;
  compact?: boolean;
};

export function EdificioFilterSelect({ className, compact }: Props) {
  const { data: edificios = [] } = useEdificios();
  const [edificioId, setEdificioId] = useEdificioFilter();

  if (edificios.length <= 1) return null;

  return (
    <Select value={edificioId} onValueChange={setEdificioId}>
      <SelectTrigger className={className ?? (compact ? "h-9 w-[200px]" : "w-[260px]")}>
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-4 h-4 shrink-0 text-[#64748B]" />
          <SelectValue placeholder="Todos los edificios" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos los edificios</SelectItem>
        {edificios.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
