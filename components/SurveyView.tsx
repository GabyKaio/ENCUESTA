
import React, { useState, useEffect } from 'react';
import { UserRole, SurveyResponse } from '../types';
import { saveResponse, getConfig } from '../services/storage';
import { ROLES, LOGO } from '../constants.tsx';
import SyncIndicator from './SyncIndicator';

interface SurveyViewProps {
  onNavigate: (view: 'admin') => void;
}

const SurveyView: React.FC<SurveyViewProps> = ({ onNavigate }) => {
  const [config, setConfig] = useState(getConfig());
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  
  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    role: ROLES[0] as UserRole,
    nps: -1,
    interestedInInfo: false,
    selectedProducts: [] as string[]
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  useEffect(() => {
    if (logoClicks >= 5) {
      onNavigate('admin');
      setLogoClicks(0);
    }
    const timer = setTimeout(() => setLogoClicks(0), 3000);
    return () => clearTimeout(timer);
  }, [logoClicks, onNavigate]);

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleReset = () => {
    setFormData(initialFormData);
    setIsSubmitted(false);
    setStep(1);
    setLogoClicks(0);
  };

  const toggleProduct = (product: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(product)
        ? prev.selectedProducts.filter(p => p !== product)
        : [...prev.selectedProducts, product]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nps === -1) return;
    
    const response: SurveyResponse = {
      ...formData,
      id: '', 
      timestamp: new Date().toISOString()
    };
    
    saveResponse(response);
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  const isStep1Valid = formData.firstName.trim() !== '' && 
                      formData.lastName.trim() !== '' && 
                      formData.email.includes('@');
                      
  const isStep2Valid = formData.nps !== -1 && 
                      (!formData.interestedInInfo || formData.selectedProducts.length > 0);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
        <div className="w-24 h-24 bg-[#367C2B] rounded-full flex items-center justify-center mb-8 shadow-xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4 font-inter">¡Muchas Gracias!</h2>
        <p className="text-slate-600 mb-12 max-w-xs mx-auto text-lg leading-relaxed">
          Tu opinión es fundamental para nosotros. Disfruta el resto de tu visita en nuestro stand.
        </p>
        <button 
          onClick={handleReset}
          className="bg-[#367C2B] text-white px-12 py-5 rounded-full font-bold shadow-lg active:scale-95 transition-all text-xl"
        >
          Nueva Encuesta
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <header className="bg-white p-4 md:p-6 shadow-sm border-b-4 border-[#367C2B] flex justify-between items-center sticky top-0 z-10">
        <div onClick={() => setLogoClicks(c => c + 1)} className="cursor-pointer active:opacity-50 transition-opacity">
          {LOGO}
        </div>
        <SyncIndicator />
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full p-4 md:p-6 py-6 md:py-10">
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-800">Tus Datos</h2>
                  <p className="text-slate-500 text-sm">Completa para recibir novedades personalizadas.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-tighter">Nombre</label>
                      <input 
                        required
                        placeholder="Nombre"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#367C2B] focus:ring-1 focus:ring-[#367C2B] outline-none transition-all text-lg"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-tighter">Apellido</label>
                      <input 
                        required
                        placeholder="Apellido"
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#367C2B] focus:ring-1 focus:ring-[#367C2B] outline-none transition-all text-lg"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-tighter">Email</label>
                    <input 
                      required
                      type="email"
                      placeholder="correo@ejemplo.com"
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#367C2B] focus:ring-1 focus:ring-[#367C2B] outline-none transition-all text-lg"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-tighter">Tu Actividad Principal</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#367C2B] outline-none appearance-none transition-all text-lg"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                      >
                        {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid}
                  className="w-full bg-[#367C2B] text-white py-5 rounded-2xl font-bold text-xl shadow-lg active:scale-95 disabled:opacity-30 transition-all mt-4"
                >
                  Continuar
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fadeIn">
                <div className="space-y-6">
                  <h2 className="text-xl font-black text-slate-800 leading-tight">
                    ¿Qué tan probable es que nos recomiendes?
                  </h2>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {[...Array(11)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({...formData, nps: i})}
                        className={`h-14 md:h-16 flex items-center justify-center rounded-2xl font-black text-xl transition-all ${
                          formData.nps === i 
                            ? 'bg-[#367C2B] text-white shadow-lg scale-110 z-10' 
                            : 'bg-slate-50 border border-slate-200 text-slate-400 active:bg-slate-200'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-black uppercase px-1 tracking-widest">
                    <span>No probable</span>
                    <span>Muy probable</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-black text-slate-800">
                    ¿Deseas más información?
                  </h2>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, interestedInInfo: true})}
                      className={`flex-1 py-5 rounded-2xl font-bold border-2 transition-all text-lg ${
                        formData.interestedInInfo 
                          ? 'bg-green-50 border-[#367C2B] text-[#367C2B]' 
                          : 'bg-white text-slate-400 border-slate-100'
                      }`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, interestedInInfo: false, selectedProducts: []})}
                      className={`flex-1 py-5 rounded-2xl font-bold border-2 transition-all text-lg ${
                        !formData.interestedInInfo 
                          ? 'bg-green-50 border-[#367C2B] text-[#367C2B]' 
                          : 'bg-white text-slate-400 border-slate-100'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {formData.interestedInInfo && (
                  <div className="space-y-3 animate-fadeIn">
                    <p className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Interés en:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {(config.availableProducts || []).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => toggleProduct(p)}
                          className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                            formData.selectedProducts.includes(p)
                              ? 'bg-green-50 border-[#367C2B] text-[#367C2B] font-bold shadow-sm'
                              : 'bg-white border-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="text-sm font-medium">{p}</span>
                          {formData.selectedProducts.includes(p) && (
                            <div className="bg-[#367C2B] rounded-full p-1 text-white">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  <button 
                    type="submit"
                    disabled={!isStep2Valid}
                    className="w-full bg-[#367C2B] text-white py-6 rounded-2xl font-black text-2xl shadow-xl active:scale-95 disabled:opacity-20 transition-all uppercase tracking-tight"
                  >
                    Enviar Encuesta
                  </button>
                  <button 
                    type="button"
                    onClick={handleBack}
                    className="text-slate-400 font-black text-xs uppercase tracking-widest p-2 hover:text-[#367C2B] transition-colors"
                  >
                    ← Modificar mis datos
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.2em] flex flex-col items-center gap-4">
        <p>© 2025 Deere & Company. Exhibición Agrícola.</p>
        <button 
          onClick={() => onNavigate('admin')} 
          className="opacity-20 hover:opacity-100 p-2 hover:text-[#367C2B] transition-all"
        >
           Admin Login
        </button>
      </footer>
    </div>
  );
};

export default SurveyView;
