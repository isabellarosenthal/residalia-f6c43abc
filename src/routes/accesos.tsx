import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
export const Route = createFileRoute("/accesos")({ component: () => <ComingSoon title="Accesos" /> });
