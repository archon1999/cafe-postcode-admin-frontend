export function errorText(error: unknown): string {
  const response = (error as { response?: { data?: unknown } })?.response?.data;
  const messages = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(messages);
    if (value && typeof value === 'object')
      return Object.entries(value)
        .filter(([key]) => !['code', 'status', 'requestId'].includes(key))
        .flatMap(([, item]) => messages(item));
    return [];
  };
  if (response && typeof response === 'object') return [...new Set(messages(response))].join('\n');
  return error instanceof Error ? error.message : String(error);
}
