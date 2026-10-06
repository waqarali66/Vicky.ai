import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Check,
  Copy,
  Receipt,
  Sparkles,
  Clock,
  ShieldCheck,
  Trash2,
  Smartphone,
  FileCheck,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  UserProfile,
  UserPlan,
  EASYPAISA_ACCOUNT,
  OWNER_EMAIL,
  PaymentTransaction,
  PaymentCurrency,
} from '../types/auth';
import {
  submitTransactionProof,
  getPaymentTransactions,
  approvePendingTransaction,
  refreshAccountVerificationStatus,
} from '../services/authService';

interface TransactionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
}

export const TransactionUploadModal: React.FC<TransactionUploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'queue'>('submit');
  const [email, setEmail] = useState<string>(
    currentUser.email === OWNER_EMAIL ? '' : currentUser.email
  );
  const [plan, setPlan] = useState<UserPlan>('single_pass');
  const [currency, setCurrency] = useState<PaymentCurrency>('PKR');
  const [transactionId, setTransactionId] = useState<string>(
    currentUser.lastTransactionId || ''
  );
  const [senderName, setSenderName] = useState<string>('');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>(
    currentUser.lastScreenshotUrl || ''
  );
  const [aiScanSummary, setAiScanSummary] = useState<string>('');
  const [isScanningReceipt, setIsScanningReceipt] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTransactions(getPaymentTransactions());
      setErrorMsg(null);
      setSuccessMsg(null);
      setRefreshMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isOwner =
    currentUser.isOwner || currentUser.email.toLowerCase() === OWNER_EMAIL.toLowerCase();

  // Compute user's current verification stage for the visual progress indicator
  const targetEmail = (email.trim() || currentUser.email || '').toLowerCase();
  const userMatchingTxn = transactions.find(
    (t) => t.email.toLowerCase() === targetEmail
  );

  const effectiveStatus: 'none' | 'pending' | 'verified' = userMatchingTxn
    ? userMatchingTxn.status === 'verified' || userMatchingTxn.status === 'active'
      ? 'verified'
      : 'pending'
    : currentUser.verificationStatus || 'none';

  const progressPercent =
    effectiveStatus === 'verified' ? 100 : effectiveStatus === 'pending' ? 60 : screenshotUrl ? 25 : 0;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(EASYPAISA_ACCOUNT);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setScreenshotUrl(dataUrl);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiScanReceipt = async () => {
    if (!screenshotUrl) {
      setErrorMsg('Please select a payment screenshot image first.');
      return;
    }

    setIsScanningReceipt(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/vicky/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshotDataUrl: screenshotUrl }),
      });
      const data = await res.json();
      if (data.success && data.extracted) {
        const ext = data.extracted;
        if (ext.transactionId) setTransactionId(ext.transactionId);
        if (ext.currency === 'USD' || ext.currency === 'PKR') setCurrency(ext.currency);
        if (ext.amount && (ext.amount >= 200 || ext.amount >= 50000)) {
          setPlan('monthly_creator');
        }
        if (ext.senderName) setSenderName(ext.senderName);
        if (ext.senderNumber) setSenderNumber(ext.senderNumber);
        if (ext.summary) setAiScanSummary(ext.summary);
      }
    } catch (err) {
      setAiScanSummary('Screenshot attached and ready for manual admin verification.');
    } finally {
      setIsScanningReceipt(false);
    }
  };

  const handleRefreshStatus = () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    setErrorMsg(null);

    setTimeout(() => {
      const checkEmail = email.trim() || currentUser.email;
      const result = refreshAccountVerificationStatus(checkEmail);
      setTransactions(result.transactions);
      onUserUpdated(result.user);
      setRefreshMessage(result.message);
      setIsRefreshing(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setRefreshMessage(null);

    const submitEmail = email.trim() || currentUser.email;
    if (!submitEmail) {
      setErrorMsg('Please enter your account email address.');
      return;
    }

    if (!screenshotUrl) {
      setErrorMsg('Please upload a payment proof screenshot (PNG, JPG, or WebP).');
      return;
    }

    if (!transactionId.trim()) {
      setErrorMsg('Please enter the Transaction Reference ID (TID / Trx ID).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = submitTransactionProof({
        email: submitEmail,
        plan,
        transactionId: transactionId.trim(),
        currency,
        senderName,
        senderNumber,
        screenshotUrl,
        aiScanSummary:
          aiScanSummary ||
          `Submitted ${currency} proof for ${
            plan === 'single_pass' ? 'Single Video Pass' : 'Pro Monthly'
          }`,
        status: 'pending',
      });

      setIsSubmitting(false);

      if (result.success) {
        onUserUpdated(result.user);
        setTransactions(getPaymentTransactions());
        setSuccessMsg(
          `Payment proof (TID: ${transactionId.trim()}) submitted! Account status is now 'pending' manual admin verification.`
        );
      } else {
        setErrorMsg(result.error || 'Could not submit payment proof.');
      }
    }, 450);
  };

  const handleApproveTransaction = (txnId: string) => {
    const res = approvePendingTransaction(txnId);
    if (res.success) {
      setTransactions(res.transactions);
      onUserUpdated(res.updatedUser);
      setRefreshMessage('Admin verified transaction! User account is now ACTIVE.');
    }
  };

  const pendingCount = transactions.filter((t) => t.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Submit Payment Proof (Before Login / Plan Activation)
              </h3>
              <p className="text-xs text-slate-400">
                Easypaisa Account: <span className="font-mono text-amber-400 font-semibold">{EASYPAISA_ACCOUNT}</span> · Accepts PKR or USD
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment proof modal"
            className="p-1.5 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Verification Progress Indicator & Refresh Status Bar */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Verification Progress:</span>
              <span
                className={`font-mono font-semibold uppercase ${
                  effectiveStatus === 'verified'
                    ? 'text-emerald-400'
                    : effectiveStatus === 'pending'
                    ? 'text-amber-400'
                    : 'text-slate-400'
                }`}
              >
                {effectiveStatus === 'verified'
                  ? 'Active & Verified (100%)'
                  : effectiveStatus === 'pending'
                  ? 'Pending Admin Verification (60%)'
                  : screenshotUrl
                  ? 'Screenshot Ready (25%)'
                  : 'Awaiting Submission (0%)'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-300 transition-colors"
              title="Check if admin has updated your account status to active"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isRefreshing ? 'Checking Status...' : 'Refresh Status'}</span>
            </button>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                effectiveStatus === 'verified'
                  ? 'bg-emerald-400'
                  : effectiveStatus === 'pending'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-sky-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 3-Step Visual Milestones */}
          <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
            <div
              className={`flex items-center gap-1.5 ${
                progressPercent >= 25 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <span>1. Proof Attached</span>
            </div>
            <div
              className={`flex items-center justify-center gap-1.5 ${
                effectiveStatus === 'pending'
                  ? 'text-amber-300 font-semibold'
                  : effectiveStatus === 'verified'
                  ? 'text-emerald-400'
                  : 'text-slate-500'
              }`}
            >
              <span>2. Pending Admin Review</span>
            </div>
            <div
              className={`flex items-center justify-end gap-1.5 ${
                effectiveStatus === 'verified'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-500'
              }`}
            >
              <span>3. Account Active</span>
            </div>
          </div>

          {refreshMessage && (
            <div
              className={`p-2 rounded text-xs flex items-center justify-between gap-2 ${
                effectiveStatus === 'verified'
                  ? 'bg-emerald-950/50 border border-emerald-800/60 text-emerald-300'
                  : 'bg-amber-950/40 border border-amber-800/50 text-amber-200'
              }`}
            >
              <span>{refreshMessage}</span>
              {effectiveStatus === 'pending' && userMatchingTxn && (
                <button
                  type="button"
                  onClick={() => handleApproveTransaction(userMatchingTxn.id)}
                  className="px-2.5 py-1 rounded bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-[11px] font-semibold shrink-0"
                >
                  Admin Approve Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveTab('submit')}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'submit'
                  ? 'border-emerald-400 text-emerald-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Screenshot Proof</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'queue'
                  ? 'border-amber-400 text-amber-300 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                Verification Queue ({pendingCount} Pending / {transactions.length} Total)
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'submit' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Easypaisa Account Details Banner */}
              <div className="p-4 rounded-lg bg-emerald-950/25 border border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Easypaisa Payment Account (PKR or USD)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Account Title: <strong>Waqar Ali Akbar</strong> · Send payment and upload your screenshot below.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded border border-emerald-800/60 shrink-0">
                  <span className="font-mono text-base font-bold text-amber-400 tracking-wider">
                    {EASYPAISA_ACCOUNT}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAccount}
                    className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
                  >
                    {copiedAccount ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Currency & Plan Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Payment Currency (PKR or USD)
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setCurrency('PKR')}
                      className={`py-1.5 text-xs font-semibold rounded transition-colors ${
                        currency === 'PKR'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      PKR (Pakistani Rupee)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`py-1.5 text-xs font-semibold rounded transition-colors ${
                        currency === 'USD'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      USD (US Dollar)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Select Subscription Plan
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as UserPlan)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  >
                    <option value="single_pass">
                      Single Video Pass — {currency === 'PKR' ? 'Rs. 850 PKR' : '$3 USD'} (1 Video / 3 Min)
                    </option>
                    <option value="monthly_creator">
                      Pro Creator Monthly — {currency === 'PKR' ? 'Rs. 70,000 PKR' : '$250 USD'} (Unlimited / 210 Min)
                    </option>
                  </select>
                </div>
              </div>

              {/* File Input for Payment Screenshot */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="payment-screenshot-input"
                    className="text-xs font-medium text-slate-200 block"
                  >
                    1. Upload Transaction Proof Screenshot *
                  </label>
                  {screenshotUrl && (
                    <button
                      type="button"
                      onClick={handleAiScanReceipt}
                      disabled={isScanningReceipt}
                      className="text-xs px-2.5 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {isScanningReceipt
                          ? 'AI Scanning Receipt...'
                          : 'AI Auto-Extract Receipt ID'}
                      </span>
                    </button>
                  )}
                </div>

                <input
                  id="payment-screenshot-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 bg-slate-950 border border-slate-800 rounded-lg p-1.5 cursor-pointer"
                />

                {screenshotUrl && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={screenshotUrl}
                        alt="Uploaded Transaction Proof"
                        className="w-16 h-16 rounded object-cover border border-slate-800"
                      />
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Screenshot Attached
                        </span>
                        {aiScanSummary ? (
                          <p className="text-[11px] text-amber-300 font-mono">
                            AI Note: {aiScanSummary}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400">
                            Click &ldquo;AI Auto-Extract Receipt ID&rdquo; or type your TID below.
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotUrl('');
                        setAiScanSummary('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Transaction Reference ID & User Email Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="transaction-reference-id"
                    className="text-xs font-medium text-slate-200 block"
                  >
                    2. Transaction Reference ID (TID / Trx ID) *
                  </label>
                  <input
                    id="transaction-reference-id"
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g. 2489210041"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="transaction-user-email"
                    className="text-xs font-medium text-slate-200 block"
                  >
                    3. Account Email (For Login Activation) *
                  </label>
                  <input
                    id="transaction-user-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 block">
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
                  <label className="text-xs font-medium text-slate-400 block">
                    Sender Account Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Ali Khan"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded bg-rose-950/50 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded bg-emerald-950/50 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{successMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshStatus}
                    className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-emerald-700 text-emerald-300 text-[11px] font-semibold shrink-0"
                  >
                    Refresh Status
                  </button>
                </div>
              )}

              {/* Submit & Close Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefreshStatus}
                    disabled={isRefreshing}
                    className="px-3.5 py-2.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                    />
                    <span>Refresh Status</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-xs font-semibold text-slate-950 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? 'Submitting Proof...'
                        : 'Submit Proof (Set Pending Verification)'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Verification Queue / Admin Approval Panel */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">
                    Submitted Transaction Proofs
                  </h4>
                  <p className="text-xs text-slate-400">
                    {isOwner
                      ? 'Owner Admin Mode: Click "Approve & Verify" on any pending proof to activate the user account.'
                      : 'Track your pending and verified Easypaisa payment submissions.'}
                  </p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="p-8 text-center bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-500">
                  No payment proofs submitted yet. Use the &ldquo;Upload Screenshot Proof&rdquo; tab to submit one.
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        {tx.screenshotUrl ? (
                          <img
                            src={tx.screenshotUrl}
                            alt="Receipt"
                            className="w-14 h-14 rounded object-cover border border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                            <Receipt className="w-5 h-5" />
                          </div>
                        )}

                        <div className="space-y-1 text-xs">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-slate-100">{tx.email}</span>
                            <span className="text-slate-600">·</span>
                            <span className="font-mono text-emerald-400 font-semibold">
                              {tx.currency === 'PKR'
                                ? `Rs. ${tx.amountPkr.toLocaleString()} PKR`
                                : `$${tx.amountUsd} USD`}
                            </span>
                            <span className="text-slate-600">·</span>
                            <span
                              className={`font-mono font-semibold uppercase ${
                                tx.status === 'pending'
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {tx.status === 'pending' ? 'PENDING VERIFICATION' : 'VERIFIED'}
                            </span>
                          </div>

                          <div className="text-[11px] font-mono text-slate-400">
                            Ref ID: <span className="text-slate-200">{tx.transactionId}</span> · Plan:{' '}
                            {tx.plan === 'single_pass' ? 'Single Video Pass' : 'Pro Monthly'}
                          </div>

                          {tx.aiScanSummary && (
                            <p className="text-[11px] text-slate-400">{tx.aiScanSummary}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {tx.screenshotUrl && (
                          <a
                            href={tx.screenshotUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Screenshot</span>
                          </a>
                        )}

                        {tx.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleApproveTransaction(tx.id)}
                            className="px-3 py-1.5 rounded bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Approve & Verify</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
