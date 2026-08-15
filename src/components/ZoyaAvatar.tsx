import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Sparkles, Volume2, Radio, Heart } from "lucide-react";

import zoyaIdle from "../assets/images/zoya_idle_1786734181590.jpg";
import zoyaSpeaking1 from "../assets/images/zoya_speaking_1786734202033.jpg";
import zoyaSpeaking2 from "../assets/images/zoya_speaking_happy_1786734267819.jpg";
import zoyaListening from "../assets/images/zoya_listening_1786734222565.jpg";

export type AvatarState = "idle" | "listening" | "processing" | "speaking";

interface ZoyaAvatarProps {
  state: AvatarState;
  currentSpeechText?: string;
  isMuted?: boolean;
}

export default function ZoyaAvatar({ state, currentSpeechText, isMuted }: ZoyaAvatarProps) {
  const [speakingFrame, setSpeakingFrame] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [audioBars, setAudioBars] = useState<number[]>([12, 28, 45, 18, 32, 50, 24, 16, 40]);

  // Speaking frame cycling animation (simulates video / live talking avatar)
  useEffect(() => {
    let frameInterval: any = null;
    if (state === "speaking") {
      const frames = [zoyaSpeaking1, zoyaSpeaking2, zoyaSpeaking1, zoyaIdle, zoyaSpeaking2];
      let i = 0;
      frameInterval = setInterval(() => {
        i = (i + 1) % frames.length;
        setSpeakingFrame(i);
        
        // Randomize audio visualizer bars when speaking
        setAudioBars([
          Math.floor(Math.random() * 40) + 10,
          Math.floor(Math.random() * 60) + 20,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 95) + 25,
          Math.floor(Math.random() * 90) + 25,
          Math.floor(Math.random() * 75) + 20,
          Math.floor(Math.random() * 60) + 15,
          Math.floor(Math.random() * 45) + 10,
          Math.floor(Math.random() * 30) + 8,
        ]);
      }, 200);
    } else {
      setSpeakingFrame(0);
      setAudioBars([8, 12, 16, 14, 18, 15, 12, 10, 6]);
    }

    return () => {
      if (frameInterval) clearInterval(frameInterval);
    };
  }, [state]);

  // Occasional natural blink when idle
  useEffect(() => {
    if (state !== "idle") return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 140);
    }, 4200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [state]);

  // Active image based on state
  const getCurrentImage = () => {
    switch (state) {
      case "speaking": {
        const frames = [zoyaSpeaking1, zoyaSpeaking2, zoyaSpeaking1, zoyaIdle, zoyaSpeaking2];
        return frames[speakingFrame % frames.length];
      }
      case "listening":
        return zoyaListening;
      case "processing":
        return zoyaListening;
      case "idle":
      default:
        return zoyaIdle;
    }
  };

  const getStatusBadge = () => {
    switch (state) {
      case "speaking":
        return {
          label: "ZOYA TALKING",
          color: "bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-pink-500/30",
          icon: <Volume2 className="w-3.5 h-3.5 animate-pulse text-pink-400" />,
        };
      case "listening":
        return {
          label: "LISTENING...",
          color: "bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-violet-500/30",
          icon: <Mic className="w-3.5 h-3.5 animate-bounce text-violet-400" />,
        };
      case "processing":
        return {
          label: "THINKING...",
          color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/30",
          icon: <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />,
        };
      case "idle":
      default:
        return {
          label: "STANDBY • READY",
          color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/20",
          icon: <Radio className="w-3.5 h-3.5 text-emerald-400" />,
        };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-xl mx-auto select-none pointer-events-auto">
      {/* Background Holographic Glows */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {state === "speaking" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[320px] h-[480px] rounded-full bg-gradient-to-tr from-pink-500/30 via-rose-500/20 to-purple-600/30 blur-[75px]"
          />
        )}
        {state === "listening" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-[320px] h-[480px] rounded-full bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-cyan-500/20 blur-[75px]"
          />
        )}
        {state === "processing" && (
          <motion.div
            animate={{ rotate: 360, opacity: [0.3, 0.55, 0.3] }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, opacity: { duration: 1.5, repeat: Infinity } }}
            className="w-[300px] h-[450px] rounded-full bg-gradient-to-r from-cyan-500/25 via-blue-500/20 to-purple-500/25 blur-[65px]"
          />
        )}
        {state === "idle" && (
          <motion.div
            animate={{ opacity: [0.15, 0.28, 0.15], scale: [0.95, 1.02, 0.95] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-[280px] h-[400px] rounded-full bg-gradient-to-b from-purple-500/15 via-pink-500/10 to-cyan-500/10 blur-[60px]"
          />
        )}
      </div>

      {/* Cyber Frame / Avatar Stage */}
      <div className="relative w-[280px] sm:w-[320px] md:w-[360px] aspect-[9/14] rounded-3xl p-1.5 backdrop-blur-xl border border-white/15 bg-gradient-to-b from-white/10 via-white/5 to-black/40 shadow-2xl shadow-black/80 overflow-hidden flex flex-col items-center justify-end">
        
        {/* Top Floating Hologram Banner */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
          <div className={`px-3 py-1 rounded-full border backdrop-blur-md text-[11px] font-mono font-medium tracking-wider flex items-center gap-1.5 shadow-md ${status.color}`}>
            {status.icon}
            <span>{status.label}</span>
          </div>

          <div className="px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono text-white/70 tracking-widest uppercase flex items-center gap-1">
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400/50" />
            <span>ZOYA 2.0</span>
          </div>
        </div>

        {/* Outer Scanner Light Lines */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent z-20" />
        <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-pink-400/40 to-transparent z-20" />
        <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-purple-400/40 to-transparent z-20" />

        {/* Character Visual / Video Container */}
        <motion.div
          animate={
            state === "speaking"
              ? {
                  scale: [1, 1.025, 0.99, 1.02, 1],
                  y: [0, -6, 2, -4, 0],
                  rotate: [-0.6, 0.6, -0.3, 0.4, 0],
                  transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
                }
              : state === "listening"
              ? {
                  scale: [1, 1.015, 1],
                  y: [0, -2, 0],
                  rotate: [0, 1.2, 0],
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                }
              : state === "processing"
              ? {
                  scale: [1, 1.01, 1],
                  y: [0, -3, 0],
                  rotate: [-1, 0.8, -1],
                  transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
                }
              : {
                  // Idle standing pose ("Khadi rahegi") with gentle breathing
                  scale: [1, 1.008, 1],
                  y: [0, -3, 0],
                  rotate: 0,
                  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }
          }
          className="relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center"
        >
          {/* Main Avatar Image */}
          <img
            src={getCurrentImage()}
            alt="Zoya AI Assistant"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top transition-transform duration-200"
          />

          {/* Blink effect overlay when idle */}
          {state === "idle" && isBlinking && (
            <div className="absolute inset-0 bg-black/15 pointer-events-none transition-opacity duration-75" />
          )}

          {/* Speaking Audio Reactive Equalizer Overlay at bottom of character */}
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-center pb-4 px-6 z-20 pointer-events-none">
            <div className="flex items-end justify-center gap-1.5 h-12 w-full max-w-[200px]">
              {audioBars.map((height, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={`flex-1 rounded-full transition-colors ${
                    state === "speaking"
                      ? "bg-gradient-to-t from-pink-500 via-purple-400 to-cyan-300 shadow-[0_0_8px_rgba(236,72,153,0.8)]"
                      : state === "listening"
                      ? "bg-gradient-to-t from-violet-500 to-cyan-400 opacity-70"
                      : "bg-white/20 opacity-30"
                  }`}
                  style={{ minHeight: "4px" }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Corner Cyber HUD Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-pink-400/70 rounded-tl-md pointer-events-none z-30" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-purple-400/70 rounded-tr-md pointer-events-none z-30" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/70 rounded-bl-md pointer-events-none z-30" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-pink-400/70 rounded-br-md pointer-events-none z-30" />
      </div>

      {/* Dynamic Floating Dialogue / Speech Bubble */}
      <AnimatePresence>
        {currentSpeechText && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="mt-4 w-full max-w-md px-4 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-pink-500/30 text-white/95 shadow-xl shadow-pink-950/40 relative z-30"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-pink-400 mt-2 shrink-0 animate-ping" />
              <div className="flex-1">
                <p className="text-xs font-mono text-pink-300 font-semibold mb-0.5 tracking-wider uppercase">
                  Zoya {state === "speaking" ? "is replying..." : ""}
                </p>
                <p className="text-sm font-sans leading-relaxed text-zinc-100 italic">
                  "{currentSpeechText}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
