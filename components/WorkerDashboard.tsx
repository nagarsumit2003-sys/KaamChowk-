import React, { useState, useEffect } from 'react';
import { WorkerProfile, Language, JobPost, Review } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button, StarRating, Modal, TextToSpeech, Input } from './Shared';
import { StorageService } from '../services/storage';

interface Props {
  user: WorkerProfile;
  lang: Language;
  onUpdateUser: (u: WorkerProfile) => void;
}

export const WorkerDashboard: React.FC<Props> = ({ user, lang, onUpdateUser }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'find' | 'profile'>('find');
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosStatus, setSosStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<WorkerProfile>>({});

  // Check availability on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const lastUpdate = new Date(user.lastAvailableUpdate).toDateString();
    
    // If last update was not today, reset availability
    if (user.isAvailableToday && today !== lastUpdate) {
      const updated = { ...user, isAvailableToday: false };
      onUpdateUser(updated);
      StorageService.updateUser(updated);
    }
  }, []);

  useEffect(() => {
    const allJobs = StorageService.getJobs();
    const relevantJobs = allJobs.filter(j => 
      j.status === 'active'
    );
    relevantJobs.sort((a, b) => {
      const aMatch = a.area.toLowerCase().includes(user.area.toLowerCase());
      const bMatch = b.area.toLowerCase().includes(user.area.toLowerCase());
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return b.createdAt - a.createdAt;
    });
    setJobs(relevantJobs);
  }, [user.area]);

  const toggleAvailability = () => {
    const updated = {
      ...user,
      isAvailableToday: !user.isAvailableToday,
      lastAvailableUpdate: Date.now()
    };
    onUpdateUser(updated);
    StorageService.updateUser(updated);
  };

  const handleRateEmployer = () => {
    if (selectedEmployerId) {
      const review: Review = {
        id: `r_${Date.now()}`,
        fromId: user.id,
        toId: selectedEmployerId,
        rating: ratingValue,
        comment: ratingComment,
        createdAt: Date.now()
      };
      StorageService.addReview(review);
      setRatingModalOpen(false);
      setRatingComment('');
      setRatingModalOpen(false);
      alert('Thanks!');
    }
  };

  const getJobVoiceText = (job: JobPost) => {
    if (lang === 'hi') {
      return `${job.employerName} को ${job.area} में ${job.type} चाहिए. दिहाड़ी ${job.payment} रुपये है.`;
    }
    return `${job.employerName} needs a ${job.type} in ${job.area}. Pay is ${job.payment}.`;
  };

  const handleSOSClick = () => {
    setSosStatus('idle');
    setSosModalOpen(true);
  };

  const sendSOSAlert = () => {
    setSosStatus('sending');
    setTimeout(() => {
      setSosStatus('sent');
      setTimeout(() => setSosModalOpen(false), 2000);
    }, 2000);
  };

  const startEditing = () => {
    setEditData({
      name: user.name,
      area: user.area,
      dailyWage: user.dailyWage,
      experienceYears: user.experienceYears,
      bio: user.bio || ''
    });
    setIsEditing(true);
  };

  const saveProfile = () => {
    const updated = { ...user, ...editData };
    onUpdateUser(updated);
    StorageService.updateUser(updated);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-5 pb-20 relative min-h-[80vh]">
      
      {/* SOS Button (Floating on the side as requested) */}
      <button 
        onClick={handleSOSClick}
        className="fixed bottom-24 right-4 w-16 h-16 bg-red-600 text-white rounded-full shadow-xl z-50 flex items-center justify-center border-4 border-red-100 animate-pulse active:scale-90 transition-transform hover:bg-red-700"
        title="Emergency Help"
        style={{ boxShadow: '0 4px 14px rgba(220, 38, 38, 0.5)' }}
      >
         <span className="text-3xl font-black">🆘</span>
      </button>

      {/* STATUS BANNERS */}
      {user.status === 'pending' && (
         <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg shadow-sm">
            <p className="font-bold flex items-center gap-2">⚠️ Pending Verification</p>
            <p className="text-sm mt-1">Employers cannot see you until Admin approves your profile.</p>
         </div>
      )}
      {user.status === 'suspended' && (
         <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg shadow-sm">
            <p className="font-bold">🛑 Account Suspended</p>
            <p className="text-sm mt-1">Contact support for assistance.</p>
         </div>
      )}

      {/* Status Toggle Card */}
      <div className={`bg-white rounded-xl p-4 shadow-sm border border-slate-200 ${user.status !== 'approved' ? 'opacity-50 pointer-events-none' : ''}`}>
         <div className="flex items-center justify-between">
           <div>
             <h3 className="text-lg font-bold text-slate-800">{user.isAvailableToday ? t.mark_available : t.mark_unavailable}</h3>
             <p className="text-sm text-slate-500">{user.isAvailableToday ? t.you_are_available : 'Tap toggle to go online'}</p>
           </div>
           <button
             onClick={toggleAvailability}
             className={`w-14 h-8 rounded-full transition-colors relative ${user.isAvailableToday ? 'bg-emerald-500' : 'bg-slate-300'}`}
           >
             <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${user.isAvailableToday ? 'left-7' : 'left-1'}`}></div>
           </button>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-slate-200 p-1 rounded-lg">
        <button 
          className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition-all ${activeTab === 'find' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('find')}
        >
          🔍 {t.find_work}
        </button>
        <button 
          className={`flex-1 py-2.5 rounded-md font-semibold text-sm transition-all ${activeTab === 'profile' ? 'bg-white shadow-sm text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 {t.my_profile}
        </button>
      </div>

      {activeTab === 'find' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-800">{t.jobs}</h3>
            <span className="bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-bold text-xs">{jobs.length} Active</span>
          </div>
          
          {jobs.length === 0 ? (
            <div className="text-center py-20 opacity-50">
              <div className="text-5xl mb-4 text-slate-300">📄</div>
              <p className="text-slate-500 font-medium">{t.no_results}</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-sky-300 transition-all relative">
                {(Date.now() - job.createdAt) < 7200000 && (
                   <div className="absolute top-3 right-3 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase tracking-wide">
                      {t.urgent}
                   </div>
                )}

                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 leading-tight">{job.type}</h3>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-0.5">📍 {job.area}</p>
                  </div>
                </div>

                {/* Employer Name Section */}
                <div className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 inline-block px-2 py-1 rounded">
                   {t.posted_by}: <span className="text-slate-800 font-bold">{job.employerName}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                   <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-lg">
                     ₹{job.payment}
                   </div>
                   <div className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded">
                     {job.dateNeeded}
                   </div>
                   <div className="ml-auto">
                     <TextToSpeech 
                        text={getJobVoiceText(job)} 
                        lang={lang} 
                     />
                   </div>
                </div>
                
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 leading-relaxed">
                   {job.description}
                </p>

                <a href={`tel:${'9999999999'}`}>
                    <Button variant="success" className="w-full">📞 {t.contact}</Button>
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6 text-center">
          <div className="flex justify-end">
             {isEditing ? (
               <button onClick={saveProfile} className="text-sky-600 font-bold text-sm bg-sky-50 px-3 py-1 rounded-full">{t.save_changes}</button>
             ) : (
               <button onClick={startEditing} className="text-slate-400 font-bold text-sm hover:text-sky-600">✏️ {t.edit_profile}</button>
             )}
          </div>
          
          <div className="mx-auto relative">
            <img src={user.photoUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-sm" />
            
            {user.status === 'approved' && (
              <div className="absolute bottom-1 right-1 bg-sky-500 text-white rounded-full p-1.5 border-2 border-white shadow-sm" title="Verified">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div>
            {isEditing ? (
               <Input 
                 value={editData.name} 
                 onChange={e => setEditData({...editData, name: e.target.value})} 
                 className="text-center font-bold text-xl"
                 placeholder="Name"
               />
            ) : (
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
            )}
            <p className="text-slate-500 font-medium">{user.phone}</p>
            <div className="mt-2 flex justify-center">
               <StarRating rating={user.ratingCount > 0 ? user.ratingSum / user.ratingCount : 5} count={user.ratingCount} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="block text-slate-400 text-xs font-bold uppercase">{t.skills}</span>
              <span className="font-bold text-slate-800">{user.skills.join(', ')}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="block text-slate-400 text-xs font-bold uppercase">{t.wage}</span>
              {isEditing ? (
                 <input 
                   type="number"
                   className="w-full bg-transparent border-b border-sky-300 focus:outline-none font-bold text-slate-800"
                   value={editData.dailyWage}
                   onChange={e => {
                      const val = parseInt(e.target.value);
                      setEditData({...editData, dailyWage: isNaN(val) ? 0 : val});
                   }}
                 />
              ) : (
                 <span className="font-bold text-slate-800">₹{user.dailyWage}</span>
              )}
            </div>
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
              <span className="block text-slate-400 text-xs font-bold uppercase">{t.area}</span>
              {isEditing ? (
                 <Input 
                   value={editData.area}
                   onChange={e => setEditData({...editData, area: e.target.value})}
                 />
              ) : (
                 <span className="font-bold text-slate-800">{user.area}</span>
              )}
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 col-span-2">
               <span className="block text-slate-400 text-xs font-bold uppercase">{t.bio}</span>
               {isEditing ? (
                 <textarea 
                   className="w-full bg-white border border-slate-200 rounded p-2 mt-1 focus:outline-none focus:border-sky-500"
                   rows={3}
                   value={editData.bio}
                   onChange={e => setEditData({...editData, bio: e.target.value})}
                 />
               ) : (
                 <p className="text-sm text-slate-700 mt-1 italic">{user.bio || 'No bio added.'}</p>
               )}
            </div>
          </div>
          
          {user.idProofUrl && (
             <div className="mt-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2 text-left">ID Proof</p>
                <img src={user.idProofUrl} className="w-full h-32 object-cover rounded-md opacity-90" />
             </div>
          )}

          <Button variant="secondary" onClick={() => setActiveTab('find')}>{t.back}</Button>
        </div>
      )}

      {/* RATING MODAL */}
      <Modal isOpen={ratingModalOpen} onClose={() => setRatingModalOpen(false)} title="Rate Employer">
        <div className="flex flex-col gap-6 py-4 items-center">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button 
                key={star} 
                onClick={() => setRatingValue(star)}
                className={`text-4xl transition-transform active:scale-110 ${ratingValue >= star ? 'text-amber-400' : 'text-slate-200'}`}
              >
                ★
              </button>
            ))}
          </div>
          <Button onClick={handleRateEmployer} className="w-full">{t.submit}</Button>
        </div>
      </Modal>

      {/* SOS MODAL */}
      <Modal isOpen={sosModalOpen} onClose={() => setSosModalOpen(false)} title={t.sos_modal_title}>
        <div className="flex flex-col gap-4 py-2">
           <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm mb-2 rounded">
              Using this feature sends your live location to the police and registered admin contacts.
           </div>
           
           <a href="tel:9999999999" className="w-full">
             <button className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-lg shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2">
                 📞 {t.call_admin}
             </button>
           </a>

           <button 
             onClick={sendSOSAlert}
             disabled={sosStatus !== 'idle'}
             className={`w-full font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${sosStatus === 'sent' ? 'bg-green-600 text-white' : 'bg-orange-500 text-white'}`}
           >
              {sosStatus === 'idle' && `📍 ${t.sending_loc}`}
              {sosStatus === 'sending' && '📡 Sending...'}
              {sosStatus === 'sent' && `✅ ${t.loc_sent}`}
           </button>
        </div>
      </Modal>
    </div>
  );
};