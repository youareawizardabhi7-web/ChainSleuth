"use client";

import React from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Authentication is disabled and set to dummy session for rapid testing
  return <>{children}</>;
}
