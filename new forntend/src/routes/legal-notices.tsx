import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/legal-notices")({
  component: LegalNoticesRoute,
});

function LegalNoticesRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/", hash: "legal-notices" });
  }, [navigate]);
  return null;
}
