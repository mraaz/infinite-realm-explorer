
import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Eye, Calendar } from 'lucide-react';
import { NewQuadrantChart } from '@/components/NewQuadrantChart';
import { SurveyHistoryItem } from '@/hooks/useSurveyHistory';
import { toPng } from 'html-to-image';
import { format } from 'date-fns';

interface SurveyCardProps {
  survey: SurveyHistoryItem;
  onShare: (survey: SurveyHistoryItem, imageDataUrl?: string) => void;
  onViewResults: (surveyId: string) => void;
}

const SurveyCard = ({ survey, onShare, onViewResults }: SurveyCardProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Extract scores from the profiles data
  const scores = survey.profiles?.[0]?.scores || {};
  const progress = {
    basics: scores.basics || 0,
    career: scores.career || 0,
    finances: scores.finances || 0,
    health: scores.health || 0,
    connections: scores.connections || 0,
  };

  const handleShareImage = async () => {
    if (chartRef.current) {
      try {
        const imageDataUrl = await toPng(chartRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
        });
        onShare(survey, imageDataUrl);
      } catch (error) {
        console.error('Error generating image:', error);
        onShare(survey);
      }
    } else {
      onShare(survey);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card className="bg-white/60 border border-gray-200/80 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            {formatDate(survey.created_at)}
          </span>
          <div className="flex gap-2">
            <Button
              onClick={() => onViewResults(survey.id)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Results
            </Button>
            <Button
              onClick={handleShareImage}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="bg-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-center mb-4">Your Current Self</h3>
          <NewQuadrantChart
            progress={progress}
            answers={survey.answers}
            className="scale-90"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyCard;
