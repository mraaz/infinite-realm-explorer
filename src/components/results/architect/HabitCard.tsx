
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FutureSelfArchitect } from '@/types/results';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface HabitCardProps {
  habit: FutureSelfArchitect;
  currentPage: number;
  totalPages: number;
  onPreviousHabit: (e: React.MouseEvent) => void;
  onNextHabit: (e: React.MouseEvent) => void;
}

const HabitCard = ({ habit, currentPage, totalPages, onPreviousHabit, onNextHabit }: HabitCardProps) => {
  const [currentSystemPage, setCurrentSystemPage] = useState(1);

  useEffect(() => {
    setCurrentSystemPage(1);
  }, [habit]);

  const systems = habit.system?.split('\n').filter(s => s.trim() !== '') || [];
  const systemsPerPage = 2;
  const totalSystemPages = Math.ceil(systems.length / systemsPerPage);
  const currentSystems = systems.slice((currentSystemPage - 1) * systemsPerPage, currentSystemPage * systemsPerPage);

  const handleSystemPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentSystemPage((prev) => Math.max(prev - 1, 1));
  };

  const handleSystemNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentSystemPage((prev) => Math.min(prev + 1, totalSystemPages));
  };

  return (
    <div className="space-y-6">
      {habit.isCompleted && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-green-300 bg-green-100 p-3 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-semibold">
            Completed on {habit.completionDate ? format(new Date(habit.completionDate), 'PPP') : ''}
          </p>
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-700">Habit {currentPage} of {totalPages}</h3>
          <Pagination className="mt-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={onPreviousHabit} className={cn(currentPage === 1 && "pointer-events-none opacity-50")} />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" onClick={onNextHabit} className={cn(currentPage === totalPages && "pointer-events-none opacity-50")} />
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
          <p className="text-lg font-semibold text-blue-800 italic">"{habit.identity}"</p>
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
          <p className="text-gray-700 italic">"{habit.proof}"</p>
        </div>
      </div>
    </div>
  );
};

export default HabitCard;
