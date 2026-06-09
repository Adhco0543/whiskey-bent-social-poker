// Wallet and Bonus Types
export type CurrencyType = 'GC' | 'SC'; // Gold Coins, Sweep Coins

export interface UserWallet {
  userId: string;
  goldCoins: number;
  sweepCoins: number;
}

export interface BonusRecord {
  id: string;
  userId: string;
  type: 'signup' | 'daily_login';
  amount: number;
  currency: CurrencyType;
  claimedAt: Date;
  expiresAt?: Date;
}

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Gameplay Types
export type GameVariant = 'NLH' | 'PLO'; // No-Limit Hold'em, Pot-Limit Omaha

export interface GameSession {
  id: string;
  variant: GameVariant;
  tableName: string;
  stakes: {
    smallBlind: number;
    bigBlind: number;
  };
  maxPlayers: number;
  currentPlayers: number;
  createdAt: Date;
}

// Tournament Types
export interface Tournament {
  id: string;
  name: string;
  variant: GameVariant;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  buyIn: number;
  maxPlayers: number;
  registeredPlayers: number;
  createdAt: Date;
  startTime: Date;
  endTime?: Date;
}
