
import { useState } from "react";
import { futureSelfArchetypes, PillarArchetypes } from "@/data/futureSelfQuestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FutureSelfArchitectProps {
  pillar: string;
  onClose: () => void;
}

const FutureSelfArchitect = ({ pillar, onClose }: FutureSelfArchitectProps) => {
  const [step, setStep] = useState(1);
  const [chosenIdentity, setChosenIdentity] = useState<string | null>(null);
  const [coreSystem, setCoreSystem] = useState("");
  const [proofOfIdentity, setProofOfIdentity] = useState("");

  const pillarData: PillarArchetypes | undefined = futureSelfArchetypes[pillar];

  if (!pillarData) {
    return (
      <div className="p-4">
        <p>Invalid pillar selected or no data available for this pillar.</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // You can handle the final data here, e.g., save to state or API
      console.log({ pillar, chosenIdentity, coreSystem, proofOfIdentity });
      onClose();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">{pillarData.prompt}</h3>
            <div className="grid grid-cols-1 gap-4">
              {pillarData.options.map((option) => (
                <Card
                  key={option.title}
                  onClick={() => setChosenIdentity(option.title)}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary",
                    chosenIdentity === option.title && "border-primary border-2 shadow-lg"
                  )}
                >
                  <CardHeader>
                    <CardTitle>{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">Design Your Core System</h3>
            <p className="text-muted-foreground mb-4">
              For your chosen identity of <span className="font-semibold text-primary">'{chosenIdentity}'</span>... What is one weekly system you can put in place to make this identity a reality?
            </p>
            <Textarea
              value={coreSystem}
              onChange={(e) => setCoreSystem(e.target.value)}
              placeholder="e.g., Every Sunday evening, I will plan and schedule my three workouts for the upcoming week..."
              rows={5}
            />
          </div>
        );
      case 3:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-2">Define Your "Proof of Identity"</h3>
            <p className="text-muted-foreground mb-4">
              A new identity starts with a single action. What is one small thing you can do right now to act like <span className="font-semibold text-primary">'{chosenIdentity}'</span>?
            </p>
            <Textarea
              value={proofOfIdentity}
              onChange={(e) => setProofOfIdentity(e.target.value)}
              placeholder="e.g., I will go into my calendar right now and block out 30 minutes for a walk tomorrow..."
              rows={5}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !chosenIdentity) return true;
    if (step === 2 && !coreSystem.trim()) return true;
    if (step === 3 && !proofOfIdentity.trim()) return true;
    return false;
  };

  return (
    <div className="flex flex-col">
        <div className="min-h-[250px]">
            {renderStep()}
        </div>
      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={handlePrevious} disabled={step === 1}>
          Previous
        </Button>
        <Button onClick={handleNext} disabled={isNextDisabled()}>
          {step === 3 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default FutureSelfArchitect;
