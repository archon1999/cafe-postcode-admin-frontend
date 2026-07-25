import { Box, Stack, Typography } from '@mui/material';

import { useTranslate } from 'app/providers/locales';

import type { PrintTemplateBlock, PrintTemplateLayout } from '../../domain';

type PrintTemplatePreviewProps = {
  layout: PrintTemplateLayout;
  sampleData: Record<string, unknown>;
  showTitle?: boolean;
};

function readPath(data: Record<string, unknown>, path: string, item?: Record<string, unknown>) {
  if (path.startsWith('item.')) {
    return path
      .slice(5)
      .split('.')
      .reduce<unknown>(
        (value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined),
        item,
      );
  }
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined),
      data,
    );
}

function resolveText(template: string | undefined, data: Record<string, unknown>, item?: Record<string, unknown>) {
  return String(template ?? '').replace(/{{\s*([a-zA-Z][a-zA-Z0-9_.]*)\s*}}/g, (_match, path: string) => {
    const value = readPath(data, path, item);
    return value === null || value === undefined ? '' : String(value);
  });
}

function formatValue(value: string, format?: 'money') {
  if (format !== 'money') {
    return value;
  }
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? new Intl.NumberFormat('uz-UZ').format(amount) : value;
}

function RowBlock({ block, data }: { block: PrintTemplateBlock; data: Record<string, unknown> }) {
  return (
    <Stack spacing={0.35}>
      {(block.rows ?? []).map((row, index) => {
        const value = formatValue(resolveText(row.value, data), row.format);
        if (!value) return null;
        if (row.hideZero && Number(resolveText(row.value, data) || 0) === 0) return null;
        return (
          <Stack key={`${block.id}-${index}`} direction="row" justifyContent="space-between" spacing={1}>
            <Typography component="span" sx={{ font: 'inherit', fontWeight: row.bold ? 800 : 400 }}>
              {resolveText(row.label, data)}
            </Typography>
            <Typography component="span" sx={{ font: 'inherit', fontWeight: row.bold ? 800 : 400, textAlign: 'right' }}>
              {value}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

function PreviewBlock({ block, data }: { block: PrintTemplateBlock; data: Record<string, unknown> }) {
  const { t } = useTranslate('printing');

  if (block.type === 'divider') {
    return <Box sx={{ borderTop: '1px dashed currentColor', my: 0.75 }} />;
  }
  if (block.type === 'spacer') {
    return <Box sx={{ height: 10 }} />;
  }
  if (block.type === 'feed' || block.type === 'cut') {
    return null;
  }
  if (block.type === 'qr') {
    const value = resolveText(block.value, data);
    if (!value) return null;
    const qrSize = block.qrScale === 2 ? 184 : 92;
    return (
      <Stack
        alignItems={block.align === 'left' ? 'flex-start' : block.align === 'right' ? 'flex-end' : 'center'}
        spacing={0.5}
        sx={{ pt: 2, pb: 1 }}>
        <Box
          sx={{
            width: qrSize,
            height: qrSize,
            border: '8px solid currentColor',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            letterSpacing: 1,
          }}>
          {t('preview.qr')}
        </Box>
        <Typography sx={{ font: 'inherit', fontSize: 9, overflowWrap: 'anywhere', textAlign: 'center' }}>
          {value}
        </Typography>
      </Stack>
    );
  }
  if (block.type === 'metadata' || block.type === 'totals' || block.type === 'two_column_row') {
    return <RowBlock block={block} data={data} />;
  }
  if (block.type === 'items_table') {
    const items = Array.isArray(data.items) ? (data.items as Record<string, unknown>[]) : [];
    return (
      <Stack spacing={0.65} sx={{ fontSize: block.size === 'large' ? 18 : 'inherit' }}>
        <Stack direction="row" spacing={1} sx={{ fontWeight: 700 }}>
          {(block.columns ?? []).map((column, index) => (
            <Box
              key={`${block.id}-header-${index}`}
              sx={{ flex: column.grow ?? 0, minWidth: column.grow ? 0 : 50, textAlign: column.align }}>
              {column.label}
            </Box>
          ))}
        </Stack>
        {items.map((item, itemIndex) => (
          <Box key={`${block.id}-item-${itemIndex}`}>
            <Stack direction="row" spacing={1}>
              {(block.columns ?? []).map((column, columnIndex) => (
                <Box
                  key={`${block.id}-${itemIndex}-${columnIndex}`}
                  sx={{ flex: column.grow ?? 0, minWidth: column.grow ? 0 : 50, textAlign: column.align }}>
                  {formatValue(resolveText(column.value, data, item), column.format)}
                </Box>
              ))}
            </Stack>
            {block.showNotes && item.note ? <Box sx={{ pl: 1, opacity: 0.75 }}>{String(item.note)}</Box> : null}
            {block.showVat && Number(item.vat ?? 0) > 0 ? (
              <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ pl: 1 }}>
                <Box>{resolveText(block.vatLabel ?? 'QQS ({{item.vatPercent}}%)', data, item)}</Box>
                <Box>{formatValue(resolveText(block.vatValue ?? '{{item.vat}}', data, item), 'money')}</Box>
              </Stack>
            ) : null}
            {block.separatorAfterEach ? <Box sx={{ borderTop: '1px dashed currentColor', mt: 0.65 }} /> : null}
          </Box>
        ))}
      </Stack>
    );
  }
  if (block.type === 'text') {
    const value = resolveText(block.text, data);
    if (!value) return null;
    return (
      <Typography
        component="div"
        sx={{
          font: 'inherit',
          fontSize: block.size === 'large' ? 18 : 'inherit',
          fontWeight: block.bold ? 800 : 400,
          textAlign: block.align ?? 'left',
          whiteSpace: 'pre-wrap',
        }}>
        {value}
      </Typography>
    );
  }
  return null;
}

export function PrintTemplatePreview({ layout, sampleData, showTitle = true }: PrintTemplatePreviewProps) {
  const { t } = useTranslate('printing');
  return (
    <Stack spacing={1}>
      {showTitle ? <Typography variant="subtitle1">{t('sections.preview')}</Typography> : null}
      <Box
        sx={{
          width: 410,
          maxWidth: '100%',
          minHeight: 420,
          mx: 'auto',
          p: 2.5,
          color: '#101010',
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
          fontFamily: 'Consolas, "Courier New", monospace',
          fontSize: 12,
          lineHeight: 1.35,
        }}>
        {layout.blocks.map((block) => (
          <PreviewBlock key={block.id} block={block} data={sampleData} />
        ))}
      </Box>
    </Stack>
  );
}
