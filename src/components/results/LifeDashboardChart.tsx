
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { LifeDashboardChart as LifeDashboardData } from '@/hooks/useGenerateResults';

interface LifeDashboardChartProps {
  data: LifeDashboardData;
}

const PILLAR_COLORS = {
  career: '#8B5CF6',
  health: '#10B981',
  relationships: '#F59E0B',
  personal_growth: '#EF4444'
};

const LifeDashboardChart = ({ data }: LifeDashboardChartProps) => {
  // Transform data for the chart
  const chartData = Object.entries(data).map(([pillar, values]) => ({
    name: pillar.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    creative: values.creative,
    reactive: values.reactive,
    total: values.creative + values.reactive,
    color: PILLAR_COLORS[pillar as keyof typeof PILLAR_COLORS]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-green-600">Creative: {data.creative}%</p>
          <p className="text-red-600">Reactive: {data.reactive}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="total"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LifeDashboardChart;
