import React from "react";

const Button = ({ text, onClick, className, type = "button" }) => {
  return (
    <div className="flex justify-end -mt-2">
      <button
        type={type}
        onClick={onClick}
        className={`text-[#0665A7] hover:text-[#3CB5AC] text-sm font-medium transition-colors duration-200 p-0 ${className}`}
      >
        {text}
      </button>
    </div>
  );
};

export default Button;
