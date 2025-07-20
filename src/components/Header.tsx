// src/components/Header.tsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoggedIn, logout, hasPulseCheckData, hasFutureSelfData } =
    useAuth();

  // --- STYLES: Define styles for the navigation buttons ---
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

  // --- LOGIC: Handlers for guided navigation ---
  const handleFutureSelfClick = () => {
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
  };

  const handleResultsClick = () => {
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
  };

  return (
    <>
      <header className="py-6 px-6 md:px-10 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link
            to="/"
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
            {isLoggedIn && (
              <>
                {/* Pulse Check Button - Always links directly */}
                <Link
                  to="/pulse-check"
                  className={cn(
                    hasPulseCheckData
                      ? secondaryButtonStyle
                      : primaryButtonStyle
                  )}
                >
                  {hasPulseCheckData ? "Pulse Check" : "Start Pulse Check"}
                </Link>

                {/* Future Self Button - Uses guided logic */}
                <button
                  onClick={handleFutureSelfClick}
                  className={cn({
                    [primaryButtonStyle]:
                      hasPulseCheckData && !hasFutureSelfData,
                    [secondaryButtonStyle]:
                      hasPulseCheckData && hasFutureSelfData,
                    [disabledButtonStyle]: !hasPulseCheckData,
                  })}
                >
                  {hasFutureSelfData ? "Future Self" : "Start Future Self"}
                </button>

                {/* Results Button - Uses guided logic */}
                <button
                  onClick={handleResultsClick}
                  className={cn({
                    [secondaryButtonStyle]:
                      hasPulseCheckData && hasFutureSelfData,
                    [disabledButtonStyle]:
                      !hasPulseCheckData || !hasFutureSelfData,
                  })}
                >
                  Results
                </button>
              </>
            )}
          </nav>
        </div>

        {/* User profile dropdown or Login button */}
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
                onClick={logout}
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
      </header>
      <SocialLoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
      />
    </>
  );
};

export default Header;
