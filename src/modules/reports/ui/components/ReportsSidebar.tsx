import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { useTranslate } from 'app/providers/locales';
import type { AdminReportKey } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';

import type { ReportDefinition } from '../../domain';

type ReportsSidebarProps = {
  reports: ReportDefinition[];
  selectedKey: AdminReportKey;
  onSelect: (reportKey: AdminReportKey) => void;
};

export function ReportsSidebar({ reports, selectedKey, onSelect }: ReportsSidebarProps) {
  const { t } = useTranslate('reports');

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography variant="h4" py={2} px={1}>
        {t('workspace.title')}
      </Typography>
      <List sx={{ p: 0, display: 'grid', gap: 0.75 }}>
        {reports.map((report) => {
          const selected = report.key === selectedKey;

          return (
            <ListItemButton
              key={report.key}
              selected={selected}
              onClick={() => onSelect(report.key)}
              sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: 2.5,
                alignItems: 'flex-start',
                border: (theme) =>
                  `1px solid ${selected ? theme.vars.palette.primary.main : theme.vars.palette.divider}`,
                bgcolor: selected ? 'primary.lighter' : 'background.paper',
              }}>
              <ListItemIcon sx={{ minWidth: 40, mt: 0.25 }}>
                <Iconify icon={report.icon} width={20} sx={{ color: selected ? 'primary.main' : 'text.secondary' }} />
              </ListItemIcon>
              <ListItemText
                primary={t(report.titleKey)}
                primaryTypographyProps={{
                  variant: 'subtitle2',
                  sx: { color: selected ? 'primary.darker' : 'text.primary' },
                }}
              />
              <Chip
                size="small"
                label={report.kind === 'summary' ? t('labels.summary') : t('labels.table')}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'soft' : 'outlined'}
                sx={{ mt: 0.5 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
