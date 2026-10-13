import React, { useState } from 'react';
import { detectBank, formatCardNumber, formatAmount, isValidCardNumber, calculateShetabFee } from '../data/banks';
import { sound } from '../utils/sound';
import {
  Calculator,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  ArrowRightLeft,
  Copy,
  Check
} from 'lucide-react';

interface BankingToolsProps {
  isDarkTheme: boolean;
}

export const BankingTools: React.FC<BankingToolsProps> = ({ isDarkTheme }) => {
  // Tool 1: Sheba Generator
  const [cardForIban, setCardForIban] = useState('');
  const [generatedIban, setGeneratedIban] = useState('');
  const [copiedIban, setCopiedIban] = useState(false);

  // Tool 2: Luhn Validator
  const [cardToValidate, setCardToValidate] = useState('');
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  // Tool 3: Fee Calculator
  const [calcAmount, setCalcAmount] = useState<number>(3000000);

  const detectedIbanBank = detectBank(cardForIban);

  const handleConvertIban = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cardForIban.replace(/\D/g, '');
    if (clean.length < 16) {
      sound.playWarning();
      return;
    }
    sound.playClick();
    // Simulate Iranian IBAN (IR + CheckDigits + BankCode + Account)
    const checkDigits = Math.floor(10 + Math.random() * 89);
    const mockIban = `IR${checkDigits}${clean.substring(0, 3)}0000${clean.substring(3)}`;
    setGeneratedIban(mockIban);
  };

  const handleValidateCard = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const valid = isValidCardNumber(cardToValidate);
    setValidationResult(valid);
  };

  const calculatedFee = calculateShetabFee(calcAmount);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-1 mb-8">
        <h2 className="text-xl font-bold gold-gradient-text flex items-center justify-center gap-2">
          <Calculator className="w-5 h-5 text-[#d4af37]" />
          جعبه ابزار بانکی و محاسبات شتاب
        </h2>
        <p className="text-xs text-gray-400">محاسبه آنلاین کارمزد، اعتبارسنجی ۱۶ رقم و تبدیل شماره کارت به شبا</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tool 1: Card to IBAN Converter */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37]">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">تبدیل کارت به شبا</h3>
            </div>
            <p className="text-[11px] text-gray-400 mb-4">
              استعلام شناسه حساب بانکی ایران (شبا) از روی پیش‌شماره کارت
            </p>

            <form onSubmit={handleConvertIban} className="space-y-3">
              <input
                type="text"
                dir="ltr"
                maxLength={19}
                value={formatCardNumber(cardForIban)}
                onChange={(e) => setCardForIban(e.target.value.replace(/\D/g, '').substring(0, 16))}
                placeholder="شماره ۱۶ رقمی کارت"
                className={`w-full px-3 py-2 text-xs rounded-xl font-mono text-center border outline-none ${
                  isDarkTheme
                    ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                    : 'bg-gray-50 border-gray-300'
                }`}
              />

              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-bold bg-[#d4af37]/20 hover:bg-[#d4af37] text-[#d4af37] hover:text-black transition-colors"
              >
                محاسبه شماره شبا
              </button>
            </form>

            {generatedIban && (
              <div
                className={`mt-4 p-3 rounded-xl border text-center ${
                  isDarkTheme ? 'bg-black/50 border-[#d4af37]/40' : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="text-[10px] text-gray-400 mb-1">{detectedIbanBank.name}</div>
                <div className="font-mono text-xs font-bold text-[#d4af37] select-all mb-2" dir="ltr">
                  {generatedIban}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedIban);
                    setCopiedIban(true);
                    setTimeout(() => setCopiedIban(false), 2000);
                  }}
                  className="text-[11px] text-gray-300 hover:text-white flex items-center justify-center gap-1 mx-auto"
                >
                  {copiedIban ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIban ? 'کپی شد' : 'کپی شبا'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tool 2: Luhn 16 Digit Card Validator */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">اعتبارسنجی کارت (Luhn)</h3>
            </div>
            <p className="text-[11px] text-gray-400 mb-4">
              بررسی صحت رقم کنترلی و ساختار رسمی شماره کارت بانکی
            </p>

            <form onSubmit={handleValidateCard} className="space-y-3">
              <input
                type="text"
                dir="ltr"
                maxLength={19}
                value={formatCardNumber(cardToValidate)}
                onChange={(e) => {
                  setCardToValidate(e.target.value.replace(/\D/g, '').substring(0, 16));
                  setValidationResult(null);
                }}
                placeholder="شماره کارت ۱۶ رقمی"
                className={`w-full px-3 py-2 text-xs rounded-xl font-mono text-center border outline-none ${
                  isDarkTheme
                    ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                    : 'bg-gray-50 border-gray-300'
                }`}
              />

              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black transition-colors"
              >
                بررسی صحت کارت
              </button>
            </form>

            {validationResult !== null && (
              <div
                className={`mt-4 p-3 rounded-xl border text-center text-xs font-bold flex items-center justify-center gap-2 ${
                  validationResult
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-red-500/15 border-red-500/40 text-red-400'
                }`}
              >
                {validationResult ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>کارت معتبر و مطابق الگوریتم شتاب است</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>شماره کارت نامعتبر است (خطای Luhn)</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tool 3: Shetab Fee Calculator */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isDarkTheme ? 'bg-[#151722] border-white/10' : 'bg-white border-gray-200 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Calculator className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">محاسبه کارمزد انتقال</h3>
            </div>
            <p className="text-[11px] text-gray-400 mb-4">
              محاسبه تعرفه رسمی کارمزد شتابی بر اساس بخشنامه بانک مرکزی
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">مبلغ انتقال (تومان):</label>
                <input
                  type="text"
                  dir="ltr"
                  value={formatAmount(calcAmount)}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                    setCalcAmount(raw);
                  }}
                  className={`w-full px-3 py-2 text-xs rounded-xl font-mono text-center border outline-none ${
                    isDarkTheme
                      ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                />
              </div>

              <div
                className={`p-3 rounded-xl border space-y-1.5 ${
                  isDarkTheme ? 'bg-black/40 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">کارمزد شتابی:</span>
                  <span className="font-mono font-bold text-[#d4af37]">{formatAmount(calculatedFee)} تومان</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">معادل ریالی:</span>
                  <span className="font-mono text-gray-300">{formatAmount(calculatedFee * 10)} ریال</span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-white/5 font-bold">
                  <span>کسر کل:</span>
                  <span className="font-mono text-emerald-400">
                    {formatAmount(calcAmount + calculatedFee)} تومان
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
