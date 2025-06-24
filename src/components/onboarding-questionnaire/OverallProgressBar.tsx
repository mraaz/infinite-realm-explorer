
import React from 'react';

const OverallProgressBar = () => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '0%' }}></div>
    </div>
  );
};

export default OverallProgressBar;
