/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Utensils, Key, Calendar, Phone, Wifi, Trash2, Bot } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { RippleButton } from "./InteractiveEffects";
const COLLECTION = "aura_chat";
function useTypewriter(text, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return displayed;
}
function renderMarkdown(text) {
  return text.split("\n").map((line, i) => {
    if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
      const rest = line.trim().substring(2);
      return <li key={i} className="ml-4 list-disc text-[0.8375rem] text-slate-700 mt-0.5 leading-relaxed">
          {parseBold(rest)}
        </li>;
    }
    if (line.trim().startsWith("## ")) {
      return <p key={i} className="text-[0.8375rem] font-extrabold text-slate-900 mt-2 mb-0.5">{line.trim().substring(3)}</p>;
    }
    return <p key={i} className="text-[0.8375rem] text-slate-700 leading-relaxed mt-1 min-h-[0.5rem]">
        {parseBold(line)}
      </p>;
  });
}
function parseBold(line) {
  const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} className="font-bold text-slate-900">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} className="bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded text-[0.75rem] font-mono">{p.slice(1, -1)}</code>;
    return p;
  });
}
function AuraBubble({ text, isLatest }) {
  const displayed = useTypewriter(isLatest ? text : "", 12);
  const shown = isLatest ? displayed : text;
  return <div className="space-y-0.5">
      {renderMarkdown(shown)}
      {isLatest && displayed.length < text.length && <span className="inline-block w-0.5 h-3.5 bg-indigo-500 ml-0.5 animate-pulse rounded-full align-middle" />}
    </div>;
}
function AIAssistant({ onSendMessage, userId = "global" }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [latestAIId, setLatestAIId] = useState(null);
  const [firestoreReady, setFirestoreReady] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatCollection = collection(db, COLLECTION, userId, "messages");
  useEffect(() => {
    const q = query(chatCollection, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        role: d.data().role,
        text: d.data().text,
        timestamp: d.data().timestamp || (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }));
      if (msgs.length === 0) {
        setMessages([{
          id: "welcome",
          role: "model",
          text: "\u{1F44B} Hi! I'm **Aura**, your AI Resident Assistant powered by Gemini.\n\nI know everything about hostel timings, gate rules, laundry, contacts, and Wi-Fi. Ask me anything!",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }]);
      } else {
        setMessages(msgs);
      }
      setFirestoreReady(true);
    }, (err) => {
      console.error("Firestore chat listener error:", err);
      setFirestoreReady(true);
      setMessages([{
        id: "welcome",
        role: "model",
        text: "\u{1F44B} Hi! I'm **Aura**, your AI Resident Assistant powered by Gemini.\n\nI know everything about hostel timings, gate rules, laundry, contacts, and Wi-Fi. Ask me anything!",
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }]);
    });
    return () => unsub();
  }, [userId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);
  const handleSend = useCallback(async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userDocRef = await addDoc(chatCollection, {
      role: "user",
      text: textToSend,
      timestamp,
      createdAt: serverTimestamp()
    }).catch(() => null);
    setInputText("");
    setIsLoading(true);
    try {
      const historyForAI = messages.filter((m) => m.id !== "welcome");
      const responseText = await onSendMessage(textToSend, historyForAI);
      const aiTimestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const aiDocRef = await addDoc(chatCollection, {
        role: "model",
        text: responseText,
        timestamp: aiTimestamp,
        createdAt: serverTimestamp()
      }).catch(() => null);
      if (aiDocRef) setLatestAIId(aiDocRef.id);
      else {
        const localId = "local-" + Date.now();
        setLatestAIId(localId);
        setMessages((prev) => [...prev, {
          id: localId,
          role: "model",
          text: responseText,
          timestamp: aiTimestamp
        }]);
      }
    } catch (err) {
      const errText = err?.message?.includes("temporarily") ? err.message : "\u274C Could not reach Aura. Check your connection and try again.";
      await addDoc(chatCollection, {
        role: "model",
        text: errText,
        timestamp,
        createdAt: serverTimestamp()
      }).catch(() => null);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [isLoading, messages, onSendMessage, chatCollection]);
  const handleClear = async () => {
    const snap = await getDocs(chatCollection).catch(() => null);
    if (snap) {
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    }
    setMessages([]);
    setLatestAIId(null);
  };
  const quickChips = [
    { label: "Mess Timings", icon: Utensils, text: "What are the mess timings?" },
    { label: "Gate Rules", icon: Key, text: "What is the curfew and gate pass policy?" },
    { label: "Laundry Days", icon: Calendar, text: "When is laundry day for Wing A?" },
    { label: "Contacts", icon: Phone, text: "What are the warden contact numbers?" },
    { label: "Wi-Fi Help", icon: Wifi, text: "How do I connect to the hostel Wi-Fi?" }
  ];
  return <div className="flex flex-col h-[640px] bg-white/75 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/50" id="ai-assistant-card">

      {
    /* ── Header ─────────────────────────────────────────────────────────── */
  }
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm">Aura AI</h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/20 text-white uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-emerald-300 animate-pulse" />
                Gemini Live
              </span>
            </div>
            <p className="text-[11px] text-indigo-200 mt-0.5">Your 24/7 Hostel Resident Assistant</p>
          </div>
        </div>
        <button
    onClick={handleClear}
    title="Clear conversation"
    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-none"
  >
          <Trash2 className="w-3.5 h-3.5 text-white/70" />
        </button>
      </div>

      {
    /* ── Messages ───────────────────────────────────────────────────────── */
  }
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {!firestoreReady ? <div className="flex items-center justify-center h-full">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div> : <AnimatePresence initial={false}>
            {messages.map((msg, idx) => <motion.div
    key={msg.id}
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    className={`flex flex-col ${msg.role === "user" ? "items-end ml-8" : "items-start mr-8"}`}
  >
                <div
    className={`px-4 py-3 rounded-2xl shadow-sm max-w-full ${msg.role === "user" ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-sm" : "bg-white border border-slate-100/80 text-slate-800 rounded-bl-sm"}`}
  >
                  {msg.role === "user" ? <p className="text-[0.8375rem] leading-relaxed whitespace-pre-wrap">{msg.text}</p> : <AuraBubble
    text={msg.text}
    isLatest={msg.id === latestAIId}
  />}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1 font-medium">{msg.timestamp}</span>
              </motion.div>)}
          </AnimatePresence>}

        {
    /* Typing indicator */
  }
        {isLoading && <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-start mr-8"
  >
            <div className="px-4 py-3 bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-medium mr-1">Aura is thinking</span>
              {[0, 1, 2].map((i) => <span
    key={i}
    className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
    style={{ animationDelay: `${i * 0.15}s` }}
  />)}
            </div>
          </motion.div>}
        <div ref={messagesEndRef} />
      </div>

      {
    /* ── Quick Chips ────────────────────────────────────────────────────── */
  }
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/60 overflow-x-auto scrollbar-none flex gap-2 shrink-0">
        {quickChips.map((chip, idx) => {
    const Icon = chip.icon;
    return <button
      key={idx}
      onClick={() => handleSend(chip.text)}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-[11px] font-semibold text-slate-600 transition-all cursor-none shrink-0 disabled:opacity-40"
      id={`quick-chip-${idx}`}
    >
              <Icon className="w-3 h-3 text-indigo-400" />
              <span>{chip.label}</span>
            </button>;
  })}
      </div>

      {
    /* ── Input ──────────────────────────────────────────────────────────── */
  }
      <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSend(inputText);
    }}
    className="p-3 border-t border-slate-100 flex gap-2 items-center bg-white/60"
  >
        <input
    ref={inputRef}
    type="text"
    value={inputText}
    onChange={(e) => setInputText(e.target.value)}
    placeholder="Ask Aura about curfew, timings, contacts…"
    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 outline-none text-sm text-slate-800 bg-white transition-all placeholder:text-slate-400"
    id="chat-input-field"
    autoComplete="off"
  />
        <RippleButton
    type="submit"
    disabled={!inputText.trim() || isLoading}
    className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 disabled:opacity-40 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40 cursor-none"
    id="chat-send-btn"
  >
          <Send className="w-4 h-4 text-white" />
        </RippleButton>
      </form>
    </div>;
}
export {
  AIAssistant as default
};
