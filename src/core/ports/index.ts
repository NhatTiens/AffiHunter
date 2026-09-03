export interface HealthPort { health(): Promise<{ ok: boolean }>; }
