
import { SmartTakeaway } from '@/hooks/useGenerateResults';
import SmartTakeawayCard from './SmartTakeawayCard';

interface SmartTakeawaysHubProps {
  takeaways: SmartTakeaway[];
}

const SmartTakeawaysHub = ({ takeaways }: SmartTakeawaysHubProps) => {
  return (
    <section className="mb-16">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {takeaways.map((takeaway, index) => (
          <SmartTakeawayCard key={index} takeaway={takeaway} />
        ))}
      </div>
    </section>
  );
};

export default SmartTakeawaysHub;
