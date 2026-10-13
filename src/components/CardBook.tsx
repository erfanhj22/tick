import React, { useState } from 'react';
import type { ContactCard } from '../types';
import { detectBank, formatCardNumber } from '../data/banks';
import { sound } from '../utils/sound';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Send,
  CreditCard as CardIcon,
  Tag,
  User,
  X
} from 'lucide-react';


interface CardBookProps {
  contacts: ContactCard[];
  isDarkTheme: boolean;
  onAddContact: (contact: ContactCard) => void;
  onDeleteContact: (id: string) => void;
  onSelectForTransfer: (contact: ContactCard) => void;
}

export const CardBook: React.FC<CardBookProps> = ({
  contacts,
  isDarkTheme,
  onAddContact,
  onDeleteContact,
  onSelectForTransfer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Contact Form
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newHolderName, setNewHolderName] = useState('');
  const [newNote, setNewNote] = useState('');

  const detectedBank = detectBank(newCardNumber);

  const filteredContacts = contacts.filter(
    (c) =>
      c.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cardNumber.includes(searchTerm) ||
      (c.note && c.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.bankName.includes(searchTerm)
  );

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardNumber.length !== 16 || !newHolderName.trim()) {
      sound.playWarning();
      return;
    }

    sound.playClick();
    const newContact: ContactCard = {
      id: `c-${Date.now()}`,
      cardNumber: formatCardNumber(newCardNumber),
      holderName: newHolderName.trim(),
      bankName: detectedBank.name,
      note: newNote.trim() || undefined,
      createdAt: new Date().toLocaleDateString('fa-IR'),
    };

    onAddContact(newContact);
    setIsModalOpen(false);
    setNewCardNumber('');
    setNewHolderName('');
    setNewNote('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header & Search Bar */}
      <div
        className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDarkTheme ? 'bg-[#12131c]/90 border-white/10' : 'bg-white border-gray-200 shadow-sm'
        }`}
      >
        <div className="space-y-1 text-center sm:text-right">
          <h2 className="text-xl font-bold gold-gradient-text flex items-center justify-center sm:justify-start gap-2">
            <BookOpen className="w-5 h-5 text-[#d4af37]" />
            دفترچه کارت‌ها و مخاطبین برگزیده
          </h2>
          <p className="text-xs text-gray-400">مدیریت کارت‌های پرکاربرد جهت انتقال وجه سریع با یک کلیک</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی نام، شماره کارت یا بانک..."
              className={`w-full pr-9 pl-3 py-2 text-xs rounded-xl border outline-none ${
                isDarkTheme
                  ? 'bg-black/30 border-white/15 text-white focus:border-[#d4af37]'
                  : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-500'
              }`}
            />
          </div>

          {/* Add Contact Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-black hover:brightness-110 flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن کارت</span>
          </button>
        </div>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDarkTheme ? 'bg-[#12131c]/50 border-white/5 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          <CardIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#d4af37]" />
          <p className="text-sm font-medium">مخاطبی یافت نشد یا هنوز کارتی اضافه نکرده‌اید.</p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 text-xs font-bold text-[#d4af37] border border-[#d4af37]/40 rounded-xl hover:bg-[#d4af37]/10"
          >
            افزودن اولین مخاطب
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-5 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between ${
                isDarkTheme
                  ? 'bg-[#151722] border-white/10 hover:border-[#d4af37]/60 hover:shadow-[0_8px_25px_rgba(212,175,55,0.1)] text-white'
                  : 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-md text-gray-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{contact.holderName}</h4>
                      <span className="text-[11px] text-[#d4af37] font-semibold">{contact.bankName}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onDeleteContact(contact.id);
                    }}
                    title="حذف مخاطب"
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Card Number */}
                <div
                  dir="ltr"
                  className={`p-2.5 rounded-xl font-mono text-center text-sm font-bold tracking-widest my-3 border ${
                    isDarkTheme ? 'bg-black/40 border-white/5 text-[#f3e5ab]' : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                >
                  {contact.cardNumber}
                </div>

                {contact.note && (
                  <div className="text-[11px] text-gray-400 flex items-center gap-1 mb-4">
                    <Tag className="w-3 h-3 text-[#d4af37]" />
                    <span>{contact.note}</span>
                  </div>
                )}
              </div>

              {/* Direct Transfer Button */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onSelectForTransfer(contact);
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#d4af37]/15 hover:bg-[#d4af37] text-[#d4af37] hover:text-black border border-[#d4af37]/30 transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <Send className="w-3.5 h-3.5 -rotate-45" />
                <span>انتقال وجه به این کارت</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl relative ${
              isDarkTheme ? 'bg-[#151722] border-[#d4af37]/40 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold gold-gradient-text mb-4">افزودن مخاطب و کارت جدید</h3>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">شماره ۱۶ رقمی کارت:</label>
                <input
                  type="text"
                  dir="ltr"
                  maxLength={19}
                  value={formatCardNumber(newCardNumber)}
                  onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                  placeholder="---- - ---- - ---- - ----"
                  className={`w-full px-4 py-2.5 rounded-xl font-mono text-center text-sm border outline-none ${
                    isDarkTheme
                      ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
                {detectedBank.prefix !== '000000' && (
                  <div className="text-[11px] text-[#d4af37] mt-1 font-bold">
                    بانک شناسایی شده: {detectedBank.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">نام و نام خانوادگی دارنده:</label>
                <input
                  type="text"
                  value={newHolderName}
                  onChange={(e) => setNewHolderName(e.target.value)}
                  placeholder="مثال: علی رضایی"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none ${
                    isDarkTheme
                      ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">یادداشت / برچسب (اختیاری):</label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="مثال: صاحبخانه، همکار، حقوق"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs border outline-none ${
                    isDarkTheme
                      ? 'bg-black/40 border-white/15 text-white focus:border-[#d4af37]'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-black hover:brightness-110 shadow"
                >
                  ذخیره در دفترچه
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
