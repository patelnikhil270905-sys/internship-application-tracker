import React, { useState, useEffect } from "react";
import {
  ListTodo,
  TrendingUp,
  Award,
  Users2,
  Lock,
  Compass,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  MapPin,
  Linkedin,
  Clock,
  Sparkles,
  Search,
  Grid,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Bell,
  Github,
  Mail,
  Zap,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

import { Sidebar } from "./components/Sidebar";
import { GlassCard } from "./components/GlassCard";
import { AnimatedButton } from "./components/AnimatedButton";
import { CommandPalette } from "./components/CommandPalette";
import { ResumeAnalyzer } from "./components/ResumeAnalyzer";
import { AIChatbot } from "./components/AIChatbot";
import { MultiStepForm } from "./components/MultiStepForm";
import { Application, User } from "./types";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  fetchApplications,
  updateApplication,
  deleteApplication
} from "./services/api";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState("landing");
  const [loading, setLoading] = useState(true);

  // Authentication Onboarding States
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Focus Tracker Details Panel
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isAddingApp, setIsAddingApp] = useState(false);

  // Search and Command Palette triggers
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Responsive / Mobile View States
  const [mobileTrackView, setMobileTrackView] = useState<"list" | "detail">("list");
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Google interview scheduled for May 25th", read: false, time: "2 hours ago" },
    { id: 2, text: "Resume scorecard analyzed at 91/100 strength", read: true, time: "1 day ago" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize and fetch session data
  useEffect(() => {
    async function initSession() {
      try {
        const currentUserData = await fetchCurrentUser();
        if (currentUserData) {
          setUser(currentUserData);
          const apps = await fetchApplications();
          setApplications(apps);
          if (apps.length > 0) setSelectedApp(apps[0]);
        }
      } catch (err) {
        console.error("Error initializing session:", err);
      } finally {
        setLoading(false);
      }
    }
    initSession();
  }, []);

  // Keyboard Event shortcuts Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError("Please input university email and password parameters.");
      return;
    }
    setIsLoggingIn(true);
    setAuthError("");
    try {
      const loggedUser = await loginUser(emailInput, passwordInput);
      setUser(loggedUser);
      const apps = await fetchApplications();
      setApplications(apps);
      setSelectedApp(apps[0] || null);
      setActiveTab("dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Failed authentication parameters.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmailInput("demo@example.com");
    setPasswordInput("password123");
    setIsLoggingIn(true);
    setAuthError("");
    try {
      const loggedUser = await loginUser("demo@example.com", "password123");
      setUser(loggedUser);
      const apps = await fetchApplications();
      setApplications(apps);
      setSelectedApp(apps[0] || null);
      setActiveTab("dashboard");
    } catch (err: any) {
      setAuthError("Failed to auto-authenticate credentials.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setApplications([]);
    setSelectedApp(null);
    setActiveTab("landing");
  };

  const handleCreateSuccess = (newApp: Application) => {
    setApplications(prev => [newApp, ...prev]);
    setSelectedApp(newApp);
    setIsAddingApp(false);
    setActiveTab("tracking");
    // Trigger notification
    setNotifications(prev => [
      { id: Date.now(), text: `New tracker added for ${newApp.companyName}!`, read: false, time: "Just now" },
      ...prev
    ]);
  };

  const handleStatusUpdate = async (id: string, newStatus: Application["status"]) => {
    try {
      const updated = await updateApplication(id, { status: newStatus });
      setApplications(prev => prev.map(a => (a.id === id ? updated : a)));
      setSelectedApp(updated);
      setNotifications(prev => [
        { id: Date.now(), text: `${updated.companyName} status changed to ${newStatus}`, read: false, time: "Just now" },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteApp = async (id: string) => {
    if (window.confirm("Are you sure you would like to delete this application tracker? This cannot be undone.")) {
      try {
        await deleteApplication(id);
        const remaining = applications.filter(a => a.id !== id);
        setApplications(remaining);
        setSelectedApp(remaining[0] || null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Metrics indicators
  const totalAppsCount = applications.length;
  const appliedCount = applications.filter(a => a.status === "Applied").length;
  const underReviewCount = applications.filter(a => a.status === "Under Review").length;
  const scheduledCount = applications.filter(a => a.status === "Interview Scheduled").length;
  const acceptedCount = applications.filter(a => a.status === "Accepted").length;
  const successRate = totalAppsCount > 0 ? Math.round(((totalAppsCount - applications.filter(a => a.status === "Rejected").length) / totalAppsCount) * 100) : 0;

  // Recharts Chart Series Data
  const activityData = [
    { name: "Week 1", count: 2, reviews: 1, offers: 0 },
    { name: "Week 2", count: 4, reviews: 2, offers: 0 },
    { name: "Week 3", count: 7, reviews: 4, offers: 0 },
    { name: "Week 4", count: totalAppsCount || 4, reviews: underReviewCount || 2, offers: acceptedCount || 1 }
  ];

  const pieData = [
    { name: "Applied", value: appliedCount || 1, color: "#94a3b8" },
    { name: "Under Review", value: underReviewCount || 1, color: "#f59e0b" },
    { name: "Interview Scheduled", value: scheduledCount || 1, color: "#c084fc" },
    { name: "Accepted", value: acceptedCount || 1, color: "#10b981" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center gap-4 text-slate-100">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
          <span className="text-xl">🚀</span>
        </div>
        <p className="font-display text-sm tracking-wide text-slate-400">
          Loading Unified Enterprise Systems...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-slate-200 font-sans antialiased selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* GLOWING PARTICLE BACKGROUND HALOS */}
      <div className="fixed inset-0 pointer-events-none select-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] glow-animation" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] glow-animation" />
        <div className="absolute top-10 right-1/3 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      {/* COMMAND PALETTE POPUP */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        applications={applications}
        onSelectApplication={app => {
          setSelectedApp(app);
          setActiveTab("tracking");
        }}
        onLaunchNewAppForm={() => {
          setIsAddingApp(true);
          setActiveTab("tracking");
        }}
        onNavigate={tab => setActiveTab(tab)}
      />

      {/* LAYOUT CONTAINER */}
      <div className="relative z-10 flex min-h-screen">
        
        {/* LOGGED IN USER INTERFACE NAVIGATION */}
        {user && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            onLogout={handleLogout}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            applicationsCount={applications.length}
          />
        )}

        {/* MAIN BODY SCROLL PORT */}
        <main className={`flex-1 overflow-x-hidden ${user ? "lg:pl-64 pb-20 lg:pb-8" : ""}`}>
          
          {/* USER GLOBAL DASHBOARD SYSTEM HEADER BAR */}
          {user && (
            <header className="px-6 lg:px-8 py-4 border-b border-white/5 bg-neutral-950/40 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-slate-400 border border-white/5 cursor-pointer transition-all active:scale-95 text-left"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span className="opacity-70">Seek commands...</span>
                  <span className="px-1 py-0.5 text-[9px] font-mono text-slate-600 bg-neutral-950 border border-white/10 rounded ml-1">Ctrl+K</span>
                </button>
              </div>

              {/* Status and Notifications dropdown triggers */}
              <div className="flex items-center gap-3 relative">
                <div className="hidden sm:flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  STABLE CONNECTION
                </div>

                {/* Notifications trigger */}
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer relative"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-purple-500 border-2 border-[#050816] rounded-full animate-bounce" />
                  )}
                </button>

                {/* Mobile Profile Trigger (hidden on lg, shown on mobile) */}
                <div className="relative lg:hidden">
                  <button
                    onClick={() => setShowMobileProfile(!showMobileProfile)}
                    className="flex items-center gap-2 p-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer overflow-hidden focus:outline-none"
                  >
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                  </button>

                  {showMobileProfile && (
                    <div className="absolute right-0 top-11 w-64 rounded-2xl bg-neutral-900 border border-white/15 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 space-y-4 text-left">
                      {/* Brand Info */}
                      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                        <img
                          src={user.profilePhoto}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-100 truncate">
                            {user.name}
                          </h4>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                            <GraduationCap className="w-3 h-3 text-purple-400 shrink-0" />
                            {user.university}
                          </span>
                        </div>
                      </div>

                      {/* Skills list */}
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-mono font-bold tracking-widest text-slate-500 uppercase block">Captured Student Skills</span>
                        <div className="flex flex-wrap gap-1">
                          {user.skills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="bg-neutral-950 border border-white/5 text-[8px] font-mono text-slate-400 px-1.5 py-0.5 rounded-md"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setShowMobileProfile(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-rose-300 hover:text-rose-100 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/25 px-3 py-2 rounded-xl transition-all cursor-pointer text-center justify-center font-mono"
                      >
                        Sign Out Account
                      </button>
                    </div>
                  )}
                </div>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 rounded-2xl bg-neutral-900 border border-white/15 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5 text-xs font-semibold text-slate-200">
                      <span>Recent Activity Alerts</span>
                      <button
                        onClick={() => {
                          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        }}
                        className="text-[10px] text-purple-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className={`p-2.5 rounded-xl border transition-colors ${notif.read ? "bg-transparent border-white/5 text-slate-400" : "bg-purple-500/5 border-purple-500/20 text-slate-200"}`}>
                          <p className="text-xs">{notif.text}</p>
                          <span className="text-[9px] text-slate-500 block mt-1 font-mono">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </header>
          )}

          <div className="px-6 lg:px-8 py-8 space-y-12">
            
            {/* TABS SWAP SWITCH BOARD */}
            {activeTab === "landing" && (
              <div id="landing-hero-container" className="space-y-24">
                
                {/* HERO CORE PANEL CARD */}
                <section className="text-center max-w-4xl mx-auto space-y-8 pt-12">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/25 text-purple-300 text-xs font-display tracking-wide animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    Now Launched: Unified AI Career Ecosystem
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-none text-slate-100">
                    Track Your <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 text-glow-purple">
                      Internship Journey
                    </span>
                  </h1>

                  <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-sans">
                    Never lose track of another application. Build enterprise-grade resumes, benchmark ATS metrics instantly, and optimize interview simulations with your private career advisor.
                  </p>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    {user ? (
                      <AnimatedButton variant="primary" onClick={() => setActiveTab("dashboard")}>
                        Enter System Console <ChevronRight className="w-4 h-4" />
                      </AnimatedButton>
                    ) : (
                      <>
                        <AnimatedButton variant="primary" onClick={handleDemoLogin}>
                          Activate Demo Student Account
                        </AnimatedButton>
                        <a href="#onboarding-auth-sec" className="no-underline">
                          <AnimatedButton variant="secondary" className="w-full sm:w-auto">
                            Sign In Credentials
                          </AnimatedButton>
                        </a>
                      </>
                    )}
                  </div>

                  {/* PORTABLE PREVIEW INTERFACE MOCKUP SCREEN */}
                  <div className="pt-8 relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] bg-neutral-950/60 max-w-3xl mx-auto">
                    <div className="absolute top-0 left-0 right-0 h-10 bg-neutral-900/80 border-b border-white/5 flex items-center px-4 gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono text-slate-500 ml-4">https://ai-tracker.enterprise/dashboard</span>
                    </div>
                    <div className="pt-14 pb-8 px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left select-none opacity-90">
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">GOOGLE</span>
                        <div className="text-xs font-semibold text-slate-200">UX Design Associate</div>
                        <span className="text-[9px] px-2 py-0.5 rounded border border-purple-500/20 text-purple-300 bg-purple-500/5">In Assessment</span>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">STRIPE</span>
                        <div className="text-xs font-semibold text-slate-200">Developer API Intern</div>
                        <span className="text-[9px] px-2 py-0.5 rounded border border-amber-500/20 text-amber-300 bg-amber-500/5">Screen Scheduled</span>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">VERCEL</span>
                        <div className="text-xs font-semibold text-slate-200">DevRel Operations</div>
                        <span className="text-[9px] px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-300 bg-emerald-500/5">Offer Issued</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* STATS RATING COUNTERS */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center select-none max-w-5xl mx-auto">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-3xl md:text-4xl font-display font-medium text-slate-100 tracking-tight">450+</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Applications Synced</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-3xl md:text-4xl font-display font-medium text-slate-100 tracking-tight">12,000+</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Global Students</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-3xl md:text-4xl font-display font-medium text-slate-100 tracking-tight">94%</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">ATS Success Rate</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="text-3xl md:text-4xl font-display font-medium text-slate-100 tracking-tight">4.9/5</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Student Rating</div>
                  </div>
                </section>

                {/* VISUAL FEATURE BENTO GRID */}
                <section className="space-y-6 max-w-5xl mx-auto">
                  <div className="text-center">
                    <h2 className="text-2xl md:text-4xl font-display font-medium text-slate-100">
                      Productive Architecture
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Engineered specifically for students and graduates tracking large applications metrics.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard hoverable={false} className="p-6 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <ListTodo className="w-5 h-5 text-glow-purple" />
                      </div>
                      <h3 className="font-display font-semibold text-slate-200 text-sm">Smart Tracking pipeline</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Input salary ranges, deadline updates, notes, and automatically sync timeline stages beautifully.
                      </p>
                    </GlassCard>

                    <GlassCard hoverable={false} className="p-6 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Sparkles className="w-5 h-5 text-glow-purple" />
                      </div>
                      <h3 className="font-display font-semibold text-slate-200 text-sm">AI Career Mentor</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Need code review details or mock behavioral assessments? Converse with an expert coach linked to your files.
                      </p>
                    </GlassCard>

                    <GlassCard hoverable={false} className="p-6 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Award className="w-5 h-5 text-glow-purple" />
                      </div>
                      <h3 className="font-display font-semibold text-slate-200 text-sm">Resume Score Optimizer</h3>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Upload plain ASCII and check keyword density alignments, bullet score modifiers and quick grammatical enhancements.
                      </p>
                    </GlassCard>
                  </div>
                </section>

                {/* TESTIMONIAL CAROUSEL CARDS */}
                <section className="space-y-6 max-w-4xl mx-auto">
                  <div className="text-center">
                    <h2 className="text-2xl font-display font-medium text-slate-100">Recommended by Placements</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "The ATS score analysis rewrote my structural bullets, and I was scheduled for interviews at Stripe within two weeks. Absolutely recommended!"
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center text-xs font-bold text-slate-200">
                          LH
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">Lucas Henders</div>
                          <div className="text-[10px] text-slate-500 font-mono">SWE INTERN, STRIPE</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        "I used to operate from custom Notion boards and multiple spread sheets. Having a connected Career AI Coach inside a centralized scheduler is mindblowing."
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-cyan-500/10 border border-cyan-500/30 rounded-full flex items-center justify-center text-xs font-bold text-slate-200">
                          SM
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-200">Sofia Martinez</div>
                          <div className="text-[10px] text-slate-500 font-mono">MACHINE LEARNING INTERN, GOOGLE</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ONBOARDING EMAIL PASSWORD REGISTER SCREEN AREA */}
                {!user && (
                  <section id="onboarding-auth-sec" className="max-w-md mx-auto pt-8">
                    <GlassCard hoverable={false} className="p-8 space-y-6">
                      <div className="text-center space-y-2">
                        <Lock className="w-8 h-8 text-purple-400 mx-auto" />
                        <h3 className="text-xl font-display font-medium text-slate-200">
                          Sign In Secure Console
                        </h3>
                        <p className="text-xs text-slate-500">
                          Access your saved applications database in real-time. Or bypass with our preloaded Demo login below.
                        </p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                            University Email
                          </label>
                          <input
                            type="email"
                            className="w-full px-4 py-3 bg-neutral-900/80 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                            placeholder="you@university.edu"
                            value={emailInput}
                            onChange={e => setEmailInput(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                            Enter Password
                          </label>
                          <input
                            type="password"
                            className="w-full px-4 py-3 bg-neutral-900/80 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                            placeholder="password123"
                            value={passwordInput}
                            onChange={e => setPasswordInput(e.target.value)}
                          />
                        </div>

                        {authError && (
                          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                            {authError}
                          </div>
                        )}

                        <AnimatedButton
                          type="submit"
                          disabled={isLoggingIn}
                          variant="primary"
                          className="w-full py-3.5"
                        >
                          {isLoggingIn ? "Authenticating Session Parameters..." : "Sign In & Access Pipeline"}
                        </AnimatedButton>
                      </form>

                      <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/5" />
                        <span className="flex-shrink mx-4 text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                          OR ACCESS INSTANTLY
                        </span>
                        <div className="flex-grow border-t border-white/5" />
                      </div>

                      <AnimatedButton
                        onClick={handleDemoLogin}
                        variant="secondary"
                        className="w-full py-3.5 text-glow-purple border-purple-500/20 hover:border-purple-500/40"
                      >
                        Enter Playground with preloaded demo profile
                      </AnimatedButton>
                    </GlassCard>
                  </section>
                )}

                {/* PREMIUM MINIMALIST FOOTER */}
                <footer className="pt-16 pb-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 max-w-5xl mx-auto text-slate-500 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 font-display font-medium">Intern Tracker</span>
                    <span>•</span>
                    <span>© 2026 Academic Systems inc. All rights reserved.</span>
                  </div>
                  <div className="flex gap-4">
                    <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors flex items-center gap-1">
                      <Github className="w-4 h-4" /> GitHub
                    </a>
                    <span>•</span>
                    <a href="mailto:contact@academic.edu" className="hover:text-slate-300 transition-colors">
                      Contact support
                    </a>
                    <span>•</span>
                    <a href="#" className="hover:text-slate-300 transition-colors">
                      Security guidelines
                    </a>
                  </div>
                </footer>
              </div>
            )}

            {/* MAIN DASHBOARD HUD TAB */}
            {activeTab === "dashboard" && (
              <div id="dashboard-analytics-sec" className="space-y-8">
                
                {/* Title */}
                <div className="flex justify-between items-center bg-neutral-950/20 p-6 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-xs text-purple-400 font-mono font-semibold uppercase tracking-widest">Academic Console Workspace</span>
                    <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight mt-1">
                      Placement Dashboard Analytics
                    </h1>
                  </div>
                  <AnimatedButton
                    onClick={() => {
                      setIsAddingApp(true);
                      setActiveTab("tracking");
                    }}
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Track New Opportunity
                  </AnimatedButton>
                </div>

                {/* STAGE METRIC CARDS HEADER */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                    <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Active Pipeline</div>
                    <div className="text-3xl font-display font-semibold text-slate-100 mt-1">{totalAppsCount}</div>
                    <span className="text-[9px] text-purple-400 font-bold block mt-1.5 uppercase tracking-widest">Calculated across terms</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                    <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Interviews Scheduled</div>
                    <div className="text-3xl font-display font-semibold text-purple-300 text-glow-purple mt-1">{scheduledCount}</div>
                    <span className="text-[9px] text-amber-500 font-medium block mt-1.5">Action pending scheduled slot</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                    <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Success & alignment Rate</div>
                    <div className="text-3xl font-display font-semibold text-cyan-300 text-glow-cyan mt-1">{successRate}%</div>
                    <span className="text-[9px] text-slate-400 block mt-1.5">Excludes rejected nodes</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden">
                    <div className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Offers Completed</div>
                    <div className="text-3xl font-display font-semibold text-emerald-300 mt-1">{acceptedCount}</div>
                    <span className="text-[9px] text-emerald-400 font-medium block mt-1.5">Awaiting user final signature</span>
                  </div>
                </div>

                {/* ANALYTICS CHARTS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Recharts Area Flow chart */}
                  <div className="lg:col-span-8">
                    <GlassCard hoverable={false} className="p-6 space-y-4">
                      <div>
                        <h4 className="font-display font-medium text-slate-200 text-sm">Application Cohort Accumulation</h4>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">ACTIVE WEEK-OVER-WEEK METRICS</span>
                      </div>
                      
                      <div className="h-72 w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                            <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                            <Tooltip
                              contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                              itemStyle={{ color: "#a855f7", fontSize: "11px" }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#a855f7" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Recharts Pie status composition chart */}
                  <div className="lg:col-span-4">
                    <GlassCard hoverable={false} className="p-6 h-full flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-medium text-slate-200 text-sm">Status Composition</h4>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">DISTRIBUTION COMPILATION</span>
                      </div>

                      <div className="h-44 w-full flex items-center justify-center pt-2 select-none">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ background: "#060606", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px" }}
                              itemStyle={{ fontSize: "10px" }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-1.5 pt-4 border-t border-white/5">
                        {pieData.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="flex items-center gap-2 text-slate-400">
                              <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </span>
                            <span className="font-mono text-slate-200 font-bold">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  </div>
                </div>

                {/* RESUME PARSE INDEX FEEDBACK HIGHLIGHT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Metric feedback block */}
                  <GlassCard
                    onClick={() => setActiveTab("resume-score")}
                    className="p-6 cursor-pointer border border-purple-500/10 hover:border-purple-500/30 flex justify-between items-center"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">RESUME STRENGTH INDEX</span>
                      <h3 className="font-display font-medium text-slate-200 text-lg">ATS Optimization Diagnostics</h3>
                      <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                        Verify keyword densities, active STAR methodologies, and scan recommendations parameters.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-display font-bold text-purple-300">84%</div>
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">CLICK TO RUN REPORT</span>
                    </div>
                  </GlassCard>

                  {/* AI Quick Strategy block */}
                  <GlassCard
                    onClick={() => setActiveTab("ai-assistant")}
                    className="p-6 cursor-pointer border border-cyan-500/10 hover:border-cyan-500/30 flex justify-between items-center"
                  >
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">COACH INTUITION TRIGGER</span>
                      <h3 className="font-display font-medium text-slate-200 text-lg">AI Mock Interview Training</h3>
                      <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                        Let your career assistant build target-company study schedules and question structures.
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-cyan-500/10 shrink-0 text-cyan-400 text-[10px] font-bold font-mono">
                      ASK AI
                    </div>
                  </GlassCard>
                </div>

                {/* CURRENT LIVE MILESTONES ACTIVITY STREAM */}
                <div className="space-y-4">
                  <h3 className="font-display font-medium text-slate-200 text-sm">Key Upcoming Milestones</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-3.5 items-start">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400 shrink-0 font-mono text-xs font-bold">25 <div className="text-[9px] font-medium leading-none">MAY</div></div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200">Google UX Screen</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Lead developer assessments call (11:00 AM)</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-3.5 items-start">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0 font-mono text-xs font-bold">30 <div className="text-[9px] font-medium leading-none">MAY</div></div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200">Stripe Referrals deadline</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Submit modified CV profiles and assessments</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-3.5 items-start">
                      <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 shrink-0 font-mono text-xs font-bold">10 <div className="text-[9px] font-medium leading-none">JUN</div></div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200">Vercel Operations update</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Review portfolios and NextJS frameworks</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TRACKING AND ADDS TAB */}
            {activeTab === "tracking" && (
              <div id="applications-tracker-sec" className="space-y-8">
                
                {isAddingApp ? (
                  <MultiStepForm
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setIsAddingApp(false)}
                  />
                ) : (
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start bg-neutral-950/20 p-6 rounded-2xl border border-white/5">
                      <div>
                        <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight">
                          Active Target Milestones
                        </h1>
                        <p className="text-slate-400 text-xs mt-1">
                          Create and adjust real-time tracking checkpoints for active internship applications.
                        </p>
                      </div>

                      <AnimatedButton
                        onClick={() => setIsAddingApp(true)}
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 animate-bounce" /> Onboard Application Form
                      </AnimatedButton>
                    </div>

                    {/* Left Checklist and active Details layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* 1. Tracked card feed column */}
                      <div className={`lg:col-span-4 space-y-4 ${mobileTrackView === "detail" ? "hidden lg:block" : "block"}`}>
                        <div className="p-3 bg-neutral-950/60 rounded-xl border border-white/5 flex items-center gap-2">
                          <Search className="w-4 h-4 text-slate-500" />
                          <input
                            type="text"
                            className="bg-transparent border-0 text-slate-200 placeholder:text-slate-500 outline-none text-xs w-full"
                            placeholder="Seek tracked firms..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                          />
                        </div>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                          {applications
                            .filter(app => app.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(app => {
                              const statusStyles: Record<string, string> = {
                                "Applied": "bg-slate-400/10 text-slate-300 border-slate-500/20",
                                "Under Review": "bg-amber-500/10 text-amber-300 border-amber-500/20",
                                "Interview Scheduled": "bg-purple-500/10 text-purple-300 border-purple-500/20",
                                "Accepted": "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
                                "Rejected": "bg-rose-500/10 text-rose-300 border-rose-500/20"
                              };

                              const isFocused = selectedApp?.id === app.id;
                              
                              return (
                                <div
                                  key={app.id}
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setMobileTrackView("detail");
                                  }}
                                  className={`p-4 rounded-xl border cursor-pointer select-none transition-all duration-300 ${
                                    isFocused
                                      ? "bg-purple-500/5 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.08)]"
                                      : "bg-white/3 hover:bg-white/5 border-white/5 hover:border-white/10"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className={`text-sm font-semibold transition-colors ${isFocused ? "text-purple-300" : "text-slate-200"}`}>
                                        {app.companyName}
                                      </h3>
                                      <span className="text-[11px] text-slate-400 block truncate max-w-[150px] mt-0.5">
                                        {app.roleTitle}
                                      </span>
                                    </div>
                                    <span className={`text-[9px] px-2 py-0.5 rounded border ${statusStyles[app.status]}`}>
                                      {app.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 shrink-0" />
                                      {app.appliedDate}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 shrink-0" />
                                      {app.salary}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          
                          {applications.filter(app => app.companyName.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500 text-xs">
                              No tracked opportunities found matching constraints.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. Interactive vertical connected timeline and details panel */}
                      <div className={`lg:col-span-8 ${mobileTrackView === "list" ? "hidden lg:block" : "block"}`}>
                        {selectedApp && (
                          <div className="lg:hidden mb-4">
                            <button
                              onClick={() => setMobileTrackView("list")}
                              className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                            >
                              <ChevronLeft className="w-4 h-4 text-purple-400" /> Return to Opportunities List
                            </button>
                          </div>
                        )}
                        {selectedApp ? (
                          <GlassCard hoverable={false} className="p-8 space-y-8">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-white/5">
                              <div>
                                <h2 className="text-xl font-display font-medium text-slate-100">
                                  {selectedApp.companyName}
                                </h2>
                                <p className="text-slate-400 text-xs flex items-center gap-3 mt-1.5 font-mono">
                                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-purple-400" /> {selectedApp.location}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-purple-400" /> {selectedApp.salary}</span>
                                </p>
                              </div>

                              {/* Controls to update status */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Update Term:</span>
                                <select
                                  id="app-status-select"
                                  className="px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-purple-500/50"
                                  value={selectedApp.status}
                                  onChange={e => handleStatusUpdate(selectedApp.id, e.target.value as any)}
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Under Review">Under Review</option>
                                  <option value="Interview Scheduled">Interview Scheduled</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                                
                                <button
                                  onClick={() => handleDeleteApp(selectedApp.id)}
                                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-300 border border-rose-500/20 hover:border-rose-400 cursor-pointer"
                                  title="Delete check target"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Connected Pipeline timeline Visual */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-display font-medium text-slate-200">
                                Milestone Connected Pipeline
                              </h3>

                              <div className="relative pl-8 space-y-6 select-none pt-2">
                                {/* Vertical Connected thread line */}
                                <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-800" />

                                {selectedApp.timeline.map((tl, index) => (
                                  <div key={index} className="relative flex gap-4 transition-all duration-300">
                                    
                                    {/* Glowing Dot point */}
                                    <div className={`absolute -left-7 w-5 bg-[#050816] rounded-full border-2 flex items-center justify-center transition-all ${
                                      tl.completed
                                        ? "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.7)] h-5"
                                        : "border-slate-800 h-5"
                                    }`}>
                                      {tl.completed && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />}
                                    </div>

                                    <div>
                                      <h4 className={`text-xs font-semibold ${tl.completed ? "text-slate-100" : "text-slate-500"}`}>
                                        {tl.status}
                                      </h4>
                                      <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">{tl.date}</span>
                                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{tl.notes}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Additional custom profile responses if onboarding form completed */}
                            {selectedApp.personalDetails && (
                              <div className="border-t border-white/5 pt-8 space-y-6">
                                <h3 className="text-sm font-display font-medium text-slate-200 uppercase tracking-wider">
                                  Captured Profile Attachment Data
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                  <div className="p-3 bg-neutral-950/40 rounded-lg space-y-1 border border-white/5">
                                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">CONTACT APPLICANT</span>
                                    <div className="text-slate-300">{selectedApp.personalDetails.fullName}</div>
                                    <div className="text-slate-400 text-[10px]">{selectedApp.personalDetails.email} • {selectedApp.personalDetails.phone}</div>
                                  </div>
                                  <div className="p-3 bg-neutral-950/40 rounded-lg space-y-1 border border-white/5">
                                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">LINKED RESUME</span>
                                    <div className="text-purple-300 font-mono">{selectedApp.personalDetails.resumeFileName}</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedApp.projects && selectedApp.projects.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="text-xs font-display font-semibold text-slate-300 uppercase tracking-wider">Highlighted Stack Projects</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {selectedApp.projects.map((proj, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-neutral-950/40 border border-white/5 space-y-2 text-xs">
                                      <div className="font-semibold text-slate-200">{proj.title}</div>
                                      <p className="text-[11px] text-slate-400 leading-relaxed">{proj.description}</p>
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {proj.skills.map((sk, sIdx) => (
                                          <span key={sIdx} className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded">
                                            {sk}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Review Section */}
                            {selectedApp.notes && (
                              <div className="pt-6 border-t border-white/5">
                                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block mb-2">Internal assessment Log</span>
                                <p className="text-xs text-slate-400 bg-neutral-950/40 p-4 rounded-xl border border-white/5 leading-relaxed">
                                  {selectedApp.notes}
                                </p>
                              </div>
                            )}
                          </GlassCard>
                        ) : (
                          <div className="p-16 text-center border-dashed border border-white/10 rounded-2xl">
                            <span className="text-4xl block mb-3">📁</span>
                            <h3 className="font-display font-medium text-slate-300">Awaiting Track Selection</h3>
                            <button
                              onClick={() => {
                                if (applications.length > 0) setSelectedApp(applications[0]);
                              }}
                              className="mt-4 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
                            >
                              Load default pre-seeded checklists
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COACH ASSISTANT CHAT TAB */}
            {activeTab === "ai-assistant" && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div>
                  <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight">
                    AI Career Mentor
                  </h1>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Built natively on top of the Gemini-3.5-flash LLM core. Ask custom interview strategies, write cold emails, construct algorithms practice cards, or analyze company profiles in high-performance workspaces.
                  </p>
                </div>
                
                <AIChatbot currentTab={activeTab} />
              </div>
            )}

            {/* ATS OPTIMIZER TAB */}
            {activeTab === "resume-score" && (
              <div className="max-w-5xl mx-auto">
                <ResumeAnalyzer activeSkills={user?.skills || []} />
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
