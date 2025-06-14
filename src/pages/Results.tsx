import { useState } from 'react';
import Header from '@/components/Header';
import { Share2, Download } from 'lucide-react';
import { NewQuadrantChart, PillarProgress } from '@/components/NewQuadrantChart';
import { Link } from 'react-router-dom';

const Results = () => {
  // Mock data based on the image for placeholder content
  const insightSyntheses = [
    {
      title: "The Burnout Risk",
      description: "Your profile shows a pattern of high professional output (e.g., 55 hours/week) combined with low personal energy reserves. This is a classic indicator of potential burnout, where performance is sustained at the cost of personal wellbeing."
    },
    {
      title: "The Anxious Saver",
      description: "Your profile shows excellent saving habits, which is a ripper strength. However, this is paired with low confidence about your financial future. This suggests your financial stress may be linked to your mindset or overall plan, rather than your actions."
    },
    {
      title: "Social Battery Drain",
      description: "Your profile indicates you are spending a fair dinkum amount of time in social situations, but your sense of true belonging and connection remains low. This pattern can often lead to feeling drained rather than energised by your social life."
    },
    {
      title: "Untapped Support System",
      description: "Your strong sense of connection is a powerful asset. Your profile suggests you are facing significant stress in your career or finances, but you have a bonza support system you can lean on to navigate these challenges."
    }
  ];

  const [activePillar, setActivePillar] = useState<string | undefined>(undefined);

  const progress: PillarProgress = {
    basics: 75,
    career: 80,
    financials: 60,
    health: 90,
    connections: 70,
  };

  const handlePillarClick = (pillar: string) => {
    setActivePillar(current => (current === pillar ? undefined : pillar));
  };
  
  const answers = {};

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
            G'day, Marc Raaz!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Here's your personalised Life View - a deep dive into the patterns shaping your future.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Current Self</h2>
            <div className="h-96 flex items-center justify-center rounded-lg">
              <NewQuadrantChart 
                progress={progress}
                answers={answers}
                onPillarClick={handlePillarClick}
                activePillar={activePillar}
              />
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/80">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Future Self</h2>
            <div className="h-96 flex flex-col items-center justify-center rounded-lg">
                <NewQuadrantChart 
                  progress={progress}
                  answers={answers}
                  isFuture={true}
                />
                <Link 
                  to="/future-questionnaire" 
                  state={{ progress }}
                  className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Let's chat about the future
                </Link>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Insight Synthesis</h2>
          <p className="text-lg text-gray-600 text-center mb-8">Patterns spotted from your responses</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insightSyntheses.map((insight, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/80">
                  <h3 className="font-bold text-gray-800 mb-2 text-lg">Observation: {insight.title}</h3>
                  <p className="text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/80 mb-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Future Self Architect</h2>
            <p className="text-gray-600 mb-4">Goals are fleeting, but your identity is who you are. Instead of setting a target, let's define the identity of your future self and build the systems that make success inevitable.</p>
            <div className="bg-gray-100/50 p-4 rounded-lg">
                <p className="font-semibold text-gray-700">Ready to design your future identity?</p>
                <p className="text-gray-600 text-sm mb-4">Create a personalised identity system based on your main focus area that will help you achieve your goals through consistent habits and mindset shifts.</p>
                <button className="bg-gray-200 text-gray-800 w-full text-left p-3 rounded-lg hover:bg-gray-300 transition font-semibold flex justify-between items-center">
                    <span>Design Your Future Self</span>
                    <span>&rarr;</span>
                </button>
            </div>
        </section>
        
        <section className="flex flex-col sm:flex-row justify-center items-center gap-4">
           <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition w-full sm:w-auto justify-center">
             <Share2 size={18} />
             Share My Life View
           </button>
           <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition w-full sm:w-auto justify-center">
             <Download size={18} />
             Download Full Report
           </button>
        </section>
      </main>
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200/80 mt-8">
        © {new Date().getFullYear()} Infinite Game. All rights reserved.
      </footer>
    </div>
  );
};

export default Results;
