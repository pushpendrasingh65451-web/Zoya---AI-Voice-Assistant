import React, { useState, useEffect } from "react";
import { 
  Settings, Mic, Radio, Moon, ShieldCheck, X, Check, Volume2, 
  Sparkles, Zap, BatteryCharging, Lock, Flame, RefreshCw, Cpu
} from "lucide-react";

export interface AppSettings {
  backgroundVoiceMode: boolean;
  wakeWordEnabled: boolean;
  autoSpeak: boolean;
  personality: "sassy" | "sweet" | "professional";
  speechRate: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  isSessionActive: boolean;
  onToggleSession: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  isSessionActive,
  onToggleSession,
}: SettingsModalProps) {
  const [wakeLockSupported, setWakeLockSupported] = useState(false);

  useEffect(() => {
    if ("wakeLock" in navigator) {
      setWakeLockSupported(true);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0c0618] border border-pink-500/30 p-6 md:p-8 shadow-2xl shadow-purple-950/80 flex flex-col gap-6 text-white scrollbar-hide">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent">
                Settings & Voice Engine
              </h2>
              <p className="text-xs text-white/60 font-mono">
                Zoya AI Assistant • Pushpendra Dev
              </p>
            </div>
          </div>

          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 🌟 HIGHLIGHT FEATURE: Background Voice Mode */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
          settings.backgroundVoiceMode 
            ? "bg-gradient-to-br from-purple-950/70 via-pink-950/40 to-black/80 border-pink-500/60 shadow-lg shadow-pink-500/20" 
            : "bg-white/5 border-white/10"
        }`}>
          {/* Top subtle glow bar */}
          {settings.backgroundVoiceMode && (
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-purple-400 to-cyan-400 animate-pulse" />
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300">
                  <Radio className={`w-4 h-4 ${settings.backgroundVoiceMode ? "animate-pulse" : ""}`} />
                </span>
                <h3 className="font-bold text-sm tracking-wide text-white">
                  Background Voice Mode
                </h3>
                {settings.backgroundVoiceMode && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono uppercase tracking-wider animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Isko ON karne par Zoya background mein bhi active rahegi. Screen lock ya doosre tab par jane par bhi mic chalu rahega aur Zoya continuous listen karegi.
              </p>
            </div>

            {/* Big Toggle Switch */}
            <button
              id="toggle-background-voice-mode-btn"
              onClick={() => {
                const nextVal = !settings.backgroundVoiceMode;
                onUpdateSettings({ backgroundVoiceMode: nextVal });
                // If turned on and session not active, prompt to start
                if (nextVal && !isSessionActive) {
                  onToggleSession();
                }
              }}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                settings.backgroundVoiceMode ? "bg-gradient-to-r from-pink-500 to-purple-600" : "bg-white/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                  settings.backgroundVoiceMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Background Features details */}
          <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-white/60">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>WakeLock: {wakeLockSupported ? "Supported" : "Standard Fallback"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
              <span>Auto-KeepAlive: Active</span>
            </div>
          </div>
        </div>

        {/* 2. Wake Word Feature ("Hey Zoya") */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="font-semibold text-xs tracking-wide">Wake Word ("Hey Zoya")</h4>
            </div>
            <p className="text-[11px] text-white/60">
              "Hey Zoya" ya "Zoya" bolte hi automatic listening trigger hogi.
            </p>
          </div>

          <button
            id="toggle-wake-word-btn"
            onClick={() => onUpdateSettings({ wakeWordEnabled: !settings.wakeWordEnabled })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              settings.wakeWordEnabled ? "bg-purple-600" : "bg-white/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.wakeWordEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* 3. Personality Mode Selection */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-white/80 font-semibold">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-pink-400" />
              Zoya's Attitude & Persona
            </span>
            <span className="text-[10px] font-mono text-pink-400 uppercase">
              {settings.personality}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "sassy", label: "🔥 Sassy Roast", desc: "Witty & Nakhrewali" },
              { id: "sweet", label: "💖 Sweet & Fun", desc: "Friendly & Cute" },
              { id: "professional", label: "⚡ Smart Pro", desc: "Direct & Fast" },
            ].map((item) => (
              <button
                key={item.id}
                id={`personality-select-${item.id}`}
                onClick={() => onUpdateSettings({ personality: item.id as any })}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  settings.personality === item.id
                    ? "bg-pink-500/20 border-pink-500/50 text-white shadow-md shadow-pink-500/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[10px] font-mono opacity-60">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Auto Voice Output */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <h4 className="font-semibold text-xs tracking-wide">Automatic Voice Response</h4>
            </div>
            <p className="text-[11px] text-white/60">
              Har question ka audio speech automatic play hoga.
            </p>
          </div>

          <button
            id="toggle-auto-speak-btn"
            onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              settings.autoSpeak ? "bg-cyan-500" : "bg-white/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.autoSpeak ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Footer info & close */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] font-mono text-white/40 flex items-center gap-1">
            <Cpu size={12} className="text-purple-400" />
            <span>Developer: Pushpendra</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 font-semibold text-xs text-white shadow-lg shadow-pink-500/20"
          >
            Save & Done
          </button>
        </div>

      </div>
    </div>
  );
}
