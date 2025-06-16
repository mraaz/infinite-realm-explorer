
export const INSIGHT_COLORS = {
  orange: {
    name: 'orange',
    stroke: 'stroke-orange-400',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200'
  },
  blue: {
    name: 'blue',
    stroke: 'stroke-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  purple: {
    name: 'purple',
    stroke: 'stroke-purple-400',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  green: {
    name: 'green',
    stroke: 'stroke-green-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200'
  },
  red: {
    name: 'red',
    stroke: 'stroke-red-400',
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200'
  },
  yellow: {
    name: 'yellow',
    stroke: 'stroke-yellow-400',
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  indigo: {
    name: 'indigo',
    stroke: 'stroke-indigo-400',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200'
  },
  pink: {
    name: 'pink',
    stroke: 'stroke-pink-400',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200'
  }
} as const;

export type InsightColorKey = keyof typeof INSIGHT_COLORS;

export const getInsightColor = (colorKey: InsightColorKey) => {
  return INSIGHT_COLORS[colorKey];
};
