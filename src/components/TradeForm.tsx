import React, { useState } from 'react';
import { useJournal } from '../lib/store';
import { TradeSide } from '../lib/types';

const days = ['lundi','mardi','mercredi','jeudi','vendredi'];
const months = ['janvier','fevrier','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','decembre'];

export const TradeForm: React.FC = () => {
  const addTrade = useJournal(s=>s.addTrade);
  const now = new Date();
  const [form, setForm] = useState<{trader:string; asset:string; date:string; time:string; year:number; month:string; dayOfWeek:string; side:TradeSide; profit:number; capitalPct:number; risk:number; rMultiple: number | undefined; comment:string; resultLabel:'gagnant' | 'perdant'; profile?: string}>({
  trader: 'moi', asset: 'XAU/USD', date: now.toISOString().slice(0,10), time: '',
    year: now.getFullYear(),
    month: months[now.getMonth()], dayOfWeek: days[now.getDay()-1] || 'lundi', side: 'BUY' as TradeSide,
  profit: 0, capitalPct: 0, risk: 0, rMultiple: undefined, comment: '', resultLabel: 'gagnant'
  });

  function submit(e: React.FormEvent){
    e.preventDefault();
  const rMultiple = form.risk && form.risk !== 0 ? form.profit / form.risk : undefined;
  addTrade({...form, rMultiple});
  setForm(f=>({...f, profit:0, capitalPct:0, risk:0, rMultiple: undefined, comment:''}));
  }

  return (
    <form onSubmit={submit} className="space-y-3 p-4 rounded-xl gradient-border bg-neutral-900/40">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  <input className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.trader} onChange={e=>setForm({...form,trader:e.target.value})} placeholder="trader" />
        <input className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.asset} onChange={e=>setForm({...form,asset:e.target.value})} placeholder="actif" />
  <input className="bg-neutral-800 rounded px-2 py-1 text-sm" value={(form as any).profile || ''} onChange={e=>setForm({...form, profile:e.target.value})} placeholder="profil" />
        <input type="date" className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.date} onChange={e=>{
          const date = e.target.value; const d = new Date(date+'T00:00:00');
          setForm({...form,date, year: d.getFullYear(), month: months[d.getMonth()], dayOfWeek: days[d.getDay()-1] || form.dayOfWeek});
        }} />
        <input type="number" className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.year} onChange={e=>setForm({...form,year:Number(e.target.value)})} placeholder="année" />
        <input type="time" className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} />
        <select className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.side} onChange={e=>setForm({...form,side:e.target.value as TradeSide})}>
          <option value="BUY">BUY</option>
          <option value="SELL">SELL</option>
        </select>
        <select className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.resultLabel} onChange={e=>setForm({...form,resultLabel:e.target.value as any})}>
          <option value="gagnant">gagnant</option>
          <option value="perdant">perdant</option>
        </select>
  <input type="number" step="0.01" className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.profit} onChange={e=>setForm({...form,profit:parseFloat(e.target.value)})} placeholder="profit" />
  <input type="number" step="0.01" className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.capitalPct} onChange={e=>setForm({...form,capitalPct:parseFloat(e.target.value)})} placeholder="% capital" />
  <input type="number" step="0.01" className="bg-neutral-800 rounded px-2 py-1 text-sm" value={form.risk} onChange={e=>setForm({...form,risk:parseFloat(e.target.value), rMultiple: form.profit && parseFloat(e.target.value)!==0? form.profit/parseFloat(e.target.value): undefined})} placeholder="risk" />
  <input disabled type="number" step="0.01" className="bg-neutral-950/40 rounded px-2 py-1 text-sm text-neutral-400" value={form.rMultiple ?? ''} placeholder="R" />
      </div>
      <textarea className="w-full bg-neutral-800 rounded px-2 py-1 text-sm" value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})} placeholder="commentaire" />
      <button className="px-4 py-2 rounded bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 hover:brightness-110 text-sm font-medium">Ajouter</button>
    </form>
  );
};
