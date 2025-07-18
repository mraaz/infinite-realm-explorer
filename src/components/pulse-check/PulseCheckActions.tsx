import React, { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DownloadPdfButton from "./DownloadPdfButton";
import ShareButton from "./ShareButton";
import PulseCheckLoginModal from "./PulseCheckLoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { isGuestMode } from "@/utils/guestUtils"; // Import isGuestMode

interface PulseCheckActionsProps {
  data: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const PulseCheckActions = ({ data }: PulseCheckActionsProps) => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user, isLoggedIn } = useAuth(); // Destructure isLoggedIn from useAuth

  // Pass isLoggedIn to isGuestMode
  const isGuest = isGuestMode(isLoggedIn);

  const isAuthenticated = isLoggedIn && !isGuest; // Revert to robust check

  const handleMagicLinkClick = () => {
    // For guests, open login modal
    if (!isAuthenticated) {
      // This condition will now correctly check if the user is truly unauthenticated/a guest
      setLoginModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4 mt-8">
        {/* Two main action buttons */}
        <div className="flex flex-col w-full max-w-sm space-y-3">
          {/* New Future Self Button */}
          <Button
            onClick={() => (window.location.href = "/future-questionnaire")} // Simple redirect for now
            variant="outline"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 hover:scale-105 font-semibold"
          >
            Proceed to Future Self
          </Button>

          {/* Create Magic Link Button - direct ShareButton for authenticated users */}
          {isAuthenticated ? (
            <ShareButton data={data} />
          ) : (
            <Button
              onClick={handleMagicLinkClick}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transition-all duration-300 hover:scale-105 font-semibold"
            >
              <Share2 size={18} className="mr-2" />
              Create Magic Link
            </Button>
          )}
        </div>

        {/* Description text under Magic Link button */}
        <p className="text-center text-sm text-gray-400 max-w-sm leading-relaxed">
          Thriving or surviving? Share your Pulse Check and see how your friends
          stack up.
        </p>
      </div>

      {/* Login Modal for Guests */}
      <PulseCheckLoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        pulseCheckData={data}
        // Pass the desired return URL explicitly
        returnPathAfterAuth="/pulse-check"
      />
    </>
  );
};

export default PulseCheckActions;
