
import Header from '@/components/Header';
import PillarCard from '@/components/PillarCard';
import CallToActionSection from '@/components/CallToActionSection';
import { Target, PiggyBank, Heart, Users } from 'lucide-react';

const pillars = [
  {
    icon: Target,
    title: 'Career',
    description: 'Professional growth & goals',
    borderColorClass: 'border-purple-500',
    iconColorClass: 'text-purple-600',
  },
  {
    icon: PiggyBank,
    title: 'Finances',
    description: 'Wealth & financial security',
    borderColorClass: 'border-blue-500',
    iconColorClass: 'text-blue-600',
  },
  {
    icon: Heart,
    title: 'Health',
    description: 'Physical & mental wellbeing',
    borderColorClass: 'border-green-500',
    iconColorClass: 'text-green-600',
  },
  {
    icon: Users,
    title: 'Connections',
    description: 'Relationships & community',
    borderColorClass: 'border-orange-500',
    iconColorClass: 'text-orange-600',
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-20">
        <section className="text-center mb-12 md:mb-16 lg:mb-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 md:mb-6">
            Discover Your <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">5-Year Future</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Get a personalised snapshot of where your life is heading. Our AI
            analyses your current situation across four key pillars to project your
            path forward.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16 lg:mb-24">
          {pillars.map((pillar) => (
            <PillarCard
              key={pillar.title}
              icon={pillar.icon}
              title={pillar.title}
              description={pillar.description}
              borderColorClass={pillar.borderColorClass}
              iconColorClass={pillar.iconColorClass}
            />
          ))}
        </section>

        <section>
          <CallToActionSection />
        </section>
      </main>
      <footer className="text-center py-4 md:py-6 text-sm text-gray-500 border-t border-gray-200 bg-white">
        © {new Date().getFullYear()} Infinite Game. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
