
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const EdgeFunctionTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  // Check authentication status on component mount
  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    };
    checkAuth();
  }, []);

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
    health_barrier_follow_up: "Not enough time",
    health_energy_levels: 6,
    health_sleep: 7,
    health_goal: "Build strength and improve fitness",
    
    // Connections
    connections_belonging: 4,
    connections_priority_follow_up: "Yes, it's a focus",
    connections_quality_time: "2-5 hours",
    connections_investment: "Friendships",
    connections_goal: "Deepen existing friendships and make new ones"
  };

  const signInAnonymously = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setError(`Authentication error: ${error.message}`);
      } else {
        setAuthStatus('authenticated');
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const testEdgeFunction = async () => {
    if (authStatus !== 'authenticated') {
      setError('Please authenticate first');
      return;
    }

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

  if (authStatus === 'checking') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Checking authentication status...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            {authStatus === 'unauthenticated' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h4 className="text-yellow-800 font-semibold mb-2">Authentication Required</h4>
                <p className="text-yellow-700 mb-3">
                  The generate-scores function requires authentication. Please sign in to test the function.
                </p>
                <Button 
                  onClick={signInAnonymously} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Signing in...' : 'Sign In Anonymously'}
                </Button>
              </div>
            )}

            {authStatus === 'authenticated' && (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <h4 className="text-green-800 font-semibold">✓ Authenticated</h4>
                <p className="text-green-700">Ready to test the edge function.</p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Simulated Answers (19 questions):</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                {JSON.stringify(simulatedAnswers, null, 2)}
              </pre>
            </div>
            
            <Button 
              onClick={testEdgeFunction} 
              disabled={loading || authStatus !== 'authenticated'}
              className="w-full"
            >
              {loading ? 'Testing Edge Function...' : 'Test generate-scores Function'}
            </Button>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h4 className="text-red-800 font-semibold">Error:</h4>
                <p className="text-red-700">{error}</p>
                <div className="mt-2 text-sm text-red-600">
                  <strong>Debug info:</strong> Check the browser console and network tab for more details.
                </div>
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
