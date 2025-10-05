
import { useState, useCallback } from 'react';
import { type Coordinate } from '../types';

interface GeolocationState {
  location: Coordinate | null;
  error: string | null;
  isLoading: boolean;
  getLocation: () => void;
}

const useGeolocation = (): GeolocationState => {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return { location, error, isLoading, getLocation };
};

export default useGeolocation;
