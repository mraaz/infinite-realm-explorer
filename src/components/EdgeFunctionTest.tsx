
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const EdgeFunctionTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulated answers for 19 questions (excluding optional ones)
  const simulatedAnswers = {
    // Basics
    name: "Alex Thompson",
    dob: "1999",
    
    // Career
    career_situation: "Employed",
    career_fulfillment: 6,
    career_hours: 45,
    career_goal: "Get a promotion to senior developer role",
    
    // Finances
    financial_situation: "Comfortable, but not saving",
    financial_confidence: 5,
    financial_savings_percentage: "5-10%",
    financial_goal: "Save for a home deposit",
    
    // Health
    health_activity: 2,
    health_barrier_follow_up: "Not enough time", // This appears since health_activity <= 1
    health_energy_levels: 6,
    health_sleep: 7,
    health_goal: "Build strength and improve fitness",
    
    // Connections
    connections_belonging: 4,
    connections_priority_follow_up: "Yes, it's a focus", // This appears since connections_belonging < 5
    connections_quality_time: "2-5 hours",
    connections_investment: "Friendships",
    connections_goal: "Deepen existing friendships and make new ones"
  };

  const testEdgeFunction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Calling generate-scores function with:', simulatedAnswers);
      
      const { data, error } = await supabase.functions.invoke('generate-scores', {
        body: { answers: simulatedAnswers }
      });

      if (error) {
        console.error('Edge function error:', error);
        setError(error.message || 'Unknown error occurred');
      } else {
        console.log('Edge function response:', data);
        setResult(data);
      }
    } catch (err) {
      console.error('Request error:', err);
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edge Function Test: generate-scores</CardTitle>
          <CardDescription>
            Testing the existing generate-scores edge function with simulated questionnaire data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Simulated Answers (19 questions):</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                {JSON.stringify(simulatedAnswers, null, 2)}
              </pre>
            </div>
            
            <Button 
              onClick={testEdgeFunction} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing Edge Function...' : 'Test generate-scores Function'}
            </Button>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h4 className="text-red-800 font-semibold">Error:</h4>
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            {result && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="text-green-800 font-semibold mb-2">Success! Function Response:</h4>
                <pre className="bg-white p-4 rounded text-sm overflow-auto max-h-96 border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeFunctionTest;
