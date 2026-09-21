import type { FormulaDefinition } from './index';

export interface FeeShift {
  from: string;
  until: string;
  rate: string;
}
export interface BuilderOptions {
  kind: 'hourly' | 'scheduled';
  hourlyRule: 'prorated' | 'minimum' | 'started';
  percent: string;
  hourlyRate: string;
  shifts: FeeShift[];
  addPercent: boolean;
  rounding: string;
}

const minute = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const clock = (value: number) =>
  `${String(Math.floor((value % 1440) / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

export function splitLastShift(shifts: FeeShift[]): FeeShift[] {
  const last = shifts[shifts.length - 1];
  if (!last) return shifts;
  const duration = (minute(last.until) - minute(last.from) + 1440) % 1440;
  if (duration < 2) return shifts;
  const middle = clock(minute(last.from) + Math.floor(duration / 2));
  return [...shifts.slice(0, -1), { ...last, until: middle }, { ...last, from: middle }];
}

export function builderError(options: BuilderOptions): string | undefined {
  const positive = (value: string) => /^\d+(\.\d+)?$/.test(value) && Number(value) > 0;
  if (!positive(options.rounding) || (options.addPercent && !positive(options.percent))) return 'invalidRate';
  if (options.kind === 'hourly') return positive(options.hourlyRate) ? undefined : 'invalidRate';
  if (options.shifts.length < 2 || options.shifts.length > 12) return 'shiftCoverage';
  const coverage = new Uint8Array(1440);
  for (const shift of options.shifts) {
    if (!positive(shift.rate)) return 'invalidRate';
    if (![shift.from, shift.until].every((time) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return 'invalidShiftTime';
    const start = minute(shift.from),
      end = minute(shift.until);
    if (start === end) return 'invalidShiftTime';
    for (let time = start; time !== end; time = (time + 1) % 1440) coverage[time]++;
  }
  return coverage.every((count) => count === 1) ? undefined : 'shiftCoverage';
}

export function buildFormula(options: BuilderOptions): Pick<FormulaDefinition, 'source' | 'parameters'> {
  const error = builderError(options);
  if (error) throw new Error(error);
  const parameters: Record<string, string> = {};
  let source: string;
  let prefix = '';
  if (options.kind === 'scheduled') {
    const minimum = options.hourlyRule === 'minimum';
    const rates = options.shifts.map((shift, index) => {
      const key = `shift_${index + 1}_rate`;
      parameters[key] = shift.rate;
      return key;
    });
    source = options.shifts
      .map(
        (shift, index) =>
          `minutes_in(${minimum ? 'first_hour_end, calculation.at, ' : ''}"${shift.from}", "${shift.until}") / 60 * ${rates[index]}`,
      )
      .join('\n  + ');
    if (minimum) {
      let arrival = rates[rates.length - 1];
      for (let index = options.shifts.length - 2; index >= 0; index--) {
        const shift = options.shifts[index];
        arrival = `if(time_in(session.started_at, "${shift.from}", "${shift.until}"), ${rates[index]}, ${arrival})`;
      }
      prefix = `let first_hour_rate = ${arrival};\nlet first_hour_end = add_minutes(session.started_at, 60);\nreturn `;
      source = `first_hour_rate + if(duration_minutes <= 60, 0, ${source})`;
    }
  } else {
    parameters.hourly_rate = options.hourlyRate;
    source =
      options.hourlyRule === 'minimum'
        ? 'max(60, duration_minutes) / 60 * hourly_rate'
        : options.hourlyRule === 'started'
          ? 'ceil(duration_minutes / 60) * hourly_rate'
          : 'duration_minutes / 60 * hourly_rate';
  }
  if (options.addPercent) {
    parameters.percent = options.percent;
    source = `(${source}) + subtotal * percent / 100`;
  }
  if (options.rounding !== '1') {
    parameters.rounding_step = options.rounding;
    source = `round_money(${source}, rounding_step)`;
  }
  return { source: prefix + source + (prefix ? ';' : ''), parameters };
}
