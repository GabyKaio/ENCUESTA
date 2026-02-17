
import React, { useState } from 'react';
import SurveyView from './components/SurveyView';
import AdminPanel from './components/AdminPanel';

type View = 'survey' | 'admin';

const App: React.FC = () => {
  // Use internal state instead of window.location.hash to avoid iframe navigation issues
  const [view, setView] = useState<View>('survey');

  const navigateTo = (newView: View) => {
    setView(newView);
    window.scrollTo(0, 0);
  };

  return (
    <div className="antialiased min-h-screen bg-slate-50">
      {view === 'admin' ? (
        <AdminPanel onNavigate={() => navigateTo('survey')} />
      ) : (
        <SurveyView onNavigate={() => navigateTo('admin')} />
      )}
      
      {/* Hidden debug link for admin access in demo - internal state transition */}
      <div className="fixed bottom-4 right-4 opacity-5 hover:opacity-100 transition-opacity z-50">
        <button 
          onClick={() => navigateTo('admin')}
          className="bg-slate-800 text-white p-2 rounded text-[10px] font-mono"
        >
          ADMIN_LOGIN
        </button>
      </div>
    </div>
  );
};

export default App;
