const API_URL = "https://trafficx-t1cm.onrender.com/";

export type Direction = "north" | "south" | "east" | "west";

export interface DirectionResult {
  counts: { vehicle: number; emergency: number };
  density: number;
  congestion_level: "Low" | "Medium" | "High";
  has_emergency: boolean;
}

export interface AnalyzeResponse {
  upload_id: string;
  per_direction: Record<Direction, DirectionResult>;
  recommended_green_time_seconds: Record<Direction, number>;
  emergency_priority: { direction: string; reason: string } | null;
}

export async function uploadImages(
  files: Record<Direction, File>
): Promise<AnalyzeResponse> {
  const form = new FormData();
  (Object.keys(files) as Direction[]).forEach((d) => form.append(d, files[d]));

  // Don't set Content-Type yourself; the browser adds the multipart boundary
  const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      typeof err?.detail === "string"
        ? err.detail
        : err?.error ?? `Request failed (${res.status})`
    );
  }
  return res.json();
}
export interface HistoryDirection {
  vehicle_count: number;
  emergency_count: number;
  density: number;
  congestion_level: "Low" | "Medium" | "High";
  green_time_seconds: number;
}

export interface HistoryRun {
  upload_id: string;
  created_at: string;
  total_vehicles: number;
  emergency: boolean;
  directions: Partial<Record<Direction, HistoryDirection>>;
}

export async function fetchHistory(limit = 30): Promise<HistoryRun[]> {
  const res = await fetch(`${API_URL}/history?limit=${limit}`);
  if (!res.ok) throw new Error(`Could not load history (${res.status})`);
  return res.json();
}