
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoginButton } from './LoginButton';
import { useAuth } from '@/context/AuthContext';

export const LoginWindow: React.FC = () => {
  const { closeLoginModal, handleLoginSuccess } = useAuth();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/c07423f4-cecb-441f-b13c-cfa9ccd53394.png" 
              alt="Infinite Game Logo" 
              className="h-12 w-12 md:h-16 md:w-16"
            />
          </div>
          
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Save Your Progress?
          </h1>
          
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            You're making great progress! Would you like to save your results so far? 
            This way you can come back anytime and pick up where you left off.
          </p>
          
          <div className="space-y-3">
            <LoginButton
              provider="google"
              onAuthSuccess={handleLoginSuccess}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors py-3 text-sm md:text-base"
            />
            <LoginButton
              provider="facebook"
              onAuthSuccess={handleLoginSuccess}
              className="w-full bg-[#1877F2] text-white hover:bg-[#166FE5] transition-colors py-3 text-sm md:text-base"
            />
            <LoginButton
              provider="discord"
              onAuthSuccess={handleLoginSuccess}
              className="w-full bg-[#5865F2] text-white hover:bg-[#4752C4] transition-colors py-3 text-sm md:text-base"
            />
          </div>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={closeLoginModal}
            className="w-full text-gray-600 hover:text-gray-800 text-sm md:text-base"
          >
            Continue without saving
          </Button>
        </div>
      </div>
    </div>
  );
};
