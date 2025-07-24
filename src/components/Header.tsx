// src/components/Header.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Menu } from "lucide-react";
import SocialLoginModal from "@/components/SocialLoginModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { branding } from "@/config/branding";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Header = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  // --- UPDATED: Get completedFutureQuestionnaire from the context ---
  const {
    user,
    isLoggedIn,
    logout,
    hasPulseCheckData,
    hasFutureSelfData,
    completedFutureQuestionnaire, // <-- Get the new flag
    refreshAuthStatus,
  } = useAuth();

  const baseButtonStyle =
    "text-sm rounded-md py-2 px-4 transition-all duration-200";
  const primaryButtonStyle = cn(
    baseButtonStyle,
    "font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
  );
  const secondaryButtonStyle = cn(
    baseButtonStyle,
    "font-medium text-gray-300 border border-gray-700 hover:border-purple-500 hover:text-white"
  );
  const disabledButtonStyle = cn(
    baseButtonStyle,
    "font-medium text-gray-500 border border-gray-800 bg-gray-800/50 cursor-pointer hover:border-gray-700 hover:text-gray-400"
  );

  const mobileBaseStyle = "w-full text-left justify-start py-3 text-base";
  const mobilePrimaryStyle = cn(mobileBaseStyle, primaryButtonStyle);
  const mobileSecondaryStyle = cn(mobileBaseStyle, secondaryButtonStyle);
  const mobileDisabledStyle = cn(mobileBaseStyle, disabledButtonStyle);

  const handleGuestClick = () => {
    setLoginModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleFutureSelfClick = () => {
    if (!isLoggedIn) return handleGuestClick();
    if (hasPulseCheckData) {
      navigate("/future-questionnaire");
    } else {
      toast({
        title: "First things first!",
        description:
          "Please complete your Pulse Check before starting your Future Self journey.",
      });
      navigate("/pulse-check");
    }
    setIsMobileMenuOpen(false);
  };

  const handleResultsClick = async () => {
    if (!isLoggedIn) return handleGuestClick();
    await refreshAuthStatus();
    if (hasPulseCheckData && hasFutureSelfData) {
      navigate("/results");
    } else if (!hasPulseCheckData) {
      toast({
        title: "First things first!",
        description: "Please complete your Pulse Check to see your results.",
      });
      navigate("/pulse-check");
    } else {
      toast({
        title: "Almost there!",
        description:
          "Please complete your Future Self journey to see your results.",
      });
      navigate("/future-questionnaire");
    }
    setIsMobileMenuOpen(false);
  };

  const NavLinks = ({ isMobile = false }) => (
    <>
      <Link
        to="/pulse-check"
        onClick={() => setIsMobileMenuOpen(false)}
        className={cn(
          "inline-flex items-center justify-center",
          isMobile ? mobileBaseStyle : baseButtonStyle,
          isLoggedIn && hasPulseCheckData
            ? isMobile
              ? mobileSecondaryStyle
              : secondaryButtonStyle
            : isMobile
            ? mobilePrimaryStyle
            : primaryButtonStyle
        )}
      >
        {isLoggedIn && hasPulseCheckData ? "Pulse Check" : "Start Pulse Check"}
      </Link>

      <button
        onClick={handleFutureSelfClick}
        className={cn(isMobile ? mobileBaseStyle : baseButtonStyle, {
          [isMobile ? mobilePrimaryStyle : primaryButtonStyle]:
            isLoggedIn && hasPulseCheckData && !hasFutureSelfData,
          [isMobile ? mobileSecondaryStyle : secondaryButtonStyle]:
            isLoggedIn && hasPulseCheckData && hasFutureSelfData,
          [isMobile ? mobileDisabledStyle : disabledButtonStyle]:
            !isLoggedIn || !hasPulseCheckData,
        })}
      >
        {isLoggedIn && hasFutureSelfData ? "Future Self" : "Start Future Self"}
      </button>

      <button
        onClick={handleResultsClick}
        className={cn(isMobile ? mobileBaseStyle : baseButtonStyle, {
          [isMobile ? mobileSecondaryStyle : secondaryButtonStyle]:
            isLoggedIn && hasPulseCheckData && hasFutureSelfData,
          [isMobile ? mobileDisabledStyle : disabledButtonStyle]:
            !isLoggedIn || !hasPulseCheckData || !hasFutureSelfData,
        })}
      >
        Results
      </button>

      {/* --- NEW: SDS Button, conditionally rendered --- */}
      {isLoggedIn && completedFutureQuestionnaire && (
        <Link
          to="/self-discovery-summary"
          onClick={() => setIsMobileMenuOpen(false)}
          className={cn(
            "inline-flex items-center justify-center",
            isMobile ? mobileSecondaryStyle : secondaryButtonStyle
          )}
        >
          SDS
        </Link>
      )}
    </>
  );

  return (
    <>
      <header className="relative py-6 px-6 md:px-10 flex justify-between items-center z-20 bg-[#16161a]">
        <div className="flex items-center space-x-8">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center space-x-2 text-xl font-bold text-white hover:text-purple-400 transition-colors duration-200"
          >
            <img
              src={branding.logo.url}
              alt={branding.logo.alt}
              className="w-6 h-6"
            />
            <span>{branding.name}</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            <NavLinks />
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full border border-gray-600 hover:border-purple-500 text-white hover:bg-gray-800 transition-colors duration-200"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-gray-900 border-gray-700"
              >
                <DropdownMenuLabel className="text-gray-300">
                  {user?.name || user?.email || "User"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-300 hover:bg-gray-800 hover:text-red-400 cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="border border-gray-600 hover:border-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Login
            </button>
          )}

          <div className="md:hidden">
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              variant="ghost"
              className="h-10 w-10 p-0 text-white hover:text-purple-400"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <nav className="absolute top-[92px] left-0 right-0 w-full bg-[#16161a] p-4 pb-6 flex flex-col space-y-4 md:hidden z-10 border-b border-gray-800 shadow-lg">
          <NavLinks isMobile={true} />
        </nav>
      )}

      <SocialLoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
      />
    </>
  );
};

export default Header;
