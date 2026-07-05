/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Plus,
  History,
  User,
  Shield,
  Wrench,
  Utensils,
  Key,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Check,
  X,
  Activity,
  Building,
  AlertOctagon,
  Info,
  Zap,
  Mail,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AIAssistant from "./components/AIAssistant";
import RoomHeatmap from "./components/RoomHeatmap";
import StatsDashboard from "./components/StatsDashboard";
import { Spotlight, CustomCursor, RippleButton, SkeletonShimmer, FloatingInput } from "./components/InteractiveEffects";
import CinematicIntro from "./components/CinematicIntro";
import "./intro.css";
import { db } from "./lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  setDoc,
  getDoc,
  where,
  getDocs
} from "firebase/firestore";
function AtmosphericBackground() {
  return <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {
    /* Dynamic tech-grid mesh pattern overlay */
  }
      <div
    className="absolute inset-0 opacity-100 text-indigo-900/5"
    style={{
      backgroundImage: `radial-gradient(currentColor 1.5px, transparent 1.5px), radial-gradient(currentColor 1px, transparent 1px)`,
      backgroundSize: "40px 40px",
      backgroundPosition: "0 0, 20px 20px"
    }}
  />
      
      {
    /* Colorful, vibrant blur spheres floating with randomized speeds and pathways */
  }
      <motion.div
    animate={{
      x: [0, 80, -40, 0],
      y: [0, -100, 60, 0],
      scale: [1, 1.2, 0.85, 1],
      rotate: [0, 90, 180, 0]
    }}
    transition={{
      duration: 35,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute top-[-10%] left-[-10%] w-[65vw] h-[65vw] rounded-full bg-sky-400/20 blur-[140px]"
  />
      
      <motion.div
    animate={{
      x: [0, -70, 90, 0],
      y: [0, 80, -90, 0],
      scale: [1, 0.85, 1.15, 1],
      rotate: [0, -120, 120, 0]
    }}
    transition={{
      duration: 40,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 3
    }}
    className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-400/20 blur-[140px]"
  />
 
      <motion.div
    animate={{
      x: [0, 100, -60, 0],
      y: [0, 120, -50, 0],
      scale: [0.9, 1.15, 0.95, 0.9]
    }}
    transition={{
      duration: 45,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 5
    }}
    className="absolute top-[30%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-purple-400/20 blur-[130px]"
  />
 
      <motion.div
    animate={{
      x: [0, -50, 60, 0],
      y: [0, -80, 100, 0],
      scale: [1.1, 0.9, 1.05, 1.1]
    }}
    transition={{
      duration: 38,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1.5
    }}
    className="absolute bottom-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-emerald-400/20 blur-[130px]"
  />
 
      <motion.div
    animate={{
      x: [0, 40, -50, 0],
      y: [0, 60, -80, 0],
      scale: [0.85, 1.1, 0.9, 0.85]
    }}
    transition={{
      duration: 32,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 7
    }}
    className="absolute top-[15%] left-[35%] w-[35vw] h-[35vw] rounded-full bg-cyan-400/20 blur-[120px]"
  />
    </div>;
}
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginRole, setLoginRole] = useState("student");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginStudentName, setLoginStudentName] = useState("");
  const [loginRoomNumber, setLoginRoomNumber] = useState("");
  const [customStudent, setCustomStudent] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("sarah");
  const [inputStudentName, setInputStudentName] = useState("");
  const [inputRoomNumber, setInputRoomNumber] = useState("");
  const [wardenPasscode, setWardenPasscode] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("student");
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isRealtimeActive, setIsRealtimeActive] = useState(true);
  const [networkPing, setNetworkPing] = useState(38);
  const requestsRef = useRef([]);
  const selectedRequestRef = useRef(null);
  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);
  useEffect(() => {
    selectedRequestRef.current = selectedRequest;
  }, [selectedRequest]);
  const [aiAnalysisStage, setAiAnalysisStage] = useState(0);
  const [studentName, setStudentName] = useState("Sarah Chen");
  const [roomNumber, setRoomNumber] = useState("B-304");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("maintenance");
  const [wardenFilter, setWardenFilter] = useState("all");
  const [wardenNotes, setWardenNotes] = useState("");
  const [isActioning, setIsActioning] = useState(false);
  const showToast = (text, type = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4e3);
  };
  const [isSignUp, setIsSignUp] = useState(true);
  useEffect(() => {
    const initSession = async () => {
      const savedUserId = localStorage.getItem("portal_user_id");
      if (savedUserId) {
        setIsLoading(true);
        try {
          const userDoc = await getDoc(doc(db, "users", savedUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setStudentName(userData.name || "Anonymous Student");
            setRoomNumber(userData.roomNumber || "N/A");
            setActiveTab(userData.role || "student");
            setLoginRole(userData.role || "student");
            setIsLoggedIn(true);
          } else {
            localStorage.removeItem("portal_user_id");
            setIsLoggedIn(false);
          }
        } catch (err) {
          console.error(err);
          setError("Failed to fetch user profile.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoggedIn(false);
        setRequests([]);
        setSelectedRequest(null);
      }
    };
    initSession();
  }, []);
  useEffect(() => {
    if (!isLoggedIn) return;
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribeSnapshot = onSnapshot(q, async (snapshot) => {
      let data = [];
      snapshot.forEach((docSnap) => {
        data.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (data.length === 0) {
        const seedData = [
          {
            studentName: "Alex Mercer",
            roomNumber: "A-204",
            title: "Ceiling Fan Sparks & Noise",
            description: "When I turn on the speed regulator past 2, the ceiling fan makes a loud grinding noise and visible sparks flew out of the motor cover. It is unsafe to use, and our room is extremely hot.",
            category: "maintenance",
            urgency: "critical",
            status: "ai_evaluated",
            createdAt: new Date(Date.now() - 36e5 * 4).toISOString(),
            aiAssessment: {
              title: "Ceiling Fan Sparks & Motor Grinding",
              category: "maintenance",
              urgency: "critical",
              autoRecommendation: "route_to_warden",
              aiReasoning: "Sparks from electrical devices constitute an immediate fire hazard. Auto-routing to Warden for emergency electrician dispatch. Strongly advise student to keep the switch off.",
              extractedDetails: {
                item: "Ceiling Fan",
                location: "Room A-204 ceiling",
                severity: "Critical (Sparks/Fire risk)",
                timing: "Immediate attention required"
              },
              autoResponse: "\u26A0\uFE0F Urgent Safety Alert: This has been flagged as a CRITICAL electrical hazard. Please keep the fan switch OFF. An electrician is being routed to Room A-204 immediately."
            }
          },
          {
            studentName: "Clara Oswald",
            roomNumber: "B-112",
            title: "Late Gate Pass for Exam Prep",
            description: "Requesting permission to enter the hostel at 11:15 PM tonight. I have a group study session for the Advanced Physics exam at the Central Library, which is open late.",
            category: "permission",
            urgency: "low",
            status: "approved",
            createdAt: new Date(Date.now() - 36e5 * 12).toISOString(),
            aiAssessment: {
              title: "Late-Night Entry Permission (Central Library)",
              category: "permission",
              urgency: "low",
              autoRecommendation: "approve",
              aiReasoning: "Academic purpose with standard location (Central Library) during exam week. Student has a flawless record. Recommend automated conditional approval.",
              extractedDetails: {
                item: "Late Gate Pass",
                location: "Central Library",
                severity: "Routine / Academic",
                timing: "Tonight, 11:15 PM"
              },
              autoResponse: "Permission pre-approved by AI Agent based on academic schedule and good conduct. Authorized gate entry up to 11:30 PM. Please bring your student ID card."
            },
            wardenAction: {
              action: "approve",
              wardenNotes: "Approved automatically by system rules, confirmed gate log updated.",
              actionedAt: new Date(Date.now() - 36e5 * 11).toISOString()
            }
          },
          {
            studentName: "Julian Alvarez",
            roomNumber: "C-309",
            title: "Spoiled milk served at High Tea",
            description: "During tea today, the milk smelled extremely sour and some of us saw curdling at the bottom of the containers. Please inspect the mess kitchen storage units.",
            category: "mess",
            urgency: "high",
            status: "pending",
            createdAt: new Date(Date.now() - 36e5 * 1).toISOString(),
            aiAssessment: {
              title: "Spoiled Mess Milk Feedback",
              category: "mess",
              urgency: "high",
              autoRecommendation: "route_to_warden",
              aiReasoning: "Food safety issue affecting multiple residents. High risk of food poisoning. Escalating to Chief Warden and Mess Committee for mandatory inspection.",
              extractedDetails: {
                item: "Milk storage & Mess hygiene",
                location: "Canteen Kitchen / Storage",
                severity: "High (Public health / Food safety)",
                timing: "Immediate inspection recommended"
              },
              autoResponse: "Thank you for flagging this food safety concern. We have forwarded this report directly to the Chief Warden and the Mess Inspector for immediate inspection of storage temperature logs."
            }
          }
        ];
        for (const seed of seedData) {
          await addDoc(collection(db, "requests"), seed);
        }
        return;
      }
      if (requestsRef.current.length > 0) {
        data.forEach((newReq) => {
          const oldReq = requestsRef.current.find((r) => r.id === newReq.id);
          if (oldReq && oldReq.status !== newReq.status) {
            showToast(`\u26A1 REAL-TIME: Request "${newReq.title}" status changed to ${newReq.status.toUpperCase()}!`, "success");
          }
        });
        if (data.length > requestsRef.current.length) {
          showToast(`\u{1F514} REAL-TIME: New student submission in active ledger.`, "info");
        }
      }
      setRequests(data);
      if (selectedRequestRef.current) {
        const freshSelected = data.find((r) => r.id === selectedRequestRef.current?.id);
        if (freshSelected) {
          setSelectedRequest(freshSelected);
        }
      } else if (data.length > 0) {
        setSelectedRequest(data[0]);
      }
    });
    return () => unsubscribeSnapshot();
  }, [isLoggedIn]);
  useEffect(() => {
    if (!isRealtimeActive) return;
    const interval = setInterval(() => {
      setNetworkPing((prev) => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        const next = prev + delta * Math.floor(Math.random() * 4);
        return Math.max(15, Math.min(110, next));
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isRealtimeActive]);
  const handleSendToAura = async (message, history = []) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to get chat response");
    }
    const data = await res.json();
    return data.response;
  };
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    setAiAnalysisStage(1);
    const advanceStage = (stageNum, ms) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          setAiAnalysisStage(stageNum);
          resolve();
        }, ms);
      });
    };
    try {
      await advanceStage(2, 600);
      await advanceStage(3, 800);
      await advanceStage(4, 600);
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          roomNumber,
          title,
          description,
          category
        })
      });
      if (!res.ok) throw new Error("Failed to submit request");
      const evaluatedReq = await res.json();
      await addDoc(collection(db, "requests"), {
        studentName: evaluatedReq.studentName,
        roomNumber: evaluatedReq.roomNumber,
        title: evaluatedReq.title,
        description: evaluatedReq.description,
        category: evaluatedReq.category,
        urgency: evaluatedReq.urgency,
        status: evaluatedReq.status,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        aiAssessment: evaluatedReq.aiAssessment
      });
      setAiAnalysisStage(5);
      await new Promise((r) => setTimeout(r, 400));
      setTitle("");
      setDescription("");
      showToast(`Request submitted. Auto-routed: ${evaluatedReq.aiAssessment?.autoRecommendation.replace(/_/g, " ")}`, "success");
    } catch (err) {
      alert(err.message || "Error submitting request");
      showToast("Submission failed", "warning");
    } finally {
      setIsSubmitting(false);
      setAiAnalysisStage(0);
    }
  };
  const handleWardenAction = async (action) => {
    if (!selectedRequest) return;
    setIsActioning(true);
    try {
      let nextStatus = selectedRequest.status;
      if (action === "approve") nextStatus = "approved";
      if (action === "reject") nextStatus = "rejected";
      if (action === "resolve") nextStatus = "resolved";
      if (action === "assign") nextStatus = "in_progress";
      const wardenAction = {
        action,
        wardenNotes,
        actionedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const reqRef = doc(db, "requests", selectedRequest.id);
      await updateDoc(reqRef, {
        status: nextStatus,
        wardenAction
      });
      setWardenNotes("");
      showToast(`Oversight action executed: ${action.toUpperCase()}`, "success");
    } catch (err) {
      alert(err.message || "Error processing action");
      showToast("Oversight action failed", "warning");
    } finally {
      setIsActioning(false);
    }
  };
  const quickFill = (type) => {
    if (type === "electrical") {
      setTitle("Bathroom Heater Sparking");
      setDescription("When we switched on the water heater in B-304 this morning, there was a loud pop and sparks shot out from the switch plate. It smelled like burning plastic. We turned off the main circuit breaker for the bathroom to be safe, but we have no hot water.");
      setCategory("maintenance");
      showToast("Template auto-filled: Emergency Electrical Hazard", "info");
    } else if (type === "gatepass") {
      setTitle("Gate Pass for Mock Coding Interview");
      setDescription("I have been scheduled for a mock technical coding interview tonight on an international platform. The interview starts at 10:15 PM and ends at 11:15 PM. Requesting late gate pass clearance up to 11:30 PM.");
      setCategory("permission");
      showToast("Template auto-filled: Late Gate Pass", "info");
    } else if (type === "water") {
      setTitle("Muddy water coming out of water cooler");
      setDescription("The water dispenser/cooler near the Wing B elevator is dispensing muddy brown water. Multiple students filled their flasks and noticed sediment. Please inspect the carbon filters or water tank storage.");
      setCategory("mess");
      showToast("Template auto-filled: Mess Quality Feedback", "info");
    }
  };
  const filteredRequests = requests.filter((req) => {
    if (wardenFilter === "all") return true;
    if (wardenFilter === "pending") return req.status === "pending" || req.status === "ai_evaluated";
    if (wardenFilter === "maintenance") return req.category === "maintenance";
    if (wardenFilter === "mess") return req.category === "mess";
    if (wardenFilter === "permission") return req.category === "permission";
    if (wardenFilter === "urgent") return req.urgency === "high" || req.urgency === "critical";
    return true;
  });
  const totalTickets = requests.length;
  const pendingTickets = requests.filter((r) => r.status === "pending" || r.status === "ai_evaluated").length;
  const resolvedTickets = requests.filter((r) => r.status === "resolved" || r.status === "approved").length;
  const criticalTickets = requests.filter((r) => r.urgency === "critical" || r.urgency === "high").length;
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "maintenance":
        return <Wrench className="w-4 h-4 text-amber-500 animate-pulse" />;
      case "mess":
        return <Utensils className="w-4 h-4 text-emerald-500" />;
      case "permission":
        return <Key className="w-4 h-4 text-indigo-500" />;
      case "complaint":
        return <AlertOctagon className="w-4 h-4 text-rose-500 animate-bounce" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Pending
          </span>;
      case "ai_evaluated":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/50 shadow-2xs animate-pulse">
            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
            AI Evaluated
          </span>;
      case "approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <X className="w-3.5 h-3.5" /> Rejected
          </span>;
      case "in_progress":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3.5 h-3.5" /> In Progress
          </span>;
      case "resolved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>;
    }
  };
  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case "critical":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold bg-rose-900 text-white animate-pulse shadow-sm">
            CRITICAL
          </span>;
      case "high":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            HIGH
          </span>;
      case "medium":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            MEDIUM
          </span>;
      case "low":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            LOW
          </span>;
    }
  };
  return <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900 relative overflow-x-hidden" id="app-container">
      {
    /* Cinematic Startup Sequence */
  }
      {!isLoggedIn && <CinematicIntro onComplete={() => {
  }} />}
      
      {
    /* Activate Spotlight listener to update cursor CSS custom properties */
  }
      <Spotlight />

      {
    /* Dynamic Cursor Spotlight Effect */
  }
      <div className="absolute inset-0 spotlight-bg pointer-events-none z-0" />
      
      {
    /* High FPS Custom Springs Cursor */
  }
      <CustomCursor />

      {
    /* Dynamic atmospheric shapes */
  }
      <AtmosphericBackground />

      {
    /* Floating Toast Area */
  }
      <div className="fixed top-20 right-6 z-[9999] pointer-events-none flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => <motion.div
    key={toast.id}
    initial={{ opacity: 0, y: -20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9, y: 10 }}
    transition={{ type: "spring", stiffness: 350, damping: 25 }}
    className={`p-4 rounded-xl border pointer-events-auto shadow-md flex items-center gap-3 backdrop-blur-md ${toast.type === "success" ? "bg-slate-900 border-slate-800 text-white" : toast.type === "warning" ? "bg-rose-50 border-rose-100 text-rose-950" : "bg-white border-slate-100 text-slate-800"}`}
  >
              {toast.type === "success" ? <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shrink-0">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div> : toast.type === "warning" ? <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" /> : <Info className="w-5 h-5 text-slate-400 shrink-0" />}
              <span className="text-xs font-semibold leading-relaxed">{toast.text}</span>
            </motion.div>)}
        </AnimatePresence>
      </div>


      {
    /* --- PREMIUM SaaS REDESIGN: SPLIT SCREEN LOGIN --- */
  }
      {!isLoggedIn ? <div className="flex w-full min-h-screen bg-slate-50 relative overflow-hidden" id="split-screen-login">
          
          {
    /* Left Panel: Immersive AI Hero */
  }
          <div className="hidden lg:flex flex-1 relative flex-col justify-center p-16 z-10 overflow-hidden select-none">

            {
    /* ── Deep background ─────────────────────────────── */
  }
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1f] via-[#0f172a] to-[#1a0533]" />

            {
    /* ── Aurora layers ────────────────────────────────── */
  }
            <div
    className="aurora-1 absolute top-[-20%] left-[-15%] w-[70%] h-[70%] rounded-full opacity-50 blur-3xl"
    style={{ background: "radial-gradient(circle, rgba(99,102,241,0.55) 0%, rgba(139,92,246,0.3) 50%, transparent 80%)" }}
  />
            <div
    className="aurora-2 absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-40 blur-3xl"
    style={{ background: "radial-gradient(circle, rgba(14,165,233,0.5) 0%, rgba(56,189,248,0.25) 50%, transparent 80%)" }}
  />
            <div
    className="absolute top-[40%] right-[5%] w-[40%] h-[40%] rounded-full opacity-25 blur-3xl"
    style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)", animation: "aurora-1 14s ease-in-out infinite reverse" }}
  />

            {
    /* ── Grid overlay ─────────────────────────────────── */
  }
            <div
    className="absolute inset-0 opacity-[0.04]"
    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
  />

            {
    /* ── Animated Particles ───────────────────────────── */
  }
            {Array.from({ length: 18 }).map((_, i) => <div
    key={i}
    className="absolute rounded-full pointer-events-none"
    style={{
      width: Math.random() * 4 + 2,
      height: Math.random() * 4 + 2,
      left: `${Math.random() * 90 + 5}%`,
      bottom: `${Math.random() * 30}%`,
      background: i % 3 === 0 ? "rgba(99,102,241,0.9)" : i % 3 === 1 ? "rgba(56,189,248,0.8)" : "rgba(168,85,247,0.7)",
      animation: `particle-drift ${5 + Math.random() * 8}s ${Math.random() * 8}s ease-out infinite`,
      boxShadow: "0 0 6px currentColor"
    }}
  />)}

            {
    /* ── Spinning ring ────────────────────────────────── */
  }
            <div className="absolute top-[12%] right-[8%] w-24 h-24 opacity-20">
              <div className="spin-slow w-full h-full rounded-full border-2 border-dashed border-indigo-400" />
              <div className="absolute inset-2 rounded-full border border-sky-400 opacity-60" style={{ animation: "spin-slow 14s linear infinite reverse" }} />
            </div>

            {
    /* ── Main Content ─────────────────────────────────── */
  }
            <motion.div
    initial={{ opacity: 0, x: -32 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
    className="relative z-10 max-w-[480px]"
  >
              {
    /* Brand badge */
  }
              <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1, duration: 0.5 }}
    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-md mb-7"
  >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.12em]">AI-Powered Residential OS</span>
              </motion.div>

              <h1 className="text-[3.25rem] font-extrabold text-white font-display leading-[1.05] mb-5 tracking-tight">
                Smarter{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
                  Hostel
                </span>{" "}
                Management
              </h1>
              <p className="text-[1.05rem] text-slate-400 leading-relaxed mb-10 font-medium">
                Agentic AI handles routing, triage, and approvals automatically — so wardens act, not administer.
              </p>

              {
    /* ── Floating metric cards ─────────────────────── */
  }
              <div className="space-y-3">

                {
    /* Card 1 – live tickets */
  }
                <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.35, duration: 0.55 }}
    className="float-card flex items-center gap-4 bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4"
  >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Tickets Processed Today</div>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-white font-mono">142</span>
                      <span className="text-xs font-bold text-emerald-400 mb-0.5">↑ 18%</span>
                    </div>
                  </div>
                  {
    /* Mini sparkline */
  }
                  <svg width="56" height="28" viewBox="0 0 56 28" className="shrink-0 opacity-70">
                    <polyline points="0,22 9,18 18,20 27,10 36,14 45,6 56,8" fill="none" stroke="url(#sl)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <defs><linearGradient id="sl" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
                  </svg>
                </motion.div>

                {
    /* Card 2 – AI routing */
  }
                <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.48, duration: 0.55 }}
    className="float-card-2 flex items-center gap-4 bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4"
  >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">AI Auto-Routed</div>
                    {
    /* Mini routing visual */
  }
                    <div className="flex items-center gap-1.5">
                      {["Maintenance", "Permission", "Mess"].map((tag, i) => <span
    key={tag}
    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
    style={{ background: ["rgba(245,158,11,0.2)", "rgba(99,102,241,0.2)", "rgba(16,185,129,0.2)"][i], color: ["#fbbf24", "#a5b4fc", "#6ee7b7"][i] }}
  >
                          {tag}
                        </span>)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-white font-mono">98%</div>
                    <div className="text-[9px] text-slate-500 font-bold">accuracy</div>
                  </div>
                </motion.div>

                {
    /* Card 3 – response time */
  }
                <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.62, duration: 0.55 }}
    className="float-card flex items-center gap-4 bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4"
  >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Response Time</div>
                    <div className="w-full bg-white/8 rounded-full h-1.5">
                      <motion.div
    initial={{ width: 0 }}
    animate={{ width: "87%" }}
    transition={{ delay: 1, duration: 1.2, ease: "easeOut" }}
    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
  />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-white font-mono">1.8s</div>
                    <div className="text-[9px] text-emerald-400 font-bold">–42%</div>
                  </div>
                </motion.div>
              </div>

              {
    /* Status bar */
  }
              <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.9 }}
    className="mt-8 flex items-center gap-3"
  >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase font-mono">All systems operational</span>
              </motion.div>
            </motion.div>
          </div>


          {
    /* Right Panel: Floating Glass Form */
  }
          <div className="flex-1 flex flex-col justify-center items-center bg-white/80 backdrop-blur-2xl z-10 p-8 sm:p-14 lg:rounded-l-[48px] shadow-[-24px_0_60px_-12px_rgba(0,0,0,0.06)] border-l border-white/80 relative overflow-hidden">
            {
    /* Subtle inner background glow */
  }
            <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-5%] left-[-5%] w-56 h-56 bg-purple-50/50 rounded-full blur-3xl pointer-events-none" />

            <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    className="w-full max-w-[440px] relative z-10"
  >
              {
    /* Header */
  }
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.1em]">Secure Portal Access</span>
                </div>
                <h2 className="text-[2rem] font-extrabold text-slate-900 font-display tracking-tight leading-tight">
                  {isSignUp ? "Create Account" : "Welcome back"}
                </h2>
                <p className="text-[0.9375rem] text-slate-500 mt-2 font-medium leading-relaxed">
                  {isSignUp ? "Join the secure residential management ledger." : "Sign in to manage operations and track requests."}
                </p>
              </div>

              {
    /* Role Selector */
  }
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70 mb-8 gap-1.5" id="login-role-selector">
                <button
    type="button"
    onClick={() => setLoginRole("student")}
    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-none ${loginRole === "student" ? "bg-white text-indigo-700 shadow-md border border-slate-200/80 scale-[1.02]" : "text-slate-500 hover:text-slate-800 hover:bg-white/50"}`}
  >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${loginRole === "student" ? "bg-indigo-100" : "bg-slate-200/50"}`}>
                    <User className="w-3.5 h-3.5" />
                  </div>
                  Resident Student
                </button>
                <button
    type="button"
    onClick={() => setLoginRole("warden")}
    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-none ${loginRole === "warden" ? "bg-slate-900 text-white shadow-lg scale-[1.02]" : "text-slate-500 hover:text-slate-800 hover:bg-white/50"}`}
  >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${loginRole === "warden" ? "bg-white/10" : "bg-slate-200/50"}`}>
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  Warden Oversight
                </button>
              </div>

              {
    /* Input Fields */
  }
              <div className="space-y-4">
                <FloatingInput
    id="login-email-input"
    type="email"
    label="Academic Email Address"
    icon={<Mail className="w-[18px] h-[18px]" />}
    value={loginEmail}
    onChange={(e) => setLoginEmail(e.target.value)}
  />

                {isSignUp && loginRole === "student" && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="grid grid-cols-2 gap-3"
  >
                    <FloatingInput
    id="login-name-input"
    type="text"
    label="Full Name"
    icon={<User className="w-[18px] h-[18px]" />}
    value={loginStudentName}
    onChange={(e) => setLoginStudentName(e.target.value)}
  />
                    <FloatingInput
    id="login-room-input"
    type="text"
    label="Room No."
    icon={<Building className="w-[18px] h-[18px]" />}
    value={loginRoomNumber}
    onChange={(e) => setLoginRoomNumber(e.target.value)}
  />
                  </motion.div>}

                <FloatingInput
    id="login-password-input"
    type="password"
    label="Secure Password"
    icon={<Lock className="w-[18px] h-[18px]" />}
    value={loginPassword}
    onChange={(e) => setLoginPassword(e.target.value)}
  />
              </div>

              {
    /* Toggle Mode */
  }
              <div className="mt-5 text-right">
                <button
    type="button"
    onClick={() => {
      setIsSignUp(!isSignUp);
      showToast(isSignUp ? "Switched to Sign In" : "Switched to Create Account", "info");
    }}
    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold transition-colors cursor-none underline-offset-2 hover:underline"
  >
                  {isSignUp ? "Already registered? Sign In \u2192" : "New resident? Create Account \u2192"}
                </button>
              </div>

              {
    /* Submit Button */
  }
              <div className="mt-7">
                <RippleButton
    disabled={isLoggingIn || !loginEmail.trim() || !loginPassword.trim() || isSignUp && loginRole === "student" && (!loginStudentName.trim() || !loginRoomNumber.trim())}
    onClick={async () => {
      if (!loginEmail.includes("@") || !loginEmail.includes(".")) {
        showToast("Please enter a valid email address.", "warning");
        return;
      }
      if (isSignUp && loginRole === "warden" && loginPassword !== "admin" && loginPassword !== "warden123") {
        showToast("Incorrect Warden passcode. Use the authorized passcode to register.", "warning");
        return;
      }
      const isValidWardenPasscode = loginRole === "warden" && (loginPassword === "admin" || loginPassword === "warden123");
      if (!isValidWardenPasscode && loginPassword.length < 6) {
        showToast("Password must be at least 6 characters.", "warning");
        return;
      }
      setIsLoggingIn(true);
      setLoginProgress(10);
      const updateProgress = (amt, ms) => new Promise((resolve) => setTimeout(() => {
        setLoginProgress(amt);
        resolve(void 0);
      }, ms));
      try {
        await updateProgress(20, 200);
        const emailNormalized = loginEmail.trim().toLowerCase();
        const passwordTrimmed = loginPassword;
        if (isSignUp) {
          const qUser = query(collection(db, "users"), where("email", "==", emailNormalized));
          const qSnap = await getDocs(qUser);
          if (!qSnap.empty) throw new Error("This email address is already registered.");
          await updateProgress(60, 300);
          const userUid = "usr_" + Math.random().toString(36).substr(2, 9);
          await setDoc(doc(db, "users", userUid), { uid: userUid, email: emailNormalized, password: passwordTrimmed, role: loginRole, name: loginRole === "student" ? loginStudentName : "Chief Warden", roomNumber: loginRole === "student" ? loginRoomNumber : "N/A" });
          localStorage.setItem("portal_user_id", userUid);
          setStudentName(loginRole === "student" ? loginStudentName : "Chief Warden");
          setRoomNumber(loginRole === "student" ? loginRoomNumber : "N/A");
          await updateProgress(90, 200);
        } else {
          const qUser = query(collection(db, "users"), where("email", "==", emailNormalized), where("password", "==", passwordTrimmed));
          const qSnap = await getDocs(qUser);
          if (qSnap.empty) throw new Error("Invalid email or password.");
          const userData = qSnap.docs[0].data();
          if (userData.role !== loginRole) throw new Error(`Account is registered as ${userData.role.toUpperCase()}. Please select the correct tab.`);
          localStorage.setItem("portal_user_id", userData.uid);
          setStudentName(userData.name || "Anonymous Student");
          setRoomNumber(userData.roomNumber || "N/A");
          await updateProgress(85, 400);
        }
        await updateProgress(100, 200);
        setIsLoggedIn(true);
        setActiveTab(loginRole);
        setIsLoggingIn(false);
        setLoginProgress(0);
        showToast("Access granted! Welcome back.", "success");
      } catch (err) {
        showToast(err.message || "Authentication failed.", "warning");
        setIsLoggingIn(false);
        setLoginProgress(0);
      }
    }}
    className="btn-primary w-full h-[3.5rem] text-[0.9375rem] rounded-[0.875rem] font-bold"
    id="login-submit-btn"
  >
                  {isLoggingIn ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-200" />}
                  <span>{isSignUp ? "Register Account" : "Access Portal"}</span>
                </RippleButton>
              </div>

              {
    /* Progress bar */
  }
              <AnimatePresence>
                {isLoggingIn && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="mt-5 bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl overflow-hidden"
  >
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Secure Handshake</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{loginProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <motion.div
    animate={{ width: `${loginProgress}%` }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
  />
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-2.5 text-center">Authenticating via cloud ledger…</p>
                  </motion.div>}
              </AnimatePresence>

            </motion.div>
          </div>
        </div> : <div className="flex w-full min-h-screen bg-slate-50 overflow-hidden" id="premium-dashboard">
            {
    /* Sidebar Navigation */
  }
            <aside className="w-[280px] bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 relative z-30">
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 to-slate-900 pointer-events-none" />
              
              <div className="p-6 relative z-10 border-b border-slate-800/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                    <Shield className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h1 className="text-md font-bold text-white font-display tracking-tight leading-tight">Hostel AI</h1>
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">Agentic RA</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-300 font-bold text-lg shadow-inner shrink-0">
                    {activeTab === "student" ? studentName.substring(0, 1) : "W"}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-bold text-white truncate">{activeTab === "student" ? studentName : "Warden Council"}</h3>
                    <p className="text-[11px] text-slate-400 font-medium truncate">
                      {activeTab === "student" ? `Room ${roomNumber}` : "Admin Access"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 relative z-10 custom-scrollbar">
                <div className="space-y-1 mb-8">
                  <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Dashboards</span>
                  <button
    onClick={() => setActiveTab("student")}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === "student" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"}`}
  >
                    <User className="w-4 h-4" /> Resident View
                  </button>
                  <button
    onClick={() => setActiveTab("warden")}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === "warden" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"}`}
  >
                    <Shield className="w-4 h-4" /> Warden Oversight
                  </button>
                </div>

                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 block">System Status</span>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    SYNCING (${networkPing}ms)
                  </div>
                </div>
              </div>

              <div className="p-4 relative z-10 border-t border-slate-800/50">
                <button
    onClick={() => {
      localStorage.removeItem("portal_user_id");
      setIsLoggedIn(false);
      setRequests([]);
      setSelectedRequest(null);
    }}
    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600"
  >
                  <Lock className="w-4 h-4" /> Secure Logout
                </button>
              </div>
            </aside>

            {
    /* Main Content Area */
  }
            <main className="flex-1 flex flex-col relative h-screen overflow-hidden">
              {
    /* Premium Background Mesh */
  }
              <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-100/50 via-sky-50/20 to-transparent rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-100/40 via-emerald-50/10 to-transparent rounded-full blur-3xl opacity-60" />
              </div>

              {
    /* Scrollable Dashboard View */
  }
              <div className="flex-1 overflow-y-auto p-8 md:p-12 z-10 relative custom-scrollbar">
                
                {error && <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-900 text-sm shadow-md">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                      <span className="font-bold">System Alert: {error}</span>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-3 py-1.5 bg-white hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold text-rose-900 transition-all shadow-sm">
                      Reboot Matrix
                    </button>
                  </div>}

                <AnimatePresence mode="wait">
                  {
    /* --- STUDENT VIEW TAB --- */
  }
                  {activeTab === "student" && <motion.div
    key="student-tab"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="max-w-6xl mx-auto"
  >
                      <div className="mb-10">
                        <h2 className="text-4xl font-extrabold text-slate-900 font-display tracking-tight mb-2">Resident Portal</h2>
                        <p className="text-slate-500 font-medium text-lg">AI-driven request routing and real-time ledger tracking.</p>
                      </div>

                      {
    /* Broadcast */
  }
                      <div className="glass-panel rounded-2xl p-5 mb-10 flex items-center gap-4 border border-indigo-100 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-sky-500/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-1000 ease-in-out" />
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-inner">
                          <Zap className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-600 uppercase mb-1 block">Live Broadcast</span>
                          <p className="text-sm font-semibold text-slate-800">Security desk curfew relaxed to 11:30 PM due to mock exams. Water dispenser servicing in Block B completed.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {
    /* New Ticket Form (7 cols) */
  }
                        <div className="lg:col-span-7">
                          <div className="glass-card rounded-[2rem] p-8 border border-white relative overflow-hidden">
                            <h3 className="text-2xl font-bold text-slate-900 font-display mb-8 flex items-center gap-3">
                              <Plus className="w-6 h-6 text-indigo-500" /> Dispatch Request
                            </h3>
                            
                            <form onSubmit={handleSubmitRequest} className="space-y-6">
                              <div>
                                <label className="text-[11px] font-bold text-slate-500 block mb-3 uppercase tracking-wider">Select Category</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  {["maintenance", "permission", "mess", "complaint"].map((cat) => <button
    key={cat}
    type="button"
    onClick={() => setCategory(cat)}
    className={`py-4 px-2 rounded-2xl text-xs font-bold capitalize transition-all flex flex-col items-center justify-center gap-2 border ${category === cat ? "bg-slate-900 text-white shadow-xl scale-105 border-slate-800" : "bg-white/50 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-white"}`}
  >
                                      {getCategoryIcon(cat)}
                                      <span className="text-[11px]">{cat}</span>
                                    </button>)}
                                </div>
                              </div>

                              <div className="space-y-4">
                                <FloatingInput
    id="student-req-title"
    type="text"
    label="Request Title (e.g., Broken AC Unit)"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    required
  />

                                <div className="input-container relative">
                                  <textarea
    id="student-req-desc"
    rows={4}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder=" "
    className="floating-input pt-6"
    required
  />
                                  <label htmlFor="student-req-desc" className="floating-label !top-4">Details & Description</label>
                                </div>
                              </div>

                              {
    /* AI Analysis Stages */
  }
                              <AnimatePresence>
                                {isSubmitting && <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    className="p-6 bg-slate-900 rounded-2xl overflow-hidden mt-4 shadow-inner"
  >
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                                      <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-2 animate-pulse">
                                        <Sparkles className="w-4 h-4" /> NEURAL DECODER ACTIVE
                                      </span>
                                      <span className="text-[10px] font-mono text-slate-500">{aiAnalysisStage}/5</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full mb-4 overflow-hidden">
                                      <motion.div
    animate={{ width: `${aiAnalysisStage / 5 * 100}%` }}
    transition={{ duration: 0.3 }}
    className="bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 h-full"
  />
                                    </div>
                                    <p className="text-xs font-mono text-white/90 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                                      {aiAnalysisStage === 1 && "\u26A1 Parsing syntax vectors and NLP boundaries..."}
                                      {aiAnalysisStage === 2 && "\u{1F9E0} Extracting hazard parameters and timelines..."}
                                      {aiAnalysisStage === 3 && "\u{1F4C2} Evaluating risk severity profiles..."}
                                      {aiAnalysisStage === 4 && "\u{1F680} Computing optimal routing matrix..."}
                                      {aiAnalysisStage === 5 && "\u{1F389} Ticket packet synthesized and dispatched."}
                                    </p>
                                  </motion.div>}
                              </AnimatePresence>

                              <div className="flex justify-between items-center pt-4">
                                <div className="flex gap-2">
                                  <button type="button" onClick={() => quickFill("electrical")} className="p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-amber-500 shadow-sm transition-all" title="Test: Electrical">
                                    <Wrench className="w-4 h-4" />
                                  </button>
                                  <button type="button" onClick={() => quickFill("gatepass")} className="p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-indigo-500 shadow-sm transition-all" title="Test: Gate Pass">
                                    <Key className="w-4 h-4" />
                                  </button>
                                </div>
                                <RippleButton
    type="submit"
    disabled={isSubmitting || !title.trim() || !description.trim()}
    className="px-8 py-4 bg-slate-900 text-white font-bold text-sm rounded-2xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
  >
                                  {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
                                  <span>{isSubmitting ? "Evaluating..." : "Dispatch to AI Sentinel"}</span>
                                </RippleButton>
                              </div>
                            </form>
                          </div>
                        </div>

                        {
    /* History Queue (5 cols) */
  }
                        <div className="lg:col-span-5 flex flex-col h-[750px]">
                          <div className="glass-card rounded-[2rem] p-6 border border-white shadow-lg flex flex-col h-full overflow-hidden relative">
                            <div className="flex justify-between items-center mb-6 z-10 relative">
                              <h3 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
                                <History className="w-5 h-5 text-indigo-500" /> Live Ledger
                              </h3>
                              <span className="text-[11px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1 rounded-full">{requests.length} Submissions</span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 z-10 relative">
                              {isLoading ? Array(3).fill(0).map((_, i) => <SkeletonShimmer key={i} className="h-32 w-full rounded-2xl" />) : requests.length > 0 ? requests.map((req) => <motion.div
    key={req.id}
    layout
    className="p-5 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all group"
  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex items-center gap-2">
                                        {getCategoryIcon(req.category)}
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{req.category}</span>
                                      </div>
                                      {getStatusBadge(req.status)}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors">{req.title}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{req.description}</p>
                                    
                                    {req.aiAssessment && <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                          <Sparkles className="w-3.5 h-3.5" /> AI Evaluated
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">{new Date(req.createdAt).toLocaleTimeString()}</span>
                                      </div>}
                                  </motion.div>) : <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                  <FileText className="w-16 h-16 mb-4 text-slate-200" />
                                  <p className="text-sm font-bold">Ledger is Empty</p>
                                </div>}
                            </div>
                            
                            {
    /* Fade out gradient for scroll */
  }
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 to-transparent z-10 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </motion.div>}

                  {
    /* --- WARDEN VIEW TAB --- */
  }
                  {activeTab === "warden" && <motion.div
    key="warden-tab"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="max-w-7xl mx-auto space-y-10"
  >
                      <div className="mb-10">
                        <h2 className="text-4xl font-extrabold text-slate-900 font-display tracking-tight mb-2">Command Center</h2>
                        <p className="text-slate-500 font-medium text-lg">Global oversight and real-time operational telemetry.</p>
                      </div>

                      {
    /* Unified Dashboard UI wrappers for Warden components */
  }
                      <StatsDashboard requests={requests} />
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
                        {
    /* Heatmap Area */
  }
                        <div className="lg:col-span-4">
                          <RoomHeatmap requests={requests} onSelectRequest={(req) => setSelectedRequest(req)} />
                        </div>
                        
                        {
    /* Queue Area */
  }
                        <div className="lg:col-span-8">
                          <div className="glass-card rounded-[2rem] p-6 border border-white shadow-lg h-[800px] flex gap-6">
                            {
    /* Ticket List */
  }
                            <div className="w-1/2 flex flex-col border-r border-slate-100 pr-6">
                              <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 font-display">Active Ledger</h3>
                                <div className="relative">
                                  <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <select
    value={wardenFilter}
    onChange={(e) => setWardenFilter(e.target.value)}
    className="pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none appearance-none cursor-pointer"
  >
                                    <option value="all">All Routes</option>
                                    <option value="pending">Review Needed</option>
                                    <option value="urgent">High Urgency</option>
                                    <option value="permission">Passes</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                {filteredRequests.map((req) => <div
    key={req.id}
    onClick={() => setSelectedRequest(req)}
    className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedRequest?.id === req.id ? "bg-slate-900 border-slate-800 text-white shadow-lg scale-[1.02]" : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"}`}
  >
                                    <div className="flex justify-between items-start mb-2">
                                      <span className={`text-[10px] font-bold uppercase ${selectedRequest?.id === req.id ? "text-slate-400" : "text-slate-500"}`}>{req.category}</span>
                                      {getStatusBadge(req.status)}
                                    </div>
                                    <h4 className="text-sm font-bold mb-1 truncate">{req.title}</h4>
                                    <div className="flex items-center justify-between mt-3">
                                      <span className={`text-xs ${selectedRequest?.id === req.id ? "text-slate-300" : "text-slate-500"}`}>{req.studentName}</span>
                                      {getUrgencyBadge(req.urgency)}
                                    </div>
                                  </div>)}
                              </div>
                            </div>
                            
                            {
    /* Ticket Details Panel */
  }
                            <div className="w-1/2 flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
                              {selectedRequest ? <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-6"
  >
                                  <div>
                                    <div className="flex items-center gap-2 mb-3">
                                      {getCategoryIcon(selectedRequest.category)}
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{selectedRequest.category}</span>
                                      <span className="text-[10px] font-mono text-slate-400 ml-auto">ID: {selectedRequest.id}</span>
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-900 font-display leading-tight">{selectedRequest.title}</h3>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      {getStatusBadge(selectedRequest.status)}
                                      {getUrgencyBadge(selectedRequest.urgency)}
                                    </div>
                                  </div>

                                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg">
                                      {selectedRequest.studentName.charAt(0)}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-bold text-slate-900">{selectedRequest.studentName}</h4>
                                      <p className="text-xs text-slate-500 font-medium mt-0.5">Room: {selectedRequest.roomNumber}</p>
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Description</span>
                                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-100">
                                      {selectedRequest.description}
                                    </p>
                                  </div>

                                  {selectedRequest.aiAssessment && <div className="p-5 bg-gradient-to-br from-indigo-50 to-sky-50 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
                                      <div className="flex items-center gap-2 mb-4 border-b border-indigo-100 pb-3">
                                        <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                                        <h4 className="text-sm font-bold text-indigo-950">AI Copilot Analysis</h4>
                                      </div>
                                      <p className="text-xs text-slate-700 font-medium leading-relaxed mb-4">
                                        {selectedRequest.aiAssessment.aiReasoning}
                                      </p>
                                      <div className="grid grid-cols-2 gap-3 bg-white/70 p-3 rounded-xl border border-indigo-50">
                                        <div>
                                          <span className="text-[10px] uppercase font-bold text-indigo-500 block mb-0.5">Severity</span>
                                          <span className="text-xs font-extrabold text-slate-900">{selectedRequest.aiAssessment.extractedDetails?.severity || "Standard"}</span>
                                        </div>
                                        <div>
                                          <span className="text-[10px] uppercase font-bold text-indigo-500 block mb-0.5">Recommended Action</span>
                                          <span className="text-xs font-extrabold text-slate-900">{selectedRequest.aiAssessment.autoRecommendation.replace(/_/g, " ")}</span>
                                        </div>
                                      </div>
                                    </div>}

                                  <div className="pt-4 border-t border-slate-100 space-y-4">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase">Execute Action</h4>
                                    <textarea
    rows={2}
    value={wardenNotes}
    onChange={(e) => setWardenNotes(e.target.value)}
    placeholder="Add operational notes..."
    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
  />
                                    
                                    {selectedRequest.category === "permission" ? <div className="flex gap-3">
                                        <button onClick={() => handleWardenAction("approve")} disabled={isActioning} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                                          <Check className="w-4 h-4" /> Grant
                                        </button>
                                        <button onClick={() => handleWardenAction("reject")} disabled={isActioning} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                                          <X className="w-4 h-4" /> Deny
                                        </button>
                                      </div> : <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => handleWardenAction("approve")} disabled={isActioning} className="py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95">Approve</button>
                                        <button onClick={() => handleWardenAction("reject")} disabled={isActioning} className="py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-md active:scale-95">Reject</button>
                                        <button onClick={() => handleWardenAction("assign")} disabled={isActioning} className="py-2.5 bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md active:scale-95">Dispatch</button>
                                        <button onClick={() => handleWardenAction("resolve")} disabled={isActioning} className="py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md active:scale-95">Resolve</button>
                                      </div>}
                                  </div>
                                </motion.div> : <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                  <Shield className="w-12 h-12 mb-3 text-slate-300" />
                                  <p className="text-sm font-bold">Select a ticket</p>
                                </div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>}
                </AnimatePresence>

                {
    /* Floating AI Assistant Toggle */
  }
                <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
                  <AnimatePresence>
                    {isChatOpen && <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className="mb-4 w-[360px] shadow-2xl rounded-[2rem] overflow-hidden border border-white/60 bg-white/50 backdrop-blur-3xl"
  >
                        <AIAssistant
    onSendMessage={handleSendToAura}
    userId={studentName ? studentName.replace(/\s+/g, "_").toLowerCase() : "guest"}
  />
                      </motion.div>}
                  </AnimatePresence>
                  
                  <RippleButton
    onClick={() => setIsChatOpen(!isChatOpen)}
    className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1"
  >
                    {isChatOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                  </RippleButton>
                </div>

              </div>
            </main>
          </div>}

      {
    /* Footer / Copyright / Connection Status line */
  }
      <footer className="mt-12 bg-white/85 backdrop-blur-md border-t border-slate-100 py-6 text-slate-400 text-xs text-center z-10" id="portal-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <Building className="w-4 h-4 text-slate-400 animate-pulse" />
            <span>AI Warden Council Oversight Network</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-emerald-700 font-extrabold uppercase">● LEDGER CLOUD ONLINE</span>
            </span>
            <span>|</span>
            <span>Policy Rules Activated</span>
          </div>
        </div>
      </footer>

    </div>;
}
export {
  App as default
};
