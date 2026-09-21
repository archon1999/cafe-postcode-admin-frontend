import type { FormulaDefinition } from './index';

export interface BuilderOptions {
  kind: 'hourly' | 'scheduled';
  hourlyRule: 'prorated' | 'minimum' | 'started';
  percent: string;
  hourlyRate: string;
  dayRate: string;
  nightRate: string;
  from: string;
  until: string;
  addPercent: boolean;
  rounding: string;
}

export function buildFormula(options: BuilderOptions): Pick<FormulaDefinition, 'source' | 'parameters'> {
  const parameters: Record<string, string> = {};
  let source: string;
  if (options.kind === 'scheduled') {
    parameters.day_rate = options.dayRate;
    parameters.night_rate = options.nightRate;
    source = `minutes_in("${options.from}", "${options.until}") / 60 * day_rate\n  + minutes_in("${options.until}", "${options.from}") / 60 * night_rate`;
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
  return { source, parameters };
}
