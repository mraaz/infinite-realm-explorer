
import { useState } from 'react';
import { User, ChevronDown, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import SocialLoginModal from '@/components/SocialLoginModal';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center border-b border-gray-200 no-print">
      <Link to="/" className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/3ed0df40-9d9f-4016-bdba-991ba7a3468c.png" 
          alt="Infinite Life Logo" 
          className="h-7 w-7"
        />
        <span className="text-xl font-semibold text-gray-800">Infinite Life</span>
      </Link>
      
      {isLoggedIn ? (
        // User is logged in - show user info and logout
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">
                {user?.email || user?.name || 'User'}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/results">View Results</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/test-edge-function">Test Edge Function</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        // User is not logged in - show login button
        <Button 
          onClick={() => setLoginModalOpen(true)}
          variant="outline"
          className="flex items-center space-x-1"
        >
          <User className="h-4 w-4" />
          <span>Login</span>
        </Button>
      )}
      
      <SocialLoginModal 
        open={loginModalOpen} 
        onOpenChange={setLoginModalOpen} 
      />
    </header>
  );
};

export default Header;
