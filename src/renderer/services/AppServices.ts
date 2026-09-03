export interface AppServices {
  health(): Promise<{ ok: true }>;
}

export const mockAppServices: AppServices = { health: async () => ({ ok: true }) };
