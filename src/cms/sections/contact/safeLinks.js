const EMAIL_RE = /^[^\s@<>"'?&]+@[^\s@<>"'?&]+$/;
const EMBED_HOSTS = ['www.google.com', 'maps.google.com'];

export const isSafeEmail = (email) => typeof email === 'string' && EMAIL_RE.test(email);

// CMS-editable map embed: only https Google Maps hosts, else the supplied default.
export const safeEmbedUrl = (value, fallback) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && EMBED_HOSTS.includes(url.hostname) ? url.href : fallback;
  } catch {
    return fallback;
  }
};
