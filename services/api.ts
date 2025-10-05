import { type Coordinate, type RouteOption, type SearchRequest, type SearchResponse, type SessionUpdateResponse } from '../types';

const DEFAULT_BACKEND_URL = 'http://127.0.0.1:8080';
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL ?? DEFAULT_BACKEND_URL).replace(/\/$/, '');

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

type JsonRecord = Record<string, unknown>;

const jsonHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
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

export const searchRoutes = async (request: SearchRequest): Promise<SearchResponse> => {
  const response = await fetch(`${API_BASE_URL}/v1/routes/search`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify(request satisfies JsonRecord),
  });

  const data = await handleResponse<SearchResponse>(response);

  const optionsWithReasons = await Promise.all(
    data.options.map(async (option) => {
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
