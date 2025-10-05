
export interface Coordinate {
  lat: number;
  lon: number;
}

export enum LegMode {
  WALK = "WALK",
  BUS = "BUS",
  TRAIN = "TRAIN",
}

export interface Leg {
  mode: LegMode;
  route_id?: string | null;
  trip_id?: string | null;
  from_stop_id?: string | null;
  to_stop_id?: string | null;
  depart_time: string; // ISO8601 string
  arrive_time: string; // ISO8601 string
  predicted_delay_secs: number;
  description?: string | null;
}

export interface RouteOption {
  id: string;
  summary: string;
  total_duration_secs: number;
  transfer_count: number;
  min_transfer_slack_secs: number;
  risk_score: number;
  legs: Leg[];
  ai_reason?: string | null;
}

export interface SearchRequest {
  origin: Coordinate;
  destination: Coordinate;
  departure_time?: string | null; // ISO8601 string
  max_transfers?: number | null;
  notes?: string | null;
}

export interface SearchResponse {
  options: RouteOption[];
}

export interface SessionStartRequest {
  selected_route_id: string;
  user_context?: string | null;
}

export interface SessionUpdateRequest {
  session_id: string;
  current_location: Coordinate;
  timestamp?: string | null; // ISO8601 string
}

export interface SessionUpdateResponse {
  session_id: string;
  advice: string;
  maybe_better_options: RouteOption[];
}
