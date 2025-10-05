export type TradeSide = 'BUY' | 'SELL';

export interface Trade {
  id: string;
  trader: string; // qui
  asset: string; // actifs
  date: string; // ISO date YYYY-MM-DD
  time?: string; // HH:mm
  year: number; // année (ex: 2025)
  month: string; // mois (ex: 'octobre')
  dayOfWeek: string; // lundi, mardi, etc
  side: TradeSide; // buy/sell
  resultLabel?: 'gagnant' | 'perdant';
  profit: number; // valeur monétaire
  capitalPct: number; // pourcentage du capital (ex 1.5 => 1.5%)
  risk?: number; // risque engagé (même unité que profit)
  rMultiple?: number; // profit / risk
  comment?: string;
  profile?: string; // portefeuille / profil
}

export interface AggregatedDayStats {
  dayOfWeek: string;
  profit: number;
  capitalPct: number;
  winRate: number; // 0..1
  winners: number;
  losers: number;
  total: number;
  buys: number;
  sells: number;
}

export interface AggregatedMonthStats {
  month: string;
  profit: number;
  capitalPct: number;
  winRate: number;
  winners: number;
  losers: number;
  buys: number;
  sells: number;
  total: number;
}

export interface AggregatedYearStats {
  year: number;
  profit: number;
  capitalPct: number;
  winRate: number;
  winners: number;
  losers: number;
  buys: number;
  sells: number;
  total: number;
}

export interface AggregatedAssetStats {
  asset: string;
  profit: number;
  capitalPct: number;
  winRate: number;
  winners: number;
  losers: number;
  total: number;
}

export interface AggregatedTraderStats {
  trader: string;
  profit: number;
  capitalPct: number;
  winRate: number;
  winners: number;
  losers: number;
  total: number;
}

export interface EquityPoint { date: string; equity: number; }
