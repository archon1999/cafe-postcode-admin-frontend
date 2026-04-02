import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { Iconify } from 'shared/ui/Iconify';

type RestaurantManagementAccordionProps = {
  icon: string;
  title: string;
  description: string;
  total: number;
  actionLabel: string;
  onActionClick: () => void;
  children: ReactNode;
  defaultExpanded?: boolean;
};

export function RestaurantManagementAccordion({
  icon,
  title,
  description,
  total,
  actionLabel,
  onActionClick,
  children,
  defaultExpanded = false,
}: RestaurantManagementAccordionProps) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters>
      <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-outline" width={20} />}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          sx={{ width: 1, pr: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
            <Stack
              alignItems="center"
              justifyContent="center"
              sx={(theme) => ({
                width: 40,
                height: 40,
                borderRadius: 1.5,
                color: theme.palette.text.secondary,
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? alpha(theme.palette.common.white, 0.06)
                    : alpha(theme.palette.common.black, 0.04),
                flexShrink: 0,
              })}>
              <Iconify icon={icon} width={22} />
            </Stack>
            <Stack spacing={0.4} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1}>
                <Typography variant="subtitle1">{title}</Typography>
                <Chip size="small" label={total} variant="soft" color="default" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              color="black"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={(event) => {
                event.stopPropagation();
                onActionClick();
              }}
              onFocus={(event) => event.stopPropagation()}>
              {actionLabel}
            </Button>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: { xs: 2, md: 2.5 }, pb: { xs: 2, md: 2.5 } }}>{children}</AccordionDetails>
    </Accordion>
  );
}
