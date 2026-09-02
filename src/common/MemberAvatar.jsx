import React, { useState, useEffect } from 'react';
import supabase from '../lib/supabase';

// In-memory cache for signed URLs to prevent duplicate network calls across list renders
const signedUrlCache = new Map();

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-20 h-20 text-lg',
};

const COLOR_PALETTES = [
  'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700',
  'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-700',
  'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700',
  'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-700',
  'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-700',
  'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-700',
  'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-700',
];

const getDeterministicColor = (text = '') => {
  if (!text) return COLOR_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
};

/**
 * MemberAvatar displays the member's photo as an avatar with graceful fallback to their initial.
 */
const MemberAvatar = ({
  lead = null,
  src = null,
  name = '',
  size = 'md',
  className = '',
  alt = '',
  shape = 'circle', // 'circle' | 'rounded'
}) => {
  const memberName = name || lead?.full_name || lead?.name || lead?.email || 'Member';
  const rawPhoto = src || lead?.photo_url_signed || lead?.photo_preview || lead?.photo_url || null;

  const [imageUrl, setImageUrl] = useState(() => {
    if (!rawPhoto) return null;
    if (rawPhoto.startsWith('http') || rawPhoto.startsWith('blob:') || rawPhoto.startsWith('data:')) {
      return rawPhoto;
    }
    return signedUrlCache.get(rawPhoto) || null;
  });

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);

    if (!rawPhoto) {
      setImageUrl(null);
      return;
    }

    if (rawPhoto.startsWith('http') || rawPhoto.startsWith('blob:') || rawPhoto.startsWith('data:')) {
      setImageUrl(rawPhoto);
      return;
    }

    // Check in-memory cache
    if (signedUrlCache.has(rawPhoto)) {
      setImageUrl(signedUrlCache.get(rawPhoto));
      return;
    }

    // Resolve signed URL for Supabase storage path
    let isCancelled = false;
    supabase.storage
      .from('lead-photos')
      .createSignedUrl(rawPhoto, 3600)
      .then(({ data, error }) => {
        if (isCancelled) return;
        if (!error && data?.signedUrl) {
          signedUrlCache.set(rawPhoto, data.signedUrl);
          setImageUrl(data.signedUrl);
        } else {
          setHasError(true);
        }
      })
      .catch(() => {
        if (!isCancelled) setHasError(true);
      });

    return () => {
      isCancelled = true;
    };
  }, [rawPhoto]);

  const initial = memberName.trim() ? memberName.trim().charAt(0).toUpperCase() : 'M';
  const sizeClasses = SIZE_MAP[size] || size || 'w-9 h-9 text-xs';
  const roundedClass = shape === 'rounded' ? 'rounded-xl' : 'rounded-full';
  const colorClass = getDeterministicColor(memberName);

  if (imageUrl && !hasError) {
    return (
      <div
        className={`${sizeClasses} ${roundedClass} overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 relative border border-gray-200/80 dark:border-gray-700 shadow-xs ${className}`}
      >
        <img
          src={imageUrl}
          alt={alt || memberName}
          onError={() => setHasError(true)}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} ${roundedClass} flex items-center justify-center font-bold flex-shrink-0 select-none border shadow-xs ${colorClass} ${className}`}
      title={memberName}
    >
      <span>{initial}</span>
    </div>
  );
};

export default MemberAvatar;
