import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';
import { formatDateTime } from 'shared/utils/format-time';

import {
  useInventoryAccess,
  useInventoryCommands,
  useInventoryReference,
  useInventoryReport,
} from '../../../../application';
import type { Insight } from '../../../../domain';
import { QueryState, InventorySection, inventoryError } from '../../../shared';

import { InsightEvidence } from './InsightEvidence';

export function InsightsPanel({ warehouse }: { warehouse: string }) {
  const { t } = useTranslate('inventory');
  const { canAnalyze } = useInventoryAccess();
  const query = useInventoryReport('insights', { warehouse });
  const items = useInventoryReference('items');
  const localize = (insight: Insight, field: 'title' | 'detail' | 'recommendation') =>
    t(`rules.${insight.id.split(':')[0]}.${field}`, {
      name: items.data?.find((item) => item.id === insight.item)?.name || insight.title.split(':')[0],
      defaultValue: insight[field],
    });
  const { analyze } = useInventoryCommands();
  const [error, setError] = useState('');
  const analyzeData = async () => {
    setError('');
    try {
      await analyze.mutateAsync(warehouse);
    } catch (cause) {
      setError(inventoryError(cause) || t('insights.aiFailed'));
    }
  };
  return (
    <InventorySection
      title={t('insights.title')}
      help={query.data && !query.data.aiAvailable ? t('insights.aiUnavailable') : undefined}
      plain
      action={
        canAnalyze && (
          <Button
            variant="contained"
            color="black"
            disabled={!query.data?.aiAvailable || analyze.isPending}
            startIcon={<Iconify icon="eva:star-fill" />}
            onClick={() => {
              void analyzeData();
            }}>
            {t(analyze.isPending ? 'insights.analyzing' : 'insights.analyze')}
          </Button>
        )
      }>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {analyze.data && (
        <Box sx={{ p: 2.5, mb: 3, bgcolor: 'background.neutral', borderRadius: 2 }}>
          <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 2 }}>
            <Iconify icon="eva:star-fill" />
            <Typography variant="h6">{t('insights.aiAnalysis')}</Typography>
          </Stack>
          <Typography sx={{ mb: 2 }}>{analyze.data.summary}</Typography>
          <Stack spacing={2}>
            {analyze.data.recommendations.map((recommendation, index) => (
              <Box key={index}>
                <Typography variant="subtitle1">{recommendation.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {recommendation.detail}
                </Typography>
                <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  {recommendation.evidenceIds.map((id) => {
                    const source = query.data?.items.find((item) => item.id === id);
                    return source ? (
                      <Link key={id} href={`#inventory-insight-${id}`} variant="caption">
                        {localize(source, 'title')}
                      </Link>
                    ) : null;
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {formatDateTime(analyze.data.generatedAt)}
          </Typography>
        </Box>
      )}
      <QueryState query={query} empty={!query.data?.items.length}>
        <Stack spacing={2}>
          {query.data?.items.map((insight) => (
            <Box
              key={insight.id}
              id={`inventory-insight-${insight.id}`}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: { xs: 2, md: 2.5 },
                scrollMarginTop: 16,
                overflowWrap: 'anywhere',
              }}>
              <Stack direction="row" gap={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  size="small"
                  color={
                    insight.severity === 'critical' ? 'error' : insight.severity === 'warning' ? 'warning' : 'info'
                  }
                  label={t(`severity.${insight.severity}`)}
                />
                <Typography variant="subtitle1">{localize(insight, 'title')}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {localize(insight, 'detail')}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1.5 }}>
                {localize(insight, 'recommendation')}
              </Typography>
              <Accordion
                elevation={0}
                disableGutters
                sx={{
                  mt: 2,
                  bgcolor: 'background.neutral',
                  borderRadius: '8px !important',
                  '& .MuiAccordionSummary-root': { px: 2, minHeight: 48 },
                  '& .MuiAccordionSummary-content': { my: 1.5, mr: 1 },
                  '& .MuiAccordionDetails-root': { px: 2, pt: 0.5, pb: 2 },
                }}>
                <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                  <Typography variant="caption">{t('insights.evidence')}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <InsightEvidence evidence={insight.evidence} />
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}
        </Stack>
        {query.data && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            {t('insights.generatedAt')}: {formatDateTime(query.data.generatedAt)}
          </Typography>
        )}
      </QueryState>
    </InventorySection>
  );
}
