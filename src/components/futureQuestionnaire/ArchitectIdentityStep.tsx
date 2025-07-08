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