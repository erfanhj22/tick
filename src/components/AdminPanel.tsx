import React, { useState } from 'react';
import type { Transaction, BankCard, SystemSettings } from '../types';
import { formatAmount } from '../data/banks';
import { sound } from '../utils/sound';
import {
  Sliders,
  TrendingUp,
  CreditCard,
  FileText,
  Search,
  CheckCircle,
  Save,
  Lock,
  Unlock,
  Trash2,
  Eye,
  Server,
  CloudUpload,
  Settings
} from 'lucide-react';


interface AdminPanelProps {
  transactions: Transaction[];
  cards: BankCard[];
  settings: SystemSettings;
  isDarkTheme: boolean;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onUpdateCards: (newCards: BankCard[]) => void;
  onUpdateTransactions: (newTxs: Transaction[]) => void;
  onViewReceipt: (tx: Transaction) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  transactions,
  cards,
  settings,
  isDarkTheme,
  onUpdateSettings,
  onUpdateCards,
  onUpdateTransactions,
  onViewReceipt,
  onClose,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'stats' | 'transactions' | 'cards' | 'settings' | 'hosting'>('stats');

  // Transaction Search & Filter
  const [txSearch, setTxSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  // Editable Settings form
  const [formSettings, setFormSettings] = useState<SystemSettings>({ ...settings });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Editable Cards
  const [editableCards, setEditableCards] = useState<BankCard[]>([...cards]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '1234') {
      sound.playSuccess();
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      sound.playWarning();
      setAuthError('رمز ورود مدیر نادرست است. (رمز پیش‌فرض: 1234)');
    }
  };

  // Metrics
  const totalVolume = transactions.reduce((acc, t) => (t.status === 'success' ? acc + t.amount : acc), 0);
  const totalFees = transactions.reduce((acc, t) => (t.status === 'success' ? acc + t.fee : acc), 0);
  const successCount = transactions.filter((t) => t.status === 'success').length;
  const pendingCount = transactions.filter((t) => t.status === 'pending').length;
  const failedCount = transactions.filter((t) => t.status === 'failed').length;

  // Filtered Transactions
  const filteredTxs = transactions.filter((t) => {
    const matchesSearch =
      t.trackingCode.includes(txSearch) ||
      t.referenceNumber.includes(txSearch) ||
      t.sourceCard.includes(txSearch) ||
      t.destCard.includes(txSearch) ||
      t.destHolderName.includes(txSearch);
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateTxStatus = (id: string, newStatus: 'success' | 'pending' | 'failed') => {
    sound.playClick();
    const updated = transactions.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    onUpdateTransactions(updated);
  };

  const handleDeleteTx = (id: string) => {
    sound.playClick();
    if (confirm('آیا از حذف این تراکنش از تاریخچه اطمینان دارید؟')) {
      const updated = transactions.filter((t) => t.id !== id);
      onUpdateTransactions(updated);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    onUpdateSettings(formSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 2500);
  };

  const handleUpdateCardBalance = (cardId: string, newBalance: number) => {
    const updated = editableCards.map((c) => (c.id === cardId ? { ...c, balance: newBalance } : c));
    setEditableCards(updated);
    onUpdateCards(updated);
  };

  // If Not Authenticated, show Login screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div
          className={`w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl relative ${
            isDarkTheme ? 'bg-[#151722] border-[#d4af37]/40 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold gold-gradient-text mb-1">ورود به پنل مدیریت VIP</h3>
          <p className="text-xs text-gray-400 mb-6">رمز عبور مدیر را وارد کنید (پیش‌فرض: 1234)</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                dir="ltr"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="••••"
                className={`w-full px-4 py-3 rounded-xl font-mono text-center text-xl tracking-widest border outline-none ${
                  isDarkTheme
                    ? 'bg-black/50 border-white/20 text-white focus:border-[#d4af37]'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
            </div>

            {authError && <div className="text-xs text-red-400 font-medium">{authError}</div>}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-black hover:brightness-110 shadow"
              >
                ورود به مدیریت
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl text-xs text-gray-400 hover:text-white"
              >
                بازگشت
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden">
      <div
        className={`w-full max-w-6xl h-[90vh] rounded-2xl border flex flex-col shadow-2xl overflow-hidden ${
          isDarkTheme ? 'bg-[#0f1118] border-[#d4af37]/40 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Top Navbar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold gold-gradient-text">داشبورد مدیریت پورتال بانکی</h2>
              <span className="text-[11px] text-gray-400">سامانه نظارت، تراکنش‌ها و پیکربندی هاست</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsAuthenticated(false);
              }}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              قفل پنل
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-gray-200 transition-colors"
            >
              بستن
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-white/10 flex items-center gap-2 overflow-x-auto shrink-0 bg-black/20">
          {[
            { id: 'stats', label: 'آمار و گزارشات', icon: TrendingUp },
            { id: 'transactions', label: 'مدیریت تراکنش‌ها', icon: FileText },
            { id: 'cards', label: 'کارت‌ها و موجودی', icon: CreditCard },
            { id: 'settings', label: 'تنظیمات سیستم', icon: Settings },
            { id: 'hosting', label: 'راهنمای هاست و گیت‌هاب', icon: CloudUpload },
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
                className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ============= TAB 1: STATS ============= */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">مجموع گردش مالی موفق</div>
                  <div className="text-2xl font-mono font-bold text-[#d4af37]">
                    {formatAmount(totalVolume)} <span className="text-xs font-normal text-gray-300">تومان</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">{formatAmount(totalVolume * 10)} ریال</div>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">کل کارمزدهای شتابی</div>
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {formatAmount(totalFees)} <span className="text-xs font-normal text-gray-300">تومان</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">نرخ کارمزد طبق مصوبه بانک مرکزی</div>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">تراکنش‌های موفق</div>
                  <div className="text-2xl font-mono font-bold text-blue-400">{successCount} تراکنش</div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {transactions.length > 0
                      ? `${Math.round((successCount / transactions.length) * 100)}% نرخ موفقیت`
                      : '۱۰۰% پایداری'}
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">کل درخواست‌های ثبت شده</div>
                  <div className="text-2xl font-mono font-bold text-purple-400">{transactions.length} تراکنش</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {pendingCount} در انتظار | {failedCount} ناموفق
                  </div>
                </div>
              </div>

              {/* Recent Activity Table Preview */}
              <div
                className={`p-5 rounded-2xl border ${
                  isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm gold-gradient-text">آخرین تراکنش‌های ثبت شده</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-[#d4af37] hover:underline"
                  >
                    مشاهده لیست کامل
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="py-2 px-3">کد پیگیری</th>
                        <th className="py-2 px-3">مبدا</th>
                        <th className="py-2 px-3">مقصد و نام</th>
                        <th className="py-2 px-3">مبلغ (تومان)</th>
                        <th className="py-2 px-3">وضعیت</th>
                        <th className="py-2 px-3">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.slice(0, 5).map((t) => (
                        <tr key={t.id} className="hover:bg-white/5">
                          <td className="py-2 px-3 font-mono font-bold text-[#d4af37]">{t.trackingCode}</td>
                          <td className="py-2 px-3 font-mono" dir="ltr">{t.sourceCard.slice(0, 9)}...</td>
                          <td className="py-2 px-3">{t.destHolderName}</td>
                          <td className="py-2 px-3 font-mono font-bold">{formatAmount(t.amount)}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                t.status === 'success'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : t.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {t.status === 'success' ? 'موفق' : t.status === 'pending' ? 'در انتظار' : 'ناموفق'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => onViewReceipt(t)}
                              className="text-[#d4af37] hover:underline flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              رسید
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============= TAB 2: TRANSACTIONS ============= */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    placeholder="جستجوی کد پیگیری، شماره کارت، نام..."
                    className={`w-full pr-9 pl-3 py-2 text-xs rounded-xl border outline-none ${
                      isDarkTheme
                        ? 'bg-black/30 border-white/15 text-white focus:border-[#d4af37]'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {(['all', 'success', 'pending', 'failed'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        statusFilter === st
                          ? 'bg-[#d4af37] text-black border-[#d4af37]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {st === 'all'
                        ? 'همه'
                        : st === 'success'
                        ? 'موفق'
                        : st === 'pending'
                        ? 'در انتظار'
                        : 'ناموفق'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Transaction Table */}
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-white border-gray-200'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/20 text-gray-400 font-bold">
                        <th className="py-3 px-4">کد پیگیری</th>
                        <th className="py-3 px-4">تاریخ و زمان</th>
                        <th className="py-3 px-4">کارت مبدا</th>
                        <th className="py-3 px-4">کارت و گیرنده مقصد</th>
                        <th className="py-3 px-4">مبلغ (تومان)</th>
                        <th className="py-3 px-4">کارمزد</th>
                        <th className="py-3 px-4">وضعیت</th>
                        <th className="py-3 px-4">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTxs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-400">
                            تراکنشی مطابق با جستجوی شما یافت نشد.
                          </td>
                        </tr>
                      ) : (
                        filteredTxs.map((t) => (
                          <tr key={t.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#d4af37]">{t.trackingCode}</td>
                            <td className="py-3 px-4 text-gray-300">{t.timestamp}</td>
                            <td className="py-3 px-4 font-mono text-gray-200" dir="ltr">
                              {t.sourceCard}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold">{t.destHolderName}</div>
                              <div className="font-mono text-[11px] text-gray-400" dir="ltr">
                                {t.destCard} ({t.destBank})
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              {formatAmount(t.amount)}
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-300">
                              {formatAmount(t.fee)}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={t.status}
                                onChange={(e) =>
                                  handleUpdateTxStatus(t.id, e.target.value as 'success' | 'pending' | 'failed')
                                }
                                className={`px-2 py-1 rounded text-[11px] font-bold border outline-none cursor-pointer ${
                                  t.status === 'success'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : t.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                    : 'bg-red-500/20 text-red-400 border-red-500/40'
                                }`}
                              >
                                <option value="success" className="bg-[#151722] text-white">موفق</option>
                                <option value="pending" className="bg-[#151722] text-white">در انتظار</option>
                                <option value="failed" className="bg-[#151722] text-white">ناموفق</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onViewReceipt(t)}
                                  title="مشاهده و صدور رسید"
                                  className="p-1 rounded bg-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTx(t.id)}
                                  title="حذف تراکنش"
                                  className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============= TAB 3: CARDS & BALANCES ============= */}
          {activeTab === 'cards' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-400 mb-2">
                مدیریت موجودی کارت‌های فعال در سیستم (جهت تست و شبیه‌سازی کسر از حساب):
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {editableCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-5 rounded-2xl border ${
                      isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-sm">{card.bankName}</h4>
                        <div className="text-xs text-gray-400">{card.holderName}</div>
                      </div>
                      <div className="font-mono text-xs px-2.5 py-1 rounded bg-white/10" dir="ltr">
                        {card.cardNumber}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/10">
                      <label className="block text-xs font-semibold text-gray-300">
                        موجودی حساب (تومان):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={formatAmount(card.balance)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                            handleUpdateCardBalance(card.id, val);
                          }}
                          className={`w-full px-3 py-2 rounded-xl font-mono text-sm border outline-none ${
                            isDarkTheme
                              ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            handleUpdateCardBalance(card.id, card.balance + 10000000);
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#d4af37] hover:text-black transition-colors whitespace-nowrap"
                        >
                          +۱۰ میلیون
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============= TAB 4: SYSTEM SETTINGS ============= */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {settingsSavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  تنظیمات با موفقیت ذخیره شد.
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div
                  className={`p-5 rounded-2xl border space-y-4 ${
                    isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className="font-bold text-sm gold-gradient-text">سقف‌های مالی و کارمزد</h4>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      سقف مجاز انتقال روزانه (تومان):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formatAmount(formSettings.dailyLimit)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                        setFormSettings({ ...formSettings, dailyLimit: val });
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl font-mono text-sm border outline-none ${
                        isDarkTheme
                          ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      کارمزد پایه انتقال وجه (تومان):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formatAmount(formSettings.baseFee)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                        setFormSettings({ ...formSettings, baseFee: val });
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl font-mono text-sm border outline-none ${
                        isDarkTheme
                          ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border space-y-4 ${
                    isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <h4 className="font-bold text-sm gold-gradient-text">امنیت و پیامک</h4>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-gray-300">
                      پین کد / رمز عبور ورود مدیر به پنل:
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={10}
                      value={formSettings.adminPin}
                      onChange={(e) => setFormSettings({ ...formSettings, adminPin: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl font-mono text-sm border outline-none ${
                        isDarkTheme
                          ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-xs font-bold text-gray-200">درج خودکار رمز پویا (Auto-fill OTP)</div>
                      <div className="text-[11px] text-gray-400">
                        در صورت فعال بودن، با دریافت پیامک رمز خودکار در کادر وارد می‌شود
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formSettings.autoFillOtp}
                      onChange={(e) => setFormSettings({ ...formSettings, autoFillOtp: e.target.checked })}
                      className="w-5 h-5 accent-[#d4af37] rounded"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-black hover:brightness-110 flex items-center justify-center gap-2 shadow"
                >
                  <Save className="w-4 h-4" />
                  ذخیره تغییرات تنظیمات
                </button>
              </form>
            </div>
          )}

          {/* ============= TAB 5: HOSTING & GITHUB GUIDE ============= */}
          {activeTab === 'hosting' && (
            <div className="max-w-3xl mx-auto space-y-6 text-xs leading-relaxed">
              <div
                className={`p-6 rounded-2xl border ${
                  isDarkTheme ? 'bg-[#151722] border-[#d4af37]/30' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-[#d4af37]/20 text-[#d4af37]">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold gold-gradient-text">
                      راهنمای کامل و گام‌به‌گام آپلود روی هاست، گیت‌هاب و سرور
                    </h3>
                    <p className="text-gray-400">
                      این سایت به صورت Static Single Page App ساخته شده و روی تمامی هاست‌ها کار می‌کند!
                    </p>
                  </div>
                </div>

                <div className="space-y-6 text-gray-300">
                  {/* Step 1 */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm text-[#d4af37] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-xs">۱</span>
                      روش اول: آپلود روی هاست معمولی (cPanel یا DirectAdmin)
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 pr-2 text-gray-300">
                      <li>در ترمینال پروژه دستور روبرو را اجرا کنید: <code className="bg-black/40 px-2 py-0.5 rounded text-[#f3e5ab]">npm run build</code></li>
                      <li>یک پوشه به نام <code className="bg-black/40 px-2 py-0.5 rounded text-[#f3e5ab]">dist</code> در پروژه شما ایجاد می‌شود.</li>
                      <li>تمام محتویات داخل پوشه <code className="bg-black/40 px-2 py-0.5 rounded text-[#f3e5ab]">dist</code> (فایل index.html و پوشه assets) را زیپ (Zip) کنید.</li>
                      <li>وارد مدیریت هاست (cPanel یا DirectAdmin) شده و به قسمت <b>File Manager &gt; public_html</b> بروید.</li>
                      <li>فایل زیپ را آپلود کرده و Extract (از حالت فشرده خارج) کنید. تمام! سایت شما فوراً بالا می‌آید.</li>
                    </ol>
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <h4 className="font-bold text-sm text-[#d4af37] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-xs">۲</span>
                      روش دوم: انتشار رایگان روی GitHub Pages
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 pr-2 text-gray-300">
                      <li>پروژه را داخل ریپازیتوری گیت‌هاب خود Push کنید:
                        <pre className="bg-black/50 p-2.5 rounded-lg font-mono text-[11px] mt-1 text-[#f3e5ab] overflow-x-auto" dir="ltr">
git init
git add .
git commit -m "Initial Royal Card Pay"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
                        </pre>
                      </li>
                      <li>در صفحه ریپازیتوری گیت‌هاب به تب <b>Settings &gt; Pages</b> بروید.</li>
                      <li>در بخش Build and deployment گزینه <b>GitHub Actions</b> را انتخاب کرده تا به صورت خودکار پروژه منتشر شود.</li>
                    </ol>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <h4 className="font-bold text-sm text-[#d4af37] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-xs">۳</span>
                      روش سوم: انتشار رایگان روی سرویس‌های ابری (Vercel یا لیارا Liara)
                    </h4>
                    <p className="pr-2">
                      فقط کافیست در سایت <b>Vercel.com</b> یا <b>Liara.ir</b> وارد شوید، ریپازیتوری گیت‌هاب پروژه را انتخاب کنید تا با ۱ کلیک و به صورت خودکار با دامنه رایگان آنلاین شود.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
