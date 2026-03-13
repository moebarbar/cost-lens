"use client";

import { createContext, useContext, useState } from "react";

export type DashboardPeriod = "7d" | "30d" | "90d" | "12m";

interface DashboardContextValue {
  period: DashboardPeriod;
  setPeriod: (p: DashboardPeriod) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  period: "30d",
  setPeriod: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<DashboardPeriod>("30d");
  return (
    <DashboardContext.Provider value={{ period, setPeriod }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardPeriod() {
  return useContext(DashboardContext);
}
