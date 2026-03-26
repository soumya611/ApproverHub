import React from "react";

const SpinerLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 16 16"
        className="windows-spinner"
      >
        <circle r="7" cy="8" cx="8" />
      </svg>
    </div>
  );
};

export default SpinerLoader;
