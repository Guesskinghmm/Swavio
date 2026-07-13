import React from "react";
import classNames from "classnames";

const Button = ({ children, className = "", ...props }) => {
  return (
    <button
      className={classNames(
        "px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition duration-200",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
