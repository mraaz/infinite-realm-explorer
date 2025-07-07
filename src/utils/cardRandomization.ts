
import { PulseCheckCard } from '@/data/pulseCheckCards';

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get one positive card per category for initial presentation
export function getInitialPositiveCards(cards: PulseCheckCard[]): PulseCheckCard[] {
  const categories = ['Career', 'Finances', 'Health', 'Connections'];
  const positiveCards: PulseCheckCard[] = [];
  
  categories.forEach(category => {
    const categoryPositiveCards = cards.filter(
      card => card.category === category && card.tone === 'positive'
    );
    if (categoryPositiveCards.length > 0) {
      // Randomly select one positive card from this category
      const randomIndex = Math.floor(Math.random() * categoryPositiveCards.length);
      positiveCards.push(categoryPositiveCards[randomIndex]);
    }
  });
  
  return positiveCards;
}

// Get remaining cards (excluding the selected positive cards) and shuffle them
export function getRemainingShuffledCards(
  allCards: PulseCheckCard[],
  usedCards: PulseCheckCard[]
): PulseCheckCard[] {
  const usedIds = new Set(usedCards.map(card => card.id));
  const remainingCards = allCards.filter(card => !usedIds.has(card.id));
  return shuffleArray(remainingCards);
}

// Check if minimum category requirements are met
export function canShowResults(
  answers: { [key: number]: 'keep' | 'pass' },
  cards: PulseCheckCard[]
): boolean {
  const categories = ['Career', 'Finances', 'Health', 'Connections'];
  
  return categories.every(category => {
    const categoryCards = cards.filter(card => card.category === category);
    return categoryCards.some(card => 
      answers[card.id] === 'keep'
    );
  });
}

// Get category completion status
export function getCategoryCompletion(
  answers: { [key: number]: 'keep' | 'pass' },
  cards: PulseCheckCard[]
): { [category: string]: boolean } {
  const categories = ['Career', 'Finances', 'Health', 'Connections'];
  const completion: { [category: string]: boolean } = {};
  
  categories.forEach(category => {
    const categoryCards = cards.filter(card => card.category === category);
    completion[category] = categoryCards.some(card => 
      answers[card.id] === 'keep'
    );
  });
  
  return completion;
}
