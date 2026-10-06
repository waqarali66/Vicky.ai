import React, { useState, useRef } from 'react';
import {
  X,
  Check,
  Copy,
  Crown,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Clock,
  Film,
  Zap,
  Upload,
  Image as ImageIcon,
  Receipt,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { UserProfile, UserPlan, PRICING_PLANS, EASYPAISA_ACCOUNT, OWNER_EMAIL, PaymentTransaction } from '../types/auth';
import { submitEasypaisaPayment, getPaymentTransactions } from '../services/authService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  initialPlan?: UserPlan;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  initialPlan = 'single_pass',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>(
    initialPlan === 'none' || initialPlan === 'owner_lifetime' ? 'single_pass' : initialPlan
  );
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [emailInput, setEmailInput] = useState<string>(currentUser.email);
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [viewHistory, setViewHistory] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isOwner = currentUser.isOwner || currentUser.email.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const pastTransactions = getPaymentTransactions();

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(EASYPAISA_ACCOUNT);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshotUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleActivatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!emailInput.trim()) {
      setErrorMsg('Please provide your login email address.');
      return;
    }

    if (!transactionId.trim()) {
      setErrorMsg('Please enter your Easypaisa Transaction ID (TID) from your SMS receipt or app.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = submitEasypaisaPayment({
        email: emailInput,
        plan: selectedPlan,
        transactionId,
        currency,
        senderNumber,
        senderName,
        screenshotUrl,
      });
      setIsSubmitting(false);

      if (result.success) {
        onUserUpdated(result.user);
        setSuccessMsg(
          selectedPlan === 'single_pass'
            ? 'Payment proof submitted! 1 Video Pass (up to 3 minutes) is now activated.'
            : 'Payment proof verified! Pro Creator Monthly Plan (up to 210 minutes) is now active!'
        );
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMsg(result.error || 'Failed to verify transaction. Please check the TID.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">vicky.AI Subscription & Payment Verification</h3>
              <p className="text-xs text-slate-400">
                Easypaisa Account Transfer with Transaction Proof & Screenshot Verification
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewHistory(!viewHistory)}
              className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {viewHistory ? 'Hide Receipts' : 'View Receipts History'}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* History Drawer if toggled */}
          {viewHistory && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  Submitted Payment Proofs & Transactions
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {pastTransactions.length} Record{pastTransactions.length > 1 ? 's' : ''}
                </span>
              </div>

              {pastTransactions.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">No transactions recorded yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pastTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            {tx.plan === 'single_pass' ? 'Single Video Pass' : 'Pro Monthly'}
                          </span>
                          <span className="text-emerald-400 font-mono text-[11px]">
                            {tx.currency === 'USD' ? `$${tx.amountUsd}` : `Rs. ${tx.amountPkr.toLocaleString()}`}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          TID: {tx.transactionId} · {tx.email}
                        </div>
                      </div>

                      {tx.screenshotUrl && (
                        <a
                          href={tx.screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-300 text-[10px] flex items-center gap-1 shrink-0 hover:bg-slate-700"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>View Proof</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Owner VIP Status Banner */}
          {isOwner && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-400/50 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5 fill-current" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-amber-300">
                    Owner Account: {OWNER_EMAIL}
                  </span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase">
                    Lifetime VIP Free Access
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As the owner of vicky.AI, you have permanent 100% free access for life with infinite minutes and unlimited video productions. All other users require a paid plan via Easypaisa to produce.
                </p>
              </div>
            </div>
          )}

          {/* Currency Toggle */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              1. Choose Production Plan
            </h4>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800 text-xs font-mono">
              <span className="text-slate-400 text-[11px] px-1.5">Currency:</span>
              <button
                type="button"
                onClick={() => setCurrency('PKR')}
                className={`px-2.5 py-1 rounded transition-colors font-semibold ${
                  currency === 'PKR' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                PKR (Rs.)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded transition-colors font-semibold ${
                  currency === 'USD' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRICING_PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const priceDisplay = currency === 'PKR' ? `Rs. ${plan.pricePkr.toLocaleString()}` : `$${plan.priceUsd}`;
              const alternatePrice = currency === 'PKR' ? `≈ $${plan.priceUsd} USD` : `≈ Rs. ${plan.pricePkr.toLocaleString()} PKR`;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-400 ring-1 ring-emerald-400/60 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-2.5 right-4 bg-emerald-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Best Value
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="text-base font-semibold text-slate-100">{plan.name}</h5>
                      <span className="text-[11px] text-slate-400">{plan.billingCadence}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold font-mono text-emerald-400">
                        {priceDisplay}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {alternatePrice}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-200 font-medium">
                      <Film className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{plan.videoAllowance}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{plan.durationLimit}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Easypaisa Payment & Screenshot Upload Form */}
          <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-emerald-300">
                    2. Transfer Payment to Easypaisa
                  </h4>
                  <span className="text-[11px] text-emerald-400/80">
                    Easypaisa / Raast / Any Pakistani Bank Transfer
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Required Amount:</span>
                <span className="text-base font-mono font-bold text-emerald-300">
                  {selectedPlan === 'single_pass'
                    ? currency === 'PKR' ? 'Rs. 850 PKR ($3 USD)' : '$3 USD (850 PKR)'
                    : currency === 'PKR' ? 'Rs. 70,000 PKR ($250 USD)' : '$250 USD (70,000 PKR)'}
                </span>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/80 p-3.5 rounded border border-emerald-900/40">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 block">Easypaisa Target Account:</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-amber-400 tracking-wider">
                    {EASYPAISA_ACCOUNT}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs flex items-center gap-1 transition-colors"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 block">Account Title:</span>
                <span className="text-sm font-semibold text-slate-200 block">
                  Waqar Ali Akbar
                </span>
                <span className="text-[10px] text-slate-500">
                  Easypaisa / Telenor Microfinance Bank Pakistan
                </span>
              </div>
            </div>

            {/* Form with Screenshot Upload */}
            <form onSubmit={handleActivatePlan} className="space-y-4 pt-1">
              <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                3. Upload Payment Proof & Enter Transaction ID
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">
                    Your Login Email
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">
                    Easypaisa Transaction ID (TID) / Trx ID
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 2489210041"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">
                    Sender Mobile Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder="e.g. 03001234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">
                    Sender Name on Easypaisa (Optional)
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Screenshot Proof Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Payment Proof (Receipt Screenshot)
                </label>

                {screenshotUrl ? (
                  <div className="relative rounded-lg border border-emerald-500/50 bg-slate-950 p-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={screenshotUrl}
                        alt="Payment Proof Receipt"
                        className="w-16 h-16 rounded object-cover border border-slate-800"
                      />
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Screenshot Proof Attached
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          Receipt ready for validation
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-xs"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreenshotUrl('')}
                        className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-slate-700 hover:border-emerald-400/80 bg-slate-950/70 p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-center space-y-1.5"
                  >
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    <span className="text-xs font-medium text-slate-200">
                      Upload Transaction Screenshot / Receipt
                    </span>
                    <span className="text-[10px] text-slate-500">
                      PNG, JPG, WebP from your Easypaisa app or SMS screenshot
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-900/50 text-xs text-rose-300">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  Transfers to 03066053314 are verified instantly upon submission.
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded transition-colors flex items-center gap-2 shadow-md shadow-emerald-400/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Receipt...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Submit Proof & Activate Access</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
