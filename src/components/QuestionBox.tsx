
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Target, ArrowLeft, ArrowRight } from 'lucide-react';

const QuestionBox = () => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border border-gray-200 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 font-medium">
          <Target className="h-4 w-4 mr-2" />
          Career
        </Badge>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        What's your single biggest career goal for the next 5 years?
      </h2>
      
      <div className="mb-6">
        <Input placeholder="e.g. Change careers" />
        <div className="flex gap-2 mt-3 flex-wrap">
          <Button variant="outline" size="sm" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Get a promotion</Button>
          <Button variant="outline" size="sm" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Change careers</Button>
          <Button variant="outline" size="sm" className="bg-gray-50 text-gray-700 hover:bg-gray-100">Start a business</Button>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button className="bg-gray-800 hover:bg-gray-900 text-white">
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionBox;
