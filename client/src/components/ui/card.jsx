import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white shadow-lg rounded-2xl p-4 border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "" }) => {
  return <div className={`text-gray-800 ${className}`}>{children}</div>;
};

export { Card, CardContent };
