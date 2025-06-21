
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import ChartsSection from '@/components/results/ChartsSection';
import InsightSynthesis from '@/components/results/InsightSynthesis';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Insight } from '@/types/insights';
import insightSyntheses from '@/data/insights.json';
import { logDebug, logError } from '@/utils/logger';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Settings, Eye, EyeOff } from 'lucide-react';

const PublicProfile = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSecureAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPublicProfile(slug);
    }
  }, [slug, user]);

  const fetchPublicProfile = async (publicSlug: string) => {
    try {
      setIsLoading(true);
      logDebug("Fetching public profile for slug:", publicSlug);

      // Get user by public slug
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, is_public, public_name, is_deleted')
        .eq('public_slug', publicSlug)
        .single();

      if (userError || !userData) {
        logError('User not found:', userError);
        setError('Profile not found');
        return;
      }

      // Check if this is a deleted account
      if (userData.is_deleted) {
        setError('This account has been deleted');
        return;
      }

      // Check if this is the profile owner
      const isProfileOwner = user?.id === userData.id;
      setIsOwner(isProfileOwner);

      // If profile is private and user is not the owner
      if (!userData.is_public && !isProfileOwner) {
        setError('This profile is currently private');
        return;
      }

      // Get the latest completed survey for this user
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('id, answers, created_at, updated_at')
        .eq('user_id', userData.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (surveyError) {
        logError('Survey error:', surveyError);
        setError('Error loading survey data');
        return;
      }

      if (!surveyData) {
        // No survey completed yet
        setProfile({
          user: userData,
          survey: null,
          profile: null
        });
        return;
      }

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('scores, insights, actions')
        .eq('survey_id', surveyData.id)
        .maybeSingle();

      if (profileError) {
        logError('Profile data error:', profileError);
        setError('Error loading profile data');
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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center max-w-md">
            {error === 'This profile is currently private' ? (
              <Card className="p-6">
                <CardContent className="space-y-4">
                  <EyeOff className="h-12 w-12 text-gray-400 mx-auto" />
                  <h1 className="text-2xl font-bold text-gray-800">Profile is Private</h1>
                  <p className="text-gray-600">This profile is not publicly visible.</p>
                  {isOwner && (
                    <Button onClick={() => navigate('/settings')} className="mt-4">
                      <Settings className="mr-2 h-4 w-4" />
                      Go to Settings to Make Public
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6">
                <CardContent className="space-y-4">
                  <h1 className="text-2xl font-bold text-gray-800">Profile Not Found</h1>
                  <p className="text-gray-600">{error}</p>
                  <Button onClick={() => navigate('/')}>
                    Return Home
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    );
  }

  // No survey completed yet
  if (!profile?.survey) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center px-4 py-8">
          <div className="text-center max-w-md">
            <Card className="p-6">
              <CardContent className="space-y-4">
                <Eye className="h-12 w-12 text-purple-600 mx-auto" />
                <h1 className="text-2xl font-bold text-gray-800">
                  {profile?.user?.public_name || 'User'}'s Profile
                </h1>
                <p className="text-gray-600">
                  {isOwner 
                    ? "You haven't completed your survey yet! Take your first survey to generate your Current and Future Self snapshots."
                    : "This user hasn't completed their survey yet."
                  }
                </p>
                {isOwner && (
                  <Button onClick={() => navigate('/questionnaire')} className="mt-4">
                    Start Your First Survey
                  </Button>
                )}
                {!isOwner && (
                  <Button onClick={() => navigate('/')} className="mt-4">
                    Discover Your Future
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Convert profile data to the format expected by ChartsSection
  const progress = profile.profile?.scores || { Career: 0, Finances: 0, Health: 0, Connections: 0 };
  const answers = profile.survey?.answers || {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {profile.user?.public_name || 'User'}'s Life View Results
          </h1>
          <p className="text-lg text-gray-600">
            Shared on {new Date(profile.survey.updated_at).toLocaleDateString()}
          </p>
          {isOwner && (
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={() => navigate('/settings')} variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Edit Settings
              </Button>
            </div>
          )}
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

        {!isOwner && (
          <div className="text-center mt-12 p-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Want your own Life View assessment?
            </h3>
            <p className="text-gray-600 mb-4">
              Take the free 5-Year Snapshot questionnaire and get your personalized insights.
            </p>
            <Button onClick={() => navigate('/')} className="inline-flex items-center px-6 py-3">
              Start My Assessment
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicProfile;
