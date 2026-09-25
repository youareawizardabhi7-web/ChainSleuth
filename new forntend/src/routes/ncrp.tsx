import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/ncrp")({
  component: NcrpRoute,
});

function NcrpRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/", hash: "ncrp" });
  }, [navigate]);
  return null;
}
