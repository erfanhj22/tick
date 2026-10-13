import React, { useState, useEffect } from 'react';
import type { BankCard, ContactCard, Transaction, SystemSettings } from '../types';
import { detectBank, formatCardNumber, formatAmount, numberToPersianWords, calculateShetabFee } from '../data/banks';
import { CreditCard } from './CreditCard';
import { sound } from '../utils/sound';
import { fireRoyalConfetti } from '../utils/receiptGenerator';
import {
  Send,
  UserCheck,
  Clock,
  BookOpen,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';


interface TransferWizardProps {
  myCards: BankCard[];
  contacts: ContactCard[];
  settings: SystemSettings;
  isDarkTheme: boolean;
  onSuccess: (tx: Transaction) => void;
  onUpdateCardBalance: (cardId: string, newBalance: number) => void;
}

export const TransferWizard: React.FC<TransferWizardProps> = ({
  myCards,
  contacts,
  settings,
  isDarkTheme,
  onSuccess,
  onUpdateCardBalance,
}) => {
  // Source Card
  const [selectedSourceId, setSelectedSourceId] = useState<string>(myCards[0]?.id || '');
  const currentSourceCard = myCards.find((c) => c.id === selectedSourceId) || myCards[0];

  // Destination Card
  const [destCardNumber, setDestCardNumber] = useState('');
  const [destHolderName, setDestHolderName] = useState('');
  const [isInquiring, setIsInquiring] = useState(false);
  const [destBankInfo, setDestBankInfo] = useState(detectBank(''));

  // Amount & Details
  const [amount, setAmount] = useState<number>(1000000);
  const [description, setDescription] = useState('انتقال وجه شخصی');

  // Security Credentials
  const [cvv2, setCvv2] = useState('');
  const [expMonth, setExpMonth] = useState('08');
  const [expYear, setExpYear] = useState('06');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [smsNotification, setSmsNotification] = useState<string | null>(null);

  // Transfer State
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [showContactsDropdown, setShowContactsDropdown] = useState(false);

  // Fees and Totals
  const shetabFee = calculateShetabFee(amount);
  const totalDeduction = amount + shetabFee;

  // Handle OTP countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);


  // Handle Dest Card input and auto-detection
  const handleDestCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    setDestCardNumber(raw);
    const detected = detectBank(raw);
    setDestBankInfo(detected);

    if (raw.length === 16) {
      simulateInquiry(raw, detected.name);
    } else {
      setDestHolderName('');
    }
  };

  // Simulated live holder name inquiry
  const simulateInquiry = (cardNum: string, bankName: string) => {
    // Check if card exists in contacts
    const matchedContact = contacts.find((c) => c.cardNumber.replace(/\D/g, '') === cardNum);
    if (matchedContact) {
      setDestHolderName(matchedContact.holderName);
      return;
    }

    setIsInquiring(true);
    setTimeout(() => {
      setIsInquiring(false);
      const mockNames = [
        'مهندس سهراب بختیاری',
        'دکتر مریم شمس آبادی',
        'امیرحسین زارعی',
        'نیلوفر رادمهر',
        'احسان محمدی پور',
        'شرکت بازرگانی پارس نگین',
      ];
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      setDestHolderName(`${randomName} (${bankName})`);
      sound.playClick();
    }, 600);
  };

  // Generate dynamic OTP with SMS simulation
  const handleRequestOtp = () => {
    sound.playClick();
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setOtpTimer(120);

    // Show simulated bank SMS
    setTimeout(() => {
      sound.playOtpChime();
      const smsText = `بانک ${currentSourceCard?.bankName || 'شتاب'}\nرمز پویا: ${randomCode}\nمبلغ: ${formatAmount(
        amount
      )} تومان\nانتقال به کارت پایان: ${destCardNumber.slice(-4) || '****'}\nاعتبار: ۲ دقیقه`;
      setSmsNotification(smsText);

      // Auto-fill if setting enabled
      if (settings.autoFillOtp) {
        setOtp(randomCode);
      }
    }, 800);
  };

  const handleSelectContact = (contact: ContactCard) => {
    sound.playClick();
    const clean = contact.cardNumber.replace(/\D/g, '');
    setDestCardNumber(clean);
    setDestHolderName(contact.holderName);
    setDestBankInfo(detectBank(clean));
    setShowContactsDropdown(false);
  };

  // Execute Transfer
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (destCardNumber.length !== 16) {
      sound.playWarning();
      setErrorMessage('لطفاً شماره کارت مقصد را به صورت کامل (۱۶ رقم) وارد نمایید.');
      return;
    }

    if (amount <= 0) {
      sound.playWarning();
      setErrorMessage('مبلغ انتقال باید بیشتر از صفر باشد.');
      return;
    }

    if (amount > settings.dailyLimit) {
      sound.playWarning();
      setErrorMessage(`مبلغ درخواستی بیش از سقف مجاز روزانه (${formatAmount(settings.dailyLimit)} تومان) است.`);
      return;
    }

    if (currentSourceCard && totalDeduction > currentSourceCard.balance) {
      sound.playWarning();
      setErrorMessage(`موجودی حساب مبدا برای این انتقال کافی نیست. موجودی: ${formatAmount(currentSourceCard.balance)} تومان`);
      return;
    }

    if (!cvv2 || cvv2.length < 3) {
      sound.playWarning();
      setErrorMessage('لطفاً کد امنیتی CVV2 را به درستی وارد کنید.');
      return;
    }

    if (!otp || (generatedOtp && otp !== generatedOtp)) {
      sound.playWarning();
      setErrorMessage('رمز پویای وارد شده نامعتبر یا منقضی است.');
      return;
    }

    // Start luxury execution flow
    setIsProcessing(true);
    sound.playClick();

    setTimeout(() => {
      setIsProcessing(false);

      // Deduct balance
      if (currentSourceCard) {
        const newBal = currentSourceCard.balance - totalDeduction;
        onUpdateCardBalance(currentSourceCard.id, newBal);
      }

      // Generate transaction record
      const now = new Date();
      const persianDate = new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(now);

      const tracking = Math.floor(10000000 + Math.random() * 90000000).toString();
      const rrn = Math.floor(100000000000 + Math.random() * 900000000000).toString();

      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        trackingCode: tracking,
        referenceNumber: rrn,
        sourceCard: formatCardNumber(currentSourceCard?.cardNumber || '6037990000000000'),
        sourceBank: currentSourceCard?.bankName || 'بانک مبدا',
        sourceHolder: currentSourceCard?.holderName || 'دارنده حساب',
        destCard: formatCardNumber(destCardNumber),
        destBank: destBankInfo.name,
        destHolderName: destHolderName || 'پذیرنده وجه',
        amount: amount,
        fee: shetabFee,
        timestamp: persianDate,
        status: 'success',
        description: description,
      };

      // Royal Fanfare & Confetti
      fireRoyalConfetti();
      sound.playSuccess();
      onSuccess(newTx);

      // Reset form fields
      setOtp('');
      setGeneratedOtp('');
      setSmsNotification(null);
    }, 1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* SMS Notification Banner (Simulated Bank SMS) */}
      {smsNotification && (
        <div
          className={`p-4 rounded-xl border flex items-start justify-between shadow-xl animate-bounce-short transition-all ${
            isDarkTheme
              ? 'bg-[#151722]/95 border-[#d4af37]/60 text-gray-100 shadow-[0_10px_25px_rgba(212,175,55,0.15)]'
              : 'bg-amber-50/95 border-amber-300 text-gray-900 shadow-lg'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                پیامک جدید رمز پویا از سامانه پیامکی بانک
              </div>
              <p className="text-xs sm:text-sm whitespace-pre-line mt-1 font-mono leading-relaxed">
                {smsNotification}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setOtp(generatedOtp);
                sound.playClick();
              }}
              className="px-3 py-1.5 text-xs font-bold bg-[#d4af37] hover:bg-[#b8860b] text-black rounded-lg transition-colors shadow"
            >
              کپی و درج خودکار
            </button>
            <button
              type="button"
              onClick={() => setSmsNotification(null)}
              className="text-[11px] text-gray-400 hover:text-gray-200 text-center"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Card Showcase (Right) & Form (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Visual Card & Source Card Selector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold gold-gradient-text flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d4af37]" />
              کارت پرداخت انتخاب شده
            </h3>
            <p className="text-xs text-gray-400">کارت را برای مشاهده پشت یا تغییر تکان دهید</p>
          </div>

          {/* Interactive 3D Card */}
          <CreditCard
            cardNumber={currentSourceCard?.cardNumber || '6037990000000000'}
            holderName={currentSourceCard?.holderName || 'دارنده حساب'}
            expiryMonth={expMonth}
            expiryYear={expYear}
            cvv2={cvv2}
            isFlipped={isCardFlipped}
            onFlipToggle={() => setIsCardFlipped(!isCardFlipped)}
            isDarkTheme={isDarkTheme}
            customBankName={currentSourceCard?.bankName}
          />

          {/* Source Card Selector Dropdown */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkTheme
                ? 'bg-[#12131a] border-white/10 text-gray-200'
                : 'bg-white border-gray-200 text-gray-800 shadow-sm'
            }`}
          >
            <label className="block text-xs font-semibold mb-2 text-gray-400">
              انتخاب کارت مبدا برای کسر وجه:
            </label>
            <div className="space-y-2">
              {myCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedSourceId(card.id);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between text-xs ${
                    selectedSourceId === card.id
                      ? isDarkTheme
                        ? 'border-[#d4af37] bg-[#d4af37]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'border-amber-500 bg-amber-50 text-gray-900 font-bold'
                        : isDarkTheme
                        ? 'border-white/5 hover:border-white/20 bg-black/20'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-2">
                      <span>{card.bankName}</span>
                      <span className="text-[10px] text-gray-400 font-mono" dir="ltr">
                        {card.cardNumber.slice(0, 4)}...{card.cardNumber.slice(-4)}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">{card.holderName}</div>
                  </div>
                  <div className="text-left font-mono font-bold text-[#d4af37]">
                    {formatAmount(card.balance)} تومان
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Transfer Form */}
        <div
          className={`lg:col-span-7 p-6 sm:p-8 rounded-2xl border relative ${
            isDarkTheme
              ? 'bg-[#12131c]/90 border-[#d4af37]/30 shadow-[0_15px_40px_rgba(0,0,0,0.5)]'
              : 'bg-white border-gray-200 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-4 mb-6 border-white/10">
            <div>
              <h2 className="text-xl font-bold gold-gradient-text flex items-center gap-2">
                <Send className="w-5 h-5 text-[#d4af37]" />
                فرم انتقال آنی کارت به کارت
              </h2>
              <p className="text-xs text-gray-400 mt-1">انتقال فوق امنیتی با تاییدیه شتاب و رسید رسمی</p>
            </div>
            <div className="text-left">
              <span className="text-[10px] text-gray-400 block">سقف انتقال روزانه</span>
              <span className="text-xs font-mono font-bold text-[#d4af37]">
                {formatAmount(settings.dailyLimit)} تومان
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleExecuteTransfer} className="space-y-5">
            {/* Destination Card Input & Contact Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <span>شماره کارت مقصد (۱۶ رقم):</span>
                </label>

                {/* Contacts Quick Picker Toggle */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowContactsDropdown(!showContactsDropdown)}
                    className="text-xs text-[#d4af37] hover:text-[#f3e5ab] flex items-center gap-1 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    انتخاب از مخاطبین
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showContactsDropdown && (
                    <div
                      className={`absolute left-0 mt-2 w-72 rounded-xl border p-2 shadow-2xl z-50 ${
                        isDarkTheme ? 'bg-[#181a24] border-white/20' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-gray-400 px-2 py-1 border-b border-white/10 mb-1">
                        دفترچه کارت‌های ذخیره شده
                      </div>
                      {contacts.length === 0 ? (
                        <div className="text-xs text-gray-400 p-2 text-center">مخاطبی ثبت نشده است</div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {contacts.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => handleSelectContact(c)}
                              className={`p-2 rounded-lg cursor-pointer text-xs flex items-center justify-between ${
                                isDarkTheme ? 'hover:bg-white/10 text-gray-200' : 'hover:bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div>
                                <div className="font-bold">{c.holderName}</div>
                                <div className="text-[10px] text-gray-400">{c.bankName}</div>
                              </div>
                              <span className="font-mono text-[11px]" dir="ltr">
                                ...{c.cardNumber.slice(-4)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  maxLength={19}
                  value={formatCardNumber(destCardNumber)}
                  onChange={handleDestCardChange}
                  placeholder="---- - ---- - ---- - ----"
                  className={`w-full px-4 py-3 rounded-xl font-mono text-lg font-bold tracking-widest text-center border transition-all outline-none ${
                    isDarkTheme
                      ? 'bg-black/40 border-white/15 focus:border-[#d4af37] text-white focus:ring-1 focus:ring-[#d4af37]'
                      : 'bg-gray-50 border-gray-300 focus:border-amber-500 text-gray-900 focus:ring-1 focus:ring-amber-500'
                  }`}
                />

                {/* Bank Mini Badge inside input */}
                {destBankInfo.prefix !== '000000' && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#f3e5ab]">
                    <span>{destBankInfo.name}</span>
                  </div>
                )}
              </div>

              {/* Beneficiary Name Inquiry Badge */}
              {destCardNumber.length === 16 && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {isInquiring ? (
                    <div className="text-gray-400 flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      در حال استعلام هویت دارنده کارت از شاپرک...
                    </div>
                  ) : destHolderName ? (
                    <div className="text-emerald-400 flex items-center gap-1.5 font-bold">
                      <UserCheck className="w-4 h-4" />
                      <span>گیرنده وجه: {destHolderName}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Amount Input with live verbal Persian converter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-300">مبلغ انتقال (تومان):</label>
                <span className="text-xs text-[#d4af37] font-mono">
                  {formatAmount(amount * 10)} ریال
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  value={formatAmount(amount)}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                    setAmount(raw);
                  }}
                  className={`w-full px-4 py-3 rounded-xl font-mono text-xl font-bold tracking-wider text-left border transition-all outline-none ${
                    isDarkTheme
                      ? 'bg-black/40 border-white/15 focus:border-[#d4af37] text-white focus:ring-1 focus:ring-[#d4af37]'
                      : 'bg-gray-50 border-gray-300 focus:border-amber-500 text-gray-900 focus:ring-1 focus:ring-amber-500'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                  تومان
                </span>
              </div>

              {/* Verbal Persian translation */}
              <div className="mt-1.5 text-xs text-[#d4af37] font-medium leading-relaxed">
                {numberToPersianWords(amount)}
              </div>

              {/* Quick Amount Badges */}
              <div className="flex flex-wrap gap-2 mt-2.5">
                {[500000, 1000000, 2000000, 5000000, 10000000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAmount(v);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors ${
                      amount === v
                        ? 'bg-[#d4af37] text-black border-[#d4af37]'
                        : isDarkTheme
                        ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    +{formatAmount(v)}
                  </button>
                ))}
              </div>
            </div>

            {/* Description / بابت */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">بابت / شرح تراکنش:</label>
              <select
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none ${
                  isDarkTheme
                    ? 'bg-black/40 border-white/15 text-gray-200 focus:border-[#d4af37]'
                    : 'bg-gray-50 border-gray-300 text-gray-800 focus:border-amber-500'
                }`}
              >
                <option value="انتقال وجه شخصی">انتقال وجه شخصی</option>
                <option value="تسویه حساب و خرید کالا">تسویه حساب و خرید کالا</option>
                <option value="اجاره بها و مسکن">اجاره بها و مسکن</option>
                <option value="دستمزد و حق‌الزحمه">دستمزد و حق‌الزحمه</option>
                <option value="قرض‌الحسنه و هدیه">قرض‌الحسنه و هدیه</option>
                <option value="هزینه‌های درمانی و متفرقه">هزینه‌های درمانی و متفرقه</option>
              </select>
            </div>

            {/* Security Grid: CVV2, Expiry & OTP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
              {/* CVV2 */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">کد امنیتی (CVV2):</label>
                <input
                  type="password"
                  dir="ltr"
                  maxLength={4}
                  value={cvv2}
                  onFocus={() => setIsCardFlipped(true)}
                  onBlur={() => setIsCardFlipped(false)}
                  onChange={(e) => setCvv2(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••"
                  className={`w-full px-3 py-2.5 rounded-xl font-mono text-center text-sm border outline-none ${
                    isDarkTheme
                      ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-500'
                  }`}
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">تاریخ انقضا (ماه / سال):</label>
                <div className="flex items-center gap-1" dir="ltr">
                  <input
                    type="text"
                    maxLength={2}
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, ''))}
                    placeholder="MM"
                    className={`w-1/2 px-2 py-2.5 rounded-xl font-mono text-center text-sm border outline-none ${
                      isDarkTheme
                        ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-500'
                    }`}
                  />
                  <span className="text-gray-400">/</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value.replace(/\D/g, ''))}
                    placeholder="YY"
                    className={`w-1/2 px-2 py-2.5 rounded-xl font-mono text-center text-sm border outline-none ${
                      isDarkTheme
                        ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              {/* Dynamic OTP */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 mb-1">رمز پویا (یکبارمصرف):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className={`w-full px-2 py-2.5 rounded-xl font-mono text-center text-sm border outline-none ${
                      isDarkTheme
                        ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={otpTimer > 0}
                    onClick={handleRequestOtp}
                    className={`px-2.5 py-2.5 rounded-xl text-[10px] font-bold whitespace-nowrap border transition-all ${
                      otpTimer > 0
                        ? 'bg-white/5 border-white/10 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-black font-extrabold hover:shadow-md'
                    }`}
                  >
                    {otpTimer > 0 ? `${otpTimer}s` : 'دریافت رمز'}
                  </button>
                </div>
              </div>
            </div>

            {/* Fee and Summary Box */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                isDarkTheme ? 'bg-black/30 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'
              }`}
            >
              <div>
                <span>کارمزد انتقال شتابی: </span>
                <span className="font-mono font-bold text-[#d4af37]">{formatAmount(shetabFee)} تومان</span>
              </div>
              <div className="font-bold">
                <span>مجموع کسر از حساب: </span>
                <span className="font-mono text-sm text-emerald-400">{formatAmount(totalDeduction)} تومان</span>
              </div>
            </div>

            {/* Submit Luxury Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                isProcessing
                  ? 'bg-gray-600 text-gray-300 cursor-wait'
                  : 'bg-gradient-to-r from-[#aa820a] via-[#d4af37] to-[#ffd700] text-black hover:brightness-110 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>در حال برقراری ارتباط با سوییچ شتاب و تایید شاپرک...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 -rotate-45" />
                  <span>تایید و انتقال آنی وجه ({formatAmount(amount)} تومان)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
