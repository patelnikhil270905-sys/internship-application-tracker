import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, User, ChevronRight, CornerDownLeft, HelpCircle, Loader, HelpCircleIcon } from "lucide-react";
import { sendChatMessage } from "../services/api";
import { Message } from "../types";

interface AIChatbotProps {
  currentTab?: string;
}

export function AIChatbot({ currentTab }: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content: "Hello! I am your AI Career Mentor. I've automatically analyzed your active application statuses and skillset list.\n\nType **'review'** and I will draft a custom interview strategy, or select one of the core training paths below to begin!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presets = [
    { label: "Google Screen Strategy", prompt: "How should I structure my preparation for my upcoming Frontend engineering interview at Google on May 25th?" },
    { label: "Summarize My Stats", prompt: "Give me an overview of my current application pipeline success rates and upcoming milestones." },
    { label: "Stripe API Developer Tips", prompt: "What are Stripe recruiters looking for in an API Platform Engineering resume or portfolio?" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setLoading(true);

    try {
      // Map history
      const mappedHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const reply = await sendChatMessage(mappedHistory);
      
      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: reply.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        links: reply.links
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[580px] bg-neutral-900/40 border border-white/10 rounded-2xl overflow-hidden glass-panel">
      {/* Bot Header info */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-neutral-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/35 flex items-center justify-center text-purple-400">
            <Sparkles className="w-5 h-5 text-glow-purple" />
          </div>
          <div>
            <h4 className="text-sm font-display font-medium text-slate-100 flex items-center gap-2">
              Career AI Coach
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              POWERED BY GEMINI-3.5-FLASH
            </span>
          </div>
        </div>
      </div>

      {/* Messages feed viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Persona Bubble avatars */}
            <div
              className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs border ${
                msg.role === "user"
                  ? "bg-purple-600/10 border-purple-500/30 text-purple-300"
                  : "bg-neutral-800 border-white/10 text-slate-400"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : "AI"}
            </div>

            {/* Bubble Contents */}
            <div className="space-y-2">
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-purple-600 text-slate-100 rounded-tr-none font-sans"
                    : "bg-neutral-950/40 text-slate-300 border border-white/5 rounded-tl-none font-sans"
                }`}
              >
                {/* Clean inline rendering of multiline blocks and bullets */}
                <div className="whitespace-pre-wrap space-y-1">
                  {msg.content.split("\n\n").map((block, bIdx) => {
                    if (block.startsWith("###")) {
                      return (
                        <h5 key={bIdx} className="font-display font-semibold text-slate-200 text-xs uppercase tracking-wider pt-2">
                          {block.replace("###", "").trim()}
                        </h5>
                      );
                    }
                    if (block.startsWith("-") || block.startsWith("*") || /^\d+\./.test(block)) {
                      return (
                        <ul key={bIdx} className="list-disc pl-4 space-y-1 my-1">
                          {block.split("\n").map((li, lIdx) => (
                            <li key={lIdx}>{li.replace(/^[\s-*\d.]+/, "").trim()}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={bIdx}>{block}</p>;
                  })}
                </div>

                {/* Subordinate citation link buttons if returned */}
                {msg.links && msg.links.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                    {msg.links.map((link, lIdx) => (
                      <a
                        key={lIdx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-[10px] text-purple-300 hover:text-purple-200 hover:-translate-y-0.5 transition-all"
                      >
                        {link.title}
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <span className={`text-[9px] text-slate-500 font-mono block ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-white/10 text-slate-400 flex items-center justify-center">
              <Loader className="w-4 h-4 animate-spin text-purple-400" />
            </div>
            <div className="bg-neutral-950/20 text-slate-500 text-xs py-2 px-4 rounded-xl border border-white/5 italic flex items-center gap-2">
              Advisor is dictating custom blueprints...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Pill Triggers */}
      <div className="px-6 py-2 border-t border-white/5 bg-neutral-950/20 flex gap-2 overflow-x-auto scrollbar-none shrink-0 py-3">
        {presets.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(pill.prompt)}
            disabled={loading}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* User control box inputs */}
      <div className="px-6 py-4 border-t border-white/5 bg-neutral-950/45 shrink-0 flex items-center gap-3">
        <input
          type="text"
          className="flex-1 py-3 px-4 bg-neutral-900/60 border border-white/10 text-slate-100 rounded-xl text-xs placeholder:text-slate-500 outline-none focus:border-purple-500/50"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask AI Coach for preparation tactics, resume rewrites, or cold strategy..."
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || loading}
          className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-[0_4px_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 shrink-0 disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
