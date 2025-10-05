
import React, { useState, useEffect } from 'react';
import { type Coordinate } from '../types';
import { LocationMarkerIcon } from './icons';
import useGeolocation from '../hooks/useGeolocation';

interface HomeScreenProps {
  onSearch: (origin: Coordinate, destination: Coordinate, notes?: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onSearch }) => {
  const [from, setFrom] = useState('Current Location');
  const [to, setTo] = useState('');
  const [notes, setNotes] = useState('');
  const [canSearch, setCanSearch] = useState(false);
  const { location, error, getLocation } = useGeolocation();

  // Mock geocoding
  const geocode = (address: string): Coordinate => {
    // In a real app, this would call a geocoding API
    if (address.toLowerCase().includes('work')) return { lat: 32.0853, lon: 34.7818 };
    if (address.toLowerCase().includes('home')) return { lat: 32.0669, lon: 34.7648 };
    return { lat: 32.109333, lon: 34.855499 }; // Default to a central point
  };
  
  useEffect(() => {
    if (from === 'Current Location' && location) {
      setCanSearch(to.trim() !== '');
    } else {
      setCanSearch(from.trim() !== '' && to.trim() !== '');
    }
  }, [from, to, location]);

  const handleSearch = () => {
    if (!canSearch) return;

    const originCoord = from === 'Current Location' ? location : geocode(from);
    const destinationCoord = geocode(to);

    if (originCoord && destinationCoord) {
      onSearch(originCoord, destinationCoord, notes);
    } else {
      alert("Could not determine location. Please be more specific or use 'Current Location'.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-brand-gray-100 p-6">
      <header className="text-center pt-8 pb-6">
        <h1 className="text-4xl font-bold text-brand-gray-900">Israel Transit</h1>
        <p className="text-brand-gray-600 mt-2">Fast, reliable, simple.</p>
      </header>
      
      <main className="flex-grow flex flex-col justify-center space-y-4">
        <div className="relative">
          <input
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="From"
            className="w-full p-4 pl-12 text-lg border-2 border-brand-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
           <LocationMarkerIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-brand-gray-400" />
        </div>
        <button 
          onClick={getLocation}
          className="text-sm text-brand-blue font-semibold hover:underline self-start px-2 py-1"
        >
          Use my current location
        </button>
        {error && <p className="text-sm text-brand-red">{error}</p>}

        <div className="relative">
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To"
            className="w-full p-4 pl-12 text-lg border-2 border-brand-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
          <LocationMarkerIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-brand-gray-400" />
        </div>

        <div>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for AI (e.g., 'I have a heavy suitcase')"
                className="w-full p-3 text-base border-2 border-brand-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                rows={2}
            />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className="w-full p-4 text-xl font-bold text-white bg-brand-blue rounded-xl shadow-lg transition-transform transform hover:scale-105 disabled:bg-brand-gray-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            Find routes
          </button>
        </div>
      </main>
      
      <footer className="text-center py-4">
        <p className="text-xs text-brand-gray-500">Beta • delay‑aware suggestions</p>
      </footer>
    </div>
  );
};

export default HomeScreen;
