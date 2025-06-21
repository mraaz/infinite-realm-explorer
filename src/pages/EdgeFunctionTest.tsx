
import React from 'react';
import Header from '@/components/Header';
import EdgeFunctionTest from '@/components/EdgeFunctionTest';

const EdgeFunctionTestPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow">
        <EdgeFunctionTest />
      </main>
    </div>
  );
};

export default EdgeFunctionTestPage;
