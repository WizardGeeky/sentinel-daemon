"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Shield, Activity, Plus, Trash2, CheckCircle, AlertTriangle,
  FileCode, Zap, Clock, Search, Menu, X, Filter, BarChart3, LayoutDashboard,
  Settings, ChevronRight, Bell, Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
} from "recharts";

// --- Types ---
type Rule = {
  id: string;
  name: string;
  filePattern: string;
  event: string;
  confidence: number;
  rawText: string;
  threshold?: { count: number; withinMinutes: number };
};

type EventLog = {
  id?: string;
  event?: string;
  path?: string;
  timestamp: number;
  message?: string;
  module?: string;
  data?: any;
};

type RuleMatch = {
  ruleId: string;
  ruleName: string;
  observation: { event: string; path: string };
  timestamp: number;
  confidence: number;
};

// --- components/Leafs ---

function Badge({ children, className, variant = "neutral" }: { children: React.ReactNode, className?: string, variant?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  const variants = {
    neutral: "bg-zinc-800 text-zinc-400 border-zinc-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-[9px] md:text-[10px] uppercase font-black tracking-widest border whitespace-nowrap", variants[variant], className)}>
      {children}
    </span>
  );
}

function SpotlightCard({ children, className }: { children: React.ReactNode, className?: string }) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
    setMouseY(e.clientY - rect.top);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn("glass-card group relative", className)}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      {children}
    </div>
  );
}

function SignalLine({ axis = 'x', position, delay = 0 }: { axis?: 'x' | 'y', position: string, delay?: number }) {
  return (
    <div
      className={cn(
        "absolute opacity-0 pointer-events-none",
        axis === 'x' ? "h-[1px] w-full left-0 animate-signal-x" : "w-[1px] h-full top-0 animate-signal-y",
        axis === 'x' ? "bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" : "bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent"
      )}
      style={{
        [axis === 'x' ? 'top' : 'left']: position,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function BackgroundSignals() {
  const [signals, setSignals] = useState<{ id: number; axis: 'x' | 'y'; position: string; delay: number }[]>([]);

  useEffect(() => {
    setSignals(
      Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        axis: Math.random() > 0.5 ? 'x' : 'y' as 'x' | 'y',
        position: `${Math.floor(Math.random() * 100)}%`,
        delay: Math.random() * 5
      }))
    );
  }, []);

  if (signals.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] grid-bg">
      {signals.map(s => (
        <SignalLine key={s.id} axis={s.axis} position={s.position} delay={s.delay} />
      ))}
    </div>
  );
}

function CursorSignals() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<{ id: number; x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const id = Date.now();
      setTrail(prev => [
        ...prev.slice(-20),
        {
          id,
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          size: Math.random() * 2 + 1
        }
      ]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[999]">
      <div
        className="absolute w-8 h-8 rounded-full bg-indigo-500/5 blur-2xl transition-all duration-100"
        style={{ left: mousePos.x, top: mousePos.y, transform: 'translate(-50%, -50%)' }}
      />
      <AnimatePresence>
        {trail.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 0, x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute bg-indigo-400 rounded-full blur-[1px]"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.size,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.8)'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// --- Main Page ---

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "rules" | "logs" | "analytics">("dashboard");

  const [rules, setRules] = useState<Rule[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [matches, setMatches] = useState<RuleMatch[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logFilter, setLogFilter] = useState<string>("all");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize lastSeen from localStorage and set mounted
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sentinel_last_seen_notification");
    if (saved) setLastSeenTimestamp(parseInt(saved, 10));
  }, []);

  const unreadCount = useMemo(() => {
    return matches.filter(m => m.timestamp > lastSeenTimestamp).length;
  }, [matches, lastSeenTimestamp]);

  const handleToggleNotifications = () => {
    const newState = !notificationsOpen;
    setNotificationsOpen(newState);
    if (newState && matches.length > 0) {
      const latest = Math.max(...matches.map(m => m.timestamp));
      setLastSeenTimestamp(latest);
      localStorage.setItem("sentinel_last_seen_notification", latest.toString());
    }
  };

  const scrollRef = useRef<HTMLDivElement>(null);

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rulesRes, eventsRes, matchesRes] = await Promise.all([
          fetch("/api/v1/rules").catch(() => null),
          fetch("/api/v1/events").catch(() => null),
          fetch("/api/v1/matches").catch(() => null)
        ]);
        if (!rulesRes || !eventsRes || !matchesRes || !rulesRes.ok || !eventsRes.ok || !matchesRes.ok) return;

        const rulesData = await rulesRes.json();
        const eventsData = await eventsRes.json();
        const matchesData = await matchesRes.json();
        setRules(rulesData.rules || []);
        setEvents(eventsData.events || []);
        setMatches(matchesData.matches || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current && activeTab === 'logs') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, activeTab]);

  const handleLearnRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) throw new Error("Failed");
      setInput("");
      toast.success("Rule learned successfully!");
    } catch (err) {
      toast.error("Failed to learn rule. Ensure Ollama is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      const res = await fetch(`/api/v1/rules?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRules(curr => curr.filter(r => r.id !== id));
      toast.success("Rule deleted successfully");
    } catch (err) {
      toast.error("Failed to delete rule");
      console.error(err);
    }
  };

  const filteredRules = useMemo(() => {
    return rules.filter(r =>
      (r.name && r.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.rawText && r.rawText.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [rules, searchQuery]);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (logFilter !== "all") {
      if (logFilter === "system") {
        filtered = filtered.filter(e => e.message);
      } else {
        filtered = filtered.filter(e => e.event === logFilter);
      }
    }

    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        (e.message && e.message.toLowerCase().includes(q)) ||
        (e.path && e.path.toLowerCase().includes(q)) ||
        (e.module && e.module.toLowerCase().includes(q)) ||
        (e.event && e.event.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [events, logFilter, logSearchQuery]);


  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans flex relative overflow-hidden">
      <BackgroundSignals />
      <CursorSignals />

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-white/10 z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-500" />
                  <span className="font-bold text-white">SENTINEL</span>
                </div>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-zinc-400" /></button>
              </div>
              <nav className="p-4 space-y-1">
                {[
                  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
                  { id: "rules", icon: FileCode, label: "Rules Engine" },
                  { id: "analytics", icon: BarChart3, label: "Analytics" },
                  { id: "logs", icon: Activity, label: "Live Logs" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors outline-none",
                      activeTab === item.id ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-auto p-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Daemon Active
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 glass border-r border-white/5 flex-col fixed inset-y-0 z-40">
        <div className="p-6 border-b border-white/5 h-16 flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-bold tracking-tighter text-xl text-white">SENTINEL</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", color: "text-indigo-400" },
            { id: "rules", icon: FileCode, label: "Rules Engine", color: "text-emerald-400" },
            { id: "analytics", icon: BarChart3, label: "Analytics", color: "text-rose-400" },
            { id: "logs", icon: Activity, label: "Live Logs", color: "text-amber-400" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                activeTab === item.id
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", activeTab === item.id ? item.color : "text-zinc-500")} />
              {item.label}
              {activeTab === item.id && (
                <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff]" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-6 mt-auto">
          <div className="glass-morphism rounded-2xl p-4 space-y-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <Shield className="w-3 h-3 text-indigo-500" />
                <span>Secure Node</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                <span>Threat Level</span>
                <span className="text-emerald-400">Low</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "30%" }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
              className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white active:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-white capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-white/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-emerald-400 font-medium tracking-wide">SYSTEM ONLINE</span>
            </div>
            <div className="relative">
              <button
                onClick={handleToggleNotifications}
                className="relative p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-black font-bold animate-in zoom-in">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
                        <h3 className="font-semibold text-sm">Security Alerts</h3>
                        {unreadCount > 0 && <Badge variant="danger">New</Badge>}
                      </div>
                      <div className="max-h-96 overflow-y-auto p-2">
                        {matches.length === 0 ? (
                          <div className="p-8 text-center text-zinc-500 text-xs italic">
                            No security matches detected
                          </div>
                        ) : (
                          matches.slice().reverse().map((m, idx) => {
                            const isNew = m.timestamp > lastSeenTimestamp;
                            return (
                              <div key={idx} className={cn(
                                "p-3 rounded-xl transition-colors mb-1 group relative",
                                isNew ? "bg-indigo-500/5 border border-indigo-500/10" : "hover:bg-white/5"
                              )}>
                                {isNew && (
                                  <div className="absolute top-3 left-1 w-1 h-4 bg-indigo-500 rounded-full" />
                                )}
                                <div className="flex justify-between items-start mb-1 pl-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-indigo-400">{m.ruleName}</span>
                                    {isNew && <span className="text-[8px] bg-indigo-500 text-white px-1 rounded animate-pulse">NEW</span>}
                                  </div>
                                  <span className="text-[10px] text-zinc-500">{new Date(m.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-[11px] text-zinc-300 line-clamp-2 bg-black/30 p-2 rounded border border-white/5 font-mono ml-2">
                                  {m.observation.path}
                                </div>
                                <div className="mt-2 flex items-center justify-between ml-2">
                                  <Badge variant="neutral" className="bg-transparent border-none text-zinc-600 p-0 lowercase">{m.observation.event}</Badge>
                                  <span className="text-[10px] text-zinc-500">{Math.round(m.confidence * 100)}% Match</span>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                      <div className="p-2 border-t border-white/5 bg-zinc-950/20">
                        <button
                          onClick={() => { setActiveTab('logs'); setNotificationsOpen(false); }}
                          className="w-full text-center text-[11px] text-indigo-400 hover:text-indigo-300 py-1"
                        >
                          View Full Security Log
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto w-full max-w-[1600px] mx-auto">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Stats Cards */}
              <div className="col-span-1 md:col-span-4">
                <SpotlightCard className="rounded-3xl p-6 transition-all hover:translate-y-[-4px]">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileCode className="w-24 h-24 text-indigo-500" />
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <Badge variant="info" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Active Rules</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-white tracking-tight">{rules.length}</div>
                    <div className="text-sm text-zinc-500 font-medium">Monitoring definitions</div>
                  </div>
                </SpotlightCard>
              </div>

              <div className="col-span-1 md:col-span-4">
                <SpotlightCard className="rounded-3xl p-6 transition-all hover:translate-y-[-4px]">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Activity className="w-24 h-24 text-emerald-500" />
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                      <Activity className="w-6 h-6" />
                    </div>
                    <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Live Stream</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-white tracking-tight">{events.length}</div>
                    <div className="text-sm text-zinc-500 font-medium">Total events processed</div>
                  </div>
                </SpotlightCard>
              </div>

              <div className="col-span-1 md:col-span-4">
                <SpotlightCard className="rounded-3xl p-6 transition-all hover:translate-y-[-4px]">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertTriangle className="w-24 h-24 text-rose-500" />
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <Badge variant="danger" className="bg-rose-500/10 text-rose-400 border-rose-500/20">Incidents</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-white tracking-tight">{matches.length}</div>
                    <div className="text-sm text-zinc-500 font-medium">Security matches detected</div>
                  </div>
                </SpotlightCard>
              </div>

              {/* AI Command Center / Neural Chat */}
              <div className="col-span-1 md:col-span-8 group relative">
                <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/50 to-emerald-500/50 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative glass-card border-none rounded-[2rem] p-4 md:p-8 overflow-hidden h-full flex flex-col">
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none animate-pulse-slow" />

                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-900 animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Neural Rule Engine</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Core Consciousness</span>
                          <div className="h-1 w-1 rounded-full bg-zinc-700" />
                          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active & Learning</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="info" className="hidden sm:flex bg-indigo-500/10 text-indigo-300 border-indigo-500/20 px-3 py-1 animate-pulse">Neural_v2.4</Badge>
                  </div>

                  {/* Chat-like input area */}
                  <div className="flex-1 flex flex-col bg-black/40 rounded-3xl border border-white/5 p-4 md:p-6 backdrop-blur-md relative overflow-hidden">
                    {loading && (
                      <motion.div
                        initial={{ top: "-100%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-20 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent pointer-events-none z-10"
                      />
                    )}

                    <div className="flex-1 min-h-[140px] mb-4 overflow-y-auto custom-scrollbar pr-2">
                      {!input && (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40 py-8">
                          <div className="p-4 bg-zinc-900 rounded-full border border-white/5">
                            <Shield className="w-8 h-8 text-indigo-500 animate-pulse" />
                          </div>
                          <p className="text-[10px] text-center font-mono max-w-[200px] uppercase tracking-tighter">Initializing neural interface... Ready for input.</p>
                        </div>
                      )}
                      {input && (
                        <div className="space-y-4">
                          <div className="flex gap-3 items-end">
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mb-1">
                              <span className="text-[8px] md:text-[10px] font-black text-indigo-400">SR</span>
                            </div>
                            <div className="bg-indigo-500/10 px-4 py-3 rounded-2xl rounded-bl-none border border-indigo-500/20 text-xs md:text-sm text-zinc-200 font-mono leading-relaxed max-w-[85%]">
                              {input}
                            </div>
                          </div>
                          {loading && (
                            <div className="flex gap-3 items-end">
                              <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 animate-pulse mb-1">
                                <Zap className="w-3 h-3 text-emerald-400" />
                              </div>
                              <div className="bg-white/5 px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 text-[10px] md:text-xs text-zinc-400 font-mono italic animate-pulse">
                                Synthesizing security patterns...
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleLearnRule} className="relative">
                      <div className="relative group/input">
                        <textarea
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          placeholder="Command the sentinel... (e.g., 'Watch for SSH keys changes')"
                          className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl p-4 md:p-5 pr-14 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none h-28 font-mono leading-relaxed placeholder:text-zinc-600 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleLearnRule(e);
                            }
                          }}
                        />
                        <button
                          type="submit"
                          disabled={loading || !input.trim()}
                          className="absolute right-3 bottom-3 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] disabled:opacity-30 disabled:grayscale active:scale-90"
                        >
                          {loading ? <Activity className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {["Monitor .env changes", "Detect large uploads", "Watch SSH keys"].map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(ex)}
                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini Log */}
              <div className="col-span-1 md:col-span-4 glass-card border-none rounded-3xl overflow-hidden flex flex-col max-h-[440px]">
                <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Live Activity
                  </h3>
                  <button onClick={() => setActiveTab('logs')} className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors">See all</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {events.slice(-10).reverse().map((e: any, idx) => (
                    <div key={idx} className="flex gap-4 text-xs group">
                      <div className={cn("w-1 h-8 rounded-full shrink-0 transition-all group-hover:scale-y-110",
                        e.message ? "bg-amber-400/50" :
                          (e.event && e.event.includes('add')) ? "bg-emerald-400/50" :
                            (e.event && e.event.includes('unlink')) ? "bg-rose-400/50" : "bg-indigo-400/50"
                      )} />
                      <div className="flex flex-col min-w-0 justify-center">
                        {e.message ? (
                          <>
                            <span className="text-zinc-200 truncate font-medium">{e.message}</span>
                            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-tighter">System Diagnostic</span>
                          </>
                        ) : (
                          <>
                            <span className="text-zinc-200 truncate font-medium">{e.path?.split('\\').pop()?.split('/').pop()}</span>
                            <span className={cn("text-[9px] uppercase font-bold tracking-tighter",
                              e.event === 'add' ? "text-emerald-500" :
                                e.event === 'unlink' ? "text-rose-500" : "text-indigo-500"
                            )}>{e.event}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <div className="text-center py-20">
                      <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                      <div className="text-zinc-600 text-xs italic tracking-tight">Listening for events...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RULES TAB */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredRules.map((rule, idx) => (
                    <motion.div
                      key={rule.id || idx}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                      className="transition-all"
                    >
                      <SpotlightCard className="rounded-2xl p-4 sm:p-6 flex flex-col h-full hover:translate-y-[-2px]">
                        <div className="flex justify-between items-start mb-5">
                          <Badge variant="info" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{rule.event}</Badge>
                          <button onClick={() => handleDeleteRule(rule.id)} className="p-2 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-400/10 transition-all relative z-10">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-2 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{rule.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mb-6 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg w-fit">
                          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                          {rule.filePattern}
                        </div>
                        <div className="mt-auto pt-5 border-t border-white/5">
                          <p className="text-sm text-zinc-500 italic line-clamp-2 leading-relaxed">&ldquo;{rule.rawText}&rdquo;</p>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              {/* Quick Metrics at Top for Mobile */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: "Total Volume", value: events.length, icon: Activity, color: "text-indigo-400", bg: "bg-indigo-500/10" },
                  { label: "Integrity Rate", value: "99.9%", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Active Nodes", value: "4", icon: LayoutDashboard, color: "text-rose-400", bg: "bg-rose-500/10" },
                  { label: "Threat Level", value: "Low", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" }
                ].map((stat, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 md:p-6 border-none">
                    <div className={cn("p-2 rounded-lg w-fit mb-3 md:mb-4", stat.bg)}>
                      <stat.icon className={cn("w-4 h-4 md:w-5 md:h-5", stat.color)} />
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                    <div className="text-[10px] md:text-xs text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Distribution - Pie Chart */}
                <div className="glass-card rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                      <PieChart className="w-5 h-5 text-indigo-400" />
                    </div>
                    Event Vector Analysis
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Add', value: events.filter(e => e.event === 'add').length },
                            { name: 'Change', value: events.filter(e => e.event === 'change').length },
                            { name: 'Unlink', value: events.filter(e => e.event === 'unlink').length },
                            { name: 'System', value: events.filter(e => e.message).length },
                          ]}
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          <Cell fill="#6366f1" />
                          <Cell fill="#10b981" />
                          <Cell fill="#f43f5e" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Event Velocity - Bar Chart */}
                <div className="glass-card rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <BarChart3 className="w-5 h-5 text-emerald-400" />
                    </div>
                    Temporal Velocity
                  </h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {isMounted ? (
                        <BarChart data={
                          Array.from({ length: 12 }).map((_, i) => ({
                            time: `${12 - i}m ago`,
                            count: events.filter(e => e.timestamp > Date.now() - (i + 1) * 60000 && e.timestamp <= Date.now() - i * 60000).length
                          })).reverse()
                        }>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip
                            cursor={{ fill: '#ffffff10' }}
                            contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xs">Loading metrics...</div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Rule Confidence - Area Chart */}
                <div className="glass-card rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                      <Shield className="w-5 h-5 text-amber-400" />
                    </div>
                    Intelligence Accuracy
                  </h3>
                  <p className="text-xs text-zinc-500 mb-4">AI confidence scores for active rules</p>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={rules.map(r => ({ name: r.name ? r.name.substring(0, 10) : "Rule", score: (r.confidence || 0.8) * 100 }))}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LOG_TAB - Premium Activity Stream */}
          {activeTab === 'logs' && (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4">
              {/* Log Header with Filters */}
              <div className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-1.5 md:p-2 bg-amber-500/20 rounded-lg md:rounded-xl">
                      <Activity className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    </div>
                    System Activity
                  </h2>
                  <p className="text-[10px] text-zinc-500 mt-0.5 md:mt-1 uppercase tracking-widest font-black opacity-50">Real-time telemetry stream</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center w-full md:w-auto">
                  <div className="relative w-full sm:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                      type="text"
                      placeholder="Filter events..."
                      value={logSearchQuery}
                      onChange={e => setLogSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
                    />
                  </div>

                  <div className="flex w-full sm:w-auto bg-zinc-900 rounded-xl p-1 border border-white/5 relative overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="flex gap-1 min-w-full sm:min-w-0">
                      {["all", "system", "add", "change", "unlink"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setLogFilter(f)}
                          className={cn(
                            "flex-1 sm:flex-none px-3 py-1.5 text-[10px] uppercase font-black tracking-wider rounded-lg transition-all relative z-10 whitespace-nowrap",
                            logFilter === f ? "text-black" : "text-zinc-500 hover:text-zinc-200"
                          )}
                        >
                          <span className="relative z-10">{f}</span>
                          {logFilter === f && (
                            <motion.div
                              layoutId="activeFilterMain"
                              className="absolute inset-0 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] rounded-lg"
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Log Content - Premium Cards */}
              <div className="space-y-3 pr-2 scroll-smooth" ref={scrollRef}>
                {filteredEvents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 py-32 bg-zinc-900/20 rounded-[2.5rem] border border-white/5 border-dashed">
                    <div className="p-4 bg-white/5 rounded-full">
                      <Search className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="italic font-sans text-sm tracking-tight text-zinc-500">No telemetry matches your current filter</p>
                  </div>
                ) : (
                  filteredEvents.slice().slice(-100).reverse().map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative flex items-start gap-3 md:gap-4 p-3 md:p-5 rounded-2xl md:rounded-3xl bg-zinc-900/40 border border-white/[0.03] hover:bg-zinc-900/60 hover:border-white/10 transition-all duration-300 backdrop-blur-sm"
                    >
                      {/* Visual Category Indicator */}
                      <div className={cn(
                        "w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110",
                        e.message ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                          e.event === 'add' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                            e.event === 'change' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                              "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}>
                        {e.message ? <Terminal className="w-4 h-4 md:w-5 md:h-5" /> :
                          e.event === 'add' ? <Plus className="w-4 h-4 md:w-5 md:h-5" /> :
                            e.event === 'change' ? <Activity className="w-4 h-4 md:w-5 md:h-5" /> :
                              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />}
                      </div>

                      {/* Info Area */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5 md:mb-2 text-wrap break-words">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                              e.message ? "bg-amber-500/20 text-amber-400" :
                                e.event === 'add' ? "bg-emerald-500/20 text-emerald-400" :
                                  e.event === 'change' ? "bg-indigo-500/20 text-indigo-400" :
                                    "bg-rose-500/20 text-rose-400"
                            )}>
                              {e.message ? "SYSTEM" : e.event}
                            </span>
                            {e.module && <span className="text-[10px] text-zinc-600 font-mono">[{e.module}]</span>}
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500 tabular-nums">
                            {new Date(e.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {e.message ? (
                            <p className="text-sm text-zinc-200 leading-relaxed max-w-[95%]">
                              {e.message}
                            </p>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                              <span className="text-xs md:text-sm text-zinc-300 font-mono break-all selection:bg-amber-500/30 line-clamp-2 md:line-clamp-none">
                                {e.path}
                              </span>
                            </div>
                          )}

                          {e.data && (
                            <div className="mt-4 rounded-2xl overflow-hidden bg-black/40 border border-white/5 p-4 relative group/code">
                              <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                <Badge variant="neutral" className="text-[8px] bg-white/5 border-none">PAYLOAD</Badge>
                              </div>
                              <pre className="text-[10px] text-zinc-500 font-mono overflow-auto max-h-40 custom-scrollbar pr-4">
                                {JSON.stringify(e.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <ChevronRight className="w-4 h-4 text-zinc-700" />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
