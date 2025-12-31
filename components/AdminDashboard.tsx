import React, { useState } from 'react';
import { AdminProfile, Language, WorkerProfile, Skill } from '../types';
import { TRANSLATIONS, SKILLS_LIST, AREAS_LIST } from '../constants';
import { Button, Input, Select, Modal, StarRating, ImageUpload } from './Shared';
import { StorageService } from '../services/storage';

interface Props {
  user: AdminProfile;
  lang: Language;
}

export const AdminDashboard: React.FC<Props> = ({ user, lang }) => {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'pending' | 'add' | 'active'>('pending');
  const [users, setUsers] = useState(StorageService.getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);

  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerWage, setNewWorkerWage] = useState('');
  const [newWorkerExp, setNewWorkerExp] = useState('');
  const [newWorkerArea, setNewWorkerArea] = useState('');
  const [newWorkerPhoto, setNewWorkerPhoto] = useState('');
  const [newWorkerSkills, setNewWorkerSkills] = useState<string[]>([SKILLS_LIST[0]]);

  const refreshData = () => {
    setUsers(StorageService.getUsers());
  };

  const handleApprove = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id && u.role === 'worker') {
        return { ...u, status: 'approved' as const };
      }
      return u;
    });
    StorageService.setUsers(updated);
    refreshData();
    if (selectedWorker?.id === id) setSelectedWorker(null);
  };

  const handleSuspend = (id: string) => {
    const updated = users.map(u => {
      if (u.id === id && u.role === 'worker') {
        return { ...u, status: 'suspended' as const };
      }
      return u;
    });
    StorageService.setUsers(updated);
    refreshData();
    if (selectedWorker?.id === id) setSelectedWorker(null);
  };

  const handleDelete = (id: string) => {
    if(!confirm("Are you sure you want to PERMANENTLY delete this worker?")) return;
    const updated = users.filter(u => u.id !== id);
    StorageService.setUsers(updated);
    refreshData();
    if (selectedWorker?.id === id) setSelectedWorker(null);
  };

  const handleAddWorker = () => {
    if (!newWorkerName || !newWorkerPhone || !newWorkerArea) {
      alert("Missing fields");
      return;
    }
    
    const worker: WorkerProfile = {
      id: `w_${Date.now()}`,
      name: newWorkerName,
      phone: newWorkerPhone,
      role: 'worker',
      status: 'approved',
      createdAt: Date.now(),
      password: '123', 
      photoUrl: newWorkerPhoto || `https://picsum.photos/200/200?random=${Date.now()}`,
      skills: newWorkerSkills,
      area: newWorkerArea,
      dailyWage: parseInt(newWorkerWage) || 500,
      experienceYears: parseInt(newWorkerExp) || 0,
      isAvailableToday: true,
      lastAvailableUpdate: Date.now(),
      ratingSum: 5,
      ratingCount: 1
    };

    StorageService.addUser(worker);
    alert(`${t.worker_added}. Login Pass: 123`);
    setNewWorkerName('');
    setNewWorkerPhone('');
    setNewWorkerArea('');
    setNewWorkerWage('');
    setNewWorkerExp('');
    setNewWorkerPhoto('');
    refreshData();
  };

  const filteredUsers = users.filter(u => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const name = u.name || '';
      const phone = u.phone || '';
      return name.toLowerCase().includes(term) || phone.includes(term);
    }
    return true;
  });

  const pendingWorkers = filteredUsers.filter(u => u.role === 'worker' && (u as WorkerProfile).status === 'pending') as WorkerProfile[];
  const activeWorkers = filteredUsers.filter(u => u.role === 'worker' && (u as WorkerProfile).status === 'approved') as WorkerProfile[];

  return (
    <div className="flex flex-col gap-4 pb-20">
      {activeTab !== 'add' && (
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-10">
          <Input 
            placeholder="Search by name or phone..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            icon="🔍"
            className="py-3"
          />
        </div>
      )}

      <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
        <button 
          className={`flex-1 py-2.5 font-semibold rounded-lg text-sm transition-all ${activeTab === 'pending' ? 'bg-sky-50 text-sky-800' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('pending')}
        >
          {t.pending_workers} <span className="ml-1 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs text-slate-600">{pendingWorkers.length}</span>
        </button>
        <button 
          className={`flex-1 py-2.5 font-semibold rounded-lg text-sm transition-all ${activeTab === 'add' ? 'bg-sky-50 text-sky-800' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('add')}
        >
          {t.add_worker}
        </button>
        <button 
          className={`flex-1 py-2.5 font-semibold rounded-lg text-sm transition-all ${activeTab === 'active' ? 'bg-sky-50 text-sky-800' : 'text-slate-500 hover:bg-slate-50'}`}
          onClick={() => setActiveTab('active')}
        >
          {t.active_workers}
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="flex flex-col gap-3">
          {pendingWorkers.length === 0 ? (
            <div className="text-center py-10 opacity-50 font-medium text-slate-500">
               {searchTerm ? 'No matches found' : 'No pending approvals ✅'}
            </div>
          ) : pendingWorkers.map(w => (
            <div key={w.id} onClick={() => setSelectedWorker(w)} className="bg-white p-4 rounded-xl shadow-sm border border-orange-200 cursor-pointer active:scale-[0.98] transition-all relative hover:shadow-md">
               <div className="absolute top-3 right-3 text-orange-600 text-[10px] font-bold uppercase tracking-wide border border-orange-100 bg-orange-50 px-2 py-0.5 rounded">Pending</div>
               <div className="flex gap-4 items-center">
                 <img src={w.photoUrl} className="w-14 h-14 rounded-full object-cover bg-slate-100 border border-slate-200" />
                 <div>
                   <h3 className="font-bold text-lg text-slate-800">{w.name}</h3>
                   <p className="text-slate-500 font-mono text-sm">{w.phone}</p>
                 </div>
               </div>
               <p className="text-xs mt-3 bg-slate-50 text-slate-600 font-bold px-2 py-1.5 rounded border border-slate-100 text-center">Skills: {w.skills.join(', ')}</p>
               <div className="mt-3 text-center text-xs font-bold text-sky-600">Click to View Details</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'add' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
           <h3 className="font-bold text-lg mb-2 text-slate-800">New Worker Entry</h3>
           
           <ImageUpload 
             image={newWorkerPhoto} 
             onUpload={setNewWorkerPhoto} 
           />

           <Input label={t.name} value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} />
           <Input label={t.phone} type="tel" value={newWorkerPhone} onChange={e => setNewWorkerPhone(e.target.value)} />
           
           <div className="relative">
              <Input label={t.area} value={newWorkerArea} onChange={e => setNewWorkerArea(e.target.value)} list="areas_admin" />
              <datalist id="areas_admin">
                {AREAS_LIST.map(a => <option key={a} value={a} />)}
              </datalist>
           </div>

           <Select label={t.skills} value={newWorkerSkills[0]} onChange={e => setNewWorkerSkills([e.target.value])}>
              {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
           </Select>

           <div className="flex gap-4">
             <Input label={t.wage} type="number" value={newWorkerWage} onChange={e => setNewWorkerWage(e.target.value)} />
             <Input label={t.experience} type="number" value={newWorkerExp} onChange={e => setNewWorkerExp(e.target.value)} />
           </div>

           <Button onClick={handleAddWorker} className="mt-4">{t.add_worker}</Button>
        </div>
      )}

      {activeTab === 'active' && (
        <div className="flex flex-col gap-3">
          {activeWorkers.length === 0 ? (
            <div className="text-center py-10 opacity-50 font-medium text-slate-500">
               {searchTerm ? 'No matches found' : 'No active workers'}
            </div>
          ) : activeWorkers.map(w => (
            <div key={w.id} onClick={() => setSelectedWorker(w)} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm cursor-pointer active:scale-[0.98] transition-all hover:border-sky-300">
              <div className="flex items-center gap-3">
                <div className="relative">
                   <img src={w.photoUrl} className="w-12 h-12 rounded-full object-cover bg-slate-100 border border-slate-200" />
                   {w.isAvailableToday && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>}
                </div>
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1 text-sm">
                     {w.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{w.phone}</div>
                </div>
              </div>
              <div className="text-right">
                <StarRating rating={w.ratingCount ? w.ratingSum / w.ratingCount : 0} size="sm" />
                <div className="text-xs font-bold mt-1 text-slate-400">{w.area}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Worker Modal */}
      <Modal isOpen={!!selectedWorker} onClose={() => setSelectedWorker(null)} title="Worker Details">
        {selectedWorker && (
          <div className="flex flex-col gap-6">
             <div className="flex flex-col items-center gap-3">
                <img src={selectedWorker.photoUrl} className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-sm" />
                <div className="text-center">
                   <h2 className="text-2xl font-bold text-slate-900">{selectedWorker.name}</h2>
                   <p className="text-slate-500 font-mono">{selectedWorker.phone}</p>
                   
                   <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold inline-block border ${
                      selectedWorker.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      selectedWorker.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-orange-50 text-orange-700 border-orange-200'
                   }`}>
                      {selectedWorker.status.toUpperCase()}
                   </div>
                </div>
             </div>

             <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4 border border-slate-200 text-sm">
                <div>
                   <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Area</span>
                   <span className="font-bold text-slate-800">{selectedWorker.area}</span>
                </div>
                <div>
                   <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Wage</span>
                   <span className="font-bold text-slate-800">₹{selectedWorker.dailyWage}</span>
                </div>
                <div>
                   <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Experience</span>
                   <span className="font-bold text-slate-800">{selectedWorker.experienceYears} Years</span>
                </div>
                <div>
                   <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">Skills</span>
                   <span className="font-bold text-slate-800">{selectedWorker.skills.join(', ')}</span>
                </div>
             </div>
             
             <div className="flex flex-col gap-3 mt-2">
                {selectedWorker.status === 'pending' && (
                  <Button variant="success" onClick={() => handleApprove(selectedWorker.id)}>✅ Approve & Verify</Button>
                )}
                
                {selectedWorker.status === 'suspended' && (
                  <Button variant="success" onClick={() => handleApprove(selectedWorker.id)}>🔄 Reactivate Account</Button>
                )}
                
                {selectedWorker.status === 'approved' && (
                  <Button className="bg-slate-600 hover:bg-slate-700 shadow-none text-white border-transparent" onClick={() => handleSuspend(selectedWorker.id)}>🚫 Suspend / Block</Button>
                )}
                
                <Button variant="danger" onClick={() => handleDelete(selectedWorker.id)}>🗑️ Delete Permanently</Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};