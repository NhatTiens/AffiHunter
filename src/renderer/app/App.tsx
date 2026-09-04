import { AppRouter } from "./router";
import { AppServicesProvider } from "../services/AppServices";
import { mockAppServices } from "../services/mock/composition";

export function App() {
  return (
    <AppServicesProvider services={mockAppServices}>
      <AppRouter />
    </AppServicesProvider>
  );
}
