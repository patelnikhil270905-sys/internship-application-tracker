import React, { useState, useEffect } from "react";
import { User, Briefcase, Plus, Trash, Globe, Github, Sparkles, Check, ChevronRight, ChevronLeft, Upload, File, AlertCircle, Save } from "lucide-react";
import { Application } from "../types";
import { createApplication } from "../services/api";
import { AnimatedButton } from "./AnimatedButton";
import { GlassCard } from "./GlassCard";

interface MultiStepFormProps {
  onSuccess: (newApp: Application) => void;
  onCancel: () => void;
}

export function MultiStepForm({ onSuccess, onCancel }: MultiStepFormProps) {
  const [step, setStep] = useState(1);
  const [draftSaved, setDraftSaved] = useState(false);

  // Form Fields State
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [location, setLocation] = useState("Mountain View, CA");
  const [salary, setSalary] = useState("$45/hr");

  // Step 1: Personal Details (30%)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [personalLinkedin, setPersonalLinkedin] = useState("");
  const [resumeFile, setResumeFile] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Step 2: Projects Section (30%)
  const [projects, setProjects] = useState<Array<{
    title: string;
    description: string;
    githubLink: string;
    portfolioLink: string;
    skills: string[];
  }>>([
    { title: "", description: "", githubLink: "", portfolioLink: "", skills: [] }
  ]);
  const [newSkillText, setNewSkillText] = useState<Record<number, string>>({});

  // Step 3: Final Questions (40%)
  const [desiredRole, setDesiredRole] = useState("");
  const [availability, setAvailability] = useState("Immediately");
  const [whyJoin, setWhyJoin] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load draft if exists
  useEffect(() => {
    const savedDraft = localStorage.getItem("tracker_draft_application");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setCompanyName(draft.companyName || "");
        setRoleTitle(draft.roleTitle || "");
        setLocation(draft.location || "Mountain View, CA");
        setSalary(draft.salary || "$45/hr");
        setFullName(draft.fullName || "");
        setPhone(draft.phone || "");
        setEmail(draft.email || "");
        setPersonalLinkedin(draft.personalLinkedin || "");
        setResumeFile(draft.resumeFile || null);
        if (draft.projects) setProjects(draft.projects);
        setDesiredRole(draft.desiredRole || "");
        setAvailability(draft.availability || "Immediately");
        setWhyJoin(draft.whyJoin || "");
        setAdditionalNotes(draft.additionalNotes || "");
        setStep(draft.step || 1);
      } catch (err) {
        console.error("Failed to restore draft application:", err);
      }
    }
  }, []);

  // Save current progress to localStorage
  const saveDraft = () => {
    const draft = {
      companyName, roleTitle, location, salary,
      fullName, phone, email, personalLinkedin, resumeFile,
      projects, desiredRole, availability, whyJoin, additionalNotes, step
    };
    localStorage.setItem("tracker_draft_application", JSON.stringify(draft));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  // Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!companyName.trim()) newErrors.companyName = "Company Name is required.";
      if (!roleTitle.trim()) newErrors.roleTitle = "Role Title is required.";
      if (!fullName.trim()) newErrors.fullName = "Full Name is required.";
      if (!email.trim() || !email.includes("@")) newErrors.email = "A valid University email is required.";
      if (!phone.trim()) newErrors.phone = "Phone number is required.";
      if (!resumeFile) newErrors.resumeFile = "Please attach or drag & drop a PDF resume.";
    } else if (currentStep === 2) {
      projects.forEach((proj, index) => {
        if (!proj.title.trim()) {
          newErrors[`proj-${index}-title`] = "Project title is required.";
        }
        if (!proj.description.trim() || proj.description.length < 15) {
          newErrors[`proj-${index}-desc`] = "Explain your project in at least 15 characters.";
        }
      });
    } else if (currentStep === 3) {
      if (!desiredRole.trim()) newErrors.desiredRole = "Target team role is required.";
      if (!whyJoin.trim() || whyJoin.length < 30) {
        newErrors.whyJoin = "Briefly explain why you want to join this firm in at least 30 characters.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      saveDraft();
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  // Drag & drop resume handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFile(e.dataTransfer.files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0].name);
    }
  };

  // Project cards add/delete logic
  const handleAddProject = () => {
    setProjects(prev => [...prev, { title: "", description: "", githubLink: "", portfolioLink: "", skills: [] }]);
  };

  const handleRemoveProject = (index: number) => {
    if (projects.length === 1) return;
    setProjects(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateProjectField = (index: number, field: string, val: any) => {
    setProjects(prev => prev.map((proj, idx) => {
      if (idx === index) {
        return { ...proj, [field]: val };
      }
      return proj;
    }));
  };

  const handleAddSkillTag = (index: number) => {
    const text = newSkillText[index] || "";
    if (!text.trim()) return;
    const currentSkills = projects[index].skills;
    if (!currentSkills.includes(text.trim())) {
      updateProjectField(index, "skills", [...currentSkills, text.trim()]);
    }
    setNewSkillText(prev => ({ ...prev, [index]: "" }));
  };

  const handleRemoveSkillTag = (projIndex: number, skillToRemove: string) => {
    const currentSkills = projects[projIndex].skills;
    updateProjectField(projIndex, "skills", currentSkills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    const pipelineData = {
      companyName,
      roleTitle,
      location,
      salary,
      status: "Applied" as const,
      personalDetails: { fullName, phone, email, linkedinUrl: personalLinkedin, resumeFileName: resumeFile || "unspecified" },
      projects: projects.map(p => ({ title: p.title, description: p.description, githubLink: p.githubLink, portfolioLink: p.portfolioLink, skills: p.skills })),
      finalAnswers: { desiredRole, availability, whyJoin, additionalNotes },
      notes: `Onboarded through interactive multi-step tracker flow. Why join rationale: "${whyJoin}"`
    };

    try {
      const savedApp = await createApplication(pipelineData);
      // Clean up drafts
      localStorage.removeItem("tracker_draft_application");
      onSuccess(savedApp);
    } catch (err: any) {
      setErrors({ submit: "Failed to persist application. Please confirm connection." });
    }
  };

  // Percentage Calculations
  const progressPercent = step === 1 ? 30 : step === 2 ? 65 : 100;

  return (
    <div id="multistep-onboarding-form" className="space-y-8">
      {/* Visual Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-display font-medium text-slate-100">
            Internal Application Setup Checklist
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Publish a tracking record and configure active profile attachments.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={saveDraft}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 text-glow-purple" />
            {draftSaved ? "Draft Saved!" : "Save Draft"}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-white/5 hover:bg-white/5 text-xs text-slate-400 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Progress pipeline Bar */}
      <div className="space-y-2 bg-neutral-950/40 p-4 rounded-xl border border-white/5">
        <div className="flex justify-between items-center text-xs font-mono text-slate-400">
          <div className="flex gap-4 md:gap-6">
            <span className={step === 1 ? "text-purple-400 font-bold" : "hidden sm:inline text-slate-500"}>
              {step === 1 ? "1. Profile Overview (30%)" : "1. Profile"}
            </span>
            <span className={step === 2 ? "text-purple-400 font-bold" : "hidden sm:inline text-slate-500"}>
              {step === 2 ? "2. Showcase (30%)" : "2. Showcase"}
            </span>
            <span className={step === 3 ? "text-purple-400 font-bold" : "hidden sm:inline text-slate-500"}>
              {step === 3 ? "3. Career Fit (40%)" : "3. Career"}
            </span>
            {/* On mobile, if all are hidden except active, show a simple counter fallback */}
            <span className="sm:hidden text-purple-400 font-bold">
              Step {step} of 3: {step === 1 ? "Profile" : step === 2 ? "Showcase" : "Career Fit"}
            </span>
          </div>
          <span className="text-purple-400 font-semibold shrink-0">{progressPercent}% DONE</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Current Step Forms switcher */}
      <GlassCard hoverable={false} className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/5 mb-2">
              <h3 className="text-lg font-display font-semibold text-slate-100 flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Intership Target & Personal Profile Credentials
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Target Company Name *</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-neutral-900/60 border rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 ${
                    errors.companyName ? "border-rose-500/40" : "border-white/10"
                  }`}
                  placeholder="e.g. Google, Stripe, Nvidia"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                />
                {errors.companyName && <span className="text-[10px] text-rose-400 mt-1 block">{errors.companyName}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Target Internship Role Title *</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-neutral-900/60 border rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 ${
                    errors.roleTitle ? "border-rose-500/40" : "border-white/10"
                  }`}
                  placeholder="e.g. Machine Learning Architect, Backend Developer"
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                />
                {errors.roleTitle && <span className="text-[10px] text-rose-400 mt-1 block">{errors.roleTitle}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Full Legal Name *</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-neutral-900/60 border rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 ${
                    errors.fullName ? "border-rose-500/40" : "border-white/10"
                  }`}
                  placeholder="John Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
                {errors.fullName && <span className="text-[10px] text-rose-400 mt-1 block">{errors.fullName}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">University Email Address *</label>
                <input
                  type="email"
                  className={`w-full px-4 py-3 bg-neutral-900/60 border rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 ${
                    errors.email ? "border-rose-500/40" : "border-white/10"
                  }`}
                  placeholder="name@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                {errors.email && <span className="text-[10px] text-rose-400 mt-1 block">{errors.email}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Contact Telephone *</label>
                <input
                  type="tel"
                  className={`w-full px-4 py-3 bg-neutral-900/60 border rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 ${
                    errors.phone ? "border-rose-500/40" : "border-white/10"
                  }`}
                  placeholder="+1 (555) 555-5555"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                {errors.phone && <span className="text-[10px] text-rose-400 mt-1 block">{errors.phone}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">LinkedIn Profile URL</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 bg-neutral-900/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="https://linkedin.com/in/username"
                  value={personalLinkedin}
                  onChange={e => setPersonalLinkedin(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Office Location Setting</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-neutral-900/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Estimated Hourly Compensation</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-neutral-900/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                />
              </div>
            </div>

            {/* Resume Upload Drag Zones */}
            <div className="space-y-2">
              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Upload Resume PDF Document *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive ? "border-purple-500 bg-purple-500/5" : "border-white/10 hover:border-white/20 bg-neutral-900/40"
                } ${resumeFile ? "border-emerald-500/50 bg-emerald-500/5" : ""}`}
              >
                <input
                  id="resume-input"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                
                {resumeFile ? (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <File className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{resumeFile}</span>
                    <span className="text-[10px] text-emerald-400">Successfully attached file preview target</span>
                    <button
                      onClick={() => setResumeFile(null)}
                      className="mt-2 text-xs text-rose-400 hover:underline hover:text-rose-300"
                    >
                      Remove and replace file
                    </button>
                  </div>
                ) : (
                  <label htmlFor="resume-input" className="flex flex-col items-center justify-center gap-2 cursor-pointer group">
                    <div className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">Drag & Drop Resume PDF here</span>
                    <span className="text-[10px] text-slate-500">or click to browse local directory</span>
                  </label>
                )}
              </div>
              {errors.resumeFile && <span className="text-[10px] text-rose-400 block mt-1">{errors.resumeFile}</span>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/5 mb-4 flex justify-between items-center">
              <h3 className="text-lg font-display font-semibold text-slate-100 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                Technical Highlight Projects Showcase
              </h3>
              <button
                onClick={handleAddProject}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-xs text-purple-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Project
              </button>
            </div>

            <div className="space-y-6">
              {projects.map((proj, pIdx) => (
                <div
                  key={pIdx}
                  className="p-6 bg-neutral-900/60 rounded-xl border border-white/5 relative overflow-hidden group/card"
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    {projects.length > 1 && (
                      <button
                        onClick={() => handleRemoveProject(pIdx)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block mb-4">
                    PROJECT #{pIdx + 1}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Project Title *</label>
                      <input
                        type="text"
                        className={`w-full px-4 py-2.5 bg-neutral-950/40 border rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500/50 ${
                          errors[`proj-${pIdx}-title`] ? "border-rose-500/40" : "border-white/5"
                        }`}
                        placeholder="e.g. Telemetry API Broker, Distributed Microservices Hub"
                        value={proj.title}
                        onChange={e => updateProjectField(pIdx, "title", e.target.value)}
                      />
                      {errors[`proj-${pIdx}-title`] && <span className="text-[10px] text-rose-400 mt-1 block">{errors[`proj-${pIdx}-title`]}</span>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Description Summary *</label>
                      <textarea
                        className={`w-full h-24 px-4 py-2.5 bg-neutral-950/40 border rounded-lg text-slate-200 text-xs focus:outline-none focus:border-purple-500/50 ${
                          errors[`proj-${pIdx}-desc`] ? "border-rose-500/40" : "border-white/5"
                        }`}
                        placeholder="Describe technical implementation details, key problems solved and metric wins..."
                        value={proj.description}
                        onChange={e => updateProjectField(pIdx, "description", e.target.value)}
                      />
                      {errors[`proj-${pIdx}-desc`] && <span className="text-[10px] text-rose-400 mt-1 block">{errors[`proj-${pIdx}-desc`]}</span>}
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1">
                        <Github className="w-3.5 h-3.5 text-slate-400" /> GitHub Repository Link
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2.5 bg-neutral-950/40 border border-white/5 rounded-lg text-slate-200 text-xs focus:outline-none"
                        placeholder="https://github.com/..."
                        value={proj.githubLink}
                        onChange={e => updateProjectField(pIdx, "githubLink", e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" /> Live Demo Deployment URL
                      </label>
                      <input
                        type="url"
                        className="w-full px-4 py-2.5 bg-neutral-950/40 border border-white/5 rounded-lg text-slate-200 text-xs focus:outline-none"
                        placeholder="https://..."
                        value={proj.portfolioLink}
                        onChange={e => updateProjectField(pIdx, "portfolioLink", e.target.value)}
                      />
                    </div>

                    {/* Skill Tags Management */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                        Core Associated Stack Skills (Hit Enter to save)
                      </label>
                      <div className="flex flex-wrap gap-2 p-3 bg-neutral-950/40 border border-white/5 rounded-lg min-h-[46px]">
                        {proj.skills.length === 0 && (
                          <span className="text-slate-600 text-[11px] self-center">No skillset tags added. Add key languages below.</span>
                        )}
                        {proj.skills.map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-sans px-2.5 py-0.5 rounded-full flex items-center gap-1 group/pill"
                          >
                            {sk}
                            <button
                              onClick={() => handleRemoveSkillTag(pIdx, sk)}
                              className="text-slate-500 hover:text-white font-bold cursor-pointer hover:bg-white/10 p-0.5 rounded"
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          className="px-3 py-1.5 bg-neutral-950/20 border border-white/10 text-slate-200 text-xs rounded-lg flex-1 outline-none focus:border-purple-500/30"
                          placeholder="e.g. Docker, TypeScript, WebAssembly"
                          value={newSkillText[pIdx] || ""}
                          onChange={e => {
                            const val = e.target.value;
                            setNewSkillText(prev => ({ ...prev, [pIdx]: val }));
                          }}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSkillTag(pIdx);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddSkillTag(pIdx)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:text-purple-300 text-slate-300 text-xs rounded-lg cursor-pointer transition-all"
                        >
                          Add Tag
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/5 mb-2">
              <h3 className="text-lg font-display font-semibold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-glow-purple text-purple-400" />
                Internship Alignment & Fit Parameters
              </h3>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Desired Department Team / Role Focus *</label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 bg-neutral-900/60 border rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 ${
                    errors.desiredRole ? "border-rose-500/40" : "border-white/10"
                  }`}
                  placeholder="e.g. Core V8 Engine optimization, Client UI Layouts, API Integrations"
                  value={desiredRole}
                  onChange={e => setDesiredRole(e.target.value)}
                />
                {errors.desiredRole && <span className="text-[10px] text-rose-400 mt-1 block">{errors.desiredRole}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Available Onboarding Timeline Range</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Immediately", "Within 1 Month", "Summer Cohort", "Part-Time"].map(chip => (
                    <button
                      key={chip}
                      onClick={() => setAvailability(chip)}
                      className={`px-4 py-3 rounded-xl border text-xs font-medium cursor-pointer transition-all active:scale-95 ${
                        availability === chip
                          ? "bg-purple-500/10 border-purple-500 text-purple-300"
                          : "bg-neutral-900 border-white/5 text-slate-400 hover:bg-white/5"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Why do you wish to join this company? * (Explain key interests)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">{whyJoin.length} characters</span>
                </div>
                <textarea
                  className={`w-full h-32 px-4 py-3 bg-neutral-900/60 border rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/20 focus:border-purple-500/50 ${
                    errors.whyJoin ? "border-rose-500/40" : "border-white/10"
                  }`}
                  placeholder="Draft your key goals, technical interest alignments, and what excites you about their values..."
                  value={whyJoin}
                  onChange={e => setWhyJoin(e.target.value)}
                />
                {errors.whyJoin && <span className="text-[10px] text-rose-400 mt-1 block">{errors.whyJoin}</span>}
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Additional Application Notes or Referrals</label>
                <textarea
                  className="w-full h-20 px-4 py-3 bg-neutral-900/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
                  placeholder="Referral name, past connection, interview feedback summaries, or other metrics..."
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Errors fallback */}
        {errors.submit && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            {errors.submit}
          </div>
        )}

        {/* Action Controls Navigation Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center bg-neutral-950/20 px-4 py-3 rounded-xl">
          {step > 1 ? (
            <AnimatedButton variant="secondary" onClick={handleBack} className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" /> Go Back
            </AnimatedButton>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <AnimatedButton variant="cyan" onClick={handleNext} className="flex items-center gap-2">
              Proceed Next Step <ChevronRight className="w-4 h-4" />
            </AnimatedButton>
          ) : (
            <AnimatedButton variant="primary" onClick={handleSubmit} className="flex items-center gap-2">
              Deploy Internship Tracker <Check className="w-4 h-4 text-glow-purple" />
            </AnimatedButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
