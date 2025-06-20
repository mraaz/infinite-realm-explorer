
import { User, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserMenu } from '@/components/auth/UserMenu';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Chrome, Facebook } from 'lucide-react';

const Header = () => {
  const { user, signInWithProvider } = useSecureAuth();
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const { error } = await signInWithProvider(provider);
    if (!error) {
      navigate('/');
    }
  };

  return (
    <header className="py-4 px-6 md:px-10 flex justify-between items-center border-b border-gray-200 no-print bg-white">
      <Link to="/" className="flex items-center space-x-2">
        <img 
          src="/lovable-uploads/c07423f4-cecb-441f-b13c-cfa9ccd53394.png" 
          alt="Infinite Game Logo" 
          className="h-8 w-8 md:h-10 md:w-10"
        />
        <span className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Infinite Game
        </span>
      </Link>
      
      {user ? (
        <UserMenu />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1 text-sm md:text-base">
              <User className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              <span className="text-gray-600 hidden sm:inline">Sign In</span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleSocialLogin('google')} className="cursor-pointer">
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSocialLogin('facebook')} className="cursor-pointer">
              <Facebook className="mr-2 h-4 w-4" />
              Continue with Facebook
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default Header;
