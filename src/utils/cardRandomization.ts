import { PulseCheckCard } from "@/data/pulseCheckCards";

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get one card per category for initial presentation (any tone)
export function getInitialCategoryCards(
  cards: PulseCheckCard[]
): PulseCheckCard[] {
  const categories = ["Career", "Finances", "Health", "Connections"];
  const initialCards: PulseCheckCard[] = [];
  const usedCardIds = new Set<number>(); // Track used card IDs to prevent duplicates

  categories.forEach((category) => {
    // Filter cards for the current category that haven't been used yet
    const categoryCards = cards.filter(
      (card) => card.category === category && !usedCardIds.has(card.id)
    );
    if (categoryCards.length > 0) {
      // Randomly select one card from this category (any tone)
      const randomIndex = Math.floor(Math.random() * categoryCards.length);
      const selectedCard = categoryCards[randomIndex];
      initialCards.push(selectedCard);
      usedCardIds.add(selectedCard.id);
    }
  });

  return initialCards;
}

// Get remaining cards (excluding the selected initial cards) and shuffle them
export function getRemainingShuffledCards(
  allCards: PulseCheckCard[],
  usedCards: PulseCheckCard[]
): PulseCheckCard[] {
  const usedIds = new Set(usedCards.map((card) => card.id));
  const remainingCards = allCards.filter((card) => !usedIds.has(card.id));
  return shuffleArray(remainingCards);
}

// Check if minimum category requirements are met (e.g., at least one 'keep' per category)
export function canShowResults(
  answers: { [key: number]: "keep" | "pass" },
  cards: PulseCheckCard[]
): boolean {
  const categories = ["Career", "Finances", "Health", "Connections"];

  return categories.every((category) => {
    const categoryCards = cards.filter((card) => card.category === category);
    return categoryCards.some((card) => answers[card.id] === "keep");
  });
}

// Get category completion status (how many questions answered vs. total per category)
export function getCategoryCompletion(
  answers: { [key: number]: "keep" | "pass" },
  cards: PulseCheckCard[]
): { [category: string]: { completed: number; total: number } } {
  const categories = ["Career", "Finances", "Health", "Connections"];
  const completion: {
    [category: string]: { completed: number; total: number };
  } = {
    Career: { completed: 0, total: 0 },
    Finances: { completed: 0, total: 0 },
    Health: { completed: 0, total: 0 },
    Connections: { completed: 0, total: 0 },
  };

  cards.forEach((card) => {
    // Iterate through all cards to get total
    if (completion[card.category]) {
      completion[card.category].total++;
      if (answers[card.id]) {
        // Check if answered
        completion[card.category].completed++;
      }
    }
  });

  return completion;
}
