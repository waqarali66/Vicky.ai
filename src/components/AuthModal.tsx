import React, { useState, useRef } from 'react';
import {
  X,
  Crown,
  User,
  ArrowRight,
  ShieldCheck,
  Mail,
  Upload,
  Receipt,
  Smartphone,
  Check,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { UserProfile, OWNER_EMAIL, EASYPAISA_ACCOUNT, UserPlan } from '../types/auth';
import { loginUser, submitEasypaisaPayment } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserLoggedIn: (user: UserProfile) => void;
  onOpenSubscription: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserLoggedIn,
  onOpenSubscription,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'payment_proof'>('login');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');

  // Payment proof form fields
  const [proofEmail, setProofEmail] = useState<string>('');
  const [proofPlan, setProofPlan] = useState<UserPlan>('single_pass');
  const [proofCurrency, setProofCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [proofTid, setProofTid] = useState<string>('');
  const [proofSender, setProofSender] = useState<string>('');
  const [proofScreenshot, setProofScreenshot] = useState<string>('');
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofSuccess, setProofSuccess] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const user = loginUser(email, name);
    onUserLoggedIn(user);
    onClose();

    if (user.plan === 'none' && !user.isOwner) {
      onOpenSubscription();
    }
  };

  const handleLoginAsOwner = () => {
    const ownerUser = loginUser(OWNER_EMAIL, 'Waqar Ali Akbar (Owner)');
    onUserLoggedIn(ownerUser);
    onClose();
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProofScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    setProofError(null);
    setProofSuccess(null);

    if (!proofEmail.trim()) {
      setProofError('Please enter your email address');
      return;
    }

    if (!proofTid.trim()) {
      setProofError('Please enter your Easypaisa Transaction ID (TID) from your receipt');
      return;
    }

    setIsSubmittingProof(true);
    setTimeout(() => {
      const result = submitEasypaisaPayment({
        email: proofEmail,
        plan: proofPlan,
        transactionId: proofTid,
        currency: proofCurrency,
        senderNumber: proofSender,
        screenshotUrl: proofScreenshot,
      });
      setIsSubmittingProof(false);

      if (result.success) {
        setProofSuccess('Payment proof accepted! Account activated.');
        onUserLoggedIn(result.user);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setProofError(result.error || 'Verification failed. Please check your TID.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">vicky.AI Account & Payment Gateway</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Login vs Upload Payment Proof */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`pb-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === 'login'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Standard Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payment_proof')}
            className={`pb-2.5 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'payment_proof'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Upload Payment Proof (Screenshot)</span>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {activeTab === 'login' ? (
            <>
              {/* Quick Owner Switcher */}
              <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 fill-current" />
                    Owner Account Bypass
                  </span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded font-mono">
                    Lifetime Free VIP
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {OWNER_EMAIL} receives permanent free access to all vicky.AI features with zero payment restrictions.
                </p>
                <button
                  onClick={handleLoginAsOwner}
                  className="w-full mt-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Log in as Owner ({OWNER_EMAIL})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                  Or Login As Other User
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Other User Login */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">User Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Name (Optional)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name or Studio"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <span>Note for other users:</span>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Single Pass: <strong>$3 USD (Rs. 850 PKR)</strong></span>
                    <span>Monthly: <strong>$250 USD (Rs. 70,000)</strong></span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('payment_proof')}
                    className="flex-1 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 text-xs font-medium rounded transition-colors"
                  >
                    Upload Payment Proof
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Upload Payment Proof Form */
            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-1">
                <span className="text-[11px] font-semibold text-emerald-300 block">
                  Easypaisa Payment Target:
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-amber-400 font-bold tracking-wider">
                    {EASYPAISA_ACCOUNT}
                  </span>
                  <span className="text-slate-300">Title: Waqar Ali Akbar</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Plan</label>
                  <select
                    value={proofPlan}
                    onChange={(e) => setProofPlan(e.target.value as UserPlan)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="single_pass">Single Pass ($3 / Rs. 850)</option>
                    <option value="monthly_creator">Pro Monthly ($250 / Rs. 70,000)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Currency Paid</label>
                  <select
                    value={proofCurrency}
                    onChange={(e) => setProofCurrency(e.target.value as 'PKR' | 'USD')}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                  >
                    <option value="PKR">Pakistani Rupee (PKR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300 block">Your Email Address</label>
                <input
                  type="email"
                  required
                  value={proofEmail}
                  onChange={(e) => setProofEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Easypaisa TID (Trx ID)</label>
                  <input
                    type="text"
                    required
                    value={proofTid}
                    onChange={(e) => setProofTid(e.target.value)}
                    placeholder="e.g. 2489210041"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Sender Mobile (Optional)</label>
                  <input
                    type="text"
                    value={proofSender}
                    onChange={(e) => setProofSender(e.target.value)}
                    placeholder="e.g. 03001234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Screenshot Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 block">
                  Attach Payment Proof (Screenshot)
                </label>
                {proofScreenshot ? (
                  <div className="p-2.5 rounded bg-slate-950 border border-emerald-500/50 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={proofScreenshot}
                        alt="Receipt"
                        className="w-12 h-12 object-cover rounded border border-slate-800"
                      />
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Screenshot Attached
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProofScreenshot('')}
                      className="text-xs text-slate-400 hover:text-rose-400"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-400/80 bg-slate-950 p-3.5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-center space-y-1"
                  >
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs text-slate-200">Click to upload screenshot receipt</span>
                    <span className="text-[10px] text-slate-500">PNG, JPG, WebP from Easypaisa app</span>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
              </div>

              {proofError && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/50 text-xs text-rose-300">
                  {proofError}
                </div>
              )}

              {proofSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{proofSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingProof}
                className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-400/20"
              >
                {isSubmittingProof ? (
                  <span>Verifying Receipt...</span>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Submit Proof & Unlock Account</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
