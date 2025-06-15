import { useState, useMemo } from 'react';
import { PillarProgress } from '@/components/NewQuadrantChart';
import { Button } from '@/components/ui/button';
import { Priorities } from '@/pages/FutureQuestionnaire';

interface PriorityRankingProps {
    progress: PillarProgress;
    onComplete: (priorities: Priorities) => void;
}

const pillars = [
    { id: 'career', name: 'Career' },
    { id: 'financials', name: 'Financials' },
    { id: 'health', name: 'Health' },
    { id: 'connections', name: 'Connections' },
];

const PriorityRanking = ({ progress, onComplete }: PriorityRankingProps) => {
    const [mainFocus, setMainFocus] = useState<string | null>(null);
    const [secondaryFocus, setSecondaryFocus] = useState<string | null>(null);

    const recommendedPillars = useMemo(() => {
        const scores = [
            { id: 'career', score: progress.career },
            { id: 'financials', score: progress.financials },
            { id: 'health', score: progress.health },
            { id: 'connections', score: progress.connections },
        ].filter(p => p.id in progress); // defensive check
        scores.sort((a, b) => a.score - b.score);
        return scores.slice(0, 2).map(s => s.id);
    }, [progress]);

    const handleSelect = (pillarId: string) => {
        if (!mainFocus) {
            setMainFocus(pillarId);
        } else if (!secondaryFocus && pillarId !== mainFocus) {
            setSecondaryFocus(pillarId);
        }
    };
    
    const handleReset = () => {
        setMainFocus(null);
        setSecondaryFocus(null);
    }
    
    const handleSubmit = () => {
        if (mainFocus && secondaryFocus) {
            const maintenance = pillars
                .filter(p => p.id !== mainFocus && p.id !== secondaryFocus)
                .map(p => p.id);
            onComplete({
                mainFocus,
                secondaryFocus,
                maintenance
            });
        }
    };

    const isSelected = (pillarId: string) => mainFocus === pillarId || secondaryFocus === pillarId;

    const availablePillars = pillars.filter(p => p.id in progress);

    return (
        <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">Phase 1: Set Your Priorities</h2>
            <p className="text-gray-600 mt-2 mb-6">You're in the driver's seat. To build your ideal 5-year future, where do you want to focus your energy? Select one Main Focus and one Secondary Focus below.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {availablePillars.map(pillar => (
                    <div 
                        key={pillar.id}
                        onClick={() => !isSelected(pillar.id) && handleSelect(pillar.id)}
                        className={`relative p-6 border-2 rounded-lg text-center transition-all duration-200 ${isSelected(pillar.id) ? 'bg-purple-50 border-purple-500 shadow-md' : 'bg-white hover:border-purple-300 hover:shadow-sm cursor-pointer'}`}
                        role="button"
                        aria-pressed={isSelected(pillar.id)}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !isSelected(pillar.id) && handleSelect(pillar.id)}
                    >
                        <h3 className="font-bold text-lg text-gray-800">{pillar.name}</h3>
                        {recommendedPillars.includes(pillar.id) && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full font-semibold mt-2 inline-block">Recommended</span>}
                    </div>
                ))}
            </div>
            
            <div className="space-y-6 mb-8 max-w-2xl mx-auto">
                <div>
                    <h3 className="font-semibold text-gray-700 text-left mb-2">Main Focus (1)</h3>
                    <div className="h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 font-semibold text-lg">
                        {mainFocus ? pillars.find(p => p.id === mainFocus)?.name : 'Select a pillar above'}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-gray-700 text-left mb-2">Secondary Focus (1)</h3>
                    <div className="h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 font-semibold text-lg">
                        {secondaryFocus ? pillars.find(p => p.id === secondaryFocus)?.name : (mainFocus ? 'Select another pillar' : '...')}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-gray-700 text-left mb-2">Maintenance Mode (2)</h3>
                    <div className="h-16 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 font-semibold text-lg">
                        {mainFocus && secondaryFocus ? pillars.filter(p => p.id !== mainFocus && p.id !== secondaryFocus).map(p => p.name).join(', ') : '...'}
                    </div>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <Button onClick={handleReset} variant="outline" size="lg">Reset</Button>
                <Button onClick={handleSubmit} disabled={!mainFocus || !secondaryFocus} size="lg">
                    Confirm Priorities
                </Button>
            </div>

        </div>
    );
};

export default PriorityRanking;
