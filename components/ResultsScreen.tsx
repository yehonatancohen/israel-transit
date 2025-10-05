
import React from 'react';
import { type RouteOption, type Leg, LegMode } from '../types';
import { WalkIcon, BusIcon, TrainIcon, ChevronRightIcon, ClockIcon, ArrowLeftIcon } from './icons';

interface ResultsScreenProps {
  routeOptions: RouteOption[];
  onSelectRoute: (route: RouteOption) => void;
  onBack: () => void;
}

const getLegIcon = (mode: LegMode) => {
  switch (mode) {
    case LegMode.WALK: return <WalkIcon className="h-6 w-6 text-brand-gray-600" />;
    case LegMode.BUS: return <BusIcon className="h-6 w-6 text-brand-blue" />;
    case LegMode.TRAIN: return <TrainIcon className="h-6 w-6 text-brand-green" />;
    default: return null;
  }
};

const formatDuration = (seconds: number) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}h ${remMinutes}m`;
};

const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const ReliabilityBar: React.FC<{ riskScore: number }> = ({ riskScore }) => {
  const width = Math.max(10, (1 - riskScore) * 100);
  let color = 'bg-brand-green';
  if (riskScore > 0.6) color = 'bg-brand-red';
  else if (riskScore > 0.3) color = 'bg-brand-yellow';

  return (
    <div className="w-full bg-brand-gray-200 rounded-full h-1.5">
      <div className={`${color} h-1.5 rounded-full`} style={{ width: `${width}%` }}></div>
    </div>
  );
};

const LegsDisplay: React.FC<{ legs: Leg[] }> = ({ legs }) => (
    <div className="flex items-center space-x-2">
        {legs.map((leg, index) => (
            <React.Fragment key={index}>
                {getLegIcon(leg.mode)}
                {index < legs.length - 1 && <ChevronRightIcon className="h-4 w-4 text-brand-gray-300" />}
            </React.Fragment>
        ))}
    </div>
);

const ResultsScreen: React.FC<ResultsScreenProps> = ({ routeOptions, onSelectRoute, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-brand-gray-100">
      <header className="flex items-center p-4 bg-white border-b border-brand-gray-200 sticky top-0">
        <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeftIcon className="h-6 w-6 text-brand-gray-800" />
        </button>
        <h1 className="text-2xl font-bold text-brand-gray-900 mx-auto">Best Options</h1>
        <div className="w-6"></div>
      </header>

      <main className="flex-grow overflow-y-auto p-3 space-y-3">
        {routeOptions.map(route => (
          <div
            key={route.id}
            onClick={() => onSelectRoute(route)}
            className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-transform transform hover:scale-[1.02] active:scale-[0.98] border border-brand-gray-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-brand-gray-900">{formatDuration(route.total_duration_secs)}</span>
                    <LegsDisplay legs={route.legs} />
                </div>
                <p className="text-sm text-brand-gray-600">
                  Arrives at <span className="font-semibold">{formatTime(route.legs[route.legs.length - 1].arrive_time)}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-brand-gray-600">{route.transfer_count} transfers</p>
                {route.min_transfer_slack_secs < 180 && route.transfer_count > 0 &&
                    <span className="text-xs font-bold text-brand-yellow px-2 py-0.5 bg-yellow-100 rounded-full">TIGHT</span>
                }
              </div>
            </div>
            
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-brand-gray-500">
                    <span>Reliability</span>
                    <span>{route.risk_score > 0.6 ? 'Low' : route.risk_score > 0.3 ? 'Medium' : 'High'}</span>
                </div>
                <ReliabilityBar riskScore={route.risk_score} />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ResultsScreen;
