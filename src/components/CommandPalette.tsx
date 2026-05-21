import React, { useState, useEffect, useRef } from "react";
import { Search, Sparkles, Plus, CheckCircle, HelpCircle, X, Shield, ArrowRight } from "lucide-react";
import { Application } from "../types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  applications: Application[];
  onSelectApplication: (app: Application) => void;
  onLaunchNewAppForm: () => void;
  onNavigate: (tab: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  applications,
  onSelectApplication,
  onLaunchNewAppForm,
  onNavigate
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredApps = applications.filter(
    app =>
      app.companyName.toLowerCase().includes(search.toLowerCase()) ||
      app.roleTitle.toLowerCase().includes(search.toLowerCase()) ||
      app.location.toLowerCase().includes(search.toLowerCase())
  );

  const actions = [
    {
      label: "Add New Internship Tracker",
      desc: "Begin interactive 3-step onboarding pipeline",
      icon: Plus,
      color: "text-emerald-400 bg-emerald-500/10",
      action: () => {
        onLaunchNewAppForm();
        onClose();
      }
    },
    {
      label: "Ask Career Assistant AI",
      desc: "Draft behavioral outlines, prepare code drills",
      icon: Sparkles,
      color: "text-purple-400 bg-purple-500/10",
      action: () => {
        onNavigate("ai-assistant");
        onClose();
      }
    },
    {
      label: "Resume Scoring Diagnostics",
      desc: "Run real-time recruiter parsing assessment",
      icon: Shield,
      color: "text-cyan-400 bg-cyan-500/10",
      action: () => {
        onNavigate("resume-score");
        onClose();
      }
    }
  ];

  const filteredActions = actions.filter(
    act =>
      act.label.toLowerCase().includes(search.toLowerCase()) ||
      act.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-neutral-950/80 backdrop-blur-md transition-opacity duration-300">
      <div
        ref={containerRef}
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-neutral-900/90 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 border-b border-white/5 bg-neutral-950/40">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full py-4 bg-transparent border-0 outline-none text-slate-200 placeholder:text-slate-500 text-sm font-sans"
            placeholder="Type a company name, role element, or tracking command..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Panel Content */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-2">
          {/* Quick Actions Title */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-500 font-display">
                Universal Commands
              </div>
              <div className="space-y-1">
                {filteredActions.map((act, index) => (
                  <button
                    key={index}
                    onClick={act.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left bg-transparent hover:bg-white/5 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${act.color} group-hover:scale-105 transition-transform duration-200`}>
                        <act.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                          {act.label}
                        </div>
                        <div className="text-xs text-slate-500">{act.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Applications list */}
          <div>
            <div className="px-3 py-1.5 pt-3 text-[10px] uppercase font-bold tracking-widest text-slate-500 font-display border-t border-white/5 mt-2">
              Tracked Internships ({filteredApps.length})
            </div>
            {filteredApps.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-500">
                No matching tracked companies found.
              </div>
            ) : (
              <div className="space-y-1 mt-1">
                {filteredApps.map(app => {
                  const statusColors: Record<string, string> = {
                    "Applied": "bg-slate-400/10 text-slate-300 border-slate-500/20",
                    "Under Review": "bg-amber-500/10 text-amber-300 border-amber-500/20",
                    "Interview Scheduled": "bg-purple-500/10 text-purple-300 border-purple-500/20",
                    "Accepted": "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                    "Rejected": "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  };
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        onSelectApplication(app);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-transparent hover:bg-white/5 transition-colors duration-200 group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-display font-medium text-slate-300 border border-white/10 group-hover:border-purple-500/30">
                          {app.companyName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                            {app.companyName}
                          </div>
                          <div className="text-xs text-slate-500">{app.roleTitle}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md border ${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Command Footer hints */}
        <div className="px-4 py-3 bg-neutral-950/60 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span>Enter Select</span>
          </div>
          <div>Esc to cancel</div>
        </div>
      </div>
    </div>
  );
}
