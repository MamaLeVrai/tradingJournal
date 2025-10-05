import React, { useRef } from 'react';
import { useJournal } from '../lib/store';

export const DataToolbar: React.FC = () => {
  const { trades, loadFromJSON, activeProfile, setActiveProfile } = useJournal();
  const fileRef = useRef<HTMLInputElement|null>(null);
  function exportJSON(){
    const blob = new Blob([JSON.stringify(trades, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'trades.json';
    a.click();
  }
  function importJSON(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0];
    if(!file) return;
    file.text().then(txt=> loadFromJSON(txt));
  }
  const profiles = Array.from(new Set(trades.map(t=> t.profile).filter(Boolean))) as string[];
  return (
    <div className="mt-4 flex flex-wrap gap-3 items-center">
      <button onClick={exportJSON} className="text-xs px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Exporter JSON</button>
      <button onClick={()=>fileRef.current?.click()} className="text-xs px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700">Importer JSON</button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={importJSON} />
      <div className="flex items-center gap-2 text-xs ml-auto">
        <span className="text-neutral-500">Profil:</span>
        <select value={activeProfile||''} onChange={e=> setActiveProfile(e.target.value || undefined)} className="bg-neutral-800 rounded px-2 py-1 text-sm">
          <option value="">(tous)</option>
          {profiles.map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
};
