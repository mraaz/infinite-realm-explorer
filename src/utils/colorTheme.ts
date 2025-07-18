
export const INSIGHT_COLORS = {
  orange: {
    name: 'orange',
    stroke: 'stroke-orange-400',
    bg: 'bg-orange-50',
    text: 'text-orange-400',
    border: 'border-t-orange-500'
  },
  blue: {
    name: 'blue',
    stroke: 'stroke-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-400',
    border: 'border-t-blue-500'
  },
  purple: {
    name: 'purple',
    stroke: 'stroke-purple-400',
    bg: 'bg-purple-50',
    text: 'text-purple-400',
    border: 'border-t-purple-500'
  },
  green: {
    name: 'green',
    stroke: 'stroke-green-500',
    bg: 'bg-green-50',
    text: 'text-green-400',
    border: 'border-t-green-500'
  },
  red: {
    name: 'red',
    stroke: 'stroke-red-400',
    bg: 'bg-red-50',
    text: 'text-red-400',
    border: 'border-t-red-500'
  },
  yellow: {
    name: 'yellow',
    stroke: 'stroke-yellow-400',
    bg: 'bg-yellow-50',
    text: 'text-yellow-400',
    border: 'border-t-yellow-500'
  },
  indigo: {
    name: 'indigo',
    stroke: 'stroke-indigo-400',
    bg: 'bg-indigo-50',
    text: 'text-indigo-400',
    border: 'border-t-indigo-500'
  },
  pink: {
    name: 'pink',
    stroke: 'stroke-pink-400',
    bg: 'bg-pink-50',
    text: 'text-pink-400',
    border: 'border-t-pink-500'
  }
} as const;

export type InsightColorKey = keyof typeof INSIGHT_COLORS;

export const getInsightColor = (colorKey: InsightColorKey) => {
  const color = INSIGHT_COLORS[colorKey];
  if (!color) {
    console.warn(`Color "${colorKey}" not found in INSIGHT_COLORS, falling back to purple`);
    return INSIGHT_COLORS.purple;
  }
  return color;
};
