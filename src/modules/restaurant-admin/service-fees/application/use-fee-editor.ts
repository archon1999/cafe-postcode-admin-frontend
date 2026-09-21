import { useRef, useState } from 'react';

import { FeeAuthoringError, type FeeContext, type FeePolicy, type FeePreview, type FormulaDefinition } from '../domain';

import { useFeeMutations } from './mutations';

export function useFeeEditor(
  policy: FeePolicy | undefined,
  defaultTimezone: string,
  onSaved: (policy: FeePolicy) => void,
) {
  const originalRevision = useRef(policy?.revision);
  const [name, setName] = useState(policy?.name ?? '');
  const [source, setSource] = useState(policy?.definition.source ?? 'duration_minutes / 60 * hourly_rate');
  const [timezone, setTimezone] = useState(policy?.definition.timezone ?? defaultTimezone);
  const [parameters, setParameters] = useState(
    Object.entries(policy?.definition.parameters ?? { hourly_rate: '60000' }),
  );
  const [isActive, setIsActive] = useState(policy?.isActive ?? true);
  const [context, setContext] = useState<FeeContext>({
    subtotal: 500000,
    guestCount: 1,
    startedAt: '2026-09-21T17:30:00+05:00',
    calculatedAt: '2026-09-21T18:30:00+05:00',
  });
  const [result, setResult] = useState<{ fingerprint: string; value: FeePreview }>();
  const [error, setError] = useState<Error>();
  const actions = useFeeMutations();
  const definition: FormulaDefinition = {
    version: 1,
    name,
    source,
    timezone,
    parameters: Object.fromEntries(parameters),
  };
  const fingerprint = JSON.stringify({ definition, parameters, context });
  const latest = useRef(fingerprint);
  latest.current = fingerprint;
  const verified = result?.fingerprint === fingerprint ? result.value : undefined;
  const busy = actions.preview.isPending || actions.save.isPending;

  function apply(value: Pick<FormulaDefinition, 'source' | 'parameters'> & Partial<FormulaDefinition>) {
    setSource(value.source);
    setParameters(Object.entries(value.parameters));
    if (value.name) setName(value.name);
    if (value.timezone) setTimezone(value.timezone);
    setResult(undefined);
    setError(undefined);
  }

  async function preview() {
    const submitted = fingerprint;
    setError(undefined);
    setResult(undefined);
    if (new Set(parameters.map(([key]) => key)).size !== parameters.length) {
      setError(new FeeAuthoringError('Duplicate parameter name.'));
      return;
    }
    try {
      const value = await actions.preview.mutateAsync({ definition, context });
      if (latest.current === submitted) setResult({ fingerprint: submitted, value });
    } catch (cause) {
      if (latest.current === submitted) setError(cause as Error);
    }
  }

  async function save() {
    if (!verified || busy) return;
    setError(undefined);
    try {
      const saved = await actions.save.mutateAsync({
        id: policy?.id,
        name,
        definition: verified.definition,
        isActive,
        expectedRevision: originalRevision.current,
      });
      onSaved(saved);
    } catch (cause) {
      setError(cause as Error);
    }
  }

  return {
    name,
    setName,
    source,
    setSource,
    timezone,
    setTimezone,
    parameters,
    setParameters,
    isActive,
    setIsActive,
    context,
    setContext,
    verified,
    error,
    busy,
    preview,
    save,
    apply,
  };
}
