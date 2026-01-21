// Game types for HotSeat app

export type Category = 'Friends' | 'Date' | 'Family' | 'Deep' | 'Funny';

export interface Player {
  _id: string;
  name: string;
  score: number;
}

export interface Question {
  _id: string;
  text: string;
  category: Category;
}

export interface Game {
  _id: string;
  category: Category;
  totalRounds: number;
  currentRound: number;
  players: Player[];
  usedQuestionIds: string[];
  status: 'active' | 'completed';
  winner: string | null;
  createdAt: string;
}

export interface Round {
  _id: string;
  gameId: string;
  roundNumber: number;
  playerId: string;
  playerName: string;
  questionId: string;
  questionText: string;
  points: 1 | 2 | 3;
  createdAt: string;
}

export interface RoundData {
  roundNumber: number;
  totalRounds: number;
  hotSeatPlayer: {
    id: string;
    name: string;
  };
  question: {
    id: string;
    text: string;
  };
  players: Player[];
}

export interface GameHistoryItem {
  id: string;
  category: Category;
  totalRounds: number;
  playerCount: number;
  winner: string;
  date: string;
}

export interface GameSetupData {
  category: Category;
  totalRounds: number;
  players: string[];
}

export interface CategoryInfo {
  category: Category;
  count: number;
}

// Rating options for round completion
export type RatingType = 'amazing' | 'good' | 'ok';

export interface RatingOption {
  type: RatingType;
  emoji: string;
  label: string;
  points: 1 | 2 | 3;
}

export const RATING_OPTIONS: RatingOption[] = [
  { type: 'amazing', emoji: '\uD83D\uDD25', label: 'Amazing', points: 3 },
  { type: 'good', emoji: '\uD83D\uDE0A', label: 'Good', points: 2 },
  { type: 'ok', emoji: '\uD83D\uDE42', label: 'Ok', points: 1 },
];

export const CATEGORIES: { name: Category; icon: string; color: string }[] = [
  { name: 'Friends', icon: 'people', color: '#4CAF50' },
  { name: 'Date', icon: 'heart', color: '#E91E63' },
  { name: 'Family', icon: 'home', color: '#FF9800' },
  { name: 'Deep', icon: 'compass', color: '#673AB7' },
  { name: 'Funny', icon: 'happy', color: '#FFC107' },
];

export const ROUND_OPTIONS = [5, 10];
