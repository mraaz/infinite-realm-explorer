
import React from 'react';

interface ResultsHeaderProps {
  userName?: string;
}

const ResultsHeader = ({ userName }: ResultsHeaderProps) => {
  return (
    <section className="text-center mb-12">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
        G'day, {userName || 'there'}!
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Here's your personalised Life View - a deep dive into the patterns shaping your future.
      </p>
    </section>
  );
};

export default ResultsHeader;
