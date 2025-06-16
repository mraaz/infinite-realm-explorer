
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/Icon';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PillarSelectionProps {
  onNext: (data: { pillar: string }) => void;
}

const pillars = [
  { id: 'career', name: 'Career', icon: 'career', color: 'from-blue-500 to-blue-600' },
  { id: 'financials', name: 'Financials', icon: 'financials', color: 'from-green-500 to-green-600' },
  { id: 'health', name: 'Health', icon: 'health', color: 'from-red-500 to-red-600' },
  { id: 'connections', name: 'Connections', icon: 'connections', color: 'from-purple-500 to-purple-600' },
] as const;

const PillarSelection = ({ onNext }: PillarSelectionProps) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/results');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
      
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Choose Your Focus Pillar
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Which area of your life do you want to build a new system for?
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <Card
              key={pillar.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => onNext({ pillar: pillar.id })}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${pillar.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon name={pillar.icon} className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{pillar.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PillarSelection;
