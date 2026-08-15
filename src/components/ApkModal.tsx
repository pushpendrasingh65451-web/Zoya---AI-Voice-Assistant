import React, { useState } from "react";
import { Smartphone, Download, Check, Copy, Terminal, ShieldCheck, X, FolderCheck } from "lucide-react";

interface ApkModalProps {
  onClose: () => void;
}

export default function ApkModal({ onClose }: ApkModalProps) {
  const [copied, setCopied] = useState(false);

  const buildCommand = `npm install\nnpm run build\nchmod +x apk/build-apk.sh\n./apk/build-apk.sh`;

  const handleCopy = () => {
    navigator.clipboard.writeText(buildCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0d071a] border border-pink-500/30 p-6 md:p-8 shadow-2xl shadow-purple-950/60 flex flex-col gap-5 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30 shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent">
              Android APK Folder Ready!
            </h2>
            <p className="text-xs text-white/60 font-mono">
              Developer: Pushpendra • Package: com.pushpendra.zoya
            </p>
          </div>
        </div>

        {/* Folder Content Status */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
            <FolderCheck className="w-4 h-4" />
            <span>📁 'apk/' Folder included in download ZIP</span>
          </div>
          <ul className="space-y-1.5 text-white/80 font-mono text-[11px] pl-2 border-l border-white/10">
            <li>✅ <span className="text-pink-300">apk/build-apk.sh</span> — 1-Click Automated Build script</li>
            <li>✅ <span className="text-purple-300">apk/capacitor.config.json</span> — Android App Configuration</li>
            <li>✅ <span className="text-cyan-300">apk/AndroidManifest.xml</span> — Mic & Audio Permissions</li>
            <li>✅ <span className="text-amber-300">apk/README.md</span> — Step-by-step Hindi & English guide</li>
          </ul>
        </div>

        {/* Build Command Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/70 font-mono">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-pink-400" />
              1-Command Build (Terminal):
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto selection:bg-cyan-500/30">
            {buildCommand}
          </pre>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 text-[11px] text-purple-200">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <span>
            Code download karne ke liye upar top-right <strong>Export ZIP</strong> ya Settings menu se download kar sakte hain. Saari APK files include rahengi.
          </span>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 font-bold text-sm text-white shadow-lg shadow-pink-500/25 transition-all active:scale-98"
        >
          Samajh Gaya (Close)
        </button>
      </div>
    </div>
  );
}
