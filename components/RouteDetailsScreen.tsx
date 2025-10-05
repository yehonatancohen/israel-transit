
import React from 'react';
import { type RouteOption, type Leg, LegMode } from '../types';
import { WalkIcon, BusIcon, TrainIcon, ArrowLeftIcon, ClockIcon } from './icons';
import MapPlaceholder from './MapPlaceholder';

interface RouteDetailsScreenProps {
  route: RouteOption;
  onStartTrip: (routeId: string) => void;
  onBack: () => void;
}

const getLegIcon = (mode: LegMode, className?: string) => {
    const defaultClass = "h-8 w-8";
    switch (mode) {
      case LegMode.WALK: return <WalkIcon className={`${defaultClass} ${className}`} />;
      case LegMode.BUS: return <BusIcon className={`${defaultClass} ${className}`} />;
      case LegMode.TRAIN: return <TrainIcon className={`${defaultClass} ${className}`} />;
      default: return null;
    }
};

const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const getDurationInMinutes = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.round(diff / 60000);
}

const RouteDetailsScreen: React.FC<RouteDetailsScreenProps> = ({ route, onStartTrip, onBack }) => {

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center p-4 bg-white border-b border-brand-gray-200 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeftIcon className="h-6 w-6 text-brand-gray-800" />
        </button>
        <div className="text-center mx-auto">
            <h1 className="text-xl font-bold text-brand-gray-900">{Math.round(route.total_duration_secs / 60)} min to destination</h1>
            <p className="text-sm text-brand-gray-500">Arrives at {formatTime(route.legs[route.legs.length-1].arrive_time)}</p>
        </div>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow overflow-y-auto">
        <MapPlaceholder />

        {route.ai_reason && (
          <div className="p-4 bg-brand-light-blue m-4 rounded-xl">
            <h3 className="font-bold text-brand-blue">Why this route?</h3>
            <p className="text-sm text-brand-gray-800 mt-1">{route.ai_reason}</p>
          </div>
        )}

        <div className="p-4 space-y-2">
          {route.legs.map((leg, index) => {
            const nextLeg = route.legs[index + 1];
            const transferDuration = nextLeg ? getDurationInMinutes(leg.arrive_time, nextLeg.depart_time) : 0;

            return (
              <React.Fragment key={index}>
                <div className="flex items-start space-x-4">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold text-brand-gray-600">{formatTime(leg.depart_time)}</span>
                    <div className="h-4"></div>
                    {getLegIcon(leg.mode, 'text-brand-gray-800')}
                    <div className="h-4"></div>
                    <span className="text-sm font-semibold text-brand-gray-600">{formatTime(leg.arrive_time)}</span>
                  </div>
                  <div className="flex-grow pt-8 border-l-2 border-brand-gray-200 ml-[-25px] pl-9 pb-4">
                    <p className="font-bold text-lg">{leg.description || leg.mode}</p>
                    <div className="flex items-center space-x-2 text-sm text-brand-gray-500 mt-1">
                        <ClockIcon className="h-4 w-4"/>
                        <span>{getDurationInMinutes(leg.depart_time, leg.arrive_time)} min</span>
                        {leg.predicted_delay_secs > 0 && <span className="text-brand-red font-semibold">+{Math.round(leg.predicted_delay_secs/60)} min delay</span>}
                    </div>
                  </div>
                </div>
                
                {nextLeg && (
                  <div className="pl-12 py-2">
                    <div className="border-l-2 border-dotted border-brand-gray-400 h-6 -ml-5"></div>
                    <div className="flex items-center text-sm font-semibold text-brand-blue bg-brand-light-blue p-2 rounded-lg -ml-2">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        <span>Transfer: {transferDuration} min buffer</span>
                        {transferDuration < 3 && <span className="ml-2 text-xs font-bold text-brand-yellow px-2 py-0.5 bg-yellow-100 rounded-full">TIGHT</span>}
                    </div>
                    <div className="border-l-2 border-dotted border-brand-gray-400 h-6 -ml-5"></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </main>

      <footer className="p-4 border-t border-brand-gray-200 sticky bottom-0 bg-white">
        <button
          onClick={() => onStartTrip(route.id)}
          className="w-full p-4 text-xl font-bold text-white bg-brand-green rounded-xl shadow-lg transition-transform transform hover:scale-105"
        >
          Start Trip
        </button>
      </footer>
    </div>
  );
};

export default RouteDetailsScreen;
