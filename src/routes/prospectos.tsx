import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/prospectos")({
  component: () => <Navigate to="/dashboard" replace />,
});
