
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartTakeaway } from '@/hooks/useGenerateResults';

interface SmartTakeawayCardProps {
  takeaway: SmartTakeaway;
}

const SmartTakeawayCard = ({ takeaway }: SmartTakeawayCardProps) => {
  return (
    <Card className="bg-white/60 border border-gray-200/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {takeaway.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 leading-relaxed">
          {takeaway.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default SmartTakeawayCard;
