import 'dayjs/locale/ru';
import 'dayjs/locale/uz';
import 'dayjs/locale/uz-latn';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'shared/utils/dayjs';

import { resolvePickerLocaleText } from './picker-locale-text';
import { useTranslate } from './use-locales';

type Props = {
  children: React.ReactNode;
};

export function LocalizationProvider({ children }: Props) {
  const { currentLang } = useTranslate();

  dayjs.locale(currentLang.adapterLocale);

  return (
    <Provider
      dateAdapter={AdapterDayjs}
      adapterLocale={currentLang.adapterLocale}
      localeText={resolvePickerLocaleText(currentLang.value)}>
      {children}
    </Provider>
  );
}
