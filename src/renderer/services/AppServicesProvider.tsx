import { type PropsWithChildren } from "react";
import type { AppServices } from "../../shared/contracts";
import { AppServicesContext } from "./app-services-context";

export interface AppServicesProviderProps extends PropsWithChildren {
  services: AppServices;
}

export function AppServicesProvider({ children, services }: AppServicesProviderProps) {
  return <AppServicesContext.Provider value={services}>{children}</AppServicesContext.Provider>;
}
