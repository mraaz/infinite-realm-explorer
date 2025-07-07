import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import RadarChart from '@/components/pulse-check/RadarChart';
import { supabase } from '@/integrations/supabase/client';

interface SharedResultsData {
  user_display_name: string;
  results_data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
    insights?: any;
  };
  created_at: string;
  view_count: number;
}

const SharedResults = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [data, setData] = useState<SharedResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchSharedResults = async () => {
      if (!shareToken) {
        setError('Invalid share link');
        setIsLoading(false);
        return;
      }

      try {
        const { data: response, error } = await supabase.functions.invoke('get-shared-results', {
          body: null,
          headers: {},
        });

        // Pass the token as query parameter since it's a GET request
        const url = `https://abcojhdnhxatbmdmyiav.supabase.co/functions/v1/get-shared-results?token=${shareToken}`;
        
        const fetchResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await fetchResponse.json();

        if (!fetchResponse.ok || result.error) {
          setError(result.message || 'Failed to load shared results');
          return;
        }

        setData(result.data);
      } catch (error) {
        console.error('Error fetching shared results:', error);
        setError('Failed to load shared results');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedResults();
  }, [shareToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading shared results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😔</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
            <p className="text-gray-300 mb-6">
              {error || 'This shared result may have expired or been removed.'}
            </p>
          </div>
          
          <Link
            to="/pulse-check"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg inline-block"
          >
            Take Your Own Pulse Check
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {data.user_display_name}'s Pulse Check Results
          </h1>
          <p className="text-gray-300 text-sm md:text-base">
            Shared on {formatDate(data.created_at)} • Viewed {data.view_count} time{data.view_count !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Results Display */}
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <RadarChart 
              data={data.results_data} 
              insights={data.results_data.insights} 
            />
          </div>

          {/* Insights Display */}
          {data.results_data.insights && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
              <h3 className="text-xl font-semibold mb-4 text-purple-300">Key Insights</h3>
              <div className="space-y-4">
                {Object.entries(data.results_data.insights).map(([category, insight]) => (
                  <div key={category} className="border-l-4 border-purple-400 pl-4">
                    <h4 className="font-semibold text-purple-200 capitalize">{category}</h4>
                    <p className="text-gray-300 text-sm">{insight as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-8 border border-purple-400/30">
              <h3 className="text-2xl font-bold mb-4">Compare Your Results</h3>
              <p className="text-gray-300 mb-6">
                Take your own pulse check and see how your life balance compares across the four key areas.
              </p>
              <Link
                to="/pulse-check"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg inline-block"
              >
                Take Your Pulse Check
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <Link 
            to="/" 
            className="text-purple-400 hover:text-purple-300 text-sm underline"
          >
            Powered by Infinite Game
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedResults;