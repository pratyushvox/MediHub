import React from "react";

const Box = ({ icon, count, label, color }) => {
  return (
    <div className={`p-4 rounded-2xl shadow-lg text-white ${color} flex flex-col items-center w-40`}>
      <div className="text-2xl">{icon}</div>
      <div className="text-xl font-bold">{count}</div>
      <div className="text-sm">{label}</div>
    </div>
  );
};

export default Box; 
