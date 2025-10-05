import React from 'react';

export const Layout: React.FC<React.PropsWithChildren<{title?: string}>> = ({title, children}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 via-primary-400 to-primary-300 bg-clip-text text-transparent">
          {title || 'Journal de Trading 2025'}
        </h1>
      </header>
      {children}
      <footer className="mt-16 text-xs text-neutral-500 border-t border-neutral-800 pt-6">
        <p>Journal local (données stockées dans votre navigateur). Export/Import JSON bientôt.</p>
      </footer>
    </div>
  );
};
