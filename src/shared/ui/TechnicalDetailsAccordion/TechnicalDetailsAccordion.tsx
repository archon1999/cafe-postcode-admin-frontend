import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

type TechnicalDetailsAccordionProps = {
  title: string;
  value: unknown;
};

export function TechnicalDetailsAccordion({ title, value }: TechnicalDetailsAccordionProps) {
  const { t } = useTranslate('common');
  const json = JSON.stringify(value ?? {}, null, 2);

  return (
    <Accordion disableGutters elevation={0} sx={{ border: 1, borderColor: 'divider', '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-linear" />}>
        <Stack spacing={0.25}>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('technicalDetails.hint', { defaultValue: "Faqat diagnostika zarur bo'lganda oching" })}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={1.5}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:copy-bold-duotone" />}
            onClick={() =>
              void navigator.clipboard
                .writeText(json)
                .then(() => toast.success(t('messages.copied', { defaultValue: 'Nusxalandi' })))
            }
            sx={{ alignSelf: 'flex-end' }}>
            {t('actions.copyJson', { defaultValue: 'JSON nusxalash' })}
          </Button>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              maxHeight: 360,
              overflow: 'auto',
              borderRadius: 1.5,
              typography: 'body2',
              fontFamily: 'monospace',
              bgcolor: 'background.neutral',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
            {json}
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
