import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

/**
 * Cloudflare Turnstile Official Test Key:
 * - 1x00000000000000000000AA: Always passes (renders challenge widget and issues a valid token)
 */
export const CLOUDFLARE_TEST_SITE_KEY = '1x00000000000000000000AA';

/**
 * Cloudflare Turnstile CAPTCHA Widget
 * Safely renders Cloudflare Turnstile challenge using explicit API rendering.
 * Supports imperative reset() via ref, custom themes, and automatic script injection.
 */
const TurnstileWidget = forwardRef(({
  siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || CLOUDFLARE_TEST_SITE_KEY,
  onVerify,
  onExpire,
  onError,
  theme = 'auto',
  size = 'normal',
  className = ''
}, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const isMountedRef = useRef(true);

  // Imperative handle to let parent form trigger reset/removal
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.warn('Turnstile reset warning:', e);
        }
      }
    },
    remove: () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null;
      }
    },
    getWidgetId: () => widgetIdRef.current
  }));

  useEffect(() => {
    isMountedRef.current = true;
    const effectiveSiteKey = siteKey || import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY || CLOUDFLARE_TEST_SITE_KEY;
    if (!effectiveSiteKey) return;

    const scriptId = 'cf-turnstile-script';

    const renderWidget = () => {
      if (!isMountedRef.current || !containerRef.current || !window.turnstile) return;

      // Clean up previous widget instance if one already exists for this container
      if (widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null;
      }

      // Clear container DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: effectiveSiteKey,
          theme,
          size,
          callback: (token) => {
            if (isMountedRef.current && onVerify) {
              onVerify(token);
            }
          },
          'expired-callback': () => {
            if (isMountedRef.current && onExpire) {
              onExpire();
            }
          },
          'error-callback': (err) => {
            console.warn('Turnstile widget error:', err);
            if (isMountedRef.current && onError) {
              onError(err);
            }
          }
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.warn('Turnstile render exception:', err);
      }
    };

    // Load Cloudflare Turnstile script dynamically
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.turnstile) {
          renderWidget();
        } else {
          const pollInterval = setInterval(() => {
            if (window.turnstile) {
              clearInterval(pollInterval);
              renderWidget();
            }
          }, 50);
          setTimeout(() => clearInterval(pollInterval), 4000);
        }
      };

      document.head.appendChild(script);
    } else {
      if (window.turnstile) {
        renderWidget();
      } else {
        const pollInterval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(pollInterval);
            renderWidget();
          }
        }, 50);
        setTimeout(() => clearInterval(pollInterval), 4000);
      }
    }

    return () => {
      isMountedRef.current = false;
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, size]);

  return (
    <div className={`flex justify-center my-3 ${className}`}>
      <div
        ref={containerRef}
        className="cf-turnstile-container min-h-[65px] flex items-center justify-center"
      />
    </div>
  );
});

TurnstileWidget.displayName = 'TurnstileWidget';

export default TurnstileWidget;
