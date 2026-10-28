import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, ShieldCheck } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>PWA ACTIVE</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-sky-500 transition active:scale-95"
        title="Download / Install Android App onto device"
        aria-label="Install Android App"
      >
        <Smartphone className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  // Fallback for Android Chrome / browsers where prompt hasn't fired yet or iOS
  return (
    <>
      <button
        onClick={() => (isIOS ? setShowIOSGuide(true) : setShowAndroidGuide(true))}
        className="flex items-center gap-1.5 rounded bg-sky-500/20 border border-sky-400/40 p-1.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-sky-300 hover:bg-sky-500/30 transition shrink-0"
        title="Download mobile app onto phone"
        aria-label="Mobile install instructions"
      >
        <Download className="w-3.5 h-3.5 text-sky-400" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-sky-500/30 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Install on Android Phone</h3>
              </div>
              <button onClick={() => setShowAndroidGuide(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 text-xs space-y-3 text-slate-300">
              <p className="leading-relaxed">
                To download and install the <strong className="text-sky-400">MINUSCA Peacekeeper</strong> app on your Android smartphone:
              </p>
              <div className="bg-slate-800/80 rounded-lg p-3 space-y-2 border border-slate-700 font-mono text-[11px]">
                <p>1. Open Chrome on your Android mobile device.</p>
                <p>2. Tap the three dots (⋮) in the top-right corner of Chrome.</p>
                <p>3. Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</p>
                <p>4. The app icon will appear on your phone screen with full offline access in the field!</p>
              </div>
              <p className="text-[11px] text-sky-300/80">
                Tip: Works offline during tactical patrols with local cached database.
              </p>
            </div>
            <button
              onClick={() => setShowAndroidGuide(false)}
              className="mt-4 w-full rounded-lg bg-sky-600 py-2 text-xs font-bold text-white hover:bg-sky-500"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
              <button onClick={() => setShowIOSGuide(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-300">
              1. Tap the <strong>Share</strong> button in Safari toolbar.<br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-lg bg-slate-800 py-2 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
