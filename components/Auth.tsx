import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, SKILLS_LIST, SKILL_ICONS, AREAS_LIST } from '../constants';
import { Button, Input, SelectableCard, ImageUpload } from './Shared';
import { StorageService } from '../services/storage';

interface Props {
  lang: Language;
  onLogin: (userId: string) => void;
}

export const Auth: React.FC<Props> = ({ lang, onLogin }) => {
  const t = TRANSLATIONS[lang];
  
  const [view, setView] = useState('landing');
  const [regRole, setRegRole] = useState<'worker' | 'employer'>('worker');
  const [loginPhone, setLoginPhone] = useState('');
  const [detectingLoc, setDetectingLoc] = useState(false);
  
  const [regData, setRegData] = useState({
    name: '',
    phone: '',
    area: '',
    skill: SKILLS_LIST[0],
    wage: '',
    exp: '',
    photo: '',
    idProof: '',
    bio: ''
  });

  const updateReg = (key: string, val: any) => setRegData(prev => ({ ...prev, [key]: val }));

  const handleLogin = () => {
    if (loginPhone === '9999999999') { 
      const users = StorageService.getUsers();
      if (!users.find(u => u.id === 'admin1')) {
         alert("Admin user missing.");
         return;
      }
      onLogin('admin1'); 
      return; 
    }

    const users = StorageService.getUsers();
    const user = users.find(u => u.phone === loginPhone);
    if (user) {
      onLogin(user.id);
    } else {
      alert("User not found. Please Register first.");
    }
  };

  const handleAdminQuickLogin = () => {
     setLoginPhone('9999999999');
     setView('login');
  };

  const simulateLocationDetect = () => {
     setDetectingLoc(true);
     // Simulate API delay
     setTimeout(() => {
        setDetectingLoc(false);
        // Randomly pick an area for demo
        const randomArea = AREAS_LIST[Math.floor(Math.random() * AREAS_LIST.length)];
        updateReg('area', randomArea);
     }, 1500);
  };

  const handleRegisterComplete = () => {
    if (regRole === 'worker') {
      const newUser: any = {
        id: `w_${Date.now()}`,
        phone: regData.phone,
        role: 'worker',
        name: regData.name,
        createdAt: Date.now(),
        status: 'pending', 
        photoUrl: regData.photo || `https://picsum.photos/200/200?random=${Date.now()}`,
        idProofUrl: regData.idProof,
        skills: [regData.skill],
        area: regData.area,
        dailyWage: parseInt(regData.wage) || 400,
        experienceYears: parseInt(regData.exp) || 1,
        isAvailableToday: true,
        lastAvailableUpdate: Date.now(),
        ratingSum: 5,
        ratingCount: 1,
        password: '123',
        bio: regData.bio
      };
      StorageService.addUser(newUser);
      onLogin(newUser.id);
    } else {
      const newUser: any = {
        id: `e_${Date.now()}`,
        phone: regData.phone,
        role: 'employer',
        name: regData.name,
        createdAt: Date.now(),
        area: regData.area,
        ratingSum: 5,
        ratingCount: 1,
        password: '123',
        bio: regData.bio
      };
      StorageService.addUser(newUser);
      onLogin(newUser.id);
    }
  };

  if (view === 'landing') {
    return (
      <div className="flex flex-col h-full justify-end pb-10 px-4">
        <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in">
          <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-sm border border-sky-100">
            🤝
          </div>
          <h1 className="text-3xl font-bold text-sky-900 mb-2 tracking-tight">{t.app_name}</h1>
          <p className="text-lg text-slate-500 font-medium">{t.tagline}</p>
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          <Button onClick={() => setView('login')} variant="primary" className="w-full">
             🔑 {t.login}
          </Button>
          <Button onClick={() => setView('register_role')} variant="secondary" className="w-full">
             ✨ {t.register}
          </Button>
          
          <button 
            onClick={handleAdminQuickLogin}
            className="mt-4 py-3 rounded-lg border border-dashed border-slate-300 text-slate-400 font-semibold hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300 transition-all text-xs flex items-center justify-center gap-2"
          >
            🛡️ Admin Login (Demo)
          </button>
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="flex flex-col h-full pt-10 px-4">
        <h2 className="text-2xl font-bold mb-8 text-center text-slate-800">{t.welcome}</h2>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6">
          <Input 
            label={t.phone} 
            type="tel" 
            placeholder="9876543210" 
            icon="📱"
            value={loginPhone} 
            onChange={e => setLoginPhone(e.target.value)} 
            autoFocus
          />
          {loginPhone === '9999999999' && (
             <div className="text-xs text-sky-600 font-semibold bg-sky-50 p-2 rounded">
                Admin Mode Detected
             </div>
          )}
          <Input 
            label={t.password} 
            type="password" 
            placeholder="1234" 
            icon="🔒"
            value="1234"
            readOnly
          />
          <Button onClick={handleLogin} disabled={loginPhone.length < 10}>{t.submit}</Button>
        </div>
        
        <button onClick={() => setView('landing')} className="mt-auto py-6 text-slate-500 font-semibold text-sm hover:text-sky-600">
          {t.back}
        </button>
      </div>
    );
  }

  if (view === 'register_role') {
    return (
      <div className="flex flex-col h-full pt-6 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">{t.role_selection}</h2>
        <div className="grid gap-4">
          <button 
            onClick={() => { setRegRole('worker'); setView('reg_step_name'); }}
            className="bg-white border border-slate-200 hover:border-sky-500 hover:ring-1 hover:ring-sky-500 p-6 rounded-xl flex flex-col items-center gap-3 shadow-sm transition-all active:scale-[0.98]"
          >
            <span className="text-5xl">👷</span>
            <span className="text-lg font-bold text-slate-800">{t.im_worker}</span>
          </button>
          
          <button 
            onClick={() => { setRegRole('employer'); setView('reg_step_name'); }}
            className="bg-white border border-slate-200 hover:border-sky-500 hover:ring-1 hover:ring-sky-500 p-6 rounded-xl flex flex-col items-center gap-3 shadow-sm transition-all active:scale-[0.98]"
          >
            <span className="text-5xl">👨‍💼</span>
            <span className="text-lg font-bold text-slate-800">{t.im_employer}</span>
          </button>
        </div>
        <button onClick={() => setView('landing')} className="mt-auto py-6 text-slate-500 font-semibold text-sm hover:text-sky-600">{t.back}</button>
      </div>
    );
  }

  // Generic Steps for both
  if (view === 'reg_step_name') {
    return (
      <div className="flex flex-col h-full pt-6 px-4">
        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden"><div className="bg-sky-600 h-full w-1/4"></div></div>
        <h2 className="text-xl font-bold mb-4 text-slate-800">{t.name} & {t.phone}</h2>
        
        {regRole === 'worker' && (
          <div className="mb-6 grid grid-cols-2 gap-4">
             <ImageUpload 
               image={regData.photo} 
               onUpload={(base64) => updateReg('photo', base64)} 
               label="Profile Photo"
             />
             <ImageUpload 
               image={regData.idProof} 
               onUpload={(base64) => updateReg('idProof', base64)} 
               label="ID / Aadhaar"
             />
          </div>
        )}

        <div className="flex flex-col gap-5">
          <Input label={t.name} icon="👤" value={regData.name} onChange={e => updateReg('name', e.target.value)} placeholder="Full Name" autoFocus />
          <Input label={t.phone} icon="📞" type="tel" value={regData.phone} onChange={e => updateReg('phone', e.target.value)} placeholder="Mobile Number" />
        </div>
        <div className="mt-auto flex gap-3 pt-6">
          <Button variant="secondary" className="flex-1" onClick={() => setView('register_role')}>{t.back}</Button>
          <Button className="flex-1" disabled={!regData.name || regData.phone.length < 10} onClick={() => setView(regRole === 'worker' ? 'reg_step_skill' : 'reg_step_area')}>{t.next}</Button>
        </div>
      </div>
    );
  }

  if (view === 'reg_step_skill') {
    return (
      <div className="flex flex-col h-full pt-6 px-4">
        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden"><div className="bg-sky-600 h-full w-2/4"></div></div>
        <h2 className="text-xl font-bold mb-4 text-slate-800">{t.select_skill}</h2>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4">
          {SKILLS_LIST.map(skill => (
            <SelectableCard 
              key={skill} 
              selected={regData.skill === skill} 
              onClick={() => updateReg('skill', skill)}
            >
              <span className="text-3xl">{SKILL_ICONS[skill] || '🔧'}</span>
              <span className="font-semibold text-center text-sm">{skill}</span>
            </SelectableCard>
          ))}
        </div>
        <div className="mt-auto pt-4 flex gap-3 bg-slate-50 sticky bottom-0">
          <Button variant="secondary" className="flex-1" onClick={() => setView('reg_step_name')}>{t.back}</Button>
          <Button className="flex-1" onClick={() => setView('reg_step_details')}>{t.next}</Button>
        </div>
      </div>
    );
  }

  if (view === 'reg_step_details') {
     return (
      <div className="flex flex-col h-full pt-6 px-4">
        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden"><div className="bg-sky-600 h-full w-3/4"></div></div>
        <h2 className="text-xl font-bold mb-6 text-slate-800">{t.wage} & {t.experience}</h2>
        <div className="flex flex-col gap-6">
          <Input label={t.wage} icon="₹" type="number" value={regData.wage} onChange={e => updateReg('wage', e.target.value)} placeholder="500" />
          <Input label={t.experience} icon="📅" type="number" value={regData.exp} onChange={e => updateReg('exp', e.target.value)} placeholder="2" />
          
          <div className="flex flex-col gap-1.5">
             <label className="text-sm font-semibold text-slate-700 ml-1">{t.bio}</label>
             <textarea 
               className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
               rows={2}
               value={regData.bio}
               onChange={e => updateReg('bio', e.target.value)}
               placeholder={t.bio_placeholder}
             />
          </div>
        </div>
        <div className="mt-auto flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setView('reg_step_skill')}>{t.back}</Button>
          <Button className="flex-1" disabled={!regData.wage} onClick={() => setView('reg_step_area')}>{t.next}</Button>
        </div>
      </div>
    );
  }

  if (view === 'reg_step_area') {
    return (
      <div className="flex flex-col h-full pt-6 px-4">
        <div className="w-full bg-slate-200 h-1.5 rounded-full mb-6 overflow-hidden"><div className="bg-sky-600 h-full w-full"></div></div>
        <h2 className="text-xl font-bold mb-6 text-slate-800">{t.area}</h2>
        
        {/* Detect Location Button */}
        <button 
          onClick={simulateLocationDetect}
          className="w-full mb-4 py-3 rounded-lg border-2 border-sky-100 bg-sky-50 text-sky-700 font-bold flex items-center justify-center gap-2 hover:bg-sky-100 transition-all active:scale-[0.98]"
        >
           {detectingLoc ? (
             <span className="animate-pulse">🛰️ Detecting...</span>
           ) : (
             <>📍 {t.detect_location}</>
           )}
        </button>

        {/* Manual Type Box */}
        <div className="mb-4">
           <Input 
             placeholder={t.type_area} 
             value={regData.area} 
             onChange={e => updateReg('area', e.target.value)} 
             icon="✍️"
           />
        </div>
        
        <p className="text-xs text-slate-500 mb-2 font-bold px-1 uppercase tracking-wider">Select Popular Area</p>
        <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[35vh]">
          {AREAS_LIST.map(area => (
             <button 
                key={area}
                onClick={() => updateReg('area', area)}
                className={`p-4 rounded-lg text-left font-semibold border transition-all ${regData.area === area ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
             >
                {area}
             </button>
          ))}
        </div>
        <div className="mt-auto pt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setView(regRole === 'worker' ? 'reg_step_details' : 'reg_step_name')}>{t.back}</Button>
          <Button variant="success" className="flex-1" disabled={!regData.area} onClick={handleRegisterComplete}>
            ✅ {t.submit}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};