import React from 'react';

const Button = ({ children, onClick, className = "", disabled, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 
        rounded font-medium 
        text-white transition
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${disabled 
          ? 'opacity-60 cursor-not-allowed bg-gray-600' 
          : 'hover:opacity-90'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;