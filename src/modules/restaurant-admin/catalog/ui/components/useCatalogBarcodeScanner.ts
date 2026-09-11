import { useEffect, useRef } from 'react';

/** Keyboard scanners terminate a rapid sequence with Enter, as in the POS. */
export function useCatalogBarcodeScanner(enabled: boolean, onScan: (barcode: string) => void) {
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);
  useEffect(() => {
    if (!enabled) return;
    let buffer = '';
    let lastKeyAt = 0;
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')
      ) {
        buffer = '';
        return;
      }
      if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
        buffer = '';
        return;
      }
      const now = Date.now();
      if (now - lastKeyAt > 120) buffer = '';
      lastKeyAt = now;
      if (event.key === 'Enter') {
        if (/^(?:[0-9]{8}|[0-9]{12,14})$/.test(buffer)) {
          event.preventDefault();
          onScanRef.current(buffer);
        }
        buffer = '';
      } else if (/^[0-9]$/.test(event.key)) {
        if (buffer.length < 15) buffer += event.key;
      } else {
        buffer = '';
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enabled]);
}
