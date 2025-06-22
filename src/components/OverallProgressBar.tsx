
import { Progress } from "@/components/ui/progress";

const OverallProgressBar = ({ value }: { value: number }) => {
  const roundedValue = Math.round(value);
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <Progress value={roundedValue} className="h-2 bg-gray-700 [&>div]:bg-purple-500" />
      <p className="text-center text-sm text-gray-400 mt-2">{roundedValue}% complete</p>
    </div>
  );
};

export default OverallProgressBar;
