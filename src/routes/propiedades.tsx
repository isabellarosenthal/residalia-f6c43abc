import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/propiedades")({
  component: () => <Navigate to="/dashboard" replace />,
});
