
import React from "react";
import { Progress } from "@/components/ui/progress";

const OverallProgressBar = ({ value }: { value: number }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <Progress
        value={value}
        className="h-2 bg-gray-700 [&>div]:bg-purple-500"
      />
      <p className="text-center text-sm text-gray-400 mt-2">
        {Math.round(value)}% complete
      </p>
    </div>
  );
};

export default OverallProgressBar;
