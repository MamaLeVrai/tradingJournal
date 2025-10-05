import React from 'react';
import { useDerived } from '../lib/store';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

const number = (v:number)=> v.toLocaleString('fr-FR',{minimumFractionDigits:2, maximumFractionDigits:2});

export const DashboardStats: React.FC = () => {
  const { global, agg } = useDerived();
  return (
    <div className="mt-10 space-y-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard label="Profit total" value={number(global.totalProfit)} />
        <StatCard label="Win rate" value={(global.winRate*100).toFixed(1)+ '%'} />
        <StatCard label="Trades" value={(global.winners+global.losers).toString()} />
        <StatCard label="Max Drawdown" value={number(global.maxDrawdown)} />
        <StatCard label="Profit Factor" value={global.profitFactor.toFixed(2)} />
        <StatCard label="Expectancy" value={number(global.expectancy)} />
      </div>

  <section className="grid lg:grid-cols-2 gap-8">
        <ChartPanel title="Equity curve">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={agg.equity}>
              <defs>
                <linearGradient id="gradEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#cc1a29" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#cc1a29" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis dataKey="date" hide />
              <YAxis width={70} stroke="#666"/>
              <Tooltip contentStyle={{background:'#111', border:'1px solid #333'}}/>
              <Area dataKey="equity" stroke="#e63342" fill="url(#gradEquity)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Profit par mois">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={agg.months}>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#666"/>
              <YAxis width={70} stroke="#666"/>
              <Tooltip contentStyle={{background:'#111', border:'1px solid #333'}}/>
              <Bar dataKey="profit" fill="#cc1a29" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="grid lg:grid-cols-2 gap-8">
        <ChartPanel title="Profit par année">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={agg.years}>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis dataKey="year" stroke="#666"/>
              <YAxis width={70} stroke="#666"/>
              <Tooltip contentStyle={{background:'#111', border:'1px solid #333'}}/>
              <Bar dataKey="profit" fill="#e63342" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Répartition Win/Loss">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ label:'Gagnants', value: global.winners }, { label:'Perdants', value: global.losers }]}>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#666"/>
              <YAxis width={60} stroke="#666"/>
              <Tooltip contentStyle={{background:'#111', border:'1px solid #333'}}/>
              <Bar dataKey="value" fill="#cc1a29" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>
    </div>
  );
};

const StatCard: React.FC<{label:string; value:string}> = ({label,value}) => (
  <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 flex flex-col gap-1">
    <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
    <span className="text-lg font-semibold text-primary-300">{value}</span>
  </div>
);

const ChartPanel: React.FC<React.PropsWithChildren<{title:string}>> = ({title,children}) => (
  <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
    <h3 className="text-sm font-medium mb-3 text-neutral-300">{title}</h3>
    {children}
  </div>
);
