export interface BankInfo {
  prefix: string;
  name: string;
  enName: string;
  color: string;
  gradient: string;
  badgeBg: string;
  logo: string;
}

export interface BankCard {
  id: string;
  cardNumber: string;
  holderName: string;
  bankName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv2: string;
  balance: number; // In Toman
  isDefault?: boolean;
  colorTheme?: string;
}

export interface ContactCard {
  id: string;
  cardNumber: string;
  holderName: string;
  bankName: string;
  note?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  trackingCode: string;
  referenceNumber: string;
  sourceCard: string;
  sourceBank: string;
  sourceHolder: string;
  destCard: string;
  destBank: string;
  destHolderName: string;
  amount: number; // in Toman
  fee: number;    // in Toman
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  description: string;
  sourceIban?: string;
  destIban?: string;
}

export interface SystemSettings {
  dailyLimit: number;
  baseFee: number;
  adminPin: string;
  siteTitle: string;
  supportPhone: string;
  soundEnabled: boolean;
  currency: 'toman' | 'rial';
  autoFillOtp: boolean;
}
