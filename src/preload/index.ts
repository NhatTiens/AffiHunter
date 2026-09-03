export type PreloadApi = { health: () => Promise<{ ok: true }> };
export const preloadApi: PreloadApi = { health: async () => ({ ok: true }) };
