
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToActionSection = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-xl border border-purple-200 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ready to See Your Future, Mate?</h2>
      <p className="text-gray-600 mb-6">
        Answer a few personalised questions and get your 5-Year Snapshot in under 7 minutes.
      </p>
      <Link to="/questionnaire">
        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold text-lg w-full sm:w-auto">
          Get My 5-Year Snapshot
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          <span>Powered by AI</span>
        </div>
        <div className="flex items-center space-x-1">
          <Zap className="h-4 w-4 text-green-500" />
          <span>Instant results</span>
        </div>
      </div>
    </div>
  );
};

export default CallToActionSection;
