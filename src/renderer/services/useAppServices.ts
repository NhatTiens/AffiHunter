import { useContext } from "react";
import type { AppServices } from "../../shared/contracts";
import { AppServicesContext } from "./app-services-context";

export function useAppServices(): AppServices {
  const services = useContext(AppServicesContext);
  if (!services) throw new Error("useAppServices must be used within AppServicesProvider");
  return services;
}
