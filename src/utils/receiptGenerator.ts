import type { Transaction } from '../types';
import { formatAmount, numberToPersianWords } from '../data/banks';

/**
 * Generates an ultra-luxurious, high-resolution PNG receipt on HTML5 Canvas
 * Directly downloadable without external dependencies or CORS issues!
 */
export function generateLuxuryReceiptImage(tx: Transaction, isDarkTheme: boolean = true): string {
  const canvas = document.createElement('canvas');
  const width = 900;
  const height = 1260;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  if (isDarkTheme) {
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#0c0d12');
    bgGradient.addColorStop(0.5, '#12141c');
    bgGradient.addColorStop(1, '#090a0e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle gold mesh pattern
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 40; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else {
    // Platinum light background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(0.5, '#f5f7fa');
    bgGradient.addColorStop(1, '#e9edf4');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Double Royal Gold Border
  ctx.strokeStyle = isDarkTheme ? '#d4af37' : '#997819';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  ctx.strokeStyle = isDarkTheme ? 'rgba(212, 175, 55, 0.3)' : 'rgba(153, 120, 25, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Corner Gold Accents
  const corners = [

    [30, 30],
    [width - 30, 30],
    [30, height - 30],
    [width - 30, height - 30],
  ];
  ctx.fillStyle = isDarkTheme ? '#f3e5ab' : '#b8860b';
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Header Title
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = isDarkTheme ? '#f5d77f' : '#855800';
  ctx.fillText('رسید رسمی انتقال وجه کارت به کارت', width / 2, 110);

  ctx.font = '18px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = isDarkTheme ? '#a0a5b5' : '#5a6275';
  ctx.fillText('سامانه یکپارچه شتاب و پرداخت سلطنتی | Royal Pay VIP', width / 2, 145);

  // Status Badge
  const badgeY = 195;
  const isSuccess = tx.status === 'success';
  ctx.fillStyle = isSuccess ? (isDarkTheme ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7') : 'rgba(239, 68, 68, 0.15)';
  ctx.strokeStyle = isSuccess ? '#22c55e' : '#ef4444';
  ctx.lineWidth = 1.5;
  
  // Rounded badge rect
  const bw = 240, bh = 46, bx = (width - bw) / 2;
  ctx.beginPath();
  ctx.roundRect(bx, badgeY, bw, bh, 23);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 20px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = isSuccess ? '#22c55e' : '#ef4444';
  ctx.fillText(isSuccess ? '✓ تراکنش موفق و تایید شده' : '✕ تراکنش ناموفق', width / 2, badgeY + 30);

  // Amount Showcase Box
  const boxY = 275;
  ctx.fillStyle = isDarkTheme ? '#181b26' : '#ffffff';
  ctx.strokeStyle = isDarkTheme ? 'rgba(212, 175, 55, 0.4)' : '#d0d7de';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(70, boxY, width - 140, 150, 16);
  ctx.fill();
  ctx.stroke();

  ctx.font = '18px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = isDarkTheme ? '#a5abb9' : '#6b7280';
  ctx.fillText('مبلغ انتقال یافته به تومان', width / 2, boxY + 45);

  ctx.font = 'bold 46px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = isDarkTheme ? '#ffffff' : '#111827';
  ctx.fillText(`${formatAmount(tx.amount)} تومان`, width / 2, boxY + 98);

  ctx.font = '16px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = isDarkTheme ? '#d4af37' : '#997819';
  ctx.fillText(numberToPersianWords(tx.amount), width / 2, boxY + 130);

  // Details Table
  const startY = 475;
  const rowHeight = 48;
  const rightX = width - 110;
  const leftX = 110;

  const rows: [string, string][] = [
    ['کد پیگیری شتاب:', tx.trackingCode],
    ['شماره ارجاع (RRN):', tx.referenceNumber],
    ['تاریخ و زمان انجام:', tx.timestamp],
    ['کارت مبدا:', tx.sourceCard],
    ['بانک و مالک مبدا:', `${tx.sourceBank} - ${tx.sourceHolder}`],
    ['کارت مقصد:', tx.destCard],
    ['بانک و دریافت‌کننده:', `${tx.destBank} - ${tx.destHolderName}`],
    ['کارمزد شتابی کسر شده:', `${formatAmount(tx.fee)} تومان`],
    ['مجموع کسر از حساب:', `${formatAmount(tx.amount + tx.fee)} تومان`],
    ['بابت / شرح تراکنش:', tx.description || 'انتقال وجه کارت به کارت'],
  ];

  ctx.font = '19px Vazirmatn, Tahoma, sans-serif';
  rows.forEach(([label, value], idx) => {
    const y = startY + idx * rowHeight;

    // Row separator
    ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(80, y + 15);
    ctx.lineTo(width - 80, y + 15);
    ctx.stroke();

    // Right label
    ctx.textAlign = 'right';
    ctx.fillStyle = isDarkTheme ? '#8d94a5' : '#4b5563';
    ctx.fillText(label, rightX, y);

    // Left value
    ctx.textAlign = 'left';
    ctx.fillStyle = isDarkTheme ? '#f1f3f9' : '#111827';
    ctx.fillText(value, leftX, y);
  });

  // Royal Golden Stamp
  const stampX = width / 2;
  const stampY = 1040;
  ctx.save();
  ctx.translate(stampX, stampY);
  ctx.rotate(-0.08);

  ctx.strokeStyle = isDarkTheme ? 'rgba(212, 175, 55, 0.85)' : '#997819';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = isDarkTheme ? 'rgba(212, 175, 55, 0.4)' : 'rgba(153, 120, 25, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = isDarkTheme ? '#d4af37' : '#997819';
  ctx.font = 'bold 15px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('تاییدیه رسمی شاپرک', 0, -20);
  ctx.font = 'bold 18px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('پرداخت معتبر', 0, 8);
  ctx.font = '12px Vazirmatn, Tahoma, sans-serif';
  ctx.fillText('ROYAL PAY VERIFIED', 0, 32);

  ctx.restore();

  // Footer Note
  ctx.textAlign = 'center';
  ctx.font = '14px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = isDarkTheme ? '#737a8c' : '#6b7280';
  ctx.fillText('این رسید دیجیتال به منزله سند رسمی انتقال وجه بین‌بانکی شبکه شتاب است.', width / 2, 1165);
  ctx.fillText('پشتیبانی ۲۴ ساعته: ۰۲۱-۸۸۸۸۹۹۹۹ | www.royalpay.vip', width / 2, 1195);

  return canvas.toDataURL('image/png');
}

/**
 * Initiates download of generated PNG receipt
 */
export function downloadReceipt(tx: Transaction, isDarkTheme: boolean = true) {
  const dataUrl = generateLuxuryReceiptImage(tx, isDarkTheme);
  if (!dataUrl) return;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `RoyalPay-Receipt-${tx.trackingCode}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Realistic Golden Confetti Particle Burst Effect using HTML5 Canvas
 */
export function fireRoyalConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);

  const colors = ['#d4af37', '#ffd700', '#f3e5ab', '#ffffff', '#e5c07b', '#b8860b'];
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    vrot: number;
    shape: 'rect' | 'circle';
    alpha: number;
  }> = [];

  for (let i = 0; i < 140; i++) {
    particles.push({
      x: w / 2 + (Math.random() - 0.5) * 200,
      y: h / 2 + (Math.random() - 0.5) * 100,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.8) * 22,
      size: Math.random() * 9 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      alpha: 1,
    });
  }

  let frame = 0;
  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    let alive = false;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // Gravity
      p.vx *= 0.98; // Air drag
      p.rotation += p.vrot;
      if (frame > 50) p.alpha -= 0.015;

      if (p.alpha > 0) {
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    frame++;
    if (alive && frame < 150) {
      requestAnimationFrame(animate);
    } else {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  }

  requestAnimationFrame(animate);
}
