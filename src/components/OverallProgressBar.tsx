
import { Progress } from "@/components/ui/progress";

const OverallProgressBar = ({ value }: { value: number }) => {
  const roundedValue = Math.round(value);
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div className="relative">
        <Progress 
          value={roundedValue} 
          className="h-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full shadow-lg border border-gray-600" 
        />
        <div 
          className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 shadow-lg transition-all duration-500 ease-out"
          style={{ width: `${roundedValue}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-full" />
      </div>
      <div className="flex justify-between items-center mt-3">
        <p className="text-sm text-gray-400 font-medium">Progress</p>
        <p className="text-lg font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {roundedValue}% complete
        </p>
      </div>
    </div>
  );
};

export default OverallProgressBar;
