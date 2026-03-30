import { useEffect } from 'react';

export const useStructuredData = (id: string, data: Record<string, any> | null) => {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const scriptId = `ld-json-${id}`;
    const existing = document.getElementById(scriptId);

    if (!data) {
      if (existing?.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      return;
    }

    const script = existing || document.createElement('script');
    script.id = scriptId;
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);

    if (!existing) {
      document.head.appendChild(script);
    }

    return () => {
      const node = document.getElementById(scriptId);
      if (node?.parentNode) {
        node.parentNode.removeChild(node);
      }
    };
  }, [id, data]);
};
