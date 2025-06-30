
import React from 'react';

const PageLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#16161a]">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoading;
