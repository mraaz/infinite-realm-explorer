
import { Rocket, User, ChevronDown } from 'lucide-react';
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
    <header className="py-4 px-6 md:px-10 flex justify-between items-center border-b border-gray-200 no-print">
      <Link to="/" className="flex items-center space-x-2">
        <Rocket className="h-7 w-7 text-purple-600" />
        <span className="text-xl font-semibold text-gray-800">Infinite Game</span>
      </Link>
      
      {user ? (
        <UserMenu />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-1">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">Sign In</span>
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSocialLogin('google')}>
              Continue with Google
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSocialLogin('facebook')}>
              Continue with Facebook
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};

export default Header;
