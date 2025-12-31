import React, { useState, useEffect } from 'react';
import { EmployerProfile, Language, WorkerProfile, JobPost, Review, Skill } from '../types';
import { TRANSLATIONS, SKILLS_LIST, SKILL_ICONS, AREAS_LIST } from '../constants';
import { Button, StarRating, Input, Select, Modal } from './Shared';
import { StorageService } from '../services/storage';

interface Props {
  user: EmployerProfile;
  lang: Language;
  onUpdateUser: (u: EmployerProfile) => void;
}

export const EmployerDashboard: React.FC<Props> = ({ user, lang, onUpdateUser }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'find' | 'post' | 'myjobs' | 'profile'>('find');
  const [subTab, setSubTab] = useState<'list' | 'map'>('list'); // New sub-tab for map view
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  
  const [searchSkill, setSearchSkill] = useState<string>('');
  const [searchArea, setSearchArea] = useState<string>('');

  const [jobType, setJobType] = useState(SKILLS_LIST[0]);
  const [jobArea, setJobArea] = useState(user.area);
  const [jobWage, setJobWage] = useState('');
  const [jobWorkersNeeded, setJobWorkersNeeded] = useState('1');
  const [jobDate, setJobDate] = useState('');
  const [jobDesc, setJobDesc] = useState('');

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);

  // Edit Profile
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<EmployerProfile>>({});

  // Force Update State for My Jobs refresh
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const allUsers = StorageService.getUsers();
    const allWorkers = allUsers.filter(u => u.role === 'worker' && u.status === 'approved') as WorkerProfile[];
    
    let filtered = allWorkers;
    if (searchSkill) filtered = filtered.filter(w => w.skills.some(s => s.toLowerCase().includes(searchSkill.toLowerCase())));
    if (searchArea) filtered = filtered.filter(w => w.area.toLowerCase().includes(searchArea.toLowerCase()));

    filtered.sort((a, b) => {
      if (a.isAvailableToday && !b.isAvailableToday) return -1;
      if (!a.isAvailableToday && b.isAvailableToday) return 1;
      
      const ratingA = a.ratingCount ? a.ratingSum / a.ratingCount : 0;
      const ratingB = b.ratingCount ? b.ratingSum / b.ratingCount : 0;
      return ratingB - ratingA;
    });

    setWorkers(filtered);
  }, [searchSkill, searchArea, activeTab]);

  const handlePostJob = () => {
    if (!jobWage || !jobDate) { alert("Please fill all fields"); return; }
    const newJob: JobPost = {
      id: `j_${Date.now()}`,
      employerId: user.id,
      employerName: user.name,
      type: jobType,
      area: jobArea,
      workersNeeded: parseInt(jobWorkersNeeded),
      payment: parseInt(jobWage),
      dateNeeded: jobDate,
      description: jobDesc,
      createdAt: Date.now(),
      status: 'active'
    };
    StorageService.addJob(newJob);
    alert(t.job_posted);
    setActiveTab('myjobs');
    setJobWage('');
    setJobDesc('');
    setRefreshTrigger(p => p + 1); // Refresh jobs list
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm(t.delete_confirm)) {
      StorageService.deleteJob(jobId);
      setRefreshTrigger(p => p + 1); // Refresh list immediately
    }
  };

  const handleRateWorker = () => {
    if (selectedWorkerId) {
       const review: Review = {
        id: `r_${Date.now()}`,
        fromId: user.id,
        toId: selectedWorkerId,
        rating: ratingValue,
        comment: '',
        createdAt: Date.now()
      };
      StorageService.addReview(review);
      setRatingModalOpen(false);
      alert('Rated!');
    }
  }

  const startEditing = () => {
    setEditData({
      name: user.name,
      area: user.area,
      bio: user.bio || ''
    });
    setIsEditing(true);
  }

  const saveProfile = () => {
    const updated = { ...user, ...editData };
    StorageService.updateUser(updated);
    onUpdateUser(updated);
    setIsEditing(false);
  }

  // Calculate myJobs based on current state (and refresh trigger)
  const myJobs = StorageService.getJobs().filter(j => j.employerId === user.id && j.status === 'active');

  return (
    <div className="flex flex-col gap-4 pb-20">
      <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <button className={`flex-1 min-w-[60px] py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${activeTab === 'find' ? 'bg-sky-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setActiveTab('find')}>{t.find_workers}</button>
        <button className={`flex-1 min-w-[60px] py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${activeTab === 'post' ? 'bg-sky-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setActiveTab('post')}>{t.post_job}</button>
        <button className={`flex-1 min-w-[60px] py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${activeTab === 'myjobs' ? 'bg-sky-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setActiveTab('myjobs')}>{t.my_jobs}</button>
        <button className={`flex-1 min-w-[60px] py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all ${activeTab === 'profile' ? 'bg-sky-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`} onClick={() => setActiveTab('profile')}>{t.my_profile}</button>
      </div>

      {activeTab === 'find' && (
        <div className="flex flex-col gap-4">
          
          {/* Search Bar */}
          <div className="relative">
             <input 
                placeholder={t.search_placeholder} 
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none shadow-sm text-base text-slate-800"
                value={searchArea}
                onChange={e => setSearchArea(e.target.value)}
             />
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
          </div>

          {/* Horizontal Skill Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
            <button onClick={() => setSearchSkill('')} className={`whitespace-nowrap px-4 py-2 rounded-full border font-semibold text-sm transition-all ${searchSkill === '' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600'}`}>All</button>
            {SKILLS_LIST.map(s => (
               <button key={s} onClick={() => setSearchSkill(s)} className={`whitespace-nowrap px-4 py-2 rounded-full border font-semibold text-sm transition-all flex items-center gap-1.5 ${searchSkill === s ? 'bg-sky-600 text-white border-sky-600' : 'bg-white border-slate-200 text-slate-600'}`}>
                 <span>{SKILL_ICONS[s]}</span> {s}
               </button>
            ))}
          </div>

          {/* List vs Map Toggle */}
          <div className="flex justify-end px-2">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button 
                onClick={() => setSubTab('list')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${subTab === 'list' ? 'bg-white shadow text-slate-800' : 'text-slate-400'}`}
              >
                📋 {t.list_view}
              </button>
              <button 
                onClick={() => setSubTab('map')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${subTab === 'map' ? 'bg-white shadow text-sky-600' : 'text-slate-400'}`}
              >
                🗺️ {t.map_view}
              </button>
            </div>
          </div>

          {subTab === 'map' ? (
             // SIMULATED MAP VIEW FOR PROTOTYPE
             <div className="w-full h-[50vh] bg-slate-200 rounded-xl relative overflow-hidden border border-slate-300 shadow-inner group">
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/Neighborhood_Map.jpg')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"></div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <p className="bg-white/80 px-3 py-1 rounded text-xs font-bold shadow">Simulated Live Map</p>
                </div>
                {/* Randomly place workers on the "map" */}
                {workers.slice(0, 8).map((w, i) => {
                   const top = 20 + (i * 10) + Math.random() * 10;
                   const left = 10 + (i * 10) + Math.random() * 20;
                   return (
                     <button 
                        key={w.id}
                        style={{ top: `${top}%`, left: `${left}%` }}
                        onClick={() => { setSelectedWorkerForAction(w.id); setRatingModalOpen(true); }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/pin transition-transform hover:scale-110 active:scale-95 z-10"
                     >
                        <div className={`w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden ${w.isAvailableToday ? 'ring-2 ring-emerald-500' : ''}`}>
                          <img src={w.photoUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-white text-[10px] font-bold px-1.5 rounded shadow mt-1 whitespace-nowrap hidden group-hover/pin:block">
                           {w.name}
                        </div>
                     </button>
                   )
                })}
                {/* User Location */}
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-sky-600 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
             </div>
          ) : (
             <div className="flex flex-col gap-3">
            {workers.length === 0 ? (
               <div className="text-center py-10 opacity-50">
                  <span className="text-5xl">🔍</span>
                  <p className="mt-4 font-semibold text-slate-500">{t.no_results}</p>
               </div>
            ) : workers.map(w => (
              <div key={w.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3 relative transition-all">
                 {w.isAvailableToday && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> 
                       <span className="text-[10px] font-bold tracking-wide">{t.available_badge}</span>
                    </div>
                 )}
                 
                 <div className="flex gap-3 items-center">
                   <div className="relative">
                     <img src={w.photoUrl} className="w-14 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200" alt={w.name} />
                   </div>
                   
                   <div>
                      <h3 className="font-bold text-lg text-slate-900">{w.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                         <span>📍 {w.area}</span>
                         <span className="text-slate-300">•</span>
                         <span>{w.experienceYears} {t.years} Exp</span>
                      </div>
                   </div>
                 </div>
                 
                 {/* WORKER BIO PREVIEW */}
                 {w.bio && <p className="text-xs text-slate-600 italic border-l-2 border-slate-200 pl-2 line-clamp-2">{w.bio}</p>}

                 <div className="flex items-center gap-2 mt-1">
                    {w.skills.map(skill => (
                        <span key={skill} className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            {SKILL_ICONS[skill]} {skill}
                        </span>
                    ))}
                 </div>

                 <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t.wage}</span>
                       <span className="font-bold text-lg text-slate-800">₹{w.dailyWage}<span className="text-xs font-normal text-slate-400">{t.per_day}</span></span>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t.ratings}</span>
                       <StarRating rating={w.ratingCount > 0 ? w.ratingSum / w.ratingCount : 0} count={w.ratingCount} size="sm" />
                    </div>
                 </div>

                 <div className="flex gap-2 mt-2">
                    <a href={`tel:${w.phone}`} className="flex-[2]">
                       <Button variant="success" className="w-full py-2.5 text-sm">📞 {t.contact}</Button>
                    </a>
                    <Button variant="secondary" className="flex-1 py-2.5 text-sm" onClick={() => { setSelectedWorkerForAction(w.id); setRatingModalOpen(true); }}>⭐ {t.rate}</Button>
                 </div>
              </div>
            ))}
          </div>
          )}

        </div>
      )}

      {activeTab === 'post' && (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-5">
          <h2 className="text-xl font-bold text-slate-800">{t.post_job}</h2>
          
          <Select label={t.skills} value={jobType} onChange={e => setJobType(e.target.value as Skill)}>
             {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          
          <div>
             <Input label={t.area} value={jobArea} onChange={e => setJobArea(e.target.value)} />
             <div className="mt-2 flex gap-2 flex-wrap">
               {AREAS_LIST.slice(0, 3).map(a => (
                 <button key={a} onClick={() => setJobArea(a)} className="text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-200">{a}</button>
               ))}
             </div>
          </div>

          <div className="flex gap-3">
             <Input type="number" label={t.wage} icon="₹" value={jobWage} onChange={e => setJobWage(e.target.value)} />
             <Input type="number" label={t.workers_needed} icon="👤" value={jobWorkersNeeded} onChange={e => setJobWorkersNeeded(e.target.value)} />
          </div>
          
          <Input type="date" label={t.date} value={jobDate} onChange={e => setJobDate(e.target.value)} />
          
          <div className="flex flex-col gap-1.5">
             <label className="text-sm font-semibold text-slate-700 ml-1">{t.description}</label>
             <textarea 
               className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white"
               rows={3}
               value={jobDesc}
               onChange={e => setJobDesc(e.target.value)}
               placeholder="Briefly describe the work..."
             />
          </div>

          <Button onClick={handlePostJob} className="mt-2">{t.post_job}</Button>
        </div>
      )}
      
      {activeTab === 'myjobs' && (
        <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold px-1 text-slate-800">{t.my_jobs}</h2>
            {myJobs.length === 0 ? (
               <div className="text-center py-10 text-slate-400 font-medium">No active jobs</div>
            ) : myJobs.map(job => (
             <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
               <div>
                  <h3 className="font-bold text-lg text-slate-800">{job.type}</h3>
                  <p className="text-slate-500 text-sm font-medium mt-0.5">📅 {job.dateNeeded} • {job.workersNeeded} Workers</p>
                  <p className="text-xs text-slate-400 mt-1">{job.area}</p>
               </div>
               <div className="flex flex-col items-end gap-2">
                  <div className="text-lg font-bold text-emerald-600">₹{job.payment}</div>
                  <button 
                    onClick={() => handleDeleteJob(job.id)}
                    className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    🗑️ {t.delete_post}
                  </button>
               </div>
             </div>
          ))}
        </div>
      )}

      {/* NEW EMPLOYER PROFILE TAB */}
      {activeTab === 'profile' && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6">
             <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-800">{t.my_profile}</h2>
                 {isEditing ? (
                   <button onClick={saveProfile} className="text-sky-600 font-bold text-sm bg-sky-50 px-3 py-1 rounded-full">{t.save_changes}</button>
                 ) : (
                   <button onClick={startEditing} className="text-slate-400 font-bold text-sm hover:text-sky-600">✏️ {t.edit_profile}</button>
                 )}
             </div>

             <div className="flex flex-col gap-4">
                {isEditing ? (
                   <>
                     <Input label={t.name} value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                     <Input label={t.area} value={editData.area} onChange={e => setEditData({...editData, area: e.target.value})} />
                     <div className="flex flex-col gap-1.5">
                       <label className="text-sm font-semibold text-slate-700 ml-1">{t.bio}</label>
                       <textarea 
                          className="w-full border border-slate-300 rounded-lg px-4 py-3 bg-white"
                          value={editData.bio} 
                          onChange={e => setEditData({...editData, bio: e.target.value})}
                          rows={3}
                       />
                     </div>
                   </>
                ) : (
                   <>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">{t.name}</span>
                        <span className="text-lg font-semibold text-slate-800">{user.name}</span>
                     </div>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">{t.phone}</span>
                        <span className="text-lg font-semibold text-slate-800">{user.phone}</span>
                     </div>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">{t.area}</span>
                        <span className="text-lg font-semibold text-slate-800">{user.area}</span>
                     </div>
                     <div>
                        <span className="block text-xs font-bold text-slate-400 uppercase">{t.bio}</span>
                        <p className="text-sm text-slate-600 mt-1">{user.bio || 'No bio added.'}</p>
                     </div>
                   </>
                )}
             </div>
         </div>
      )}

      <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title="Rate Worker">
         <div className="flex justify-center gap-2 py-6">
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} onClick={() => setRatingValue(star)} className={`text-4xl transition-transform active:scale-110 ${ratingValue >= star ? 'text-amber-400' : 'text-slate-200'}`}>★</button>
            ))}
         </div>
         <Button onClick={handleRateWorker} className="w-full">{t.submit}</Button>
      </Modal>
    </div>
  );
  
  function setSelectedWorkerForAction(id: string) {
     setSelectedWorkerId(id);
  }
};