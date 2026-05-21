import React, { useState } from "react";
import { Sparkles, Shield, AlertTriangle, CheckCircle, RefreshCcw, FileText, ArrowRight } from "lucide-react";
import { analyzeResume } from "../services/api";
import { ResumeReport } from "../types";
import { AnimatedButton } from "./AnimatedButton";
import { GlassCard } from "./GlassCard";

const SAMPLE_RESUME = `ALEX RIVERA
alex.rivera@university.edu | Palo Alto, CA | github.com/arivera

EDUCATION
Stanford University - B.S. Computer Science, Anticipated June 2027
Selected Coursework: Data Structures, Web Applications, Databases, Operating Systems

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, C++, HTML/CSS
Frameworks/Libraries: React, Node.js, Express, Next.js, Tailwind CSS
Tools: Git, Vite, Postman, Figma

PROJECTS
OmniSearch Dashboard | React, Vite, Tailwind | Jan 2026
- Built a front-end interface that searches local structures.
- Added motion transitions for smoother tab clicks.
- Documented files and set up custom parameters.

Task Manager App | Node.js, Express, MongoDB | Sept 2025
- Created an api backend that registers tasks.
- Allowed users to log in with passwords.
- Structured code into routes and models.

EXPERIENCE
Campus Tech Support | Assistant Analyst | Sept 2025 - Present
- Helped students solve password resets and printer issues.
- Answered phone calls and filed tracking tickets in the system.
- Organized equipment inventory spreadsheets.`;

export function ResumeAnalyzer({ activeSkills = [] }: { activeSkills?: string[] }) {
  const [resumeText, setResumeText] = useState("");
  const [desiredRole, setDesiredRole] = useState("Frontend Software Engineer Intern");
  const [report, setReport] = useState<ResumeReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (textToUse?: string) => {
    const rawText = textToUse || resumeText;
    if (!rawText.trim()) {
      setError("Please paste your resume text or click 'Load Sample Resume' first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await analyzeResume(rawText, activeSkills, desiredRole);
      setReport(data);
    } catch (err: any) {
      setError("Could not complete resume assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setError(null);
  };

  return (
    <div id="resume-analyzer-sec" className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-display mb-3">
          <Shield className="w-3.5 h-3.5" />
          ATS Scanner Diagnostic Hub
        </div>
        <h1 className="text-3xl font-display font-medium text-slate-100 tracking-tight">
          AI Resume Strength Optimizer
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-2xl">
          Recruiters spend less than 6 seconds on a resume. Compare your document against your target internship role guidelines instantly using professional parsing heuristics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Block */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard hoverable={false} className="p-6 space-y-4">
            <h3 className="font-display font-medium text-slate-200 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Document Compiler Space
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-widest">
                Target Role Preference
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-neutral-900/60 border border-white/10 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-purple-500/50"
                value={desiredRole}
                onChange={e => setDesiredRole(e.target.value)}
                placeholder="e.g. Frontend Software Architect Intern, API Developer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest">
                  Paste Resume Content (Plain Text ASCII)
                </label>
                <button
                  onClick={loadSample}
                  className="text-xs text-purple-400 hover:text-purple-300 font-medium hover:underline transition-all cursor-pointer"
                >
                  Load Pre-styled Sample
                </button>
              </div>
              <textarea
                className="w-full h-80 px-4 py-3 bg-neutral-900/60 border border-white/10 rounded-xl text-slate-200 text-sm font-mono overflow-y-auto focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20"
                placeholder="Paste the raw text of your resume (Education, Projects, Work Experience, Skills blocks) here..."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <AnimatedButton
                onClick={() => handleAnalyze()}
                disabled={loading}
                variant="primary"
                className="w-full flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    Completing Heuristics...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Initiate Parser Diagnostic
                  </span>
                )}
              </AnimatedButton>
              {resumeText && (
                <AnimatedButton
                  variant="secondary"
                  onClick={() => setResumeText("")}
                  disabled={loading}
                >
                  Clear
                </AnimatedButton>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Report Output Block */}
        <div className="lg:col-span-5 space-y-6">
          {!report && !loading ? (
            <GlassCard hoverable={false} className="border-dashed p-10 text-center flex flex-col items-center justify-center h-full min-h-[460px]">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 mb-4 text-slate-400">
                <Shield className="w-8 h-8" />
              </div>
              <h4 className="font-display font-medium text-slate-300 text-base">Awaiting Diagnostic Signal</h4>
              <p className="text-slate-500 text-xs mt-2 max-w-sm">
                Compile your target resume and role constraints, then click Analyze. We will extract quantitative scores and supply recommended edits.
              </p>
              <button
                onClick={() => {
                  loadSample();
                  setTimeout(() => handleAnalyze(SAMPLE_RESUME), 100);
                }}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-300 text-xs font-display hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
              >
                Simulate Diagnostic with Demo profile
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </GlassCard>
          ) : loading ? (
            <GlassCard hoverable={false} className="p-8 h-full min-h-[460px] flex flex-col items-center justify-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/10 border-t-purple-500 animate-spin" />
                <Sparkles className="w-10 h-10 text-purple-400 animate-pulse" />
              </div>
              <div className="space-y-2 text-center">
                <h4 className="font-display font-medium text-slate-200">Revising Resume Structure</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-normal">
                  Our system is parsing education boundaries, scanning active action verbs, scoring grammar and calculating keyword density match rates...
                </p>
              </div>
            </GlassCard>
          ) : (
            report && (
              <div className="space-y-6">
                {/* Score Dial Glass Card */}
                <GlassCard hoverable={false} className="text-center p-6 bg-gradient-to-br from-neutral-900/60 to-purple-950/10">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-slate-400 tracking-widest uppercase mb-4">
                      Overall Metric Rating
                    </span>

                    {/* Circular SVG Gauge */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="68"
                          className="stroke-slate-800 fill-none"
                          strokeWidth="10"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="68"
                          className="stroke-purple-500 fill-none transition-all duration-1000 ease-out"
                          strokeWidth="10"
                          strokeDasharray={2 * Math.PI * 68}
                          strokeDashoffset={2 * Math.PI * 68 * (1 - report.score / 100)}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-display font-bold text-slate-100">
                          {report.score}
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
                          / 100 STR
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-neutral-950/40 border border-white/5 text-xs text-slate-400 font-sans leading-relaxed text-left w-full">
                      {report.feedbackSummary}
                    </div>
                  </div>
                </GlassCard>

                {/* Keyword Alignment Glass Card */}
                <GlassCard hoverable={false} className="p-6 space-y-4">
                  <h3 className="font-display font-medium text-slate-200 text-sm">
                    Keyword Alignment Matcher
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-1.5">
                        Matched Keywords ({report.matchedKeywords.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {report.matchedKeywords.map((kw, index) => (
                          <span
                            key={index}
                            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 mb-1.5">
                        Suggested Keywords ({report.missingKeywords.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {report.missingKeywords.map((kw, index) => (
                          <span
                            key={index}
                            className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded"
                          >
                            +{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Strengths / Suggestions Glass Card */}
                <GlassCard hoverable={false} className="p-6 space-y-4">
                  <h3 className="font-display font-medium text-slate-200 text-sm">
                    Bullet Diagnostics & Audits
                  </h3>
                  <div className="space-y-2 text-xs">
                    {report.bulletStrengths.map((bullet, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border ${
                          bullet.startsWith("✓")
                            ? "bg-emerald-500/5 border-emerald-500/10 text-slate-300"
                            : "bg-rose-500/5 border-rose-500/10 text-slate-300"
                        }`}
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                      Recommended Quantifiable Rewrites
                    </div>
                    {report.improvements.map((imp, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-400 bg-neutral-950/40 p-3 rounded-lg border border-white/5 leading-relaxed relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 h-full w-1 bg-purple-500/30" />
                        {imp}
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
