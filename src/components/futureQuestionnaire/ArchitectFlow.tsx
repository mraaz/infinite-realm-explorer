
import React from 'react';
import IdentityArchetypeSelection from '@/components/IdentityArchetypeSelection';
import CoreSystemDesign from '@/components/CoreSystemDesign';
import ProofOfIdentity from '@/components/ProofOfIdentity';
import { QuestionnaireNavigation } from './QuestionnaireNavigation';
import { Pillar } from '@/components/priority-ranking/types';

interface ArchitectFlowProps {
    step: number;
    priorities: { mainFocus: Pillar; secondaryFocus: Pillar; maintenance: Pillar[] };
    architectAnswers: { identity: string; system: string; proof: string };
    onIdentityComplete: (identity: string) => void;
    onSystemComplete: (system: string) => void;
    onProofComplete: (proof: string) => void;
    onPrevious: () => void;
}

export const ArchitectFlow: React.FC<ArchitectFlowProps> = ({
    step,
    priorities,
    architectAnswers,
    onIdentityComplete,
    onSystemComplete,
    onProofComplete,
    onPrevious,
}) => {
    switch (step) {
        case 1:
            return (
                <div>
                    <IdentityArchetypeSelection 
                        mainFocus={priorities.mainFocus.toLowerCase()} 
                        onComplete={onIdentityComplete} 
                        value={architectAnswers.identity} 
                    />
                    <QuestionnaireNavigation
                        step={step}
                        isArchitect={true}
                        onNext={() => onIdentityComplete(architectAnswers.identity)}
                    />
                </div>
            );
        case 2:
            return (
                <div>
                    <CoreSystemDesign 
                        mainFocus={priorities.mainFocus.toLowerCase()} 
                        chosenIdentity={architectAnswers.identity} 
                        onComplete={onSystemComplete} 
                        value={architectAnswers.system} 
                    />
                    <QuestionnaireNavigation
                        step={step}
                        isArchitect={true}
                        onPrevious={onPrevious}
                        onNext={() => onSystemComplete(architectAnswers.system)}
                    />
                </div>
            );
        case 3:
            return (
                <div>
                    <ProofOfIdentity 
                        chosenIdentity={architectAnswers.identity} 
                        onComplete={onProofComplete} 
                        value={architectAnswers.proof} 
                    />
                    <QuestionnaireNavigation
                        step={step}
                        isArchitect={true}
                        onPrevious={onPrevious}
                        onNext={() => onProofComplete(architectAnswers.proof)}
                    />
                </div>
            );
        default:
            return null;
    }
};
