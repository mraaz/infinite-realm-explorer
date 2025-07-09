import React from "react";

interface ConfidenceLevelBarProps {
  value: number; // Expects a value from 0 to 100
}

const ConfidenceLevelBar: React.FC<ConfidenceLevelBarProps> = ({ value }) => {
  const clampedValue = Math.max(0, Math.min(100, value)); // Ensure value is between 0 and 100

  return (
    <div className="w-full max-w-lg mx-auto mb-4 relative px-4 sm:px-0">
      {/* Label "Confidence Level" at the top-center */}
      {/* Adjusted -top to create more space, making it -top-10 or -top-12 */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-gray-400 text-sm font-semibold whitespace-nowrap">
        {" "}
        {/* Adjusted -top value again */}
        Confidence Level: {Math.round(clampedValue)}%
      </div>

      {/* Bar container */}
      <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden relative mt-3 mb-3">
        {/* Fill */}
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          style={{ width: `${clampedValue}%` }}
        ></div>
      </div>

      {/* Labels "Uncertain" and "Certain" */}
      <div className="flex justify-between text-gray-400 text-sm font-semibold">
        <span>Uncertain</span>
        <span>Certain</span>
      </div>
    </div>
  );
};

export default ConfidenceLevelBar;
