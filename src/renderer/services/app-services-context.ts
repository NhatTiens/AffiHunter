import { createContext } from "react";
import type { AppServices } from "../../shared/contracts";

export const AppServicesContext = createContext<AppServices | null>(null);
