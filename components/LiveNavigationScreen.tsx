
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type Coordinate, type RouteOption } from '../types';
import { progressTrip } from '../services/api';
import { WalkIcon, BusIcon, TrainIcon, ClockIcon } from './icons';

interface LiveNavigationScreenProps {
  route: RouteOption;
  sessionId: string;
  onEndTrip: () => void;
}

const LiveNavigationScreen: React.FC<LiveNavigationScreenProps> = ({ route, sessionId, onEndTrip }) => {
  const [currentLegIndex, setCurrentLegIndex] = useState(0);
  const [advice, setAdvice] = useState('You are on the best route.');
  const [betterOptions, setBetterOptions] = useState<RouteOption[]>([]);
  const [progress, setProgress] = useState(0);
  const locationRef = useRef<Coordinate | null>(null);
  const [hasLocationFix, setHasLocationFix] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const currentLeg = route.legs[currentLegIndex];
  
  const updateProgress = useCallback(async () => {
    const currentLocation = locationRef.current;
    if (!currentLocation) {
      return;
    }

    try {
      const response = await progressTrip(sessionId, currentLocation);
      setAdvice(response.advice);
      setBetterOptions(response.maybe_better_options);
    } catch (error) {
      console.error("Failed to update trip progress:", error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported in this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        locationRef.current = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setHasLocationFix(true);
        setLocationError(null);
      },
      (error) => {
        console.error('Geolocation error', error);
        setLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentLegIndex < route.legs.length - 1) {
            setCurrentLegIndex(i => i + 1);
            return 0;
          } else {
            // End of trip
            clearInterval(progressInterval);
            clearInterval(apiInterval);
            return 100;
          }
        }
        return prev + 5; // Simulate progress
      });
    }, 1000);

    const apiInterval = setInterval(updateProgress, 10000); // Check for updates every 10 seconds

    return () => {
      clearInterval(progressInterval);
      clearInterval(apiInterval);
    };
  }, [currentLegIndex, route.legs.length, updateProgress]);

  useEffect(() => {
    if (hasLocationFix) {
      void updateProgress();
    }
  }, [hasLocationFix, updateProgress]);

  const LegIcon = ({ mode }: { mode: string }) => {
    const props = { className: "h-12 w-12 text-brand-gray-900" };
    if (mode === 'WALK') return <WalkIcon {...props} />;
    if (mode === 'BUS') return <BusIcon {...props} />;
    if (mode === 'TRAIN') return <TrainIcon {...props} />;
    return null;
  };

  const getArrivalTime = () => new Date(currentLeg.arrive_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const getRemainingTime = () => {
      const duration = (new Date(currentLeg.arrive_time).getTime() - new Date(currentLeg.depart_time).getTime()) / 60000;
      const remaining = Math.round(duration * (1 - progress/100));
      return remaining;
  }

  return (
    <div className="flex flex-col h-full bg-brand-gray-900 text-white">
      <main className="flex-grow flex flex-col justify-between p-6">
        {/* Top Section */}
        <div className="text-center">
            <LegIcon mode={currentLeg.mode} />
            <h1 className="text-3xl font-bold mt-4">{currentLeg.description}</h1>
            <p className="text-lg text-brand-gray-400">Next stop in your journey</p>
        </div>

        {/* Middle Section */}
        <div className="text-center">
            <p className="text-lg text-brand-gray-300">Estimated arrival at next stop</p>
            <p className="text-6xl font-bold tracking-tight">{getArrivalTime()}</p>
            <div className="flex items-center justify-center space-x-2 mt-2 text-brand-gray-300">
                <ClockIcon className="h-5 w-5" />
                <span>{getRemainingTime()} min remaining</span>
            </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="w-full bg-brand-gray-700 rounded-full h-2.5">
            <div className="bg-white h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 1s linear' }}></div>
          </div>
        </div>
        
        {/* Advice Section */}
        {locationError && (
            <div className="bg-brand-red/20 border border-brand-red/40 text-brand-red text-sm p-3 rounded-lg mb-4">
                {locationError}
            </div>
        )}

        {(advice !== 'You are on the best route.' || betterOptions.length > 0) && (
            <div className="bg-brand-blue p-4 rounded-xl shadow-lg">
                <h3 className="font-bold">Heads up!</h3>
                <p className="text-sm text-blue-100">{advice}</p>
                {betterOptions.length > 0 && <button className="mt-2 text-sm font-bold underline">View Option</button>}
            </div>
        )}
      </main>

      <footer className="p-4 border-t border-brand-gray-700">
        <button
          onClick={onEndTrip}
          className="w-full p-3 text-lg font-bold text-white bg-brand-red rounded-xl"
        >
          End Trip
        </button>
      </footer>
    </div>
  );
};

export default LiveNavigationScreen;
