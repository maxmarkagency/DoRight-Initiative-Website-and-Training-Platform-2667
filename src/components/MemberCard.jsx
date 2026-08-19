import React, { useRef, useState, useEffect } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { generateQRCodeSVG } from '../utils/qrCode';
import { TIERS } from '../services/leadsService';

const { FiUser, FiCheck, FiDownload, FiShare2, FiPrinter, FiCheckCircle } = FiIcons;

/**
 * Virtual Member Card Component
 * Faithfully matches the official DoRight Awareness Initiative Membership Card specification.
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

  const fullName = (lead?.full_name || lead?.fullName || 'MEMBER NAME').toUpperCase();
  const membershipId = lead?.membership_id || lead?.membershipId || 'DRAI-2026-8841';
  const photoUrl = lead?.photo_url_signed || lead?.photo_preview || lead?.photo_url || null;
  const currentTierKey = lead?.tier || 'tier_1';
  const tierConfig = TIERS[currentTierKey] || TIERS.tier_1;

  const verificationUrl = `https://doright.ng/#/verify-member?id=${encodeURIComponent(membershipId)}`;
  const qrCodeDataUri = generateQRCodeSVG(verificationUrl, 160);

  // High-Resolution Canvas Exporter for Image/PDF
  const exportToCanvas = async (scale = 3) => {
    const canvas = document.createElement('canvas');
    const width = 540;
    const height = 340;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // 1. Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#182235');
    ctx.fillStyle = bgGrad;
    
    // Rounded Card Base
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
    ctx.setLineDash([]); // Reset line dash

    // Try loading photo if present
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
        drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH);
      }
    } else {
      drawDefaultAvatar(ctx, photoX, photoY, photoW, photoH);
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

    // Chip center seam
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

    // QR White Box
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

    return canvas;
  };

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

  // Helper: Draw Default Avatar inside photo box
  function drawDefaultAvatar(ctx, x, y, w, h) {
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x + 2, y + 2, w - 4, h - 4, 10);
    ctx.fill();

    // Head
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 - 12, 22, 0, Math.PI * 2);
    ctx.fill();

    // Shoulders
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 + 38, 36, Math.PI, 0);
    ctx.fill();

    // "PHOTO" text
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PHOTO', x + w / 2, y + h - 16);
    ctx.textAlign = 'start';
  }

  const handleDownloadImage = async () => {
    try {
      setDownloading(true);
      const canvas = await exportToCanvas(3); // 3x crisp retina resolution
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${membershipId}-membership-card.png`;
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
    <div className={`flex flex-col items-center ${className}`}>
      {/* The Visual Membership Card */}
      <div
        id={id}
        ref={cardRef}
        className="w-full max-w-[480px] sm:max-w-[540px] aspect-[1.588] rounded-2xl relative overflow-hidden text-white shadow-2xl transition-all duration-300 border border-slate-700/80 select-none"
        style={{
          background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 50%, #1e293b 100%)',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px 0 rgba(245, 158, 11, 0.15)'
        }}
      >
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

        {/* Card Content Layer */}
        <div className="p-4 sm:p-6 h-full flex flex-col justify-between relative z-10">
          {/* Top Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm sm:text-base font-black text-amber-500 tracking-wider">
                DOING RIGHT
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-wider">
                AWARENESS INITIATIVE
              </div>
            </div>

            {/* Top Right DO-RIGHT Pill */}
            <div className="bg-yellow-50/95 border border-yellow-300/80 px-3 sm:px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <div className="text-amber-600 font-bold text-sm sm:text-base">
                <SafeIcon icon={FiCheck} className="stroke-[3]" />
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-wide">
                DO-RIGHT
              </span>
            </div>
          </div>

          {/* Middle Body */}
          <div className="grid grid-cols-12 gap-3 sm:gap-5 items-center my-auto">
            {/* Left Photo Container with Dashed Golden Border */}
            <div className="col-span-4 sm:col-span-4 aspect-[3/4] border-2 border-dashed border-amber-400/90 rounded-xl overflow-hidden bg-slate-900/60 p-0.5 relative flex items-center justify-center shadow-inner">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-1">
                    <SafeIcon icon={FiUser} className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    PHOTO
                  </span>
                </div>
              )}
            </div>

            {/* Center Info */}
            <div className="col-span-5 sm:col-span-5 flex flex-col justify-center space-y-2 sm:space-y-2.5">
              {/* Metallic Gold Chip */}
              <div
                className="w-10 h-7 sm:w-12 sm:h-8 rounded-md relative shadow-sm border border-amber-600/60"
                style={{
                  background: 'linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #d97706 100%)'
                }}
              >
                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/25 -translate-y-1/2" />
              </div>

              {/* Full Name */}
              <div>
                <div className="text-xs sm:text-base font-black text-white tracking-wide truncate leading-tight">
                  {fullName}
                </div>
                <div className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 tracking-wider mt-0.5">
                  ID: {membershipId}
                </div>
              </div>

              {/* Tier Pill */}
              <div className="inline-flex">
                <span className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full ${tierConfig.badgeClass}`}>
                  {tierConfig.label}
                </span>
              </div>
            </div>

            {/* Bottom Right QR Code */}
            <div className="col-span-3 sm:col-span-3 flex justify-end items-end">
              <div className="bg-white p-1 sm:p-1.5 rounded-xl shadow-md border border-slate-200 inline-block">
                <img
                  src={qrCodeDataUri}
                  alt={`Verification QR Code for ${membershipId}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full max-w-[540px]">
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={downloading}
            className="flex-1 min-w-[140px] px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all inline-flex items-center justify-center gap-2"
          >
            <SafeIcon icon={FiDownload} className="w-4 h-4" />
            <span>{downloading ? 'Generating...' : 'Download Card'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all inline-flex items-center gap-2"
          >
            <SafeIcon icon={FiPrinter} className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm transition-all inline-flex items-center gap-1.5"
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
