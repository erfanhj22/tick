import { useState, useEffect } from 'react';
import type { BankCard, ContactCard, Transaction, SystemSettings } from './types';
import { TransferWizard } from './components/TransferWizard';
import { ReceiptModal } from './components/ReceiptModal';
import { CardBook } from './components/CardBook';
import { BankingTools } from './components/BankingTools';
import { AdminPanel } from './components/AdminPanel';
import { sound } from './utils/sound';
import { formatAmount } from './data/banks';
import {
  Send,
  History,
  BookOpen,
  Calculator,
  ShieldCheck,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lock,
  Eye,
  Crown,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';


const INITIAL_CARDS: BankCard[] = [
  {
    id: 'card-1',
    cardNumber: '6037991823904512',
    holderName: 'امیرحسین پارسا',
    bankName: 'بانک ملی ایران',
    expiryMonth: '09',
    expiryYear: '07',
    cvv2: '382',
    balance: 48500000,
    isDefault: true,
  },
  {
    id: 'card-2',
    cardNumber: '6104337890123456',
    holderName: 'امیرحسین پارسا',
    bankName: 'بانک ملت',
    expiryMonth: '11',
    expiryYear: '08',
    cvv2: '741',
    balance: 125000000,
  },
  {
    id: 'card-3',
    cardNumber: '6219861045238712',
    holderName: 'امیرحسین پارسا',
    bankName: 'بانک سامان / بلوبانک',
    expiryMonth: '04',
    expiryYear: '06',
    cvv2: '519',
    balance: 34200000,
  },
];

const INITIAL_CONTACTS: ContactCard[] = [
  {
    id: 'c-1',
    cardNumber: '5022291045678901',
    holderName: 'مهندس نیما رادپور',
    bankName: 'بانک پاسارگاد',
    note: 'شریک تجاری و پروژه‌ها',
    createdAt: '۱۴۰۳/۰۷/۱۰',
  },
  {
    id: 'c-2',
    cardNumber: '6273531198765432',
    holderName: 'دکتر سارا کریمی',
    bankName: 'بانک تجارت',
    note: 'حق‌الوکاله و مشاوره حقوقی',
    createdAt: '۱۴۰۳/۰۶/۲۲',
  },
  {
    id: 'c-3',
    cardNumber: '5892101234567890',
    holderName: 'علی صادقی',
    bankName: 'بانک سپه',
    note: 'اجاره دفتر اداری',
    createdAt: '۱۴۰۳/۰۵/۱۵',
  },
];

const INITIAL_SETTINGS: SystemSettings = {
  dailyLimit: 20000000, // 20M Toman
  baseFee: 720,
  adminPin: '1234',
  siteTitle: 'سامانه سلطنتی کارت به کارت',
  supportPhone: '۰۲۱-۸۸۸۸۹۹۹۹',
  soundEnabled: true,
  currency: 'toman',
  autoFillOtp: true,
};

export function App() {
  // Theme State
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('royal_theme');
    return saved ? saved === 'dark' : true;
  });

  // Sound Mute State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'transfer' | 'history' | 'contacts' | 'tools'>('transfer');

  // Stored State in LocalStorage
  const [cards, setCards] = useState<BankCard[]>(() => {
    const saved = localStorage.getItem('royal_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [contacts, setContacts] = useState<ContactCard[]>(() => {
    const saved = localStorage.getItem('royal_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('royal_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('royal_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Modals
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('royal_theme', isDarkTheme ? 'dark' : 'light');
    if (isDarkTheme) {
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
      document.body.classList.add('bg-[#0b0c10]', 'text-[#e0e0e0]');
    } else {
      document.body.classList.remove('bg-[#0b0c10]', 'text-[#e0e0e0]');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
    }
  }, [isDarkTheme]);

  useEffect(() => {
    localStorage.setItem('royal_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('royal_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('royal_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('royal_settings', JSON.stringify(settings));
  }, [settings]);

  // Audio Sync
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    if (next) sound.playClick();
  };

  // Card Balance Update
  const handleUpdateCardBalance = (cardId: string, newBalance: number) => {
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, balance: newBalance } : c)));
  };

  // On Transfer Success
  const handleTransferSuccess = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    setActiveReceiptTx(tx);
  };

  // Delete Transaction from history
  const handleDeleteTx = (id: string) => {
    sound.playClick();
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkTheme ? 'text-[#e0e0e0]' : 'text-slate-900'}`}>
      {/* Top Luxury Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
          isDarkTheme
            ? 'bg-[#0c0d13]/90 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
            : 'bg-white/90 border-slate-200 shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#997819] via-[#d4af37] to-[#ffd700] p-[2px] shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#12141c] flex items-center justify-center text-[#d4af37]">
                <Crown className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black gold-gradient-text tracking-tight">
                  رویـال پـی
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab]">
                  VIP LUXURY
                </span>
              </div>
              <p className="text-[11px] text-gray-400">سامانه تشریفاتی انتقال وجه شتابی</p>
            </div>
          </div>

          {/* Quick Actions (Admin, Sound, Theme) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              title={soundEnabled ? 'قطع صدا' : 'فعال‌سازی افکت‌های صوتی'}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDarkTheme ? 'border-white/10 hover:bg-white/10 text-gray-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#d4af37]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsDarkTheme(!isDarkTheme);
              }}
              title={isDarkTheme ? 'تغییر به حالت لایت پلاتینیومی' : 'تغییر به حالت دارک مود سلطنتی'}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDarkTheme ? 'border-white/10 hover:bg-white/10 text-[#d4af37]' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Admin Panel Button */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsAdminOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-[#d4af37]/40 bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#d4af37] hover:text-black transition-all flex items-center gap-1.5 shadow"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">پنل مدیریت VIP</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-1 sm:gap-4 overflow-x-auto py-1">
          {[
            { id: 'transfer', label: 'انتقال کارت به کارت', icon: Send },
            { id: 'history', label: 'تاریخچه تراکنش‌ها', icon: History, count: transactions.length },
            { id: 'contacts', label: 'دفترچه کارت‌ها', icon: BookOpen, count: contacts.length },
            { id: 'tools', label: 'جعبه ابزار بانکی', icon: Calculator },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`py-3 px-3 sm:px-5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all relative ${
                  isActive
                    ? 'border-[#d4af37] text-[#d4af37] shadow-[0_2px_15px_rgba(212,175,55,0.2)]'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d4af37]' : ''}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-[#d4af37] text-black font-extrabold' : 'bg-white/10 text-gray-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* VIEW 1: TRANSFER WIZARD */}
        {activeTab === 'transfer' && (
          <TransferWizard
            myCards={cards}
            contacts={contacts}
            settings={settings}
            isDarkTheme={isDarkTheme}
            onSuccess={handleTransferSuccess}
            onUpdateCardBalance={handleUpdateCardBalance}
          />
        )}

        {/* VIEW 2: TRANSACTION HISTORY */}
        {activeTab === 'history' && (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold gold-gradient-text flex items-center gap-2">
                  <History className="w-5 h-5 text-[#d4af37]" />
                  سوابق و تاریخچه تراکنش‌ها
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">لیست کلیه انتقال‌های انجام شده با قابلیت صدور مجدد فاکتور</p>
              </div>

              {transactions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('آیا از پاک کردن کامل تاریخچه اطمینان دارید؟')) {
                      sound.playClick();
                      setTransactions([]);
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 hover:underline"
                >
                  پاکسازی کل تاریخچه
                </button>
              )}
            </div>

            {transactions.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border ${
                  isDarkTheme ? 'bg-[#12131c]/50 border-white/5 text-gray-400' : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#d4af37]" />
                <p className="text-sm font-medium">هنوز هیچ تراکنشی ثبت نشده است.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('transfer')}
                  className="mt-4 px-4 py-2 text-xs font-bold text-[#d4af37] border border-[#d4af37]/40 rounded-xl hover:bg-[#d4af37]/10"
                >
                  انجام اولین انتقال کارت به کارت
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      isDarkTheme
                        ? 'bg-[#151722] border-white/10 hover:border-[#d4af37]/40 text-white'
                        : 'bg-white border-slate-200 hover:border-amber-400 shadow-sm text-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">انتقال به: {tx.destHolderName}</span>
                          <span className="text-[11px] text-gray-400">({tx.destBank})</span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-3">
                          <span>کد پیگیری: <span className="font-mono text-gray-300 font-bold">{tx.trackingCode}</span></span>
                          <span>زمان: {tx.timestamp}</span>
                        </div>
                        <div className="text-[11px] font-mono text-gray-400" dir="ltr">
                          {tx.sourceCard.slice(0, 9)}... &rarr; {tx.destCard}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                      <div className="font-mono font-bold text-base text-[#d4af37]">
                        {formatAmount(tx.amount)} تومان
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setActiveReceiptTx(tx);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#d4af37] hover:text-black transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          رسید رسمی
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTx(tx.id)}
                          title="حذف از تاریخچه"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: CONTACT BOOK */}
        {activeTab === 'contacts' && (
          <CardBook
            contacts={contacts}
            isDarkTheme={isDarkTheme}
            onAddContact={(c) => setContacts((prev) => [c, ...prev])}
            onDeleteContact={(id) => setContacts((prev) => prev.filter((c) => c.id !== id))}
            onSelectForTransfer={(_c) => {
              setActiveTab('transfer');
            }}
          />
        )}

        {/* VIEW 4: BANKING TOOLS */}
        {activeTab === 'tools' && <BankingTools isDarkTheme={isDarkTheme} />}
      </main>

      {/* Digital Receipt Modal */}
      <ReceiptModal
        transaction={activeReceiptTx}
        isOpen={!!activeReceiptTx}
        onClose={() => setActiveReceiptTx(null)}
        isDarkTheme={isDarkTheme}
      />

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <AdminPanel
          transactions={transactions}
          cards={cards}
          settings={settings}
          isDarkTheme={isDarkTheme}
          onUpdateSettings={setSettings}
          onUpdateCards={setCards}
          onUpdateTransactions={setTransactions}
          onViewReceipt={(tx) => {
            setActiveReceiptTx(tx);
            setIsAdminOpen(false);
          }}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Footer */}
      <footer
        className={`border-t py-8 px-4 sm:px-6 transition-colors text-xs text-center ${
          isDarkTheme ? 'bg-[#090a0e] border-white/5 text-gray-500' : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
              پروتکل امنیتی شتاب و شاپرک ۲۵۶ بیتی
            </span>
            <span>پشتیبانی: {settings.supportPhone}</span>
            <span>قابلیت استقرار مستقیم روی هاست (cPanel / DirectAdmin / GitHub)</span>
          </div>

          <p className="text-[11px] text-gray-500">
            طراحی شده با الهام از معماری بانکداری پریمیوم سلطنتی | کلیه حقوق محفوظ است © ۱۴۰۳ - ۲۰۲۶
          </p>
        </div>
      </footer>
    </div>
  );
}
export default App;
