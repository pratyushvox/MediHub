import React from 'react';

const Box = ({ icon, count, label, className, onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className={`p-4 rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity duration-300 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold">{count}</div>
        <div className="text-4xl opacity-70">{icon}</div>
      </div>
      <div className="text-sm mt-2">{label}</div>
      <div className="text-sm mt-1 text-right opacity-80">See details →</div>
    </div>
  );
};

export default Box;