
import { ReactNode } from 'react';
import Header from '@/components/Header';

interface QuestionnaireLayoutProps {
  children: ReactNode;
}

const QuestionnaireLayout = ({ children }: QuestionnaireLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
};

export default QuestionnaireLayout;
