
import { Progress } from "@/components/ui/progress";

const OverallProgressBar = ({ value }: { value: number }) => {
  const roundedValue = Math.round(value);
  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <Progress value={roundedValue} className="h-2 bg-gray-200 [&>div]:bg-gray-800" />
      <p className="text-center text-sm text-gray-600 mt-2">{roundedValue}% complete</p>
    </div>
  );
};

export default OverallProgressBar;
