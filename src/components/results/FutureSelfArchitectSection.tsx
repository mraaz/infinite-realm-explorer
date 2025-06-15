
import { Button } from '@/components/ui/button';

interface FutureSelfArchitect {
  mainFocus: string;
  identity: string;
  system: string;
  proof: string;
}

interface FutureSelfArchitectSectionProps {
  architect?: FutureSelfArchitect;
  onStart: () => void;
}

const FutureSelfArchitectSection = ({ architect, onStart }: FutureSelfArchitectSectionProps) => {
  return (
    <section className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/80 mb-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Future Self Architect</h2>
        <p className="text-gray-600 mb-4">Goals are fleeting, but your identity is who you are. Instead of setting a target, let's define the identity of your future self and build the systems that make success inevitable.</p>
        
        {architect ? (
          <div className="bg-gray-100/50 p-6 rounded-lg space-y-4">
              <div>
                  <h3 className="font-semibold text-gray-700 capitalize">Your Future Identity for {architect.mainFocus}:</h3>
                  <p className="font-bold text-purple-600 text-xl">"{architect.identity}"</p>
              </div>
              <div>
                  <h3 className="font-semibold text-gray-700">Your Core System:</h3>
                  <p className="text-gray-600 italic">"{architect.system}"</p>
              </div>
              <div>
                  <h3 className="font-semibold text-gray-700">Your First Proof of Identity:</h3>
                  <p className="text-gray-600 italic">"{architect.proof}"</p>
              </div>
              <Button onClick={onStart} variant="outline" className="w-full mt-4 !text-gray-800">
                  Redesign Your Future Self
              </Button>
          </div>
        ) : (
          <div className="bg-gray-100/50 p-4 rounded-lg">
              <p className="font-semibold text-gray-700">Ready to design your future identity?</p>
              <p className="text-gray-600 text-sm mb-4">Create a personalised identity system based on your main focus area that will help you achieve your goals through consistent habits and mindset shifts.</p>
              <Button onClick={onStart} className="w-full justify-between">
                  <span>Design Your Future Self</span>
                  <span>&rarr;</span>
              </Button>
          </div>
        )}
    </section>
  );
};

export default FutureSelfArchitectSection;
