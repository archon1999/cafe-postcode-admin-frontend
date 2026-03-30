import { RHFAutocomplete } from './rhf-autocomplete';
import { RHFCheckbox, RHFMultiCheckbox } from './rhf-checkbox';
import { RHFDatePicker, RHFTimePicker, RHFDateTimePicker } from './rhf-date-picker';
import { RHFRadioGroup } from './rhf-radio-group';
import { RHFRating } from './rhf-rating';
import { RHFSelect, RHFMultiSelect } from './rhf-select';
import { RHFSlider } from './rhf-slider';
import { RHFSwitch, RHFMultiSwitch } from './rhf-switch';
import { RHFTextField } from './rhf-text-field';

export const Field = {
  Select: RHFSelect,
  Switch: RHFSwitch,
  Slider: RHFSlider,
  Rating: RHFRating,
  Text: RHFTextField,
  Checkbox: RHFCheckbox,
  RadioGroup: RHFRadioGroup,
  MultiSelect: RHFMultiSelect,
  MultiSwitch: RHFMultiSwitch,
  Autocomplete: RHFAutocomplete,
  MultiCheckbox: RHFMultiCheckbox,

  DatePicker: RHFDatePicker,
  TimePicker: RHFTimePicker,
  DateTimePicker: RHFDateTimePicker,
};
