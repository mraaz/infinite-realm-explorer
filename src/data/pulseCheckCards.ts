export interface PulseCheckCard {
  id: number;
  category: string;
  tone: 'positive' | 'negative';
  text: string;
}

export const pulseCheckCards: PulseCheckCard[] = [
  { id: 1, category: "Career", tone: "negative", text: "I'm grinding hard... but like, is this even the right ladder?" },
  { id: 2, category: "Career", tone: "negative", text: "I'm busy 24/7 but low-key forgot why I started." },
  { id: 3, category: "Career", tone: "negative", text: "People think I've got leadership vibes. I'm just winging it." },
  { id: 4, category: "Career", tone: "negative", text: "I keep saying I want freedom, then choose stability every time." },
  { id: 5, category: "Career", tone: "negative", text: "Planning? 10/10. Actually doing it? Still buffering." },
  { id: 6, category: "Career", tone: "positive", text: "I'm building something that actually feels like me." },
  { id: 7, category: "Career", tone: "positive", text: "I'm not just busy — I'm intentional now." },
  { id: 8, category: "Career", tone: "positive", text: "I'm finally leading in a way that feels natural." },
  { id: 9, category: "Career", tone: "positive", text: "I've made choices that trade comfort for growth — and I'm good with that." },
  { id: 10, category: "Career", tone: "positive", text: "I used to overthink. Now I just start." },

  { id: 11, category: "Finances", tone: "negative", text: "I make more now, but money still stresses me out." },
  { id: 12, category: "Finances", tone: "negative", text: "Sometimes I spend just to feel a little in control." },
  { id: 13, category: "Finances", tone: "negative", text: "I'm saving, but honestly... for what, exactly?" },
  { id: 14, category: "Finances", tone: "negative", text: "I wanna invest, but the fear of messing up is real." },
  { id: 15, category: "Finances", tone: "negative", text: "Why does 'enough' always feel one paycheck away?" },
  { id: 16, category: "Finances", tone: "positive", text: "I actually feel calm when I check my bank account." },
  { id: 17, category: "Finances", tone: "positive", text: "I spend on things that genuinely make life better." },
  { id: 18, category: "Finances", tone: "positive", text: "My savings have a purpose — and that feels good." },
  { id: 19, category: "Finances", tone: "positive", text: "Investing doesn't scare me anymore — I feel in the game." },
  { id: 20, category: "Finances", tone: "positive", text: "I'm defining what 'enough' means for me, not everyone else." },

  { id: 21, category: "Health", tone: "negative", text: "Caffeine is my coping mechanism and personality trait." },
  { id: 22, category: "Health", tone: "negative", text: "I sleep, but waking up tired is my brand." },
  { id: 23, category: "Health", tone: "negative", text: "I'll focus on my health... once I survive this week." },
  { id: 24, category: "Health", tone: "negative", text: "I know what's good for me. I just... don't do it." },
  { id: 25, category: "Health", tone: "negative", text: "I treat rest like a luxury item, not a necessity." },
  { id: 26, category: "Health", tone: "positive", text: "I have energy — and it's not just from coffee." },
  { id: 27, category: "Health", tone: "positive", text: "Sleep is my new superpower." },
  { id: 28, category: "Health", tone: "positive", text: "I've made space for health without guilt-tripping myself." },
  { id: 29, category: "Health", tone: "positive", text: "I follow through — even when no one's watching." },
  { id: 30, category: "Health", tone: "positive", text: "Rest is part of the plan, not a backup option." },

  { id: 31, category: "Connections", tone: "negative", text: "I've got people around, but still feel kinda solo." },
  { id: 32, category: "Connections", tone: "negative", text: "I'm great at showing up—for everyone but me." },
  { id: 33, category: "Connections", tone: "negative", text: "I want deep convos, but vulnerability? Yikes." },
  { id: 34, category: "Connections", tone: "negative", text: "I miss my people. I just never hit send." },
  { id: 35, category: "Connections", tone: "negative", text: "I'm always there for others, but do they really see me?" },
  { id: 36, category: "Connections", tone: "positive", text: "I feel seen by the people I care about." },
  { id: 37, category: "Connections", tone: "positive", text: "I've been showing up for me too." },
  { id: 38, category: "Connections", tone: "positive", text: "I let people in — and it's actually been great." },
  { id: 39, category: "Connections", tone: "positive", text: "I've been reaching out more — and it feels easy." },
  { id: 40, category: "Connections", tone: "positive", text: "I'm surrounded by people who really get me." }
];

export const keepMessages = [
  "Yeah, that's me!",
  "How did you know?!",
  "Embarrassing but... yes",
  "Felt that in my soul",
  "Oof, called out — keeping it",
  "My therapist would agree",
  "Adding that to my personality",
  "Literally my inner monologue"
];

export const passMessages = [
  "Would be a cold day in...",
  "NEVER. Never. Never. Maybe?",
  "Not in this lifetime",
  "That's not my vibe",
  "Too real. Still no.",
  "This ain't it, chief",
  "I don't claim that energy",
  "Swipe left on that one"
];

export const categoryIconPaths = {
  Career: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2 2v10a2 2 0 002 2z",
  Finances: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01M18 10a6 6 0 11-12 0 6 6 0 0112 0z",
  Health: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  Connections: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
};

export const categoryColors = {
  Career: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    gradient: 'from-purple-500/20 to-purple-600/20'
  },
  Finances: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    gradient: 'from-blue-500/20 to-blue-600/20'
  },
  Health: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    gradient: 'from-emerald-500/20 to-emerald-600/20'
  },
  Connections: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    gradient: 'from-amber-500/20 to-amber-600/20'
  }
};