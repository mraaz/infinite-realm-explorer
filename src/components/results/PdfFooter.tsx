
import { Rocket } from 'lucide-react';
import React from 'react';

const PdfFooter = () => {
  return (
    <footer className="pdf-only text-center pt-16 pb-4">
      <div className="inline-flex justify-center items-center space-x-2 text-gray-600">
        <Rocket className="h-5 w-5 text-purple-600" />
        <span className="font-semibold">Infinite Game</span>
      </div>
    </footer>
  );
};

export default PdfFooter;
