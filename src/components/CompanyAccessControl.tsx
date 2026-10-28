import React, { useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { CompanyConfig, saveAuthorizedEditorEmail } from '../firebase/tacticalSync';
import { Shield, UserCheck, Key, Check, AlertCircle, LogIn, LogOut, Radio, Smartphone, Monitor } from 'lucide-react';

interface CompanyAccessControlProps {
  currentUser: User | null;
  config: CompanyConfig;
  isCommander: boolean;
  isAuthorizedEditor: boolean;
  canEdit: boolean;
  lastSyncTime: string | null;
}

export const CompanyAccessControl: React.FC<CompanyAccessControlProps> = ({
  currentUser,
  config,
  isCommander,
  isAuthorizedEditor,
  canEdit,
  lastSyncTime,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newEditorInput, setNewEditorInput] = useState(config.authorizedEditorEmail || '');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Sign-in error:', err);
      setAuthError(err?.message || 'Failed to authenticate with Google.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Sign-out error:', err);
    }
  };

  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCommander) return;
    setIsSaving(true);
    setSaveStatus(null);
    try {
      await saveAuthorizedEditorEmail(newEditorInput, currentUser?.email || 'captainfakrul@gmail.com');
      setSaveStatus('Secondary editor account authorized successfully.');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus(`Failed to update authorization: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Header Compact Badge */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs transition"
          title="Click to view Cloud Device Sync & Access Permissions"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-300 hidden sm:inline text-[11px]">
            {canEdit ? (isCommander ? 'Comd (Full Edit)' : '2IC / Editor') : 'Live Sync (Viewer)'}
          </span>
          <Shield className="w-3.5 h-3.5 text-sky-400" />
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    MULTI-DEVICE SYNC & ACCESS CONTROL
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time state replication across Android, iOS, Windows & Mac
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Live Sync Status Banner */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-white text-xs">Real-Time Cloud Synchronization</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  CONNECTED
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Any changes made by the Company Commander or Authorized Co-Editor immediately replicate to every phone, tablet, and PC using this app.
              </p>
              {lastSyncTime && (
                <div className="text-[10px] font-mono text-slate-400">
                  Last Real-Time Synchronized: {lastSyncTime}
                </div>
              )}
            </div>

            {/* Current User Authentication State */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono text-[11px]">ACTIVE SESSION:</span>
                {currentUser ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 underline"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="flex items-center gap-1.5 px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign in with Google
                  </button>
                )}
              </div>

              <div className="text-slate-200 font-mono">
                {currentUser?.email ? (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{currentUser.email}</span>
                    {currentUser.displayName && (
                      <span className="text-slate-400 text-[11px]">({currentUser.displayName})</span>
                    )}
                  </div>
                ) : (
                  <span className="text-amber-400">
                    Using shared company link (Read-Only Viewer mode). Sign in to activate Commander / Editor privileges.
                  </span>
                )}
              </div>

              {authError && (
                <div className="text-rose-400 text-[11px] bg-rose-500/10 p-2 rounded border border-rose-500/20">
                  {authError}
                </div>
              )}

              {/* Permission Badge */}
              <div className="pt-1 flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Your Authority Level:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isCommander
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : isAuthorizedEditor
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-700 text-slate-300 border border-slate-600'
                  }`}
                >
                  {isCommander
                    ? 'COMPANY COMMANDER (PRIMARY ADMIN)'
                    : isAuthorizedEditor
                    ? 'AUTHORIZED CO-COMMANDER (FULL EDIT)'
                    : 'COMPANY VIEWER (REAL-TIME READ ONLY)'}
                </span>
              </div>
            </div>

            {/* Authorize Secondary Account - Commander Only */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-white text-xs">AUTHORIZED SECONDARY EDITOR ACCOUNT</h4>
              </div>
              <p className="text-[11px] text-slate-400">
                The Company Commander can authorize one additional Google account (such as the Company 2IC, Adjutant, or Company Sergeant Major) to add, modify, and delete company data alongside the Commander.
              </p>

              <form onSubmit={handleSaveEditor} className="space-y-2 pt-1">
                <div>
                  <label className="block text-slate-300 text-[11px] mb-1">
                    Secondary Authorized Email Address:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newEditorInput}
                      onChange={(e) => setNewEditorInput(e.target.value)}
                      placeholder="e.g. 2ic.minusca@gmail.com"
                      disabled={!isCommander || isSaving}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:border-sky-500 outline-none disabled:opacity-60"
                    />
                    {isCommander && (
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Authorize'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {!isCommander && (
                  <p className="text-[10px] text-slate-500 italic">
                    * Only the primary Commander (captainfakrul@gmail.com) can designate or change the secondary editor.
                  </p>
                )}

                {saveStatus && (
                  <div className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 p-2 rounded border border-emerald-500/30">
                    {saveStatus}
                  </div>
                )}
              </form>
            </div>

            {/* Device Compatibility Guide */}
            <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Android & iOS Mobile Phones & Tablets</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <Monitor className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Windows PC, Mac, Linux & Chromebooks</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
