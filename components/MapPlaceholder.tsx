
import React from 'react';

const MapPlaceholder: React.FC = () => {
  return (
    <div className="relative h-48 bg-brand-gray-200 overflow-hidden">
      {/* This is a simple visual representation, not a real map */}
      <svg
        className="absolute inset-0 w-full h-full text-brand-blue"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
      >
        <path d="M10 80 Q 50 10, 100 50 T 190 20" />
      </svg>
      <div className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg">
        <div className="w-3 h-3 bg-brand-green rounded-full"></div>
      </div>
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-brand-red">
            <path fillRule="evenodd" d="M9.69 18.233c.256.256.67.256.92 0l6.25-6.25a7.5 7.5 0 0 0-11.82-10.02A7.5 7.5 0 0 0 3.44 11.983l6.25 6.25ZM10 10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export default MapPlaceholder;
