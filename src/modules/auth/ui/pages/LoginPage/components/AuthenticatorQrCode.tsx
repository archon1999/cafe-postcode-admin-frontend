import Box from '@mui/material/Box';
import { BrowserQRCodeSvgWriter } from '@zxing/browser';
import { EncodeHintType } from '@zxing/library';
import { useEffect, useRef } from 'react';

const QR_SIZE = 168;

type AuthenticatorQrCodeProps = {
  label: string;
  value: string;
};

export function AuthenticatorQrCode({ label, value }: AuthenticatorQrCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !value) return undefined;

    const hints = new Map<EncodeHintType, string | number>([
      [EncodeHintType.CHARACTER_SET, 'UTF-8'],
      [EncodeHintType.ERROR_CORRECTION, 'M'],
      [EncodeHintType.MARGIN, 4],
    ]);
    const svg = new BrowserQRCodeSvgWriter().write(value, QR_SIZE, QR_SIZE, hints);
    svg.setAttribute('aria-label', label);
    svg.setAttribute('data-testid', 'mfa-enrollment-qr-svg');
    svg.setAttribute('role', 'img');
    svg.style.display = 'block';
    svg.style.height = '100%';
    svg.style.maxWidth = '100%';
    svg.style.width = '100%';
    container.replaceChildren(svg);

    return () => container.replaceChildren();
  }, [label, value]);

  return (
    <Box
      ref={containerRef}
      data-testid="mfa-enrollment-qr"
      sx={{
        width: QR_SIZE,
        height: QR_SIZE,
        p: 0.75,
        bgcolor: 'common.white',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1.5,
        boxShadow: (theme) => theme.customShadows?.card,
      }}
    />
  );
}
