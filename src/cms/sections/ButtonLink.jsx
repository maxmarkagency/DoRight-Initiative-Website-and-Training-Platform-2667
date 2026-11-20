import React from 'react';
import { Link } from 'react-router-dom';

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

const safeExternalHref = (href) => {
  try {
    const url = new URL(href);
    return SAFE_PROTOCOLS.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

// Internal paths ("/join") use the router; safe external links open in a new tab.
// Anything else (javascript:, //host, garbage) renders as plain text so CMS input can't inject script.
const ButtonLink = ({ href = '', className, children }) => {
  // Internal = one leading slash, no backslashes or whitespace (browsers treat "/\host" and "/\t/host" as "//host").
  if (/^\/(?!\/)/.test(href) && !/[\s\\]/.test(href)) return <Link to={href} className={className}>{children}</Link>;
  const safe = safeExternalHref(href);
  if (!safe) return <span className={className}>{children}</span>;
  return <a href={safe} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
};

export default ButtonLink;
