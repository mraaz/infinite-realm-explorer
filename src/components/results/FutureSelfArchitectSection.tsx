
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Settings, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FutureSelfArchitect {
  mainFocus: string;
  identity: string;
  system: string;
  proof: string;
}

interface FutureSelfArchitectSectionProps {
  architect?: FutureSelfArchitect;
  onStart: () => void;
  isQuestionnaireComplete: boolean;
}

const FutureSelfArchitectSection = ({ architect, onStart, isQuestionnaireComplete }: FutureSelfArchitectSectionProps) => {
  const { toast } = useToast();

  const handleStartClick = () => {
    if (isQuestionnaireComplete) {
      onStart();
    } else {
      toast({
        title: "Action Required",
        description: "Please complete the Future Self Questionnaire before you can proceed.",
      });
    }
  };

  return (
    <section className="mb-16 flex justify-center">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200/80 w-full max-w-3xl flex flex-col">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            <h2>Future Self Architect</h2>
          </div>
          {architect ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">Your Future Identity</h3>
                <p className="text-gray-600 mt-1">
                  You've defined your vision of success for <span className="font-semibold">{architect.mainFocus}</span> as:
                </p>
                <div className="mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                  <p className="text-lg font-semibold text-blue-800 italic">"{architect.identity}"</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700">Your Core System</h3>
                <div className="mt-2 p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 italic">"{architect.system}"</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700">Your Proof of Identity</h3>
                <div className="mt-2 p-4 bg-green-50/50 rounded-lg border border-green-200">
                  <p className="text-gray-700 italic">"{architect.proof}"</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Goals are fleeting, but your identity is who you are. Instead of setting a target, let's define the identity of your future self and build the systems that make success inevitable.</p>
              <div className="bg-gray-100/50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-700">Ready to design your future identity?</p>
                  <p className="text-gray-600 text-sm">Create a personalised identity system based on your main focus area that will help you achieve your goals through consistent habits and mindset shifts.</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 md:p-8 md:pt-0">
          {architect ? (
            <Button onClick={onStart} variant="outline" className="w-full no-print h-11 px-8 rounded-md">
              Edit Your Identity System
            </Button>
          ) : (
            <Button
              onClick={handleStartClick}
              className={cn(
                "w-full justify-between no-print h-11 px-8 rounded-md",
                !isQuestionnaireComplete && "opacity-50 cursor-not-allowed"
              )}
            >
              <span>Design Your Future Self</span>
              <ArrowRight />
            </Button>
          )}
        </CardFooter>
      </Card>
    </section>
  );
};

export default FutureSelfArchitectSection;
