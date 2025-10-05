
import { type SearchRequest, type SearchResponse, type RouteOption, LegMode, type SessionUpdateResponse } from '../types';

const createFutureDate = (minutes: number): string => new Date(Date.now() + minutes * 60 * 1000).toISOString();

const mockRouteOptions: RouteOption[] = [
  {
    id: "route_1",
    summary: "Fastest, one tight transfer",
    total_duration_secs: 2700, // 45 min
    transfer_count: 1,
    min_transfer_slack_secs: 90, // 1.5 min (tight)
    risk_score: 0.7,
    ai_reason: "This is the quickest option, but relies on a very short transfer. It's risky if your first bus is even slightly delayed.",
    legs: [
      { mode: LegMode.WALK, depart_time: createFutureDate(0), arrive_time: createFutureDate(5), description: "Walk to Central Station", predicted_delay_secs: 0 },
      { mode: LegMode.BUS, route_id: "74", depart_time: createFutureDate(6), arrive_time: createFutureDate(25), description: "Bus 74 towards University", predicted_delay_secs: 120 },
      { mode: LegMode.TRAIN, route_id: "R1", depart_time: createFutureDate(27), arrive_time: createFutureDate(40), description: "Train to North District", predicted_delay_secs: 0 },
      { mode: LegMode.WALK, depart_time: createFutureDate(40), arrive_time: createFutureDate(45), description: "Walk to destination", predicted_delay_secs: 0 },
    ]
  },
  {
    id: "route_2",
    summary: "Most reliable, safer transfer",
    total_duration_secs: 3120, // 52 min
    transfer_count: 1,
    min_transfer_slack_secs: 480, // 8 min
    risk_score: 0.2,
    ai_reason: "A slightly longer trip, but with a comfortable 8-minute transfer time. This is your most reliable choice, especially during peak hours.",
    legs: [
      { mode: LegMode.WALK, depart_time: createFutureDate(0), arrive_time: createFutureDate(5), description: "Walk to Central Station", predicted_delay_secs: 0 },
      { mode: LegMode.BUS, route_id: "74", depart_time: createFutureDate(6), arrive_time: createFutureDate(25), description: "Bus 74 towards University", predicted_delay_secs: 60 },
      { mode: LegMode.TRAIN, route_id: "R2", depart_time: createFutureDate(33), arrive_time: createFutureDate(47), description: "Train to North District", predicted_delay_secs: 0 },
      { mode: LegMode.WALK, depart_time: createFutureDate(47), arrive_time: createFutureDate(52), description: "Walk to destination", predicted_delay_secs: 0 },
    ]
  },
  {
    id: "route_3",
    summary: "No transfers, more walking",
    total_duration_secs: 3600, // 60 min
    transfer_count: 0,
    min_transfer_slack_secs: 0,
    risk_score: 0.1,
    ai_reason: "This route avoids transfers completely. It involves a single, longer bus ride and more walking, but it's very straightforward.",
    legs: [
      { mode: LegMode.WALK, depart_time: createFutureDate(0), arrive_time: createFutureDate(10), description: "Walk to Main Street Bus Stop", predicted_delay_secs: 0 },
      { mode: LegMode.BUS, route_id: "5", depart_time: createFutureDate(11), arrive_time: createFutureDate(50), description: "Bus 5 direct to Downtown", predicted_delay_secs: 180 },
      { mode: LegMode.WALK, depart_time: createFutureDate(50), arrive_time: createFutureDate(60), description: "Walk to destination", predicted_delay_secs: 0 },
    ]
  },
];

export const searchRoutes = (request: SearchRequest): Promise<SearchResponse> => {
  console.log("Mock API: Searching routes with", request);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ options: mockRouteOptions });
    }, 1000);
  });
};

export const startTrip = (routeId: string): Promise<{ session_id: string }> => {
  console.log("Mock API: Starting trip for route", routeId);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ session_id: `session_${Date.now()}` });
    }, 500);
  });
}

let progressCounter = 0;
export const progressTrip = (sessionId: string): Promise<SessionUpdateResponse> => {
    console.log("Mock API: Progressing trip for session", sessionId);
    return new Promise(resolve => {
        setTimeout(() => {
            progressCounter++;
            if (progressCounter % 3 === 0) {
                 resolve({
                    session_id: sessionId,
                    advice: "Traffic ahead is heavy. A faster option is available if you switch buses.",
                    maybe_better_options: [
                      {
                        id: "reroute_1",
                        summary: "Switch to Bus 88, saves 5 min",
                        total_duration_secs: 2400,
                        transfer_count: 1,
                        min_transfer_slack_secs: 300,
                        risk_score: 0.3,
                        ai_reason: "By getting off at the next stop and taking Bus 88, you can bypass a known traffic jam and save about 5 minutes.",
                        legs: [
                            { mode: LegMode.WALK, depart_time: createFutureDate(0), arrive_time: createFutureDate(2), description: "Walk to alternate stop", predicted_delay_secs: 0},
                            { mode: LegMode.BUS, route_id: "88", depart_time: createFutureDate(3), arrive_time: createFutureDate(20), description: "Bus 88 to destination", predicted_delay_secs: 0},
                             { mode: LegMode.WALK, depart_time: createFutureDate(20), arrive_time: createFutureDate(25), description: "Walk to destination", predicted_delay_secs: 0},
                        ]
                    }
                    ]
                 });
            } else {
                 resolve({
                    session_id: sessionId,
                    advice: "You are on the best route. No changes needed.",
                    maybe_better_options: []
                 });
            }
        }, 2000);
    });
}
