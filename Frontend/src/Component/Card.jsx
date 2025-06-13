import React from 'react';

export function Card({ title, icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-opacity-10">
          {icon}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}