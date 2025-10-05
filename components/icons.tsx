
import React from 'react';

export const WalkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-3.434 2.822a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1-1.06 1.061l-1.328-1.328a3.999 3.999 0 0 1-5.126-1.325L8.5 11.061V16.5a.75.75 0 0 1-1.5 0v-5.69l-1.664 1.386a.75.75 0 0 1-.942-1.168l3.434-2.857Z" />
  </svg>
);

export const BusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-15Zm4.125 3a.75.75 0 0 0 0 1.5h6.75a.75.75 0 0 0 0-1.5h-6.75Zm-3.375 3.75a.75.75 0 0 1 .75-.75h13.5a.75.75 0 0 1 0 1.5h-13.5a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h13.5a.75.75 0 0 0 0-1.5h-13.5Z" clipRule="evenodd" />
  </svg>
);

export const TrainIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a4 4 0 0 0-4 4v7.015A3.001 3.001 0 0 0 6 16.5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3c0-1.05-.548-1.973-1.357-2.485V6a4 4 0 0 0-4-4h-2Zm0 2h2a2 2 0 0 1 2 2v7H8V6a2 2 0 0 1 2-2Z" />
    <path d="M4.5 16.5a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15Z" />
  </svg>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.25 10a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M10.159 5.159a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L13.84 10.5H5a.75.75 0 0 1 0-1.5h8.84l-3.68-3.681a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
  </svg>
);

export const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
  </svg>
);

export const LocationMarkerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.69 18.233c.256.256.67.256.92 0l6.25-6.25a7.5 7.5 0 0 0-11.82-10.02A7.5 7.5 0 0 0 3.44 11.983l6.25 6.25ZM10 10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" clipRule="evenodd" />
  </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.56l3.682 3.682a.75.75 0 1 1-1.06 1.06l-5-5a.75.75 0 0 1 0-1.06l5-5a.75.75 0 0 1 1.06 1.06L5.56 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
  </svg>
);
