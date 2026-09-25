import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/investigations")({
  component: InvestigationsRoute,
});

function InvestigationsRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/", hash: "investigations" });
  }, [navigate]);
  return null;
}
