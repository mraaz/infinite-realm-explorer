
import React from 'react';
import { ArrowRight, Brain, Target, Users, Zap } from 'lucide-react';

const Landing = () => {
  const handleStartPulseCheck = () => {
    window.location.href = '/pulse-check';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Life Path Pulse Check
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Discover your balance across the four key areas of life: Career, Finances, Health, and Connections. 
            Get AI-powered insights to guide your next steps.
          </p>
          <button
            onClick={handleStartPulseCheck}
            className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3 mx-auto"
          >
            Start Your Pulse Check
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-400">Get personalized analysis of your life balance with advanced AI technology.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Four Key Areas</h3>
            <p className="text-gray-400">Focus on Career, Finances, Health, and Connections for holistic growth.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick & Easy</h3>
            <p className="text-gray-400">Complete your assessment in just a few minutes with our intuitive interface.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Share & Compare</h3>
            <p className="text-gray-400">Share your results with friends and see how you compare across different areas.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to discover your path?</h2>
          <p className="text-gray-300 mb-6">
            Join thousands who have gained clarity about their life direction through our comprehensive assessment.
          </p>
          <button
            onClick={handleStartPulseCheck}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Take Your Pulse Check Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
