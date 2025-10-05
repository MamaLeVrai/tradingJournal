import { create } from 'zustand';
import { Trade } from './types';
import { aggregate, globalStats } from './stats';

interface JournalState {
  trades: Trade[];
  addTrade: (t: Omit<Trade,'id'>) => void;
  removeTrade: (id: string) => void;
  loadFromJSON: (json: string) => void;
  filters: Partial<{
    year: number;
    month: string;
    asset: string;
    trader: string;
    side: Trade['side'];
    resultLabel: Trade['resultLabel'];
    profile: string;
  }>;
  setFilter: (k: keyof JournalState['filters'], v: any)=> void;
  clearFilters: ()=> void;
  activeProfile?: string;
  setActiveProfile: (p?: string)=> void;
}

const STORAGE_KEY = 'trading-journal-trades-v1';

function loadInitial(): Trade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

export const useJournal = create<JournalState>((set,get)=>({
  trades: loadInitial(),
  filters: {},
  setFilter: (k,v)=> set(state=> ({ filters: { ...state.filters, [k]: v } })),
  clearFilters: ()=> set(()=> ({ filters: {} })),
  activeProfile: undefined,
  setActiveProfile: (p)=> set(()=> ({ activeProfile: p })),
  addTrade: (t) => set(state => {
    const trade: Trade = { id: crypto.randomUUID(), ...t, rMultiple: (t.risk && t.risk!==0)? t.profit / t.risk : t.rMultiple };
    const trades = [...state.trades, trade];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    return { trades };
  }),
  removeTrade: (id) => set(state => {
    const trades = state.trades.filter(t=> t.id!==id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
    return { trades };
  }),
  loadFromJSON: (json) => set(()=> {
    try {
      const trades: Trade[] = JSON.parse(json).map((t: any)=> ({
        ...t,
        year: t.year ?? (t.date? Number(t.date.slice(0,4)) : new Date().getFullYear()),
        rMultiple: t.rMultiple ?? (t.risk? (t.profit / t.risk) : undefined)
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
      return { trades };
    } catch { return {}; }
  })
}));

export function useDerived(){
  const { trades, filters, activeProfile } = useJournal();
  const filtered = trades.filter(t=> {
    if(activeProfile && t.profile !== activeProfile) return false;
    if(filters.year && t.year !== filters.year) return false;
    if(filters.month && t.month !== filters.month) return false;
    if(filters.asset && t.asset !== filters.asset) return false;
    if(filters.trader && t.trader !== filters.trader) return false;
    if(filters.side && t.side !== filters.side) return false;
    if(filters.resultLabel && t.resultLabel !== filters.resultLabel) return false;
    if(filters.profile && t.profile !== filters.profile) return false;
    return true;
  });
  const agg = aggregate(filtered);
  const g = globalStats(filtered);
  return { trades: filtered, agg, global: g, totalAll: trades.length };
}
