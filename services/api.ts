import { LegMode, type Coordinate, type RouteOption, type SearchRequest, type SearchResponse, type SessionUpdateResponse } from '../types';

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8080';
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL ?? DEFAULT_BACKEND_URL).replace(/\/$/, '');

const DEFAULT_CURLBUS_URL = 'https://api.curlbus.app';
const CURLBUS_API_BASE_URL = (import.meta.env.VITE_CURLBUS_API_URL ?? DEFAULT_CURLBUS_URL).replace(/\/$/, '');
const CURLBUS_ROUTER_ID = import.meta.env.VITE_CURLBUS_ROUTER_ID ?? 'israel';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

type JsonRecord = Record<string, unknown>;

const jsonHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
});

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  if (response.status === 204) {
    return {} as T;
  }
  return await response.json() as T;
};

const generateRouteReason = async (route: RouteOption, request: SearchRequest): Promise<string | null> => {
  if (!OPENROUTER_API_KEY || !OPENROUTER_MODEL) {
    return route.ai_reason ?? null;
  }

  const legsSummary = route.legs
    .map(leg => `${leg.mode} from ${new Date(leg.depart_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${new Date(leg.arrive_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
    .join('\n');

  const userNotes = request.notes?.trim();

  const messages = [
    {
      role: 'system',
      content: 'You are a concise transit planning assistant. Explain why a traveler might like a proposed public transit route. Keep the tone practical and friendly.'
    },
    {
      role: 'user',
      content: `Route summary: ${route.summary}\nTotal duration: ${Math.round(route.total_duration_secs / 60)} minutes\nTransfers: ${route.transfer_count}\nLegs:\n${legsSummary}\n${userNotes ? `Rider notes: ${userNotes}` : 'No rider notes provided.'}\n\nIn 1-2 sentences, explain why this route could be a good choice.`
    }
  ];

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        ...(typeof window !== 'undefined' && window.location?.origin ? { 'HTTP-Referer': window.location.origin } : {}),
        'X-Title': 'Israel Transit',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        max_tokens: 120,
        temperature: 0.7,
      }),
    });

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content?.trim() ?? route.ai_reason ?? null;
  } catch (error) {
    console.warn('Failed to fetch AI reason from OpenRouter', error);
    return route.ai_reason ?? null;
  }
};

type CurlbusStopReference = string | { id?: string; agencyId?: string } | null | undefined;

interface CurlbusLeg {
  mode: string;
  routeId?: string | null;
  tripId?: string | null;
  trip?: { id?: string | null } | null;
  route?: string | null;
  routeShortName?: string | null;
  routeLongName?: string | null;
  headsign?: string | null;
  startTime: number;
  endTime: number;
  realTime?: boolean;
  distance?: number;
  duration?: number;
  departureDelay?: number;
  arrivalDelay?: number;
  from?: {
    name?: string | null;
    stopId?: CurlbusStopReference;
  } | null;
  to?: {
    name?: string | null;
    stopId?: CurlbusStopReference;
  } | null;
}

interface CurlbusItinerary {
  duration: number;
  legs: CurlbusLeg[];
  transfers?: number;
}

interface CurlbusPlanResponse {
  plan?: {
    itineraries: CurlbusItinerary[];
  };
  error?: {
    id?: string;
    message?: string;
  };
}

const parseStopId = (stopId: CurlbusStopReference): string | null => {
  if (!stopId) {
    return null;
  }

  if (typeof stopId === 'string') {
    return stopId.includes(':') ? stopId.split(':').pop() ?? null : stopId;
  }

  if (typeof stopId.id === 'string' && stopId.id.length > 0) {
    return stopId.id;
  }

  return null;
};

const toLegMode = (mode: string): LegMode => {
  const normalized = mode.toUpperCase();
  if (normalized === 'WALK' || normalized === 'WALKING') {
    return LegMode.WALK;
  }
  if (['BUS', 'TRAM', 'TROLLEYBUS', 'COACH'].includes(normalized)) {
    return LegMode.BUS;
  }
  return LegMode.TRAIN;
};

const toIsoString = (epochMillis: number): string => {
  const date = Number.isFinite(epochMillis) ? new Date(epochMillis) : new Date();
  return date.toISOString();
};

const describeLeg = (leg: CurlbusLeg, mode: LegMode): string | null => {
  if (mode === LegMode.WALK) {
    const distanceMeters = leg.distance ? Math.round(leg.distance) : null;
    if (distanceMeters && distanceMeters > 0) {
      return `Walk ${distanceMeters} m`;
    }
    return 'Walk';
  }

  const routeParts = [leg.routeShortName, leg.routeLongName, leg.route, leg.headsign]
    .filter((part): part is string => Boolean(part && part.trim().length > 0));

  if (routeParts.length === 0) {
    return mode === LegMode.BUS ? 'Bus ride' : 'Train ride';
  }

  const [primary, ...rest] = routeParts;
  const suffix = rest.length > 0 ? ` – ${rest.join(' ')}` : '';
  return `${primary}${suffix}`;
};

const computeMinTransferSlack = (legs: CurlbusLeg[]): number => {
  if (legs.length <= 1) {
    return 0;
  }

  let minSlack = Number.POSITIVE_INFINITY;
  for (let i = 1; i < legs.length; i += 1) {
    const previous = legs[i - 1];
    const current = legs[i];
    const slackMillis = current.startTime - previous.endTime;
    if (Number.isFinite(slackMillis)) {
      const slackSecs = Math.max(0, Math.round(slackMillis / 1000));
      minSlack = Math.min(minSlack, slackSecs);
    }
  }

  return minSlack === Number.POSITIVE_INFINITY ? 0 : minSlack;
};

const computeRiskScore = (legs: CurlbusLeg[]): number => {
  if (legs.length === 0) {
    return 0.2;
  }

  const totalDelay = legs.reduce((accumulator, leg) => {
    const delay = Math.max(0, leg.departureDelay ?? leg.arrivalDelay ?? 0);
    return accumulator + delay;
  }, 0);

  const averageDelay = totalDelay / legs.length;
  const realtimePenalty = legs.some(leg => leg.realTime === false) ? 0.25 : 0;
  const normalizedDelay = Math.min(1, averageDelay / 600); // Normalise to 10 minutes.

  return Math.min(1, Number((normalizedDelay + realtimePenalty).toFixed(3)));
};

const summariseLegs = (legs: CurlbusLeg[]): string => {
  const summaryParts = legs.map((leg) => {
    const mode = toLegMode(leg.mode);
    const description = describeLeg(leg, mode);
    return description ?? mode;
  });

  return summaryParts.join(' → ');
};

const transformCurlbusItinerary = (itinerary: CurlbusItinerary, index: number): RouteOption => {
  const legs = itinerary.legs.map((leg): RouteOption['legs'][number] => {
    const mode = toLegMode(leg.mode);
    return {
      mode,
      route_id: leg.routeId ?? leg.routeShortName ?? leg.route ?? null,
      trip_id: leg.tripId ?? leg.trip?.id ?? null,
      from_stop_id: parseStopId(leg.from?.stopId),
      to_stop_id: parseStopId(leg.to?.stopId),
      depart_time: toIsoString(leg.startTime),
      arrive_time: toIsoString(leg.endTime),
      predicted_delay_secs: Math.max(0, leg.departureDelay ?? leg.arrivalDelay ?? 0),
      description: describeLeg(leg, mode),
    };
  });

  const totalDuration = Math.round(itinerary.duration ?? 0);
  const summary = summariseLegs(itinerary.legs);
  const transferCount = itinerary.transfers ?? Math.max(0, itinerary.legs.length - 1);
  const minTransferSlack = computeMinTransferSlack(itinerary.legs);
  const firstLegStart = itinerary.legs[0]?.startTime ?? 0;
  const identifier = `${Math.round(firstLegStart)}-${index}`;

  return {
    id: identifier,
    summary,
    total_duration_secs: totalDuration,
    transfer_count: transferCount,
    min_transfer_slack_secs: minTransferSlack,
    risk_score: computeRiskScore(itinerary.legs),
    legs,
  };
};

const buildCurlbusPlanUrl = (request: SearchRequest): string => {
  const params = new URLSearchParams({
    fromPlace: `${request.origin.lat},${request.origin.lon}`,
    toPlace: `${request.destination.lat},${request.destination.lon}`,
    mode: 'TRANSIT,WALK',
    numItineraries: '5',
  });

  const departure = request.departure_time ? new Date(request.departure_time) : new Date();
  if (!Number.isNaN(departure.getTime())) {
    const isoDate = departure.toISOString().split('T')[0];
    const time = departure.toLocaleTimeString('en-GB', { hour12: false });
    params.set('date', isoDate);
    params.set('time', time);
  }

  if (typeof request.max_transfers === 'number') {
    params.set('maxTransfers', request.max_transfers.toString());
  }

  return `${CURLBUS_API_BASE_URL}/otp/routers/${encodeURIComponent(CURLBUS_ROUTER_ID)}/plan?${params.toString()}`;
};

const fetchCurlbusRouteOptions = async (request: SearchRequest): Promise<RouteOption[]> => {
  const url = buildCurlbusPlanUrl(request);
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  const data = await handleResponse<CurlbusPlanResponse>(response);

  if (data.error?.message) {
    throw new Error(data.error.message);
  }

  const itineraries = data.plan?.itineraries ?? [];
  return itineraries.map((itinerary, index) => transformCurlbusItinerary(itinerary, index));
};

export const searchRoutes = async (request: SearchRequest): Promise<SearchResponse> => {
  const options = await fetchCurlbusRouteOptions(request);

  const optionsWithReasons = await Promise.all(
    options.map(async (option) => {
      if (option.ai_reason && option.ai_reason.trim().length > 0) {
        return option;
      }
      const aiReason = await generateRouteReason(option, request);
      return { ...option, ai_reason: aiReason };
    })
  );

  return { options: optionsWithReasons };
};

export const startTrip = async (routeId: string, userContext?: string | null): Promise<{ session_id: string }> => {
  const payload = {
    selected_route_id: routeId,
    user_context: userContext ?? null,
  };

  const response = await fetch(`${API_BASE_URL}/v1/trip/start`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload satisfies JsonRecord),
  });

  return await handleResponse<{ session_id: string }>(response);
};

export const progressTrip = async (sessionId: string, currentLocation: Coordinate): Promise<SessionUpdateResponse> => {
  const payload = {
    session_id: sessionId,
    current_location: currentLocation,
    timestamp: new Date().toISOString(),
  } satisfies JsonRecord;

  const response = await fetch(`${API_BASE_URL}/v1/trip/progress`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });

  return await handleResponse<SessionUpdateResponse>(response);
};
