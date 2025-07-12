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
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Architect Identity</h3>
            <p className="text-gray-400">Define your {pillarName} architect identity</p>
            <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`Describe your ${pillarName} architect identity...`}
                className="min-h-[100px] bg-gray-800 border-gray-700 text-white"
            />
        </div>
    );
};