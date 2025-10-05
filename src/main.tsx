import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Layout } from './components/Layout';
import { TradeForm } from './components/TradeForm';
import { TradesTable } from './components/TradesTable';
import { DashboardStats } from './components/DashboardStats';
import { FiltersBar } from './components/FiltersBar';
import { DataToolbar } from './components/DataToolbar';
import { ProfitDistribution } from './components/ProfitDistribution';

const App = () => {
  return (
    <Layout>
  <TradeForm />
  <DataToolbar />
  <FiltersBar />
      <DashboardStats />
  <ProfitDistribution />
      <TradesTable />
    </Layout>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
