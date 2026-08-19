import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import { RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';

import { type CatalogLocalizedNameFormValues, countFilledCatalogNames } from './catalogLocalizedName';

type LanguageTab = 'nameUz' | 'nameUzCrl' | 'nameRu';

type Props = {
  disabled?: boolean;
  translating?: boolean;
  onTranslate: () => void;
  sx?: object;
};

const LANGUAGE_TABS: Array<{ value: LanguageTab; label: string }> = [
  { value: 'nameUz', label: 'O‘zbekcha' },
  { value: 'nameUzCrl', label: 'Ўзбекча' },
  { value: 'nameRu', label: 'Русский' },
];

export function CatalogLocalizedNameFields({ disabled, translating, onTranslate, sx }: Props) {
  const { t } = useTranslate('catalog');
  const [activeTab, setActiveTab] = useState<LanguageTab>('nameUz');
  const { control } = useFormContext<CatalogLocalizedNameFormValues>();
  const [nameUz = '', nameUzCrl = '', nameRu = ''] = useWatch({
    control,
    name: ['nameUz', 'nameUzCrl', 'nameRu'],
  });
  const filledCount = countFilledCatalogNames({ nameUz, nameUzCrl, nameRu });
  const canTranslate = filledCount === 1 && !disabled && !translating;

  return (
    <Box sx={sx}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Tabs
          value={activeTab}
          onChange={(_, value: LanguageTab) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label={t('labels.nameLanguages')}>
          {LANGUAGE_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
        <Tooltip title={filledCount === 1 ? t('actions.translateName') : t('labels.translateOnlyOneLanguage')}>
          <span>
            <IconButton
              color="primary"
              disabled={!canTranslate}
              onClick={onTranslate}
              aria-label={t('actions.translateName')}>
              {translating ? (
                <CircularProgress size={20} />
              ) : (
                <Iconify icon="solar:translation-2-bold-duotone" width={22} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      {LANGUAGE_TABS.map((tab) => (
        <Box key={tab.value} hidden={activeTab !== tab.value} sx={{ pt: 2 }}>
          <RHFTextField<CatalogLocalizedNameFormValues>
            name={tab.value}
            label={`${t('fields.name')} — ${tab.label}`}
            disabled={disabled}
          />
        </Box>
      ))}
    </Box>
  );
}
