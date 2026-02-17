
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SurveyResponse, AppConfig } from '../types';
import { getResponses, getConfig, saveConfig, clearAllData, mergeResponses, getDeviceInfo } from '../services/storage';
import { getSurveyInsights } from '../services/geminiService';
import { COLORS, LOGO } from '../constants.tsx';

interface AdminPanelProps {
  onNavigate: (view: 'survey') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [config, setConfig] = useState<AppConfig>(getConfig());
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newProduct, setNewProduct] = useState('');
  const [loginError, setLoginError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResponses(getResponses());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().toUpperCase() === config.adminPin.toUpperCase()) {
      setIsAuthorized(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPin('');
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleClearData = () => {
    if (confirm("¿Estás SEGURO de que quieres borrar TODAS las encuestas? Esta acción no se puede deshacer.")) {
      clearAllData();
      setResponses([]);
      alert("Datos borrados.");
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          const result = mergeResponses(json);
          setResponses(getResponses());
          alert(`Sincronización completa:\n✅ ${result.added} encuestas nuevas añadidas.\nℹ️ ${result.duplicates} duplicados omitidos.`);
        } else {
          alert("El archivo no tiene el formato correcto.");
        }
      } catch (err) {
        alert("Error al procesar el archivo.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const downloadData = (format: 'csv' | 'json') => {
    if (responses.length === 0) return alert("No hay datos para exportar.");
    
    let content = "";
    let mimeType = "";
    let fileName = `jd_data_${new Date().toISOString().split('T')[0]}`;

    if (format === 'json') {
      content = JSON.stringify(responses, null, 2);
      mimeType = "application/json";
      fileName += "_sync";
    } else {
      const headers = ['ID', 'Fecha', 'Nombre', 'Apellido', 'Email', 'Rol', 'NPS', 'Interesado', 'Productos', 'Dispositivo', 'Sector'];
      const rows = responses.map(r => [
        r.id, r.timestamp, `"${r.firstName}"`, `"${r.lastName}"`, r.email, r.role, r.nps, 
        r.interestedInInfo ? 'Si' : 'No', `"${r.selectedProducts.join('; ')}"`, r.deviceId || 'N/A', `"${r.sectorName || 'N/A'}"`
      ]);
      content = "\ufeff" + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      mimeType = "text/csv;charset=utf-8";
      fileName += "_reporte";
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName + (format === 'json' ? '.json' : '.csv');
    link.click();
  };

  const updateSectorName = (val: string) => {
    const updated = { ...config, sectorName: val.toUpperCase() };
    setConfig(updated);
    saveConfig(updated);
  };

  const roleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    responses.forEach(r => {
      const roleName = r.role || 'Otro';
      stats[roleName] = (stats[roleName] || 0) + 1;
    });
    return Object.entries(stats).map(([name, value]) => ({ name, value }));
  }, [responses]);

  const npsAvg = useMemo(() => {
    if (responses.length === 0) return 0;
    const sum = responses.reduce((acc, r) => acc + r.nps, 0);
    return (sum / responses.length).toFixed(1);
  }, [responses]);

  const generateAIReport = async () => {
    setIsAnalyzing(true);
    const insights = await getSurveyInsights(responses);
    setAiInsights(insights);
    setIsAnalyzing(false);
  };

  const addProduct = () => {
    if (!newProduct) return;
    const updated = { ...config, availableProducts: [...config.availableProducts, newProduct] };
    setConfig(updated);
    saveConfig(updated);
    setNewProduct('');
  };

  const removeProduct = (idx: number) => {
    const updated = { ...config, availableProducts: config.availableProducts.filter((_, i) => i !== idx) };
    setConfig(updated);
    saveConfig(updated);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4 font-inter">
        <div className="mb-8 scale-125">{LOGO}</div>
        <form onSubmit={handleLogin} className={`bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full transition-all ${loginError ? 'animate-shake border-2 border-red-500' : 'border border-slate-100'}`}>
          <h2 className="text-2xl font-black mb-2 text-center text-slate-800">Panel de Control</h2>
          <p className="text-[10px] text-slate-400 mb-8 text-center font-black uppercase tracking-widest">Ingrese contraseña autorizada</p>
          <div className="space-y-4">
            <input
              autoFocus
              type="password"
              placeholder="Contraseña"
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-bold focus:ring-2 focus:ring-[#367C2B] outline-none"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
            <button className="w-full bg-[#367C2B] text-white py-5 rounded-2xl font-black text-xl hover:bg-green-800 shadow-lg active:scale-95 uppercase">
              Ingresar
            </button>
          </div>
          <button type="button" onClick={() => onNavigate('survey')} className="w-full mt-8 text-slate-400 text-xs font-black uppercase tracking-widest">
            Volver a la Encuesta
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-inter">
      <header className="bg-[#1D1D1D] text-white p-4 md:p-6 shadow-md flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="hidden md:block">{LOGO}</div>
          <h1 className="text-lg font-black uppercase">Dashboard Stand</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadData('csv')} className="bg-[#367C2B] px-4 py-2 rounded-xl font-black text-[10px] uppercase">Descargar Excel (CSV)</button>
          <button onClick={() => onNavigate('survey')} className="bg-slate-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider">Salir</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Sector Config Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="flex-1">
               <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-1">Ubicación de este celular</h4>
               <input 
                 type="text"
                 className="w-full md:w-64 p-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-[#367C2B] focus:ring-2 focus:ring-[#367C2B] outline-none"
                 value={config.sectorName}
                 placeholder="EJ: ZONA TRACTORES"
                 onChange={(e) => updateSectorName(e.target.value)}
               />
               <p className="text-[10px] text-slate-400 mt-2 font-medium italic">* Cambia esto en cada celular según el sector del stand.</p>
             </div>
             <div className="hidden md:block h-12 w-px bg-slate-100"></div>
             <div className="flex-1 text-center md:text-left">
               <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-1">ID Dispositivo Único</h4>
               <p className="text-xl font-black text-slate-300 tracking-tighter">{getDeviceInfo().id}</p>
             </div>
           </div>
        </div>

        {/* Sync Section */}
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex-1">
             <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest">Sincronización Manual</h4>
             <p className="text-sm text-blue-700 font-medium mt-1">Suma encuestas de otros celulares aquí.</p>
           </div>
           <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
             <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
             <button 
                onClick={() => downloadData('json')} 
                className="bg-white text-blue-600 border border-blue-200 px-6 py-3 rounded-2xl font-black text-[11px] uppercase shadow-sm active:scale-95 flex items-center justify-center gap-2"
             >
               <span>1. Exportar Backup</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
             </button>
             <button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase shadow-md active:scale-95 flex items-center justify-center gap-2"
             >
               <span>2. Importar Datos</span>
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-[#367C2B]">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Encuestas Totales</p>
            <p className="text-4xl font-black text-slate-800">{responses.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-[#FFDE00]">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Puntaje NPS</p>
            <p className="text-4xl font-black text-slate-800">{npsAvg}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-blue-500 hidden lg:block">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Estado Sync</p>
            <p className="text-2xl font-black text-slate-800">Sincronizado</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Visitantes por Perfil</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {roleStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS.JD_GREEN, '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Productos en este Stand</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4 pr-1">
              {config.availableProducts.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl text-sm font-bold text-slate-700">
                  <span className="truncate">{p}</span>
                  <button onClick={() => removeProduct(i)} className="text-red-400 hover:text-red-600 font-black p-1 text-xl">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#367C2B] outline-none" 
                placeholder="Añadir ítem..."
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
              />
              <button onClick={addProduct} className="bg-[#367C2B] text-white px-6 py-4 rounded-2xl text-sm font-black uppercase">Ok</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border-t-8 border-[#367C2B] border border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h3 className="font-black text-xl flex items-center gap-2 text-slate-800">
                ✨ Análisis Gemini (IA)
              </h3>
              <p className="text-xs text-slate-400 font-medium">Resumen inteligente de todas las encuestas.</p>
            </div>
            <button 
              onClick={generateAIReport}
              disabled={isAnalyzing || responses.length === 0}
              className="w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50 shadow-xl"
            >
              {isAnalyzing ? 'Procesando...' : 'Generar Reporte IA'}
            </button>
          </div>
          {aiInsights && (
            <div className="text-sm text-slate-700 bg-slate-50 p-6 rounded-[2rem] leading-relaxed whitespace-pre-wrap font-medium italic">
              {aiInsights}
            </div>
          )}
        </div>

        <button 
          onClick={handleClearData}
          className="w-full border-2 border-red-50 text-red-400 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 transition-colors"
        >
          Borrar Datos de este Dispositivo
        </button>
      </main>
    </div>
  );
};

export default AdminPanel;
