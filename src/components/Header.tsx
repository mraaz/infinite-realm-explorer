/*
================================================================================
File: /components/Header.tsx
================================================================================
- This is the corrected version of the Header component.
- The <SocialLoginModal /> has been moved outside the <header> element
  to prevent Flexbox layout conflicts.
- A React Fragment <>...</> is used to wrap both components.
*/
import { useState } from "react";
import { Link } from "react-router-dom";
import { Infinity } from "lucide-react";
import SocialLoginModal from "@/components/SocialLoginModal";
import { useAuth } from "@/contexts/AuthContext";

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
          <Infinity className="w-6 h-6" />
          <span>Infinite Life</span>
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">
              {user?.email || "User"}
            </span>
            <button
              onClick={logout}
              className="border border-gray-600 hover:border-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Logout</span>
            </button>
          </div>
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
