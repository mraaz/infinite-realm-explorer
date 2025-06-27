
/*
================================================================================
File: /components/Header.tsx
================================================================================
- Updated to show profile icon dropdown for logged-in users
- Kept Login button for logged-out users
- Added dropdown menu with user email and logout option
- Updated to use centralized logo configuration
*/
import { useState } from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import SocialLoginModal from "@/components/SocialLoginModal";
import { useAuth } from "@/contexts/AuthContext";
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

const Header = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <>
      <header className="py-6 px-6 md:px-10 flex justify-between items-center">
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
            className="border border-gray-600 hover:border-purple-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"
              />
              <path
                fillRule="evenodd"
                d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"
              />
            </svg>
            <span>Login</span>
          </button>
        )}
      </header>

      {/* The modal is now a sibling to the header, not a child */}
      <SocialLoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
      />
    </>
  );
};

export default Header;
