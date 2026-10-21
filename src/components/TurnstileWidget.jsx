import React, { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile CAPTCHA Widget
 * Automatically renders Cloudflare Turnstile challenge if site key is configured.
 */
const TurnstileWidget = ({
  siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY,
  onVerify,
  onExpire,
  onError,
  theme = 'auto'
}) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!siteKey) return;

    let isMounted = true;

    // Load Turnstile script dynamically if not already loaded
    const scriptId = 'cloudflare-turnstile-script';
    let script = document.getElementById(scriptId);

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      // Clean up previous widget instance if present
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore cleanup errors
        }
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme,
          callback: (token) => {
            if (isMounted && onVerify) onVerify(token);
          },
          'expired-callback': () => {
            if (isMounted && onExpire) onExpire();
          },
          'error-callback': (err) => {
            console.warn('Turnstile widget error:', err);
            if (isMounted && onError) onError(err);
          }
        });
      } catch (err) {
        console.warn('Turnstile render error:', err);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.turnstile) {
          window.turnstile.ready(renderWidget);
        }
      };
      document.head.appendChild(script);
    } else {
      if (window.turnstile) {
        window.turnstile.ready(renderWidget);
      } else {
        script.addEventListener('load', renderWidget);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [siteKey, theme]);

  if (!siteKey) {
    return null; // Gracefully render nothing if no key is configured yet
  }

  return (
    <div className="flex justify-center my-2.5">
      <div ref={containerRef} className="cf-turnstile-container min-h-[65px]" />
    </div>
  );
};

export default TurnstileWidget;
