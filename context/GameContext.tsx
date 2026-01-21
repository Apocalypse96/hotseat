import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  Category,
  Player,
  Game,
  RoundData,
  GameSetupData,
} from '@/types/game';

// State interface
interface GameState {
  // Setup phase
  setupData: GameSetupData;

  // Active game
  currentGame: Game | null;
  currentRound: RoundData | null;

  // Loading and error states
  isLoading: boolean;
  error: string | null;
}

// Action types
type GameAction =
  | { type: 'SET_CATEGORY'; payload: Category }
  | { type: 'SET_ROUNDS'; payload: number }
  | { type: 'SET_PLAYERS'; payload: string[] }
  | { type: 'ADD_PLAYER'; payload: string }
  | { type: 'REMOVE_PLAYER'; payload: number }
  | { type: 'UPDATE_PLAYER'; payload: { index: number; name: string } }
  | { type: 'SET_GAME'; payload: Game }
  | { type: 'SET_ROUND'; payload: RoundData }
  | { type: 'UPDATE_PLAYER_SCORE'; payload: { playerId: string; points: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_GAME' }
  | { type: 'RESET_SETUP' };

// Initial state
const initialState: GameState = {
  setupData: {
    category: 'Friends',
    totalRounds: 5,
    players: ['', ''],
  },
  currentGame: null,
  currentRound: null,
  isLoading: false,
  error: null,
};

// Reducer
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CATEGORY':
      return {
        ...state,
        setupData: { ...state.setupData, category: action.payload },
      };

    case 'SET_ROUNDS':
      return {
        ...state,
        setupData: { ...state.setupData, totalRounds: action.payload },
      };

    case 'SET_PLAYERS':
      return {
        ...state,
        setupData: { ...state.setupData, players: action.payload },
      };

    case 'ADD_PLAYER':
      if (state.setupData.players.length >= 8) return state;
      return {
        ...state,
        setupData: {
          ...state.setupData,
          players: [...state.setupData.players, action.payload],
        },
      };

    case 'REMOVE_PLAYER':
      if (state.setupData.players.length <= 2) return state;
      return {
        ...state,
        setupData: {
          ...state.setupData,
          players: state.setupData.players.filter((_, i) => i !== action.payload),
        },
      };

    case 'UPDATE_PLAYER':
      const updatedPlayers = [...state.setupData.players];
      updatedPlayers[action.payload.index] = action.payload.name;
      return {
        ...state,
        setupData: { ...state.setupData, players: updatedPlayers },
      };

    case 'SET_GAME':
      return {
        ...state,
        currentGame: action.payload,
        error: null,
      };

    case 'SET_ROUND':
      return {
        ...state,
        currentRound: action.payload,
        error: null,
      };

    case 'UPDATE_PLAYER_SCORE':
      if (!state.currentGame) return state;
      return {
        ...state,
        currentGame: {
          ...state.currentGame,
          players: state.currentGame.players.map((player) =>
            player._id === action.payload.playerId
              ? { ...player, score: player.score + action.payload.points }
              : player
          ),
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'RESET_GAME':
      return {
        ...state,
        currentGame: null,
        currentRound: null,
        error: null,
      };

    case 'RESET_SETUP':
      return {
        ...state,
        setupData: initialState.setupData,
        currentGame: null,
        currentRound: null,
        error: null,
      };

    default:
      return state;
  }
}

// Context
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;

  // Helper methods
  setCategory: (category: Category) => void;
  setRounds: (rounds: number) => void;
  addPlayer: () => void;
  removePlayer: (index: number) => void;
  updatePlayer: (index: number, name: string) => void;
  setGame: (game: Game) => void;
  setRound: (round: RoundData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetGame: () => void;
  resetSetup: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider
interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const value: GameContextType = {
    state,
    dispatch,

    setCategory: (category) => dispatch({ type: 'SET_CATEGORY', payload: category }),
    setRounds: (rounds) => dispatch({ type: 'SET_ROUNDS', payload: rounds }),
    addPlayer: () => dispatch({ type: 'ADD_PLAYER', payload: '' }),
    removePlayer: (index) => dispatch({ type: 'REMOVE_PLAYER', payload: index }),
    updatePlayer: (index, name) =>
      dispatch({ type: 'UPDATE_PLAYER', payload: { index, name } }),
    setGame: (game) => dispatch({ type: 'SET_GAME', payload: game }),
    setRound: (round) => dispatch({ type: 'SET_ROUND', payload: round }),
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    resetGame: () => dispatch({ type: 'RESET_GAME' }),
    resetSetup: () => dispatch({ type: 'RESET_SETUP' }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
