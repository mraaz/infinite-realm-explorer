
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Loader2, AlertCircle, RefreshCw, FileText, LogIn } from 'lucide-react';
import { useSurveyHistory, SurveyHistoryItem } from '@/hooks/useSurveyHistory';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import SurveyCard from '@/components/profile/SurveyCard';
import ShareModal from '@/components/profile/ShareModal';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isVerified } = useSecureAuth();
  const { surveys, isLoading, isError, refetch } = useSurveyHistory();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyHistoryItem | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);

  const handleShare = (survey: SurveyHistoryItem, imageData?: string) => {
    setSelectedSurvey(survey);
    setImageDataUrl(imageData);
    setShareModalOpen(true);
  };

  const handleViewResults = (surveyId: string) => {
    navigate('/results');
  };

  const handleRetakeSurvey = () => {
    navigate('/questionnaire');
  };

  // Authentication check
  if (!user?.id || !isVerified) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <LogIn className="h-12 w-12 text-purple-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Sign in to view your profile
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Please sign in to access your survey history and results.
            </p>
            <Button onClick={() => navigate('/auth')} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Loading your profile...
            </h2>
            <p className="text-gray-600 text-center max-w-md">
              We're gathering your survey history and results.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Unable to load profile
            </h2>
            <p className="text-gray-600 text-center max-w-md mb-6">
              We encountered an issue while loading your profile. Please try again.
            </p>
            <Button onClick={refetch} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
            <User className="h-10 w-10 text-purple-600" />
            Your Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            View your Life Path journey and share your insights with others.
          </p>
        </div>

        {/* No Surveys State */}
        {surveys.length === 0 ? (
          <Card className="max-w-2xl mx-auto bg-white/60 border border-gray-200/80 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <FileText className="h-6 w-6 text-purple-600" />
                No Life Snapshot Yet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Complete the questionnaire to unlock your insights and start tracking your Life Path journey!
              </p>
              <Button onClick={handleRetakeSurvey} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Take Questionnaire
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Survey History Section */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Life Path Snapshots ({surveys.length})
                </h2>
                <Button onClick={handleRetakeSurvey} variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retake Survey
                </Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {surveys.map((survey) => (
                  <SurveyCard
                    key={survey.id}
                    survey={survey}
                    onShare={handleShare}
                    onViewResults={handleViewResults}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Share Modal */}
        <ShareModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          survey={selectedSurvey}
          imageDataUrl={imageDataUrl}
        />
      </main>
    </div>
  );
};

export default Profile;
