import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  component: AuthRoute,
});

function AuthRoute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/", hash: "auth" });
  }, [navigate]);
  return null;
}
