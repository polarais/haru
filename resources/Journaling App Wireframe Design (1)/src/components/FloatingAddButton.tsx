import React from 'react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 
                 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
                 flex items-center justify-center text-white group hover:scale-110 z-50"
      aria-label="Add new journal entry"
    >
      <svg 
        className="w-6 h-6 lg:w-7 lg:h-7 transition-transform group-hover:rotate-90" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      
      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full bg-pink-300 opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></div>
    </button>
  );
}