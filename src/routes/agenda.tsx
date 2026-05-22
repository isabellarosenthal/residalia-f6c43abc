import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/layout/ComingSoon";
export const Route = createFileRoute("/agenda")({ component: () => <ComingSoon title="Agenda" /> });
