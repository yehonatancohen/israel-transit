
import React, { useState, useCallback } from 'react';
import HomeScreen from './components/HomeScreen';
import ResultsScreen from './components/ResultsScreen';
import RouteDetailsScreen from './components/RouteDetailsScreen';
import LiveNavigationScreen from './components/LiveNavigationScreen';
import { searchRoutes, startTrip } from './services/api';
import { type RouteOption, type Coordinate, type SearchRequest } from './types';

type Screen = 'home' | 'results' | 'details' | 'live';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>('home');
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastSearchRequest, setLastSearchRequest] = useState<SearchRequest | null>(null);

  const handleSearch = useCallback(async (origin: Coordinate, destination: Coordinate, notes?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const trimmedNotes = notes?.trim();
      const request: SearchRequest = {
        origin,
        destination,
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
      };
      const response = await searchRoutes(request);
      setRouteOptions(response.options);
      setLastSearchRequest(request);
      setScreen('results');
    } catch (err) {
      setError('Failed to find routes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectRoute = useCallback((route: RouteOption) => {
    setSelectedRoute(route);
    setScreen('details');
  }, []);

  const handleStartTrip = useCallback(async (routeId: string) => {
    setIsLoading(true);
    try {
      const session = await startTrip(routeId, lastSearchRequest?.notes ?? null);
      if (!session?.session_id) {
        throw new Error('Missing session identifier');
      }
      setSessionId(session.session_id);
      setScreen('live');
    } catch (err) {
      setError('Could not start the trip.');
    } finally {
      setIsLoading(false);
    }
  }, [lastSearchRequest?.notes]);

  const handleEndTrip = useCallback(() => {
    setSessionId(null);
    setSelectedRoute(null);
    setScreen('home');
  }, []);

  const navigateBack = useCallback(() => {
    if (screen === 'live') setScreen('details');
    else if (screen === 'details') setScreen('results');
    else if (screen === 'results') setScreen('home');
  }, [screen]);

  const renderScreen = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-blue"></div>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-screen bg-white text-center p-4">
          <p className="text-brand-red text-lg mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setScreen('home');
            }}
            className="px-6 py-2 bg-brand-blue text-white rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      );
    }

    switch (screen) {
      case 'results':
        return <ResultsScreen routeOptions={routeOptions} onSelectRoute={handleSelectRoute} onBack={navigateBack} />;
      case 'details':
        return selectedRoute && <RouteDetailsScreen route={selectedRoute} onStartTrip={handleStartTrip} onBack={navigateBack} />;
      case 'live':
        return selectedRoute && sessionId && <LiveNavigationScreen route={selectedRoute} sessionId={sessionId} onEndTrip={handleEndTrip} />;
      case 'home':
      default:
        return <HomeScreen onSearch={handleSearch} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen shadow-lg bg-white font-sans">
      {renderScreen()}
    </div>
  );
};

export default App;
