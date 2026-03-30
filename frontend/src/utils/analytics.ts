export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window === 'undefined') return;

  const payload = {
    event: eventName,
    ...params,
  };

  const win = window as any;

  if (typeof win.gtag === 'function') {
    win.gtag('event', eventName, params);
  }

  if (Array.isArray(win.dataLayer)) {
    win.dataLayer.push(payload);
  } else {
    win.dataLayer = [payload];
  }
};
