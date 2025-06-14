
import { Target, PiggyBank, Heart, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const pillarsData = [
  { name: 'Career', Icon: Target, progress: 100, active: true },
  { name: 'Financials', Icon: PiggyBank, progress: 0, active: false },
  { name: 'Health', Icon: Heart, progress: 0, active: false },
  { name: 'Connections', Icon: Users, progress: 0, active: false },
];

const PillarItem = ({ name, Icon, progress, active }: typeof pillarsData[0]) => (
  <div className="flex flex-col items-center gap-2 text-center w-28">
    <div className={cn(
      "relative h-24 w-24 rounded-full flex items-center justify-center border-4",
      active ? "border-purple-500" : "border-gray-200"
    )}>
      <div className={cn(
        "h-16 w-16 rounded-full flex items-center justify-center",
        active ? "bg-purple-100" : "bg-gray-100"
      )}>
        <Icon className={cn("h-8 w-8", active ? "text-purple-600" : "text-gray-400")} />
      </div>
      <div className="absolute -bottom-2.5 bg-white px-2 rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
        {progress}%
      </div>
    </div>
    <p className="font-semibold text-gray-800 text-sm mt-2">{name}</p>
    {active && progress === 100 ? (
      <div className="flex items-center justify-center gap-1 text-green-600">
        <Check className="h-4 w-4" />
        <p className="text-xs font-medium">Clarity achieved</p>
      </div>
    ) : (
      <div className="h-5" /> 
    )}
  </div>
);

const PillarStatus = () => (
  <div className="flex justify-center items-start flex-wrap gap-4 sm:gap-8 md:gap-12 my-8 w-full max-w-3xl mx-auto">
    {pillarsData.map((pillar) => (
      <PillarItem key={pillar.name} {...pillar} />
    ))}
  </div>
);

export default PillarStatus;
