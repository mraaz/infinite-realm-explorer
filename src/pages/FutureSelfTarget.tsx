
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { PillarProgress } from '@/components/NewQuadrantChart';

const pillars: (keyof Omit<PillarProgress, 'basics'>)[] = ['career', 'financials', 'health', 'connections'];

const pillarLabels: Record<keyof Omit<PillarProgress, 'basics'>, string> = {
    career: 'Career & Growth',
    financials: 'Financial Wellbeing',
    health: 'Health & Vitality',
    connections: 'Connections & Relationships',
};


const FutureSelfTarget = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentProgress } = (location.state || {}) as { currentProgress: PillarProgress | null };

    const [targets, setTargets] = useState<PillarProgress>(
        currentProgress || { basics: 0, career: 50, financials: 50, health: 50, connections: 50 }
    );

    if (!currentProgress) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Error</h1>
                    <p className="text-gray-600 mt-2">Current progress data not found. Please go back to the results page and try again.</p>
                    <Button onClick={() => navigate('/results')} className="mt-4">Back to Results</Button>
                </main>
            </div>
        );
    }

    const handleSliderChange = (pillar: keyof Omit<PillarProgress, 'basics'>, value: number[]) => {
        setTargets(prev => ({ ...prev, [pillar]: value[0] }));
    };

    const handleSave = () => {
        navigate('/results', { state: { ...location.state, futureProgress: targets } });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-3xl">Set Your 5-Year Targets</CardTitle>
                        <CardDescription>Define what success looks like for you in the next five years across the core pillars of your life. Your current scores are shown for reference.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-4">
                        {pillars.map(pillar => (
                            <div key={pillar}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800">{pillarLabels[pillar]}</h3>
                                    <span className="text-xl font-bold text-purple-600">{targets[pillar]}%</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">Current score: {currentProgress[pillar]}%</p>
                                <Slider
                                    value={[targets[pillar]]}
                                    onValueChange={(value) => handleSliderChange(pillar, value)}
                                    min={currentProgress[pillar]}
                                    max={100}
                                    step={1}
                                />
                            </div>
                        ))}
                        <div className="pt-6 flex justify-end gap-4">
                            <Button variant="outline" onClick={() => navigate('/results', { state: location.state })}>Cancel</Button>
                            <Button onClick={handleSave}>Save Targets & View Future Self</Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default FutureSelfTarget;
