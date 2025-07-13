import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface ArchitectIdentityStepProps {
  pillarName: string;
  onComplete: (identity: string) => void;
  initialValue?: string;
}

export const ArchitectIdentityStep: React.FC<ArchitectIdentityStepProps> = ({ pillarName, onComplete, initialValue = '' }) => {
    const [value, setValue] = useState(initialValue);
    useEffect(() => { onComplete(value); }, [value, onComplete]);
    
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                    Define Your {pillarName} Identity
                </h3>
                <p className="text-gray-400">
                    Describe who you want to become in your {pillarName.toLowerCase()} journey.
                </p>
            </div>
            
            <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Example: "I want to become someone who..."`}
                className="min-h-[120px] bg-gray-800/50 border-gray-700 text-white"
            />
        </div>
    );
};