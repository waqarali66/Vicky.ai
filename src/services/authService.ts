import { UserProfile, UserPlan, OWNER_EMAIL, EASYPAISA_ACCOUNT, PaymentTransaction } from '../types/auth';

const STORAGE_KEY_USER = 'vicky_ai_current_user';
const STORAGE_KEY_TXNS = 'vicky_ai_transactions';

export function getDefaultOwnerProfile(): UserProfile {
  return {
    email: OWNER_EMAIL,
    name: 'Waqar Ali Akbar (Owner)',
    plan: 'owner_lifetime',
    verificationStatus: 'verified',
    isOwner: true,
    videosRemaining: Infinity,
    minutesUsed: 0,
    minutesMax: Infinity,
    subscriptionExpiresAt: 'Lifetime Free VIP',
    easypaisaAccount: EASYPAISA_ACCOUNT,
  };
}

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed: UserProfile = JSON.parse(raw);
      // Ensure owner always has lifetime free plan even if modified
      if (parsed.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
        return getDefaultOwnerProfile();
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Error reading user profile:', e);
  }
  // Default to owner Waqar Ali Akbar
  const owner = getDefaultOwnerProfile();
  saveCurrentUser(owner);
  return owner;
}

export function saveCurrentUser(user: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (e) {
    console.warn('Error saving user profile:', e);
  }
}

export function loginUser(email: string, name?: string): UserProfile {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === OWNER_EMAIL.toLowerCase()) {
    const owner = getDefaultOwnerProfile();
    saveCurrentUser(owner);
    return owner;
  }

  // Check if this email already had a saved verified or pending transaction
  try {
    const rawTxns = localStorage.getItem(STORAGE_KEY_TXNS);
    const txns: PaymentTransaction[] = rawTxns ? JSON.parse(rawTxns) : [];
    const activeTxn = txns.find((t) => t.email.toLowerCase() === cleanEmail && t.status === 'verified');
    const pendingTxn = txns.find((t) => t.email.toLowerCase() === cleanEmail && t.status === 'pending');

    if (activeTxn) {
      const user: UserProfile = {
        email: cleanEmail,
        name: name || activeTxn.senderName || cleanEmail.split('@')[0],
        plan: activeTxn.plan,
        verificationStatus: 'verified',
        lastTransactionId: activeTxn.transactionId,
        lastScreenshotUrl: activeTxn.screenshotUrl,
        isOwner: false,
        videosRemaining: activeTxn.plan === 'single_pass' ? 1 : Infinity,
        minutesUsed: 0,
        minutesMax: activeTxn.plan === 'single_pass' ? 3 : 210,
        subscriptionExpiresAt: activeTxn.plan === 'single_pass' ? '1 Video (3 min)' : 'Active (1 Month)',
        easypaisaAccount: EASYPAISA_ACCOUNT,
      };
      saveCurrentUser(user);
      return user;
    }

    if (pendingTxn) {
      const pendingUser: UserProfile = {
        email: cleanEmail,
        name: name || pendingTxn.senderName || cleanEmail.split('@')[0],
        plan: 'none',
        pendingPlan: pendingTxn.plan,
        verificationStatus: 'pending',
        lastTransactionId: pendingTxn.transactionId,
        lastScreenshotUrl: pendingTxn.screenshotUrl,
        isOwner: false,
        videosRemaining: 0,
        minutesUsed: 0,
        minutesMax: 0,
        subscriptionExpiresAt: 'Pending Admin Verification',
        easypaisaAccount: EASYPAISA_ACCOUNT,
      };
      saveCurrentUser(pendingUser);
      return pendingUser;
    }
  } catch (e) {}

  // New guest user without active plan
  const guestUser: UserProfile = {
    email: cleanEmail,
    name: name || cleanEmail.split('@')[0],
    plan: 'none',
    verificationStatus: 'none',
    isOwner: false,
    videosRemaining: 0,
    minutesUsed: 0,
    minutesMax: 0,
    subscriptionExpiresAt: null,
    easypaisaAccount: EASYPAISA_ACCOUNT,
  };
  saveCurrentUser(guestUser);
  return guestUser;
}

export interface SubmitPaymentParams {
  email: string;
  plan: UserPlan;
  transactionId: string;
  currency?: 'PKR' | 'USD';
  senderNumber?: string;
  senderName?: string;
  screenshotUrl?: string;
  aiScanSummary?: string;
  status?: 'pending' | 'verified';
}

export function getPaymentTransactions(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXNS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function submitTransactionProof(
  params: SubmitPaymentParams
): { success: boolean; user: UserProfile; transaction?: PaymentTransaction; error?: string } {
  const cleanEmail = (params.email || '').trim().toLowerCase();
  const cleanTid = (params.transactionId || '').trim();
  const plan = params.plan || 'single_pass';
  const currency = params.currency || 'PKR';
  const status = params.status || 'pending';

  if (!cleanEmail) {
    return {
      success: false,
      user: getCurrentUser(),
      error: 'Please enter your email address so your account can be linked.',
    };
  }

  if (!cleanTid || cleanTid.length < 4) {
    return {
      success: false,
      user: getCurrentUser(),
      error: 'Please enter a valid Transaction Reference ID (TID) from your receipt.',
    };
  }

  const isMonthly = plan === 'monthly_creator';
  const amountUsd = isMonthly ? 250 : 3;
  const amountPkr = isMonthly ? 70000 : 850;
  const amount = currency === 'PKR' ? amountPkr : amountUsd;

  const newTxn: PaymentTransaction = {
    id: `txn_${Date.now()}`,
    email: cleanEmail,
    plan,
    currency,
    amount,
    amountUsd,
    amountPkr,
    easypaisaNumber: EASYPAISA_ACCOUNT,
    senderNumber: params.senderNumber?.trim() || undefined,
    senderName: params.senderName?.trim() || undefined,
    transactionId: cleanTid,
    screenshotUrl: params.screenshotUrl || undefined,
    aiScanSummary: params.aiScanSummary || undefined,
    submittedAt: new Date().toISOString(),
    status,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_TXNS);
    const txns: PaymentTransaction[] = raw ? JSON.parse(raw) : [];
    txns.unshift(newTxn);
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(txns));
  } catch (e) {}

  const isOwnerEmail = cleanEmail === OWNER_EMAIL.toLowerCase();
  if (isOwnerEmail) {
    const owner = getDefaultOwnerProfile();
    saveCurrentUser(owner);
    return { success: true, user: owner, transaction: newTxn };
  }

  const updatedUser: UserProfile =
    status === 'verified'
      ? {
          email: cleanEmail,
          name: params.senderName?.trim() || cleanEmail.split('@')[0],
          plan,
          verificationStatus: 'verified',
          lastTransactionId: cleanTid,
          lastScreenshotUrl: params.screenshotUrl,
          isOwner: false,
          videosRemaining: isMonthly ? Infinity : 1,
          minutesUsed: 0,
          minutesMax: isMonthly ? 210 : 3,
          subscriptionExpiresAt: isMonthly
            ? 'Active (1 Month - Max 210 mins)'
            : 'Active (1 Video - Max 3 mins)',
          easypaisaAccount: EASYPAISA_ACCOUNT,
        }
      : {
          email: cleanEmail,
          name: params.senderName?.trim() || cleanEmail.split('@')[0],
          plan: 'none',
          pendingPlan: plan,
          verificationStatus: 'pending',
          lastTransactionId: cleanTid,
          lastScreenshotUrl: params.screenshotUrl,
          isOwner: false,
          videosRemaining: 0,
          minutesUsed: 0,
          minutesMax: 0,
          subscriptionExpiresAt: 'Pending Admin Verification',
          easypaisaAccount: EASYPAISA_ACCOUNT,
        };

  saveCurrentUser(updatedUser);
  return { success: true, user: updatedUser, transaction: newTxn };
}

export function approvePendingTransaction(txnId: string): {
  success: boolean;
  transactions: PaymentTransaction[];
  updatedUser: UserProfile;
} {
  const txns = getPaymentTransactions();
  const target = txns.find((t) => t.id === txnId);
  const updatedTxns = txns.map((t) =>
    t.id === txnId ? { ...t, status: 'verified' as const } : t
  );

  try {
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(updatedTxns));
  } catch (e) {}

  let current = getCurrentUser();
  if (target && current.email.toLowerCase() === target.email.toLowerCase() && !current.isOwner) {
    const isMonthly = target.plan === 'monthly_creator';
    current = {
      ...current,
      plan: target.plan,
      pendingPlan: undefined,
      verificationStatus: 'verified',
      videosRemaining: isMonthly ? Infinity : 1,
      minutesUsed: 0,
      minutesMax: isMonthly ? 210 : 3,
      subscriptionExpiresAt: isMonthly
        ? 'Active (1 Month - Max 210 mins)'
        : 'Active (1 Video - Max 3 mins)',
    };
    saveCurrentUser(current);
  }

  return {
    success: true,
    transactions: updatedTxns,
    updatedUser: current,
  };
}

export function refreshAccountVerificationStatus(email?: string): {
  status: 'none' | 'pending' | 'verified';
  isActive: boolean;
  user: UserProfile;
  transactions: PaymentTransaction[];
  message: string;
} {
  const txns = getPaymentTransactions();
  const current = getCurrentUser();
  const targetEmail = (email || current.email || '').trim().toLowerCase();

  if (targetEmail === OWNER_EMAIL.toLowerCase()) {
    const owner = getDefaultOwnerProfile();
    saveCurrentUser(owner);
    return {
      status: 'verified',
      isActive: true,
      user: owner,
      transactions: txns,
      message: 'Owner account is active with Lifetime Free VIP access.',
    };
  }

  const verifiedTxn = txns.find(
    (t) =>
      t.email.toLowerCase() === targetEmail &&
      (t.status === 'verified' || t.status === 'active')
  );

  if (verifiedTxn) {
    const isMonthly = verifiedTxn.plan === 'monthly_creator';
    const updatedUser: UserProfile = {
      ...current,
      email: targetEmail,
      name: verifiedTxn.senderName || current.name || targetEmail.split('@')[0],
      plan: verifiedTxn.plan,
      pendingPlan: undefined,
      verificationStatus: 'verified',
      lastTransactionId: verifiedTxn.transactionId,
      lastScreenshotUrl: verifiedTxn.screenshotUrl,
      isOwner: false,
      videosRemaining: isMonthly ? Infinity : Math.max(1, current.videosRemaining || 1),
      minutesMax: isMonthly ? 210 : 3,
      subscriptionExpiresAt: isMonthly
        ? 'Active (1 Month - Max 210 mins)'
        : 'Active (1 Video - Max 3 mins)',
    };
    saveCurrentUser(updatedUser);
    return {
      status: 'verified',
      isActive: true,
      user: updatedUser,
      transactions: txns,
      message: `Account approved & active! Your ${
        isMonthly ? 'Pro Creator Monthly Plan' : 'Single Video Pass'
      } (TID: ${verifiedTxn.transactionId}) is now unlocked.`,
    };
  }

  const pendingTxn = txns.find(
    (t) => t.email.toLowerCase() === targetEmail && t.status === 'pending'
  );

  if (pendingTxn) {
    const pendingUser: UserProfile = {
      ...current,
      email: targetEmail,
      plan: 'none',
      pendingPlan: pendingTxn.plan,
      verificationStatus: 'pending',
      lastTransactionId: pendingTxn.transactionId,
      lastScreenshotUrl: pendingTxn.screenshotUrl,
      isOwner: false,
      subscriptionExpiresAt: 'Pending Admin Verification',
    };
    saveCurrentUser(pendingUser);
    return {
      status: 'pending',
      isActive: false,
      user: pendingUser,
      transactions: txns,
      message: `Still pending admin verification (Ref ID: ${pendingTxn.transactionId}). Please check again shortly or contact admin (${OWNER_EMAIL}).`,
    };
  }

  return {
    status: current.verificationStatus || 'none',
    isActive: current.plan !== 'none',
    user: current,
    transactions: txns,
    message: 'No pending or verified transaction found for this email yet.',
  };
}

export function submitEasypaisaPayment(
  emailOrParams: string | SubmitPaymentParams,
  legacyPlan?: UserPlan,
  legacyTid?: string
): { success: boolean; user: UserProfile; error?: string } {
  if (typeof emailOrParams === 'object') {
    return submitTransactionProof({
      ...emailOrParams,
      status: emailOrParams.status || 'verified',
    });
  }
  return submitTransactionProof({
    email: emailOrParams,
    plan: legacyPlan || 'single_pass',
    transactionId: legacyTid || '',
    status: 'verified',
  });
}

export function checkCanProduceVideo(
  user: UserProfile,
  requestedDurationSec: number
): { allowed: boolean; reason?: string } {
  // Owner always has lifetime free access
  if (user.isOwner || user.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
    return { allowed: true };
  }

  if (user.verificationStatus === 'pending' && user.plan === 'none') {
    return {
      allowed: false,
      reason: `Your payment proof (TID: ${user.lastTransactionId || 'submitted'}) is currently PENDING manual admin verification by ${OWNER_EMAIL}.`,
    };
  }

  if (user.plan === 'none') {
    return {
      allowed: false,
      reason: 'A paid plan is required to login and produce videos. Please submit your payment proof ($3 Single Video Pass or $250 Monthly Plan) via Easypaisa (03066053314).',
    };
  }

  const requestedMinutes = requestedDurationSec / 60;

  if (user.plan === 'single_pass') {
    if (user.videosRemaining <= 0) {
      return {
        allowed: false,
        reason: 'Your Single Video Pass has been used. Please purchase another $3 pass or upgrade to the $250 monthly plan via Easypaisa (03066053314).',
      };
    }
    if (requestedMinutes > 3) {
      return {
        allowed: false,
        reason: 'Single Video Pass is capped at 3 minutes per video. Please reduce target duration or upgrade to the $250 monthly plan.',
      };
    }
    return { allowed: true };
  }

  if (user.plan === 'monthly_creator') {
    if (user.minutesUsed + requestedMinutes > 210) {
      return {
        allowed: false,
        reason: `Monthly limit of 210 minutes reached (${user.minutesUsed.toFixed(1)}/210 min used). Your plan cannot exceed 210 minutes per month.`,
      };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

export function deductQuotaAfterProduction(user: UserProfile, durationSec: number): UserProfile {
  if (user.isOwner) return user;

  const durationMin = durationSec / 60;
  const updated = { ...user };

  if (user.plan === 'single_pass') {
    updated.videosRemaining = Math.max(0, updated.videosRemaining - 1);
    updated.minutesUsed += durationMin;
  } else if (user.plan === 'monthly_creator') {
    updated.minutesUsed = Math.min(210, updated.minutesUsed + durationMin);
  }

  saveCurrentUser(updated);
  return updated;
}
