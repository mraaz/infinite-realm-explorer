
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import RadarChart from '@/components/pulse-check/RadarChart';
import { ArrowLeft, Share, Eye } from 'lucide-react';

interface SharedResult {
  id: string;
  user_display_name: string;
  user_email: string;
  results_data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
    insights?: {
      Career: string;
      Finances: string;
      Health: string;
      Connections: string;
    };
  };
  created_at: string;
  view_count: number;
}

const SharedResults = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [sharedResult, setSharedResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedResult = async () => {
      if (!shareToken) {
        setError('Invalid share link');
        setLoading(false);
        return;
      }

      try {
        // Fetch the shared result
        const { data, error } = await supabase
          .from('shared_pulse_results')
          .select('*')
          .eq('share_token', shareToken)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            setError('This shared result has expired or does not exist');
          } else {
            setError('Failed to load shared result');
          }
          setLoading(false);
          return;
        }

        // Type the data properly
        const typedResult: SharedResult = {
          id: data.id,
          user_display_name: data.user_display_name,
          user_email: data.user_email,
          results_data: data.results_data as SharedResult['results_data'],
          created_at: data.created_at,
          view_count: data.view_count
        };

        setSharedResult(typedResult);

        // Increment view count
        await supabase
          .from('shared_pulse_results')
          .update({ view_count: data.view_count + 1 })
          .eq('id', data.id);

      } catch (err) {
        console.error('Error fetching shared result:', err);
        setError('Failed to load shared result');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedResult();
  }, [shareToken]);

  const handleTakePulseCheck = () => {
    window.location.href = '/pulse-check';
  };

  const handleShareResult = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `${sharedResult?.user_display_name}'s Pulse Check Results`,
      text: `Check out ${sharedResult?.user_display_name}'s pulse check results! Take your own at ${window.location.origin}`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred, fallback to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          alert('Link copied to clipboard!');
        }
      }
    } else {
      // Fallback: Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      } else {
        prompt('Copy this link:', shareUrl);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-gray-300 mb-8">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!sharedResult) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-gray-400">
              <Eye size={16} />
              <span className="text-sm">{sharedResult.view_count} views</span>
            </div>
            <button
              onClick={handleShareResult}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <Share size={16} />
              Share
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {sharedResult.user_display_name}'s Pulse Check Results
            </h1>
            <p className="text-gray-300 text-lg">
              Shared on {new Date(sharedResult.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="mb-8">
            <RadarChart 
              data={sharedResult.results_data} 
              insights={sharedResult.results_data.insights}
            />
          </div>

          {/* Call to Action */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to discover your own path?</h2>
            <p className="text-gray-300 mb-6">
              Take your own Life Path Pulse Check and see how you compare across the four key areas of life.
            </p>
            <button
              onClick={handleTakePulseCheck}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Take Your Pulse Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedResults;
