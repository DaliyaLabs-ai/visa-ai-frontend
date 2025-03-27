"use client";
import { createContext, useContext } from "react";
import { useVapiState } from "@/hooks/use-vapi";

type VapiContextType = ReturnType<typeof useVapiState>;

const VapiContext = createContext<VapiContextType | null>(null);

export function VapiProvider({ children }: { children: React.ReactNode }) {
  const vapiState = useVapiState();

  return (
    <VapiContext.Provider value={vapiState}>{children}</VapiContext.Provider>
  );
}

export const useVapi = () => {
  const context = useContext(VapiContext);
  if (!context) {
    throw new Error("useVapi must be used within a VapiProvider");
  }
  return context;
}; 