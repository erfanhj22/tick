import React, { useState } from 'react';
import type { Transaction } from '../types';
import { formatAmount, numberToPersianWords } from '../data/banks';
import { downloadReceipt } from '../utils/receiptGenerator';
import { sound } from '../utils/sound';
import {
  X,
  Download,
  CheckCircle2,
  Printer,
  Copy,
  Check
} from 'lucide-react';


interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  isOpen,
  onClose,
  isDarkTheme,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleDownload = () => {
    sound.playClick();
    downloadReceipt(transaction, isDarkTheme);
  };

  const handleCopyDetails = () => {
    sound.playClick();
    const text = `رسید انتقال وجه شتاب\nکد پیگیری: ${transaction.trackingCode}\nشماره ارجاع: ${
      transaction.referenceNumber
    }\nمبلغ: ${formatAmount(transaction.amount)} تومان\nاز: ${transaction.sourceHolder} (${
      transaction.sourceCard
    })\nبه: ${transaction.destHolderName} (${transaction.destCard})\nزمان: ${
      transaction.timestamp
    }\nسامانه سلطنتی کارت به کارت`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-lg rounded-2xl border p-6 sm:p-8 my-8 shadow-2xl transition-all ${
          isDarkTheme
            ? 'bg-[#12141c] border-[#d4af37]/50 text-white shadow-[0_0_50px_rgba(212,175,55,0.2)]'
            : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Royal Stamp */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] mb-2 shadow-inner">
            <CheckCircle2 className="w-10 h-10 animate-pulse" />
          </div>

          <h2 className="text-2xl font-black gold-gradient-text">رسید رسمی انتقال وجه</h2>
          <p className="text-xs text-gray-400">سامانه یکپارچه شتاب و پرداخت سلطنتی شاپرک</p>

          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mt-1">
            ✓ تراکنش با موفقیت انجام شد
          </div>
        </div>

        {/* Amount Box */}
        <div
          className={`p-4 rounded-xl border text-center mb-6 ${
            isDarkTheme ? 'bg-black/40 border-[#d4af37]/30' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="text-xs text-gray-400">مبلغ انتقال یافته</div>
          <div className="text-3xl font-mono font-black text-[#d4af37] my-1">
            {formatAmount(transaction.amount)} <span className="text-sm font-normal text-gray-300">تومان</span>
          </div>
          <div className="text-xs text-[#d4af37]/90">{numberToPersianWords(transaction.amount)}</div>
        </div>

        {/* Details Table */}
        <div className="space-y-3 text-xs border-y py-4 border-white/10 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">کد پیگیری شتاب:</span>
            <span className="font-mono font-bold text-[#d4af37]">{transaction.trackingCode}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">شماره ارجاع (RRN):</span>
            <span className="font-mono text-gray-300">{transaction.referenceNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">تاریخ و زمان:</span>
            <span className="text-gray-300">{transaction.timestamp}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">کارت مبدا:</span>
            <div className="text-left">
              <span className="font-mono text-gray-200" dir="ltr">{transaction.sourceCard}</span>
              <span className="text-[11px] text-gray-400 block">{transaction.sourceBank} - {transaction.sourceHolder}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">کارت مقصد:</span>
            <div className="text-left">
              <span className="font-mono text-[#d4af37] font-bold" dir="ltr">{transaction.destCard}</span>
              <span className="text-[11px] text-gray-300 block">{transaction.destBank} - {transaction.destHolderName}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">کارمزد شتابی:</span>
            <span className="font-mono text-gray-300">{formatAmount(transaction.fee)} تومان</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">کل کسر شده از حساب:</span>
            <span className="font-mono font-bold text-emerald-400">{formatAmount(transaction.amount + transaction.fee)} تومان</span>
          </div>

          {transaction.description && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">بابت:</span>
              <span className="text-gray-300">{transaction.description}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-black hover:brightness-110 flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Download className="w-4 h-4" />
            <span>دانلود عکس رسید (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyDetails}
            className={`py-3 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-colors ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : isDarkTheme
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>کپی متن</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className={`py-3 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-colors ${
              isDarkTheme
                ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>چاپ رسید</span>
          </button>
        </div>

        {/* Close and new transfer */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full mt-4 py-2.5 text-xs text-gray-400 hover:text-white text-center transition-colors"
        >
          بستن و بازگشت به صفحه اصلی
        </button>
      </div>
    </div>
  );
};
