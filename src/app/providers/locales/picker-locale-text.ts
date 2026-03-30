import { enUS as enUSDate, ruRU as ruRUDate } from '@mui/x-date-pickers/locales';

import type { LangCode } from './locales-config';

const enDatePickerLocaleText = enUSDate.components.MuiLocalizationProvider.defaultProps.localeText;
const ruDatePickerLocaleText = ruRUDate.components.MuiLocalizationProvider.defaultProps.localeText;

type DatePickerLocaleText = typeof enDatePickerLocaleText;

function getUzViewLabel(view: 'hours' | 'minutes' | 'seconds' | 'meridiem') {
  switch (view) {
    case 'hours':
      return 'soat';
    case 'minutes':
      return 'daqiqa';
    case 'seconds':
      return 'soniya';
    case 'meridiem':
      return 'kun qismi';
    default:
      return view;
  }
}

const uzDatePickerLocaleText: DatePickerLocaleText = {
  ...enDatePickerLocaleText,
  previousMonth: 'Oldingi oy',
  nextMonth: 'Keyingi oy',
  openPreviousView: "Oldingi ko'rinishni ochish",
  openNextView: "Keyingi ko'rinishni ochish",
  calendarViewSwitchingButtonAriaLabel: (view) =>
    view === 'year'
      ? "Yil ko'rinishi ochiq, kalendar ko'rinishiga o'tish"
      : "Kalendar ko'rinishi ochiq, yil ko'rinishiga o'tish",
  start: 'Boshlanish',
  end: 'Tugash',
  startDate: 'Boshlanish sanasi',
  startTime: 'Boshlanish vaqti',
  endDate: 'Tugash sanasi',
  endTime: 'Tugash vaqti',
  cancelButtonLabel: 'Bekor qilish',
  clearButtonLabel: 'Tozalash',
  okButtonLabel: 'OK',
  todayButtonLabel: 'Bugun',
  nextStepButtonLabel: 'Keyingi',
  datePickerToolbarTitle: 'Sanani tanlang',
  dateTimePickerToolbarTitle: 'Sana va vaqtni tanlang',
  timePickerToolbarTitle: 'Vaqtni tanlang',
  dateRangePickerToolbarTitle: "Sana oralig'ini tanlang",
  timeRangePickerToolbarTitle: "Vaqt oralig'ini tanlang",
  clockLabelText: (view, formattedTime) =>
    `${getUzViewLabel(view)} ni tanlang. ${!formattedTime ? 'Vaqt tanlanmagan' : `Tanlangan vaqt ${formattedTime}`}`,
  hoursClockNumberText: (hours) => `${hours} soat`,
  minutesClockNumberText: (minutes) => `${minutes} daqiqa`,
  secondsClockNumberText: (seconds) => `${seconds} soniya`,
  selectViewText: (view) => `${getUzViewLabel(view)} ni tanlang`,
  calendarWeekNumberHeaderLabel: 'Hafta raqami',
  calendarWeekNumberHeaderText: '#',
  calendarWeekNumberAriaLabelText: (weekNumber) => `${weekNumber}-hafta`,
  calendarWeekNumberText: (weekNumber) => `${weekNumber}`,
  openDatePickerDialogue: (formattedDate) =>
    formattedDate ? `Sanani tanlang, tanlangan sana ${formattedDate}` : 'Sanani tanlang',
  openTimePickerDialogue: (formattedTime) =>
    formattedTime ? `Vaqtni tanlang, tanlangan vaqt ${formattedTime}` : 'Vaqtni tanlang',
  openRangePickerDialogue: (formattedRange) =>
    formattedRange ? `Oraliqni tanlang, tanlangan oraliq ${formattedRange}` : 'Oraliqni tanlang',
  fieldClearLabel: 'Tozalash',
  timeTableLabel: 'vaqtni tanlang',
  dateTableLabel: 'sanani tanlang',
  year: 'Yil',
  month: 'Oy',
  day: 'Kun',
  weekDay: 'Hafta kuni',
  hours: 'Soat',
  minutes: 'Daqiqa',
  seconds: 'Soniya',
  meridiem: 'Kun qismi',
  empty: "Bo'sh",
};

export function resolvePickerLocaleText(lang: LangCode) {
  switch (lang) {
    case 'uz':
      return uzDatePickerLocaleText;
    case 'uz-Cyrl':
    case 'ru':
      return ruDatePickerLocaleText;
    default:
      return enDatePickerLocaleText;
  }
}
