import React, { useRef, useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { generateQRCodeSVG } from '../utils/qrCode';
import { TIERS } from '../services/leadsService';

const { FiUser, FiCheck, FiDownload, FiShare2, FiPrinter, FiCheckCircle } = FiIcons;

/**
 * Format a date to DD/MM/YYYY
 */
const formatDateDDMMYYYY = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-GB');
  return d.toLocaleDateString('en-GB');
};

/**
 * Calculate 1-year expiry date from issue date in DD/MM/YYYY
 */
const getExpiryDateDDMMYYYY = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const exp = isNaN(d.getTime()) ? new Date() : new Date(d);
  exp.setFullYear(exp.getFullYear() + 1);
  return exp.toLocaleDateString('en-GB');
};

/**
 * Virtual Member & Advocate Card Component
 * - Tier 1: White & Gold "Advocate Card" (Authorized Advocate)
 * - Tier 2 & Tier 3: Luxury Navy & Gold "Membership Card" (Movement Champion / Strategic Leader)
 */
const MemberCard = ({
  lead,
  showActions = true,
  className = '',
  id = 'drai-membership-card'
}) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullName = (lead?.full_name || lead?.fullName || 'JANE DOE').toUpperCase();
  const membershipId = lead?.membership_id || lead?.membershipId || 'DRAI-2026-8841';
  const photoUrl = lead?.photo_url_signed || lead?.photo_preview || lead?.photo_url || null;
  const currentTierKey = lead?.tier || 'tier_1';
  const tierConfig = TIERS[currentTierKey] || TIERS.tier_1;
  const isTier1 = currentTierKey === 'tier_1';

  const issueDate = formatDateDDMMYYYY(lead?.tier_1_at || lead?.created_at);
  const expiryDate = getExpiryDateDDMMYYYY(lead?.tier_1_at || lead?.created_at);

  const verificationUrl = `https://doright.ng/verify-member?id=${encodeURIComponent(membershipId)}`;
  const qrCodeDataUri = generateQRCodeSVG(verificationUrl, 160);

  // Helper: Round Rectangle path
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Draw Default Avatar inside photo box
  function drawDefaultAvatar(ctx, x, y, w, h, darkBg = true) {
    ctx.fillStyle = darkBg ? '#1e293b' : '#f1f5f9';
    roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 8);
    ctx.fill();

    // Head
    ctx.fillStyle = darkBg ? '#64748b' : '#94a3b8';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 - 12, 22, 0, Math.PI * 2);
    ctx.fill();

    // Shoulders
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 + 38, 36, Math.PI, 0);
    ctx.fill();

    // "PHOTO" text
    ctx.fillStyle = darkBg ? '#94a3b8' : '#64748b';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO', x + w / 2, y + h - 14);
    ctx.textAlign = 'start';
  }

  // High-Resolution Canvas Exporter for Image/PDF
  const exportToCanvas = async (scale = 3) => {
    const canvas = document.createElement('canvas');
    const width = 540;
    const height = 340;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    if (isTier1) {
      // ==========================================
      // TIER 1: ADVOCATE CARD (WHITE / GOLD THEME)
      // ==========================================

      // 1. Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FFFFFF');
      bgGrad.addColorStop(0.7, '#FDFBF7');
      bgGrad.addColorStop(1, '#FFFBEB');
      ctx.fillStyle = bgGrad;
      roundRect(ctx, 0, 0, width, height, 16);
      ctx.fill();

      // Border outline
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. Top Golden Bar
      const goldGrad = ctx.createLinearGradient(0, 0, width, 0);
      goldGrad.addColorStop(0, '#F59E0B');
      goldGrad.addColorStop(0.5, '#FBBF24');
      goldGrad.addColorStop(1, '#D97706');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(0, 0, width, 7, [16, 16, 0, 0]) : ctx.rect(0, 0, width, 7);
      ctx.fill();

      // 3. Organization Header (Centered)
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('DOING RIGHT AWARENESS INITIATIVE', width / 2, 40);
      ctx.textAlign = 'start';

      // 4. Photo Container (Left)
      const photoX = 28;
      const photoY = 70;
      const photoW = 126;
      const photoH = 168;

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      roundRect(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.stroke();
      ctx.setLineDash([]);

      if (photoUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = photoUrl;
          });
          ctx.save();
          roundRect(ctx, photoX + 2, photoY + 2, photoW - 4, photoH - 4, 10);
          ctx.clip();
          ctx.drawImage(img, photoX + 2, photoY + 2, photoW - 4, photoH - 4);
          ctx.restore();
        } catch {
          drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, false);
        }
      } else {
        drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, false);
      }

      // 5. Center Section: Logo, Name & Designation
      const centerX = 180;

      // Yellow checkmark
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX, 102);
      ctx.lineTo(centerX + 8, 110);
      ctx.lineTo(centerX + 20, 94);
      ctx.stroke();

      // "DO-RIGHT" text
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('DO-RIGHT', centerX + 26, 106);

      // Advocate Full Name
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(fullName, centerX, 150);

      // "AUTHORIZED ADVOCATE" designation
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('AUTHORIZED ADVOCATE', centerX, 185);

      // 6. QR Code (Right Side)
      const qrX = width - 120;
      const qrY = 130;
      const qrSize = 92;

      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, qrX, qrY, qrSize, qrSize, 6);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2;
      ctx.stroke();

      try {
        const qrImg = new Image();
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrCodeDataUri;
        });
        ctx.drawImage(qrImg, qrX + 4, qrY + 4, qrSize - 8, qrSize - 8);
      } catch (e) {
        console.warn('QR canvas render error', e);
      }

      // 7. Bottom Dates Row
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`ISSUE DATE: ${issueDate}`, 28, 305);

      ctx.textAlign = 'right';
      ctx.fillText(`EXPIRY DATE: ${expiryDate}`, width - 28, 305);
      ctx.textAlign = 'start';

    } else {
      // ===============================================
      // TIER 2 & TIER 3: OFFICIAL MEMBERSHIP CARD
      // ===============================================

      // 1. Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a0f1d');
      bgGrad.addColorStop(0.5, '#0f172a');
      bgGrad.addColorStop(1, '#182235');
      ctx.fillStyle = bgGrad;
      roundRect(ctx, 0, 0, width, height, 16);
      ctx.fill();

      // 2. Top Golden Gradient Bar
      const goldGrad = ctx.createLinearGradient(0, 0, width, 0);
      goldGrad.addColorStop(0, '#D97706');
      goldGrad.addColorStop(0.3, '#FBBF24');
      goldGrad.addColorStop(0.7, '#F59E0B');
      goldGrad.addColorStop(1, '#B45309');
      ctx.fillStyle = goldGrad;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(0, 0, width, 6, [16, 16, 0, 0]) : ctx.rect(0, 0, width, 6);
      ctx.fill();

      // 3. Top Left Header
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('DOING RIGHT', 24, 38);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('AWARENESS INITIATIVE', 24, 52);

      // 4. Top Right "DO-RIGHT" pill
      ctx.fillStyle = '#FEF9C3';
      roundRect(ctx, width - 160, 18, 136, 36, 10);
      ctx.fill();
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Checkmark in pill
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(width - 146, 36);
      ctx.lineTo(width - 138, 43);
      ctx.lineTo(width - 124, 28);
      ctx.stroke();

      // "DO-RIGHT" text
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('DO-RIGHT', width - 116, 41);

      // 5. Left Photo Box with Dashed Border
      const photoX = 24;
      const photoY = 82;
      const photoW = 125;
      const photoH = 175;

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      roundRect(ctx, photoX, photoY, photoW, photoH, 12);
      ctx.stroke();
      ctx.setLineDash([]);

      if (photoUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          ctx.save();
          roundRect(ctx, photoX + 2, photoY + 2, photoW - 4, photoH - 4, 10);
          ctx.clip();
          ctx.drawImage(img, photoX + 2, photoY + 2, photoW - 4, photoH - 4);
          ctx.restore();
        } catch {
          drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, true);
        }
      } else {
        drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH, true);
      }

      // 6. Gold Metallic EMV Chip
      const chipX = 175;
      const chipY = 86;
      const chipW = 56;
      const chipH = 42;
      const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      chipGrad.addColorStop(0, '#FDE047');
      chipGrad.addColorStop(0.5, '#F59E0B');
      chipGrad.addColorStop(1, '#D97706');
      ctx.fillStyle = chipGrad;
      roundRect(ctx, chipX, chipY, chipW, chipH, 6);
      ctx.fill();
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Chip seam
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(chipX, chipY + chipH / 2);
      ctx.lineTo(chipX + chipW, chipY + chipH / 2);
      ctx.stroke();

      // 7. Member Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(fullName, 175, 172);

      // 8. Member ID
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 15px "Courier New", Courier, monospace';
      ctx.fillText(`ID: ${membershipId}`, 175, 202);

      // Tier badge subtext
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(tierConfig.name.toUpperCase(), 175, 226);

      // 9. QR Code (Bottom Right)
      const qrX = width - 110;
      const qrY = height - 110;
      const qrSize = 86;

      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, qrX, qrY, qrSize, qrSize, 8);
      ctx.fill();

      try {
        const qrImg = new Image();
        await new Promise((resolve, reject) => {
          qrImg.onload = resolve;
          qrImg.onerror = reject;
          qrImg.src = qrCodeDataUri;
        });
        ctx.drawImage(qrImg, qrX + 4, qrY + 4, qrSize - 8, qrSize - 8);
      } catch (e) {
        console.warn('QR canvas render fallback', e);
      }

      // Dates on bottom
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`VALID THRU: ${expiryDate}`, 175, 252);
    }

    return canvas;
  };

  const handleDownloadImage = async () => {
    try {
      setDownloading(true);
      const canvas = await exportToCanvas(3);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${membershipId}-${isTier1 ? 'advocate-card' : 'membership-card'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col items-center w-full ${className}`}>
      {/* Visual Card Display */}
      {isTier1 ? (
        /* ========================================================================= */
        /* TIER 1: ADVOCATE CARD (Clean White/Gold template matching official design) */
        /* ========================================================================= */
        <div
          id={id}
          ref={cardRef}
          className="w-full max-w-[480px] sm:max-w-[540px] aspect-[1.588] rounded-xl sm:rounded-2xl relative overflow-hidden text-neutral-900 shadow-2xl transition-all duration-300 border border-neutral-200 select-none bg-white"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fefcf7 65%, #fffdf0 100%)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 25px 0 rgba(245, 158, 11, 0.12)'
          }}
        >
          {/* Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />

          {/* Card Content Layer */}
          <div className="p-2.5 xs:p-3.5 sm:p-5 h-full flex flex-col justify-between relative z-10">
            {/* Top Organization Header */}
            <div className="text-center pt-0.5 sm:pt-1">
              <h2 className="text-[10px] xs:text-[12px] sm:text-[16px] md:text-[18px] font-black text-neutral-900 tracking-wider uppercase leading-none font-heading">
                DOING RIGHT AWARENESS INITIATIVE
              </h2>
            </div>

            {/* Middle Row: Photo | Name & Badge | QR */}
            <div className="flex items-center justify-between gap-2 xs:gap-2.5 sm:gap-4 my-auto w-full">
              {/* Left Photo Box with Dashed Gold Border */}
              <div className="w-[28%] max-w-[120px] aspect-[3/4] border-2 border-dashed border-amber-400 rounded-lg sm:rounded-xl overflow-hidden bg-neutral-50 p-0.5 relative flex items-center justify-center shadow-inner flex-shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover rounded-md sm:rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-400">
                    <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-11 sm:h-11 rounded-full bg-neutral-200/80 flex items-center justify-center text-neutral-400 mb-0.5 sm:mb-1">
                      <SafeIcon icon={FiUser} className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[6.5px] xs:text-[7.5px] sm:text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider">
                      PHOTO
                    </span>
                  </div>
                )}
              </div>

              {/* Center Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1 sm:space-y-1.5 px-0.5">
                {/* DO-RIGHT Logo / Badge */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-amber-500 font-extrabold text-[10px] xs:text-xs sm:text-sm">
                  <SafeIcon icon={FiCheck} className="stroke-[3] w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-amber-500" />
                  <span className="text-neutral-900 font-black tracking-wide">DO-RIGHT</span>
                </div>

                {/* Full Name */}
                <div className="text-[12px] xs:text-[14px] sm:text-lg md:text-xl font-black text-neutral-900 tracking-wide uppercase truncate leading-tight font-heading">
                  {fullName}
                </div>

                {/* Subtitle / Role */}
                <div className="text-[8px] xs:text-[9px] sm:text-xs font-bold text-neutral-700 tracking-widest uppercase truncate">
                  AUTHORIZED ADVOCATE
                </div>
              </div>

              {/* Right QR Code Box */}
              <div className="w-[24%] max-w-[86px] aspect-square flex items-center justify-end flex-shrink-0">
                <div className="w-full max-w-[80px] aspect-square bg-white p-1 sm:p-1.5 rounded-lg border-2 border-neutral-900 shadow-sm flex items-center justify-center">
                  <img
                    src={qrCodeDataUri}
                    alt={`Verification QR Code for ${membershipId}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Dates Row */}
            <div className="flex items-center justify-between text-[7px] xs:text-[8px] sm:text-[11px] font-bold text-neutral-900 tracking-wider uppercase pt-1 border-t border-neutral-100/90">
              <div>ISSUE DATE: {issueDate}</div>
              <div>EXPIRY DATE: {expiryDate}</div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* TIER 2 & 3: OFFICIAL MEMBERSHIP CARD (Luxury Navy/Slate & Gold Metallic)  */
        /* ========================================================================= */
        <div
          id={id}
          ref={cardRef}
          className="w-full max-w-[480px] sm:max-w-[540px] aspect-[1.588] rounded-xl sm:rounded-2xl relative overflow-hidden text-white shadow-2xl transition-all duration-300 border border-slate-700/80 select-none"
          style={{
            background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 50%, #1e293b 100%)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px 0 rgba(245, 158, 11, 0.15)'
          }}
        >
          {/* Top Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

          {/* Card Content Layer */}
          <div className="p-2.5 xs:p-3.5 sm:p-6 h-full flex flex-col justify-between relative z-10">
            {/* Top Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] xs:text-xs sm:text-sm md:text-base font-black text-amber-500 tracking-wider leading-none truncate">
                  DOING RIGHT
                </div>
                <div className="text-[7px] xs:text-[8px] sm:text-[10px] font-semibold text-slate-400 tracking-wider mt-0.5 leading-none">
                  AWARENESS INITIATIVE
                </div>
              </div>

              {/* Top Right DO-RIGHT Pill */}
              <div className="bg-yellow-50/95 border border-yellow-300/80 px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-1.5 shadow-sm flex-shrink-0">
                <div className="text-amber-600 font-bold text-xs sm:text-base">
                  <SafeIcon icon={FiCheck} className="stroke-[3] w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-black text-slate-900 tracking-wide">
                  DO-RIGHT
                </span>
              </div>
            </div>

            {/* Middle Body */}
            <div className="flex items-center justify-between gap-1.5 xs:gap-2 sm:gap-4 my-auto w-full min-w-0">
              {/* Left Photo Container with Dashed Golden Border */}
              <div className="w-[27%] max-w-[120px] aspect-[3/4] border border-dashed xs:border-2 border-amber-400/90 rounded-lg sm:rounded-xl overflow-hidden bg-slate-900/60 p-0.5 relative flex items-center justify-center shadow-inner flex-shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover rounded-md sm:rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-11 sm:h-11 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-0.5 sm:mb-1">
                      <SafeIcon icon={FiUser} className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-6 sm:h-6" />
                    </div>
                    <span className="text-[6px] xs:text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      PHOTO
                    </span>
                  </div>
                )}
              </div>

              {/* Center Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1 sm:space-y-2 px-1">
                {/* Metallic Gold Chip */}
                <div
                  className="w-5 h-3.5 xs:w-7 xs:h-4.5 sm:w-11 sm:h-7 rounded-sm xs:rounded-md relative shadow-sm border border-amber-600/60 flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #d97706 100%)'
                  }}
                >
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/25 -translate-y-1/2" />
                </div>

                {/* Full Name */}
                <div className="min-w-0">
                  <div className="text-[10px] xs:text-xs sm:text-sm md:text-base font-black text-white tracking-wide truncate leading-tight">
                    {fullName}
                  </div>
                  <div className="text-[7px] xs:text-[9px] sm:text-xs font-mono font-bold text-amber-400 tracking-wider mt-0.5 truncate">
                    ID: {membershipId}
                  </div>
                </div>

                {/* Tier Pill */}
                <div className="inline-flex min-w-0">
                  <span className={`px-1.5 py-0.5 text-[6.5px] xs:text-[8px] sm:text-[10px] font-bold rounded-full truncate max-w-full ${tierConfig.badgeClass}`}>
                    {tierConfig.label}
                  </span>
                </div>
              </div>

              {/* Bottom Right QR Code */}
              <div className="w-[23%] max-w-[85px] aspect-square flex items-center justify-end flex-shrink-0">
                <div className="w-full max-w-[80px] aspect-square bg-white p-0.5 sm:p-1.5 rounded-md sm:rounded-xl shadow-md border border-slate-200 flex items-center justify-center">
                  <img
                    src={qrCodeDataUri}
                    alt={`Verification QR Code for ${membershipId}`}
                    className="w-full h-full object-contain rounded-sm sm:rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-4 sm:mt-6 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center justify-center gap-2 sm:gap-3 w-full max-w-[540px]">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex-1 min-w-[130px] px-3.5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all inline-flex items-center justify-center gap-2 active:scale-95"
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4" />
            <span>{downloading ? 'Generating...' : isTier1 ? 'Download Advocate Card' : 'Download Membership Card'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all inline-flex items-center justify-center gap-2 active:scale-95"
          >
            <SafeIcon icon={FiPrinter} className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm transition-all inline-flex items-center justify-center gap-1.5 active:scale-95"
          >
            <SafeIcon icon={copied ? FiCheckCircle : FiShare2} className="w-4 h-4 text-emerald-600" />
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
