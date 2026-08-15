import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, MicOff, Volume2, VolumeX, Keyboard, Send, Trash2, 
  MessageSquare, Sparkles, X, ChevronRight, Play, Info,
  Settings, Radio, Zap
} from "lucide-react";
import { getZoyaResponse, getZoyaAudio, resetZoyaSession } from "./services/geminiService";
import { processCommand } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import ZoyaAvatar, { AvatarState } from "./components/ZoyaAvatar";
import PermissionModal from "./components/PermissionModal";
import SettingsModal, { AppSettings } from "./components/SettingsModal";
import { playPCM } from "./utils/audioUtils";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  id: string;
  sender: "user" | "zoya";
  text: string;
  timestamp?: string;
}

const QUICK_PROMPTS = [
  "👋 Zoya, apna intro do!",
  "😎 Developer Pushpendra ko roast karo",
  "🎵 Play top Hindi songs on YouTube",
  "😂 Koi mast joke sunao",
  "🎧 Open Spotify",
  "🌦️ Aaj ka mausam kaisa hai?"
];

export default function App() {
  const [appState, setAppState] = useState<AvatarState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("zoya_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    return [
      {
        id: "init-1",
        sender: "zoya",
        text: "Namaste Pushpendra! Main hoon Zoya—aapki witty, sassy Indian AI assistant. Kuch puchna hai ya bas mujhe taad rahe ho?",
        timestamp: "Just now"
      }
    ];
  });

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
    localStorage.setItem("zoya_chat_history", JSON.stringify(messages));
  }, [messages]);

  const [isMuted, setIsMuted] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [latestResponse, setLatestResponse] = useState<string>("");

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("zoya_app_settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      backgroundVoiceMode: false,
      wakeWordEnabled: true,
      autoSpeak: true,
      personality: "sassy",
      speechRate: 1.0,
    };
  });

  const wakeLockRef = useRef<any>(null);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("zoya_app_settings", JSON.stringify(updated));
      return updated;
    });
  };

  // Background Voice Mode: Screen WakeLock management
  useEffect(() => {
    const requestWakeLock = async () => {
      if (settings.backgroundVoiceMode && "wakeLock" in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request("screen");
          wakeLockRef.current.addEventListener("release", () => {
            console.log("Screen Wake Lock released");
          });
        } catch (err: any) {
          console.warn("Wake Lock error:", err?.message || err);
        }
      } else if (!settings.backgroundVoiceMode && wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (e) {
          console.error(e);
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && settings.backgroundVoiceMode) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [settings.backgroundVoiceMode]);

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (liveSessionRef.current) {
      liveSessionRef.current.isMuted = isMuted;
    }
  }, [isMuted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showHistory]);

  const handleTextCommand = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) {
      setAppState("idle");
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev, 
      { id: Date.now().toString(), sender: "user", text: finalTranscript, timestamp: timeStr }
    ]);
    
    // If live session is active, send text through it
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(finalTranscript);
      return;
    }

    setAppState("processing");

    // 1. Check for browser commands
    const commandResult = processCommand(finalTranscript);
    let responseText = "";

    if (commandResult.isBrowserAction) {
      responseText = commandResult.action;
      setLatestResponse(responseText);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now().toString() + "-z", sender: "zoya", text: responseText, timestamp: timeStr }
      ]);
      
      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getZoyaAudio(responseText);
        if (audioBase64) {
          await playPCM(audioBase64);
        }
      }

      setAppState("idle");

      setTimeout(() => {
        if (commandResult.url) {
          window.open(commandResult.url, "_blank");
        }
      }, 1200);
    } else {
      // 2. General Chit-Chat via Gemini
      responseText = await getZoyaResponse(finalTranscript, messagesRef.current);
      setLatestResponse(responseText);
      setMessages((prev) => [
        ...prev, 
        { id: Date.now().toString() + "-z", sender: "zoya", text: responseText, timestamp: timeStr }
      ]);
      
      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getZoyaAudio(responseText);
        if (audioBase64) {
          await playPCM(audioBase64);
        }
      }
      setAppState("idle");
    }
  }, [isMuted, isSessionActive]);

  useEffect(() => {
    return () => {
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      setAppState("idle");
      resetZoyaSession();
    } else {
      try {
        setIsSessionActive(true);
        resetZoyaSession();
        
        const session = new LiveSessionManager();
        session.isMuted = isMuted;
        liveSessionRef.current = session;
        
        session.onStateChange = (state) => {
          setAppState(state as AvatarState);
        };
        
        session.onMessage = (sender, text) => {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (sender === "zoya") {
            setLatestResponse(text);
          }
          setMessages((prev) => [
            ...prev, 
            { id: Date.now().toString() + "-" + sender, sender, text, timestamp: timeStr }
          ]);
        };
        
        session.onCommand = (url) => {
          setTimeout(() => {
            window.open(url, "_blank");
          }, 1000);
        };

        await session.start();
      } catch (e) {
        console.error("Failed to start session", e);
        setShowPermissionModal(true);
        setIsSessionActive(false);
        setAppState("idle");
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    handleTextCommand(textInput);
    setTextInput("");
    setShowTextInput(false);
  };

  return (
    <div id="zoya-app-root" className="h-[100dvh] w-screen bg-[#04020a] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden m-0 p-0 selection:bg-pink-500/30">
      {showPermissionModal && (
        <PermissionModal 
          onClose={() => setShowPermissionModal(false)} 
        />
      )}

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        isSessionActive={isSessionActive}
        onToggleSession={toggleListening}
      />

      {/* Cyber Space Anime Background Gradients */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-purple-900/25 blur-[140px] rounded-full" />
        <div className="absolute top-[30%] right-[-15%] w-[50%] h-[50%] bg-pink-900/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-indigo-950/30 blur-[140px] rounded-full" />
        {/* Subtle Cyber Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      {/* Top Header */}
      <header className="relative w-full flex justify-between items-center z-30 shrink-0 px-4 py-3 md:px-8 md:py-4 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-lg shadow-pink-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#090414] rounded-[14px] flex items-center justify-center font-bold text-pink-400 text-sm">
                ZY
              </div>
            </div>
            {appState === "speaking" && (
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-wider bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent">
                ZOYA
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono">
                AI AVATAR
              </span>
            </div>
            <p className="text-[11px] text-white/50 font-mono flex items-center gap-1">
              Dev: <span className="text-purple-300 font-semibold">Pushpendra</span>
            </p>
          </div>
        </div>

        {/* Header Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Background Voice Mode Active Indicator */}
          {settings.backgroundVoiceMode && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-500/15 border border-pink-500/40 text-[11px] font-mono text-pink-300 shadow-md shadow-pink-500/10 hover:bg-pink-500/25 transition-all"
              title="Background Voice Mode is Active"
            >
              <Radio size={12} className="text-emerald-400 animate-pulse" />
              <span className="font-semibold">BG VOICE ON</span>
            </button>
          )}

          {/* Settings Button */}
          <button
            id="open-settings-btn"
            onClick={() => setShowSettingsModal(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 text-xs font-mono"
            title="Settings & Background Voice"
          >
            <Settings size={15} className="text-purple-400" />
            <span className="hidden md:inline">Settings</span>
          </button>

          {/* Chat History Toggle Button */}
          <button
            id="toggle-chat-drawer-btn"
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-mono ${
              showHistory
                ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
            }`}
            title="Chat History"
          >
            <MessageSquare size={16} />
            <span className="hidden sm:inline">History ({messages.length})</span>
          </button>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <button
              id="clear-chat-history-btn"
              onClick={() => {
                if (confirm("Clear all chat conversations?")) {
                  setMessages([]);
                  setLatestResponse("");
                  resetZoyaSession();
                }
              }}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-300 text-white/60 transition-colors border border-white/10"
              title="Clear History"
            >
              <Trash2 size={16} />
            </button>
          )}

          {/* Mute/Unmute Audio Toggle */}
          <button
            id="toggle-audio-mute-btn"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isMuted
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
            }`}
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </header>

      {/* Main Center Area: Avatar Stage & Dynamic Visuals */}
      <main className="relative flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center px-4 py-2 overflow-y-auto overflow-x-hidden z-10">
        
        {/* Animated Avatar Character (Standing when idle, moving/speaking when replying) */}
        <div className="w-full flex flex-col items-center justify-center my-auto">
          <ZoyaAvatar 
            state={appState} 
            currentSpeechText={appState === "speaking" ? latestResponse : undefined}
            isMuted={isMuted}
          />
        </div>

        {/* Quick Question Chips (Desktop & Mobile) */}
        <div className="w-full max-w-2xl mt-3 mb-2 flex items-center justify-center flex-wrap gap-2 z-20">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              id={`quick-prompt-btn-${idx}`}
              onClick={() => handleTextCommand(prompt)}
              disabled={appState === "processing" || appState === "speaking"}
              className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/15 active:scale-95 text-white/80 hover:text-white border border-white/10 transition-all backdrop-blur-md flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none hover:border-pink-500/40"
            >
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </main>

      {/* Bottom Sticky Control Console */}
      <footer className="relative w-full flex flex-col items-center justify-center pb-4 pt-2 px-4 z-30 shrink-0 border-t border-white/10 bg-black/60 backdrop-blur-2xl">
        
        {/* Floating Text Form Input Modal */}
        <AnimatePresence>
          {showTextInput && (
            <motion.form 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              onSubmit={handleTextSubmit}
              className="w-full max-w-lg mb-3 flex items-center gap-2 bg-[#120822]/90 border border-pink-500/30 rounded-2xl p-1.5 pl-4 backdrop-blur-xl shadow-2xl"
            >
              <input 
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask Zoya anything in Hindi or English..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 text-sm font-sans"
                autoFocus
              />
              <button 
                type="submit"
                id="send-text-btn"
                disabled={!textInput.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 disabled:opacity-40 transition-all text-white shadow-md shadow-pink-500/30"
              >
                <Send size={15} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Primary Controls Row */}
        <div className="flex items-center gap-4">
          
          {/* Text Input Toggle Button */}
          <button
            id="toggle-keyboard-btn"
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-3.5 rounded-2xl border transition-all ${
              showTextInput
                ? "bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-lg shadow-pink-500/20"
                : "bg-white/5 hover:bg-white/10 text-white/80 border-white/15"
            }`}
            title="Type message"
          >
            <Keyboard size={20} />
          </button>

          {/* Main Voice Activation Button */}
          <button
            id="toggle-voice-session-btn"
            onClick={toggleListening}
            className={`
              relative flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold tracking-wider text-sm transition-all duration-300 shadow-2xl
              ${
                isSessionActive
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/40 hover:brightness-110 active:scale-95 animate-pulse"
                  : "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-pink-500/30 hover:scale-105 active:scale-95 hover:shadow-pink-500/50"
              }
            `}
          >
            {isSessionActive ? (
              <>
                <MicOff size={18} className="animate-spin" />
                <span>END LIVE SESSION</span>
              </>
            ) : (
              <>
                <Mic size={18} className="animate-bounce" />
                <span>TALK WITH ZOYA</span>
              </>
            )}
          </button>

          {/* Quick Info/Help Chip */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-white/60">
            <Sparkles size={13} className="text-pink-400" />
            <span>Auto Voice + Video Sync</span>
          </div>
        </div>
      </footer>

      {/* Side Chat Conversation Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[380px] bg-[#0c0618]/95 backdrop-blur-2xl border-l border-white/15 z-50 flex flex-col shadow-2xl shadow-black"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-sm tracking-wide">Conversation Log</h3>
              </div>
              <button
                id="close-chat-drawer-btn"
                onClick={() => setShowHistory(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/40 font-mono text-xs">
                  <MessageSquare size={32} className="mb-2 opacity-40" />
                  <p>No messages yet.</p>
                  <p className="text-[10px] mt-1">Start speaking or ask a question to begin!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-mono font-semibold uppercase text-white/50">
                        {msg.sender === "user" ? "Pushpendra" : "Zoya"}
                      </span>
                      {msg.timestamp && (
                        <span className="text-[9px] font-mono text-white/30">
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl max-w-[88%] text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-purple-600 text-white rounded-tr-xs shadow-md shadow-purple-900/30"
                          : "bg-white/10 text-pink-100 border border-pink-500/20 rounded-tl-xs backdrop-blur-md shadow-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Drawer Quick Action Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40">
              <button
                onClick={() => {
                  setShowHistory(false);
                  setShowTextInput(true);
                }}
                className="w-full py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Send size={13} />
                <span>Type New Question</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

