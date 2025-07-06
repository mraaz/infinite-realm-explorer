import React from 'react';
import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarChartProps {
  scores: {
    Career: number;
    Finances: number;
    Health: number;
    Connections: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({ scores }) => {
  const data = [
    {
      category: 'Career',
      score: scores.Career,
    },
    {
      category: 'Finances',
      score: scores.Finances,
    },
    {
      category: 'Health',
      score: scores.Health,
    },
    {
      category: 'Connections',
      score: scores.Connections,
    },
  ];

  return (
    <div className="w-full h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fontSize: 12, fill: '#d1d5db' }}
            className="text-gray-300"
          />
          <PolarRadiusAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickCount={5}
            angle={90}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#ffffff' }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;