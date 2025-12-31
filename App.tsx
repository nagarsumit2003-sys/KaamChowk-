import React, { useState, useEffect } from 'react';
import { Language, AnyUser, WorkerProfile, EmployerProfile, AdminProfile } from './types';
import { Layout } from './components/Shared';
import { Auth } from './components/Auth';
import { WorkerDashboard } from './components/WorkerDashboard';
import { EmployerDashboard } from './components/EmployerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { StorageService } from './services/storage';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<AnyUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const handleLogin = (userId: string) => {
    StorageService.setCurrentUser(userId);
    const user = StorageService.getCurrentUser();
    setCurrentUser(user);
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!currentUser) {
    return (
      <Layout lang={lang} setLang={setLang}>
        <Auth lang={lang} onLogin={handleLogin} />
      </Layout>
    );
  }

  return (
    <Layout 
      lang={lang} 
      setLang={setLang} 
      onLogout={handleLogout}
      userRole={currentUser.role}
    >
      {currentUser.role === 'worker' && (
        <WorkerDashboard 
          user={currentUser as WorkerProfile} 
          lang={lang} 
          onUpdateUser={(u) => setCurrentUser(u)} 
        />
      )}
      {currentUser.role === 'employer' && (
        <EmployerDashboard 
          user={currentUser as EmployerProfile} 
          lang={lang} 
          onUpdateUser={(u) => setCurrentUser(u)}
        />
      )}
      {currentUser.role === 'admin' && (
        <AdminDashboard 
          user={currentUser as AdminProfile} 
          lang={lang} 
        />
      )}
    </Layout>
  );
}