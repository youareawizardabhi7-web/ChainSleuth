import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/vasp")({
  component: VaspRoute,
});

function VaspRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/", hash: "vasp" });
  }, [navigate]);
  return null;
}
