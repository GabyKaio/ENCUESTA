
import React, { useState, useEffect } from 'react';
import { getResponses } from '../services/storage';

const SyncIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    
    const interval = setInterval(() => {
      const responses = getResponses();
      setPending(responses.filter(r => !r.synced).length);
    }, 3000);

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
        {isOnline ? (pending > 0 ? `${pending} Pendientes` : 'Sincronizado') : 'Modo Offline'}
      </span>
      <svg className={`w-3 h-3 ${isOnline ? 'text-green-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    </div>
  );
};

export default SyncIndicator;
