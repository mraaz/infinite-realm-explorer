
import { SmartTakeaway } from '@/hooks/useGenerateResults';
import SmartTakeawayCard from './SmartTakeawayCard';
import { Lightbulb } from 'lucide-react';

interface SmartTakeawaysHubProps {
  takeaways: SmartTakeaway[];
}

const SmartTakeawaysHub = ({ takeaways }: SmartTakeawaysHubProps) => {
  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <Lightbulb className="h-8 w-8 text-yellow-600" />
          Smart Takeaways Hub
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Based on your responses, here are key insights and patterns we've identified in your life.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {takeaways.map((takeaway, index) => (
          <SmartTakeawayCard key={index} takeaway={takeaway} />
        ))}
      </div>
    </section>
  );
};

export default SmartTakeawaysHub;
