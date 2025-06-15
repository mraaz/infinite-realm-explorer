
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Settings, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);

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

  const systems = architect?.system?.split('\n').filter(s => s.trim() !== '') || [];
  const habitsPerPage = 2;
  const totalPages = Math.ceil(systems.length / habitsPerPage);
  const currentHabits = systems.slice((currentPage - 1) * habitsPerPage, currentPage * habitsPerPage);

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <section className="mb-16 flex justify-center">
      <Card className="bg-white/80 shadow-lg border border-gray-200/80 w-full max-w-3xl flex flex-col">
        <CardContent>
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
                  You've chosen to become:
                </p>
                <div className="mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                  <p className="text-lg font-semibold text-blue-800 italic">"{architect.identity}"</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700">Your Core Systems</h3>
                {systems.length > habitsPerPage ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {currentHabits.map((system, index) => (
                        <div key={index} className="p-4 bg-gray-50/50 rounded-lg border border-gray-200 h-full flex items-center">
                          <p className="text-gray-700 italic">"{system}"</p>
                        </div>
                      ))}
                    </div>
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={handlePrevious} className={cn(currentPage === 1 && "pointer-events-none opacity-50")} />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }} isActive={currentPage === i + 1}>
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext href="#" onClick={handleNext} className={cn(currentPage === totalPages && "pointer-events-none opacity-50")} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </>
                ) : (
                  <div className="mt-2 space-y-2">
                    {systems.length > 0 ? (
                      systems.map((system, index) => (
                        <div key={index} className="p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                          <p className="text-gray-700 italic">"{system}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="mt-2 p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">No core systems defined yet.</p>
                      </div>
                    )}
                  </div>
                )}
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
