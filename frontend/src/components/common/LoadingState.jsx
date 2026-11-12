import React from 'react';

export default function LoadingState({ message = 'Loading delicious stories...' }) {
  return (
    <div className="py-24 flex flex-col items-center justify-center space-y-4 text-center">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-2 border-lavender-200" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-plum-royal border-t-gold animate-spin" />
      </div>
      <p className="text-sm font-medium text-plum-royal/80">{message}</p>
    </div>
  );
}
