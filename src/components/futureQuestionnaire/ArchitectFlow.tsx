
import React from 'react';
import IdentityArchetypeSelection from '@/components/IdentityArchetypeSelection';
import CoreSystemDesign from '@/components/CoreSystemDesign';
import ProofOfIdentity from '@/components/ProofOfIdentity';
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
                <IdentityArchetypeSelection 
                    mainFocus={priorities.mainFocus.toLowerCase()} 
                    onComplete={onIdentityComplete} 
                    value={architectAnswers.identity} 
                />
            );
        case 2:
            return (
                <CoreSystemDesign 
                    mainFocus={priorities.mainFocus.toLowerCase()} 
                    chosenIdentity={architectAnswers.identity} 
                    onComplete={onSystemComplete} 
                    value={architectAnswers.system} 
                />
            );
        case 3:
            return (
                <ProofOfIdentity 
                    chosenIdentity={architectAnswers.identity} 
                    onComplete={onProofComplete} 
                    value={architectAnswers.proof} 
                />
            );
        default:
            return null;
    }
};
