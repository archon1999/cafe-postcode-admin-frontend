import { z } from 'zod';

import {
  PAPER_WIDTH_VALUES,
  PRINTER_CONNECTION_TYPE_VALUES,
  PRINT_MODE_VALUES,
  QR_MODE_VALUES,
  RASTER_FONT_VALUES,
} from './integration-config.mapper';

export const INTEGRATION_KIND_VALUES = ['printer', 'payment', 'fiscal'] as const;

const stringValue = z.preprocess((value) => (value === undefined || value === null ? '' : String(value)), z.string());

export const integrationConfigSchema = z
  .object({
    kind: z.enum(INTEGRATION_KIND_VALUES),
    provider: z.string().min(1),
    isEnabled: z.boolean(),
    connectionType: z.enum(PRINTER_CONNECTION_TYPE_VALUES),
    printerName: stringValue,
    printerHost: stringValue,
    printerPort: stringValue,
    paperWidthMm: z.enum(PAPER_WIDTH_VALUES),
    encoding: z.string(),
    printMode: z.enum(PRINT_MODE_VALUES),
    qrMode: z.enum(QR_MODE_VALUES),
    rasterFont: z.enum(RASTER_FONT_VALUES),
    cutAfterPrint: z.boolean(),
    terminalId: z.string(),
    merchantId: z.string(),
    cashboxId: z.string(),
    taxNumber: z.string(),
    endpointUrl: z.string(),
    timeoutSeconds: z.string(),
    factoryId: z.string(),
    amountMultiplier: z.string(),
    hmacSecret: z.string(),
    apiKey: z.string(),
    paymentQrUrl: z.string(),
  })
  .superRefine((values, ctx) => {
    if (
      values.kind === 'fiscal' &&
      values.taxNumber.trim() &&
      !/^(?:[0-9]{9}|[0-9]{14})$/.test(values.taxNumber.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['taxNumber'],
        message: 'STIR 9 ta yoki JSHSHIR 14 ta raqamdan iborat bo‘lishi kerak',
      });
    }

    if (values.kind === 'printer' && values.provider === 'windows-raw') {
      if (values.connectionType === 'socket') {
        if (!values.printerHost.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['printerHost'],
            message: 'LAN printer IP manzilini kiriting',
          });
        }
        const port = Number(values.printerPort);
        if (values.printerPort.trim() && (!Number.isInteger(port) || port <= 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['printerPort'],
            message: "Printer porti bo'sh yoki musbat butun son bo'lishi kerak",
          });
        }
      } else if (!values.printerName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['printerName'],
          message: 'Printer nomini kiriting',
        });
      }
    }

    if (values.kind === 'payment' && values.provider === 'marta-softpos') {
      const timeoutSeconds = Number(values.timeoutSeconds);
      if (!Number.isInteger(timeoutSeconds) || timeoutSeconds <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['timeoutSeconds'],
          message: "Timeout musbat butun son bo'lishi kerak",
        });
      }

      const amountMultiplier = Number(values.amountMultiplier);
      if (!Number.isInteger(amountMultiplier) || amountMultiplier <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amountMultiplier'],
          message: "Amount multiplier musbat butun son bo'lishi kerak",
        });
      }
    }
  });
