import React from 'react';
import { useJournal } from '../lib/store';

export const TradesTable: React.FC = () => {
  const trades = useJournal(s=>s.trades);
  const remove = useJournal(s=>s.removeTrade);
  const add = useJournal(s=>s.addTrade);
  if(!trades.length) return <p className="text-sm text-neutral-500 mt-4">Aucun trade pour l'instant.</p>;
  return (
    <div className="overflow-auto mt-6 rounded-xl border border-neutral-800">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-900/60 text-neutral-400">
          <tr className="text-left">
            <th className="px-2 py-2">Date</th>
            <th className="px-2 py-2">Année</th>
            <th className="px-2 py-2">Heure</th>
            <th className="px-2 py-2">Trader</th>
            <th className="px-2 py-2">Actif</th>
            <th className="px-2 py-2">Side</th>
            <th className="px-2 py-2">Profit</th>
            <th className="px-2 py-2">% Capital</th>
            <th className="px-2 py-2">Risk</th>
            <th className="px-2 py-2">R</th>
            <th className="px-2 py-2">Résultat</th>
            <th className="px-2 py-2">Commentaire</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t=> (
            <tr key={t.id} className="odd:bg-neutral-950 even:bg-neutral-900/40 hover:bg-neutral-800/40">
              <td className="px-2 py-1 whitespace-nowrap">{t.date}</td>
              <td className="px-2 py-1">{t.year}</td>
              <td className="px-2 py-1">{t.time}</td>
              <td className="px-2 py-1">{t.trader}</td>
              <td className="px-2 py-1">{t.asset}</td>
              <td className={`px-2 py-1 font-medium ${t.side==='BUY' ? 'text-primary-300' : 'text-primary-500'}`}>{t.side}</td>
              <td className={`px-2 py-1 ${t.profit>=0 ? 'text-primary-400' : 'text-red-500'}`}>{t.profit.toFixed(2)}</td>
              <td className="px-2 py-1">{t.capitalPct.toFixed(2)}%</td>
              <td className="px-2 py-1">{t.risk?.toFixed(2)}</td>
              <td className="px-2 py-1">{typeof t.rMultiple==='number'? t.rMultiple.toFixed(2): ''}</td>
              <td className="px-2 py-1">{t.resultLabel}</td>
              <td className="px-2 py-1 max-w-xs truncate" title={t.comment}>{t.comment}</td>
              <td className="px-2 py-1 text-right flex gap-2">
                <button onClick={()=> { const {id, ...rest} = t; add(rest as any); }} className="text-xs text-neutral-400 hover:text-primary-300">dup</button>
                <button onClick={()=>remove(t.id)} className="text-xs text-neutral-400 hover:text-red-400">suppr</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
