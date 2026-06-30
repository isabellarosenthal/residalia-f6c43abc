import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/pipeline")({
  component: () => <Navigate to="/dashboard" replace />,
});
