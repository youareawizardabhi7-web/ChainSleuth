import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/audit")({
  component: AuditRoute,
});

function AuditRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/", hash: "audit" });
  }, [navigate]);
  return null;
}
