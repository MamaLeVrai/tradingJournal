import React from 'react';
import { useJournal } from '../lib/store';
import { useDerived } from '../lib/store';

export const FiltersBar: React.FC = () => {
  const { filters, setFilter, clearFilters, trades } = useJournal();
  const allTrades = useDerived().trades; // filtered already, but we only need unique lists from original store; simplification
  const unique = (key: keyof typeof allTrades[number]) => Array.from(new Set(useJournal.getState().trades.map(t=> (t as any)[key]).filter(Boolean))).sort();

  return (
    <div className="mt-6 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex flex-wrap gap-3 items-end">
      <Select label="Année" value={filters.year?.toString()||''} onChange={v=> setFilter('year', v? Number(v): undefined)} options={unique('year').map(y=>({label:String(y), value:String(y)}))} />
      <Select label="Mois" value={filters.month||''} onChange={v=> setFilter('month', v|| undefined)} options={unique('month').map(m=>({label:String(m), value:String(m)}))} />
      <Select label="Actif" value={filters.asset||''} onChange={v=> setFilter('asset', v|| undefined)} options={unique('asset').map(a=>({label:String(a), value:String(a)}))} />
      <Select label="Trader" value={filters.trader||''} onChange={v=> setFilter('trader', v|| undefined)} options={unique('trader').map(a=>({label:String(a), value:String(a)}))} />
      <Select label="Side" value={filters.side||''} onChange={v=> setFilter('side', v|| undefined)} options={[{label:'BUY', value:'BUY'},{label:'SELL', value:'SELL'}]} />
      <Select label="Résultat" value={filters.resultLabel||''} onChange={v=> setFilter('resultLabel', v|| undefined)} options={[{label:'gagnant', value:'gagnant'},{label:'perdant', value:'perdant'}]} />
      <button onClick={()=>clearFilters()} className="ml-auto text-xs px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Reset</button>
    </div>
  );
};

const Select: React.FC<{label:string; value:string; onChange:(v:string)=>void; options:{label:string; value:string}[]}> = ({label,value,onChange,options}) => (
  <label className="text-xs flex flex-col gap-1">
    <span className="text-neutral-400">{label}</span>
    <select className="bg-neutral-800 rounded px-2 py-1 text-sm" value={value} onChange={e=>onChange(e.target.value)}>
      <option value="">--</option>
      {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </label>
);
