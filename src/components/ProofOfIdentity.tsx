
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ProofOfIdentityProps {
  chosenIdentity: string;
  onComplete: (proof: string) => void;
}

const ProofOfIdentity = ({ chosenIdentity, onComplete }: ProofOfIdentityProps) => {
  const [proof, setProof] = useState('');

  return (
    <div className="text-left max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-700 text-center">Step 3: Define Your "Proof of Identity"</h2>
      <p className="text-gray-600 mt-2 mb-6 text-center">
        A new identity starts with a single action. What is one small thing you can do right now to act like '{chosenIdentity}'?
      </p>

      <div className="space-y-2 mb-6">
        <label htmlFor="proof-description" className="font-semibold text-gray-700 mb-2 block">Your Immediate Action:</label>
        <Textarea 
          id="proof-description"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="e.g., 'I will go into my calendar right now and block out 30 minutes for a walk tomorrow lunchtime.'"
          rows={4}
        />
      </div>

      <div className="text-center">
        <Button onClick={() => proof && onComplete(proof)} disabled={!proof}>
          Confirm Action
        </Button>
      </div>
    </div>
  );
};

export default ProofOfIdentity;
