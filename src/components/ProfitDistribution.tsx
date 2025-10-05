import React, { useMemo } from 'react';
import { useDerived } from '../lib/store';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const ProfitDistribution: React.FC = () => {
  const { trades } = useDerived();
  const data = useMemo(()=> buildHistogram(trades.map(t=> t.profit), 12), [trades]);
  if(!data.length) return null;
  return (
    <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 mt-8">
      <h3 className="text-sm font-medium mb-3 text-neutral-300">Distribution des profits</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid stroke="#222" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#666" interval={0} angle={-30} textAnchor="end" height={60} />
          <YAxis width={60} stroke="#666" />
          <Tooltip contentStyle={{background:'#111', border:'1px solid #333'}} />
          <Bar dataKey="count" fill="#cc1a29" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

function buildHistogram(values: number[], bins: number){
  if(!values.length) return [];
  const min = Math.min(...values); const max = Math.max(...values);
  const width = (max - min) / bins || 1;
  const arr = Array.from({length: bins}, (_,i)=> ({ from: min + i*width, to: min + (i+1)*width, count:0 }));
  for(const v of values){
    const idx = Math.min(arr.length-1, Math.floor((v - min) / width));
    arr[idx].count++;
  }
  return arr.map(b=> ({ label: `${b.from.toFixed(0)}..${b.to.toFixed(0)}`, count: b.count }));
}
