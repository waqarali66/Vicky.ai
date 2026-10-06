export type UserPlan = 'owner_lifetime' | 'single_pass' | 'monthly_creator' | 'none';

export type VerificationStatus = 'none' | 'pending' | 'verified';

export interface UserProfile {
  email: string;
  name: string;
  plan: UserPlan;
  pendingPlan?: UserPlan;
  verificationStatus?: VerificationStatus;
  lastTransactionId?: string;
  lastScreenshotUrl?: string;
  isOwner: boolean;
  videosRemaining: number;
  minutesUsed: number;
  minutesMax: number;
  subscriptionExpiresAt?: string | null;
  easypaisaAccount: string;
}

export type PaymentCurrency = 'PKR' | 'USD';

export interface PaymentTransaction {
  id: string;
  email: string;
  plan: UserPlan;
  currency: PaymentCurrency;
  amount: number;
  amountUsd: number;
  amountPkr: number;
  easypaisaNumber: string;
  senderNumber?: string;
  senderName?: string;
  transactionId: string;
  screenshotUrl?: string;
  aiScanSummary?: string;
  submittedAt: string;
  status: 'active' | 'pending' | 'verified';
}

export const OWNER_EMAIL = 'waqar.aliakbar920@gmail.com';
export const EASYPAISA_ACCOUNT = '03066053314';

export const PRICING_PLANS = [
  {
    id: 'single_pass' as UserPlan,
    name: 'Single Video Pass',
    priceUsd: 3,
    pricePkr: 850,
    billingCadence: 'Per video generation',
    videoAllowance: '1 Video Production',
    durationLimit: 'Up to 3 minutes',
    features: [
      'Full Autonomous Directing & Shot Breakdown',
      'High-Resolution Visual Prompt Generation',
      'All Connectors (Canva, CapCut EDL, Higgsfield)',
      'DaVinci Resolve LUT & ElevenLabs Script',
      'Standard 24 FPS Export Package',
    ],
    recommended: false,
  },
  {
    id: 'monthly_creator' as UserPlan,
    name: 'Pro Creator Monthly',
    priceUsd: 250,
    pricePkr: 70000,
    billingCadence: 'Billed monthly',
    videoAllowance: 'Unlimited Video Productions',
    durationLimit: 'Max 210 minutes total per month',
    features: [
      'Unlimited video projects (up to 210 minutes cap)',
      'Autonomous Character Bible & Consistency Seed Lock',
      'Multi-Tool Connectors Full Automation (Canva & CapCut)',
      'High-Priority Gemini Server-Side Processing',
      'Direct CMX3600 EDL, CDL XML & Prompt Batches',
      'Priority Email & WhatsApp Easypaisa Support',
    ],
    recommended: true,
  },
];
