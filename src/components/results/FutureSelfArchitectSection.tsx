import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Settings, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-react';
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
import { MarkAsDoneDialog, MarkAsDoneData } from './MarkAsDoneDialog';
import { format } from 'date-fns';

interface FutureSelfArchitect {
  mainFocus: string;
  identity: string;
  system: string;
  proof: string;
  isCompleted?: boolean;
  completionDate?: string | Date;
  completionNotes?: string;
}

interface FutureSelfArchitectSectionProps {
  architect?: FutureSelfArchitect[];
  onStart: (index?: number) => void;
  isQuestionnaireComplete: boolean;
  onMarkAsDone: (habitIndex: number, data: MarkAsDoneData) => void;
}

const FutureSelfArchitectSection = ({ architect, onStart, isQuestionnaireComplete, onMarkAsDone }: FutureSelfArchitectSectionProps) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSystemPage, setCurrentSystemPage] = useState(1);
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [habitToMark, setHabitToMark] = useState<number | null>(null);

  const habits = architect || [];
  const totalPages = habits.length;
  const currentHabit = habits.length > 0 ? habits[currentPage - 1] : undefined;

  const activeHabitsCount = habits.filter(h => !h.isCompleted).length;
  const canAddHabit = activeHabitsCount < 2;

  const systems = currentHabit?.system?.split('\n').filter(s => s.trim() !== '') || [];
  const systemsPerPage = 2;
  const totalSystemPages = Math.ceil(systems.length / systemsPerPage);
  const currentSystems = systems.slice((currentSystemPage - 1) * systemsPerPage, currentSystemPage * systemsPerPage);

  const handleAddClick = () => {
    if (isQuestionnaireComplete) {
      if (canAddHabit) {
        onStart(); // No index means add new
      } else {
        toast({
          title: "Habit Limit Reached",
          description: "You can only have two active habits. Mark one as complete to add another.",
        });
      }
    } else {
      toast({
        title: "Action Required",
        description: "Please complete the Future Self Questionnaire before you can proceed.",
      });
    }
  };

  const handleEditClick = () => {
    onStart(currentPage - 1);
  };
  
  const handleMarkAsDoneClick = () => {
    setHabitToMark(currentPage - 1);
    setIsDoneModalOpen(true);
  };

  const handleDoneSubmit = (data: MarkAsDoneData) => {
    if (habitToMark !== null) {
      onMarkAsDone(habitToMark, data);
    }
    setIsDoneModalOpen(false);
    setHabitToMark(null);
  };

  const handlePreviousHabit = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => {
      const newPage = Math.max(prev - 1, 1);
      if (newPage !== prev) setCurrentSystemPage(1);
      return newPage;
    });
  };

  const handleNextHabit = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentPage((prev) => {
      const newPage = Math.min(prev + 1, totalPages);
      if (newPage !== prev) setCurrentSystemPage(1);
      return newPage;
    });
  };

  const handleSystemPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentSystemPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSystemNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentSystemPage((prev) => Math.min(prev + 1, totalSystemPages));
  };

  return (
    <>
      <section className="mb-16 flex justify-center">
        <Card className="bg-white/80 shadow-lg border border-gray-200/80 w-full max-w-3xl flex flex-col">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3 text-2xl font-bold text-gray-800 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
              <h2>Future Self Architect</h2>
            </div>
            {currentHabit ? (
              <div className="space-y-6">
                {currentHabit.isCompleted && (
                  <div className="mb-4 flex items-center gap-2 rounded-md border border-green-300 bg-green-100 p-3 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="font-semibold">
                      Completed on {currentHabit.completionDate ? format(new Date(currentHabit.completionDate), 'PPP') : ''}
                    </p>
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-700">Habit {currentPage} of {totalPages}</h3>
                    <Pagination className="mt-0">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={handlePreviousHabit} className={cn(currentPage === 1 && "pointer-events-none opacity-50")} />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext href="#" onClick={handleNextHabit} className={cn(currentPage === totalPages && "pointer-events-none opacity-50")} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Your Future Identity</h3>
                  <p className="text-gray-600 mt-1">
                    You've chosen to become:
                  </p>
                  <div className="mt-2 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                    <p className="text-lg font-semibold text-blue-800 italic">"{currentHabit.identity}"</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Your Core Systems</h3>
                  {systems.length > systemsPerPage ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {currentSystems.map((system, index) => (
                          <div key={index} className="p-4 bg-gray-50/50 rounded-lg border border-gray-200 h-full flex items-center">
                            <p className="text-gray-700 italic">"{system}"</p>
                          </div>
                        ))}
                      </div>
                      <Pagination className="mt-4">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious href="#" onClick={handleSystemPrevious} className={cn(currentSystemPage === 1 && "pointer-events-none opacity-50")} />
                          </PaginationItem>
                          {Array.from({ length: totalSystemPages }, (_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); setCurrentSystemPage(i + 1); }} isActive={currentSystemPage === i + 1}>
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext href="#" onClick={handleSystemNext} className={cn(currentSystemPage === totalSystemPages && "pointer-events-none opacity-50")} />
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
                    <p className="text-gray-700 italic">"{currentHabit.proof}"</p>
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
            {habits.length > 0 ? (
               <div className="w-full flex flex-col sm:flex-row gap-2">
                {!currentHabit?.isCompleted && (
                  <Button onClick={handleMarkAsDoneClick} variant="outline" className="w-full no-print h-11 px-8 rounded-md border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700">
                    <CheckCircle2 className="mr-2" />
                    Mark as Done
                  </Button>
                )}
                <Button onClick={handleEditClick} variant="outline" className="w-full no-print h-11 px-8 rounded-md">
                  Edit This Habit
                </Button>
                <Button
                  onClick={handleAddClick}
                  className={cn(
                    "w-full justify-center no-print h-11 px-8 rounded-md",
                    (!isQuestionnaireComplete || !canAddHabit) && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!isQuestionnaireComplete || !canAddHabit}
                >
                  <PlusCircle className="mr-2" />
                  Add Another Habit
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleAddClick}
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
      <MarkAsDoneDialog
        isOpen={isDoneModalOpen}
        onOpenChange={setIsDoneModalOpen}
        onDone={handleDoneSubmit}
      />
    </>
  );
};

export default FutureSelfArchitectSection;
