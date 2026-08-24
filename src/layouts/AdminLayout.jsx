import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '@/utils/auth';
import { useSettings } from '@/context/SettingsContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { settings, isLoading } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = userData?.name || 'System Administrator';
  const userEmail = userData?.email || 'admin@correctsolution.com';

  const brandName = settings?.brand_name || 'Correct Solution';
  const logoUrl = settings?.logo_url || 'https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg';

  const handleLogout = (e) => {
    e.preventDefault();
    removeAuthToken();
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-background text-foreground text-base min-h-screen flex flex-col md:flex-row">
      
      {/* Mobile Top App Bar */}
      <header className="w-full top-0 sticky border-b border-border dark:border-border bg-card dark:bg-slate-900 text-primary dark:text-primary flex justify-between items-center px-4 z-40 h-[64px] md:hidden">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-muted-foreground hover:bg-muted-high rounded-full p-2 transition-colors active:opacity-80">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
        <h1 className=" text-2xl font-bold font-bold text-primary dark:text-primary">{brandName}</h1>
        <div className="flex items-center gap-2">
          <button className="text-muted-foreground hover:bg-muted-high rounded-full p-2 transition-colors active:opacity-80">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar / Mobile Drawer */}
      <aside className={`flex flex-col bg-card border-r border-border h-screen w-[280px] fixed left-0 top-0 p-4 space-y-2 z-50 transition-transform duration-300 shadow-sm ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Mobile close button inside drawer */}
        <div className="md:hidden flex justify-end mb-2">
           <button onClick={() => setIsMobileMenuOpen(false)}>
             <span className="material-symbols-outlined text-muted-foreground">close</span>
           </button>
        </div>

        <div className="flex flex-col items-center justify-center bg-muted/50 p-6 border border-border rounded-xl mb-4">
          <div className="w-16 h-16 rounded-full bg-white border border-border shadow-sm mb-3 overflow-hidden flex items-center justify-center p-2">
            {!isLoading && <img src={logoUrl} alt={brandName} className="w-full h-full object-contain" />}
          </div>
          <h2 className="text-lg font-bold text-primary text-center">{userName}</h2>
          <p className="text-sm text-muted-foreground mt-1 text-center truncate w-full">{userEmail}</p>
        </div>
        
        <nav className="flex-1 space-y-1 w-full overflow-y-auto">
          <NavLink to="/admin/certificates" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>verified</span>
                <span>Certificates</span>
              </>
            )}
          </NavLink>

          <NavLink to="/admin/settings" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
                <span>Settings</span>
              </>
            )}
          </NavLink>
          
          <NavLink to="/admin/users" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer font-medium ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>group</span>
                <span>Users</span>
              </>
            )}
          </NavLink>
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <a onClick={handleLogout} className="flex items-center gap-3 text-muted-foreground px-4 py-3 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-xl cursor-pointer font-medium">
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span>Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[280px] min-h-screen pb-20 md:pb-0 w-full flex flex-col relative overflow-hidden bg-background">
        {/* Desktop TopAppBar */}
        <header className="hidden md:flex bg-card text-foreground border-b border-border w-full sticky top-0 z-30 justify-between items-center px-6 py-3 shadow-sm">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold text-primary">{brandName}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 text-muted-foreground">
              <button className="hover:bg-muted hover:text-foreground p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
            <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-white flex items-center justify-center p-1 shadow-sm">
               {!isLoading && <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full bg-background overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-background border-t border-border shadow-lg rounded-t-xl">
        <NavLink to="/admin/certificates" className={({isActive}) => `flex flex-col items-center justify-center rounded-lg px-4 py-1 text-xs font-medium  active:scale-90 transition-transform ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>verified</span>
              <span>Certificates</span>
            </>
          )}
        </NavLink>
        <NavLink to="/admin/settings" className={({isActive}) => `flex flex-col items-center justify-center rounded-lg px-4 py-1 text-xs font-medium  active:scale-90 transition-transform ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>settings</span>
              <span>Settings</span>
            </>
          )}
        </NavLink>
        <NavLink to="/admin/users" className={({isActive}) => `flex flex-col items-center justify-center rounded-lg px-4 py-1 text-xs font-medium  active:scale-90 transition-transform ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined mb-1" style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>group</span>
              <span>Users</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
