import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

type CopyableTextCellProps = {
  value?: string | null;
};

export function CopyableTextCell({ value }: CopyableTextCellProps) {
  const { t } = useTranslate('common');
  const displayValue = value || '-';

  if (!value) return <Typography variant="body2">{displayValue}</Typography>;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, width: 1, height: 1 }}>
      <Tooltip title={value} enterDelay={500}>
        <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>
          {value}
        </Typography>
      </Tooltip>
      <Tooltip title={t('actions.copy', { defaultValue: 'Nusxalash' })}>
        <IconButton
          size="small"
          aria-label={t('actions.copy', { defaultValue: 'Nusxalash' })}
          onClick={(event) => {
            event.stopPropagation();
            void navigator.clipboard
              .writeText(value)
              .then(() => toast.success(t('messages.copied', { defaultValue: 'Nusxalandi' })));
          }}
          sx={{ opacity: 0.58, '&:hover': { opacity: 1 } }}>
          <Iconify icon="solar:copy-bold-duotone" width={16} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
