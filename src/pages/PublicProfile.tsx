
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ChartsSection from '@/components/results/ChartsSection';
import InsightSynthesis from '@/components/results/InsightSynthesis';
import { Insight } from '@/types/insights';
import insightSyntheses from '@/data/insights.json';
import { logDebug, logError } from '@/utils/logger';

const PublicProfile = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPublicProfile(slug);
    }
  }, [slug]);

  const fetchPublicProfile = async (publicSlug: string) => {
    try {
      setIsLoading(true);
      logDebug("Fetching public profile for slug:", publicSlug);

      // Get user by public slug
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, is_public')
        .eq('public_slug', publicSlug)
        .eq('is_public', true)
        .single();

      if (userError || !userData) {
        logError('User not found or not public:', userError);
        setError('Profile not found or not public');
        return;
      }

      // Get the latest completed public survey for this user
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('id, answers, created_at, updated_at')
        .eq('user_id', userData.id)
        .eq('status', 'completed')
        .eq('is_public', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (surveyError || !surveyData) {
        logError('Survey not found:', surveyError);
        setError('No public survey found for this user');
        return;
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('scores, insights, actions')
        .eq('survey_id', surveyData.id)
        .single();

      if (profileError || !profileData) {
        logError('Profile data not found:', profileError);
        setError('Profile data not found');
        return;
      }

      setProfile({
        user: userData,
        survey: surveyData,
        profile: profileData
      });

    } catch (error) {
      logError('Error fetching public profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading Profile...</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'This profile is not available or has been made private.'}</p>
          </div>
        </main>
      </div>
    );
  }

  // Convert profile data to the format expected by ChartsSection
  const progress = profile.profile.scores || { Career: 0, Finances: 0, Health: 0, Connections: 0 };
  const answers = profile.survey.answers || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Public Life View Results
          </h1>
          <p className="text-lg text-gray-600">
            Shared on {new Date(profile.survey.updated_at).toLocaleDateString()}
          </p>
        </div>

        <ChartsSection
          currentProgress={progress}
          futureProgress={undefined}
          answers={answers}
          onPillarClick={() => {}} // No interaction for public view
          activePillar={undefined}
          onRetakeCurrent={() => {}} // No retake for public view
          onStartFutureQuestionnaire={() => {}} // No future questionnaire for public view
          isPublicView={true}
        />

        <InsightSynthesis insights={insightSyntheses as Insight[]} />

        <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Want your own Life View assessment?
          </h3>
          <p className="text-gray-600 mb-4">
            Take the free 5-Year Snapshot questionnaire and get your personalized insights.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start My Assessment
          </a>
        </div>
      </main>
    </div>
  );
};

export default PublicProfile;
