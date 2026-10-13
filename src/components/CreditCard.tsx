import React, { useState, useRef } from 'react';
import { detectBank, formatCardNumber } from '../data/banks';
import { Wifi, RotateCw, ShieldCheck } from 'lucide-react';

interface CreditCardProps {
  cardNumber: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvv2: string;
  isFlipped?: boolean;
  onFlipToggle?: () => void;
  isDarkTheme?: boolean;
  customBankName?: string;
  className?: string;
}

export const CreditCard: React.FC<CreditCardProps> = ({
  cardNumber,
  holderName,
  expiryMonth,
  expiryYear,
  cvv2,
  isFlipped = false,
  onFlipToggle,
  isDarkTheme = true,
  customBankName,
  className = '',
}) => {
  const [internalFlip, setInternalFlip] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const bank = detectBank(cardNumber);
  const activeFlip = isFlipped !== undefined ? isFlipped : internalFlip;

  // Handle subtle 3D mouse parallax tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 12;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const toggleFlip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onFlipToggle) {
      onFlipToggle();
    } else {
      setInternalFlip(!internalFlip);
    }
  };

  const displayBankName = customBankName || bank.name;
  const formattedNumber = formatCardNumber(cardNumber || '6037990000000000');

  return (
    <div className={`relative perspective-1000 select-none ${className}`}>
      {/* 3D Wrapper */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="w-full max-w-[420px] aspect-[1.586] mx-auto relative preserve-3d cursor-pointer group"
        onClick={() => toggleFlip()}
      >
        {/* Flip Inner Container */}
        <div
          className={`w-full h-full duration-700 preserve-3d rounded-2xl shadow-2xl transition-transform ${
            activeFlip ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= CARD FRONT ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 backface-hidden overflow-hidden flex flex-col justify-between border ${
              isDarkTheme
                ? 'bg-gradient-to-br from-[#1c1d24] via-[#121319] to-[#08090c] border-[#d4af37]/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
                : 'bg-gradient-to-br from-[#ffffff] via-[#f3f4f8] to-[#e5e7eb] border-[#cbd5e1] shadow-[0_15px_30px_rgba(15,23,42,0.15)] text-gray-900'
            }`}
          >
            {/* Holographic light sheen reflection */}
            <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000" />

            {/* Subtle Royal Bank Watermark */}
            <div className="absolute right-[-20px] bottom-[-25px] text-[120px] font-black opacity-[0.04] pointer-events-none uppercase">
              {bank.logo}
            </div>

            {/* Top Row: Bank Info, NFC, Bank Badge */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {/* Bank Mini Icon / Logo badge */}
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-md border ${
                    isDarkTheme
                      ? 'bg-gradient-to-r from-[#d4af37]/20 to-[#ffd700]/10 border-[#d4af37]/50 text-[#f3e5ab]'
                      : 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-600/40 text-amber-900'
                  }`}
                >
                  {displayBankName}
                </div>
                <span className="text-[10px] text-gray-400 font-mono tracking-wider">{bank.enName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Wifi className={`w-5 h-5 -rotate-90 ${isDarkTheme ? 'text-[#d4af37]' : 'text-gray-700'}`} />
                <button
                  type="button"
                  onClick={toggleFlip}
                  title="چرخش کارت برای مشاهده پشت"
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs text-gray-300"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Middle Row: Gold EMV Chip & Hologram */}
            <div className="flex items-center justify-between my-auto z-10">
              {/* Realistic Gold Chip */}
              <div className="relative w-12 h-9 rounded-md bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#aa820a] p-[1.5px] shadow-md border border-[#ffeeaa]/40">
                <div className="w-full h-full rounded-[4px] bg-[#e6c35c] relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-x-0 h-[1px] bg-[#997300]" />
                  <div className="absolute inset-y-0 w-[1px] bg-[#997300]" />
                  <div className="w-4 h-4 rounded-full border border-[#997300]" />
                </div>
              </div>

              {/* Holographic Security Patch */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-400 to-yellow-300 opacity-70 blur-[0.4px] shadow-inner flex items-center justify-center border border-white/40">
                <ShieldCheck className="w-4 h-4 text-white drop-shadow" />
              </div>
            </div>

            {/* Bottom Section: 16-Digit Number, Holder Name, Expiry */}
            <div className="z-10 space-y-3">
              {/* Card Number with Embossed 3D effect */}
              <div
                dir="ltr"
                className={`font-mono text-xl sm:text-2xl font-bold tracking-[0.2em] text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
                  isDarkTheme ? 'text-[#fff8db]' : 'text-gray-900'
                }`}
              >
                {formattedNumber}
              </div>

              {/* Holder & Expiry */}
              <div className="flex items-end justify-between pt-1">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-gray-400">دارنده کارت</div>
                  <div
                    className={`text-sm sm:text-base font-bold truncate max-w-[200px] ${
                      isDarkTheme ? 'text-gray-100' : 'text-gray-800'
                    }`}
                  >
                    {holderName || 'نام و نام خانوادگی'}
                  </div>
                </div>

                <div className="text-left" dir="ltr">
                  <div className="text-[9px] uppercase tracking-wider text-gray-400">EXP DATE</div>
                  <div className={`font-mono text-xs sm:text-sm font-bold ${isDarkTheme ? 'text-gray-200' : 'text-gray-800'}`}>
                    {(expiryMonth || '00').padStart(2, '0')} / {(expiryYear || '00').padStart(2, '0')}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Shetab Network Badge */}
                  <div className="px-2 py-0.5 rounded text-[10px] font-black bg-white/10 border border-white/20 text-white tracking-widest">
                    SHETAB
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CARD BACK ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden rotate-y-180 overflow-hidden flex flex-col justify-between border ${
              isDarkTheme
                ? 'bg-[#101217] border-[#d4af37]/40 shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
                : 'bg-[#f8fafc] border-[#cbd5e1] shadow-[0_15px_30px_rgba(15,23,42,0.15)] text-gray-900'
            }`}
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-11 bg-[#1a1b1e] mt-5 shadow-inner" />

            {/* Signature & CVV2 Area */}
            <div className="px-6 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>امضای مجاز دارنده کارت</span>
                <span>کد امنیتی (CVV2)</span>
              </div>

              <div className="flex items-center bg-white/90 rounded-md p-2 h-10 border border-gray-300">
                <div className="flex-1 italic text-gray-400 text-xs font-serif select-none line-through tracking-widest">
                  AUTHORIZED SIGNATURE
                </div>
                <div
                  dir="ltr"
                  className="font-mono text-base font-extrabold text-black bg-white px-3 py-1 rounded shadow-inner tracking-widest border border-gray-400"
                >
                  {cvv2 || '•••'}
                </div>
              </div>
            </div>

            {/* Security Legal Text & Customer Support */}
            <div className="px-6 pb-5 pt-2 flex items-center justify-between text-[9px] text-gray-400 border-t border-white/5">
              <div>
                این کارت متعلق به {displayBankName} بوده و یابنده موظف به تحویل آن به نزدیک‌ترین شعبه است.
              </div>
              <button
                type="button"
                onClick={toggleFlip}
                className="flex items-center gap-1 text-[10px] text-[#d4af37] hover:underline"
              >
                <RotateCw className="w-3 h-3" />
                روی کارت
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
