import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
export const Route = createFileRoute("/mantenimiento")({ component: () => <ComingSoon title="Mantenimiento" /> });
