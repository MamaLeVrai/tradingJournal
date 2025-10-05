import { Trade, AggregatedDayStats, AggregatedMonthStats, AggregatedAssetStats, AggregatedTraderStats, EquityPoint, AggregatedYearStats } from './types';

const monthOrder = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];

export function aggregate(trades: Trade[]) {
  return {
    days: aggregateDays(trades),
    months: aggregateMonths(trades),
  years: aggregateYears(trades),
    assets: aggregateAssets(trades),
    traders: aggregateTraders(trades),
    equity: buildEquity(trades)
  };
}

function aggregateDays(trades: Trade[]): AggregatedDayStats[] {
  const map: Record<string, AggregatedDayStats> = {};
  for (const t of trades) {
    const key = t.dayOfWeek;
    if(!map[key]) map[key] = { dayOfWeek: key, profit:0, capitalPct:0, winRate:0, winners:0, losers:0, total:0, buys:0, sells:0 };
    const e = map[key];
    e.profit += t.profit;
    e.capitalPct += t.capitalPct;
    e.total++;
    if(t.resultLabel === 'gagnant' || t.profit > 0) e.winners++; else e.losers++;
    if(t.side === 'BUY') e.buys++; else e.sells++;
  }
  return Object.values(map).map(e => ({...e, winRate: e.total ? e.winners / e.total : 0}));
}

function aggregateMonths(trades: Trade[]): AggregatedMonthStats[] {
  const map: Record<string, AggregatedMonthStats> = {};
  for (const t of trades) {
    const key = t.month;
    if(!map[key]) map[key] = { month: key, profit:0, capitalPct:0, winRate:0, winners:0, losers:0, buys:0, sells:0, total:0 };
    const e = map[key];
    e.profit += t.profit;
    e.capitalPct += t.capitalPct;
    e.total++;
    if(t.resultLabel === 'gagnant' || t.profit > 0) e.winners++; else e.losers++;
    if(t.side === 'BUY') e.buys++; else e.sells++;
  }
  return Object.values(map)
    .map(e => ({...e, winRate: e.total ? e.winners / e.total : 0}))
    .sort((a,b)=> monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
}

function aggregateYears(trades: Trade[]): AggregatedYearStats[] {
  const map: Record<number, AggregatedYearStats> = {};
  for(const t of trades){
    if(!map[t.year]) map[t.year] = { year:t.year, profit:0, capitalPct:0, winRate:0, winners:0, losers:0, buys:0, sells:0, total:0 };
    const e = map[t.year];
    e.profit += t.profit;
    e.capitalPct += t.capitalPct;
    e.total++;
    if(t.resultLabel === 'gagnant' || t.profit > 0) e.winners++; else e.losers++;
    if(t.side==='BUY') e.buys++; else e.sells++;
  }
  return Object.values(map).map(e=>({...e, winRate: e.total? e.winners/e.total : 0})).sort((a,b)=> a.year - b.year);
}

function aggregateAssets(trades: Trade[]): AggregatedAssetStats[] {
  const map: Record<string, AggregatedAssetStats> = {};
  for(const t of trades){
    const key = t.asset;
    if(!map[key]) map[key] = { asset:key, profit:0, capitalPct:0, winRate:0, winners:0, losers:0, total:0 };
    const e = map[key];
    e.profit += t.profit;
    e.capitalPct += t.capitalPct;
    e.total++;
    if(t.resultLabel === 'gagnant' || t.profit > 0) e.winners++; else e.losers++;
  }
  return Object.values(map).map(e => ({...e, winRate: e.total ? e.winners / e.total : 0}));
}

function aggregateTraders(trades: Trade[]): AggregatedTraderStats[] {
  const map: Record<string, AggregatedTraderStats> = {};
  for(const t of trades){
    const key = t.trader;
    if(!map[key]) map[key] = { trader:key, profit:0, capitalPct:0, winRate:0, winners:0, losers:0, total:0 };
    const e = map[key];
    e.profit += t.profit;
    e.capitalPct += t.capitalPct;
    e.total++;
    if(t.resultLabel === 'gagnant' || t.profit > 0) e.winners++; else e.losers++;
  }
  return Object.values(map).map(e => ({...e, winRate: e.total ? e.winners / e.total : 0}));
}

function buildEquity(trades: Trade[]): EquityPoint[] {
  const sorted = [...trades].sort((a,b)=> a.date.localeCompare(b.date));
  let equity = 0;
  return sorted.map(t => { equity += t.profit; return { date: t.date, equity }; });
}

export function globalStats(trades: Trade[]) {
  const agg = aggregate(trades);
  const totalProfit = trades.reduce((s,t)=>s+t.profit,0);
  const winners = trades.filter(t=> (t.resultLabel === 'gagnant' || t.profit>0)).length;
  const losers = trades.length - winners;
  const winRate = trades.length? winners / trades.length : 0;
  const avgProfit = trades.length? totalProfit / trades.length : 0;
  const maxDrawdown = computeMaxDrawdown(agg.equity.map(p=>p.equity));
  // expectancy & profit factor & payoff ratio
  const gains = trades.filter(t=> t.profit>0).map(t=> t.profit);
  const losses = trades.filter(t=> t.profit<0).map(t=> Math.abs(t.profit));
  const avgGain = gains.length? gains.reduce((a,b)=>a+b,0)/gains.length : 0;
  const avgLoss = losses.length? losses.reduce((a,b)=>a+b,0)/losses.length : 0;
  const profitFactor = losses.length? (gains.reduce((a,b)=>a+b,0) / losses.reduce((a,b)=>a+b,0)) : 0;
  const payoffRatio = avgLoss? avgGain / avgLoss : 0;
  const expectancy = (winRate * avgGain) - ((1-winRate)*avgLoss);
  const avgR = trades.filter(t=> typeof t.rMultiple === 'number').map(t=> t.rMultiple as number);
  const meanR = avgR.length? avgR.reduce((a,b)=>a+b,0)/avgR.length : 0;
  return { totalProfit, winners, losers, winRate, avgProfit, maxDrawdown, avgGain, avgLoss, profitFactor, payoffRatio, expectancy, meanR };
}

function computeMaxDrawdown(series: number[]): number {
  let peak = -Infinity; let maxDd = 0;
  for(const v of series){
    if(v>peak) peak = v;
    const dd = (peak - v);
    if(dd>maxDd) maxDd = dd;
  }
  return maxDd;
}
