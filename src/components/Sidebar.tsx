import React from "react";
import { LayoutDashboard, Sparkles, FileText, Search, User, LogOut, ChevronRight, GraduationCap, Home, ListTodo } from "lucide-react";
import { User as UserType } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserType | null;
  onLogout: () => void;
  onOpenCommandPalette: () => void;
  applicationsCount: number;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  user,
  onLogout,
  onOpenCommandPalette,
  applicationsCount
}: SidebarProps) {
  const menuItems = [
    { id: "landing", label: "Home Base", icon: Home },
    { id: "dashboard", label: "Dashboard Hub", icon: LayoutDashboard },
    { id: "tracking", label: "Applications Tracker", icon: ListTodo, count: applicationsCount },
    { id: "ai-assistant", label: "AI Career Coach", icon: Sparkles, premium: true },
    { id: "resume-score", label: "Resume Diagnostics", icon: FileText }
  ];

  return (
    <>
      {/* 1. DESKTOP STABLE SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-white/10 bg-neutral-950/80 fixed left-0 top-0 z-30 overflow-y-auto shrink-0 select-none pb-8">
        
        {/* Banner Logo */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-display font-medium text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400/25">
              🚀
            </div>
            <div>
              <h2 className="text-xs font-display font-bold text-slate-100 tracking-wider uppercase">
                Intern Tracker
              </h2>
              <span className="text-[9px] font-mono text-purple-400 tracking-widest font-semibold uppercase block">
                Enterprise v1.5
              </span>
            </div>
          </div>
        </div>

        {/* Global Prompt search portal */}
        <div className="px-4 py-3">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] text-slate-400 hover:text-slate-200 transition-all cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
              Quick search panel...
            </span>
            <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-white/10 text-[9px] font-mono text-slate-500">
              ⌘K
            </span>
          </button>
        </div>

        {/* Main Menu tabs */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-300 relative group cursor-pointer ${
                  isActive
                    ? "bg-purple-600/10 text-purple-300 border border-purple-500/25"
                    : "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-purple-400" : "text-slate-500 group-hover:text-purple-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-white/10 text-[10px] font-mono text-slate-400">
                    {item.count}
                  </span>
                )}
                {item.premium && (
                  <span className="px-1.5 py-0.5 text-[8px] uppercase tracking-widest font-black rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20 text-glow-purple">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Student credentials profile block */}
        {user && (
          <div className="mx-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-100 truncate">
                  {user.name}
                </h4>
                <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                  <GraduationCap className="w-3 h-3 text-purple-400 shrink-0" />
                  {user.university}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 border-t border-white/5 pt-2">
              {user.skills.slice(0, 3).map((sk, idx) => (
                <span
                  key={idx}
                  className="bg-neutral-900 border border-white/5 text-[8px] font-mono text-slate-500 px-1.5 py-0.5 rounded-md"
                >
                  {sk}
                </span>
              ))}
              {user.skills.length > 3 && (
                <span className="text-[8px] text-slate-500 self-center">+{user.skills.length - 3} more</span>
              )}
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-rose-300 hover:bg-rose-500/5 px-2 py-1.5 rounded-lg border border-transparent hover:border-rose-500/25 transition-all text-left cursor-pointer group"
            >
              <span className="flex items-center gap-1.5">
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                Sign Out Account
              </span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
            </button>
          </div>
        )}
      </aside>

      {/* 2. RESPONSIVE MOBILE CORE BOTTOM TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-neutral-950/90 border-t border-white/10 backdrop-blur-md flex justify-around items-center py-2.5 px-4">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 cursor-pointer transition-colors relative ${
                isActive ? "text-purple-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-medium font-sans">{item.label.split(" ")[0]}</span>
              {isActive && (
                <span className="absolute bottom-0 w-4 h-0.5 bg-purple-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
