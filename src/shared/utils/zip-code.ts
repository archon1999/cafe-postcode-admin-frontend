export const ZIP_CODE_MAX_LENGTH = 10;
export const ZIP_CODE_DIGITS_REGEX = /^\d+$/;

export const sanitizeZipCode = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '').slice(0, ZIP_CODE_MAX_LENGTH);
};

export const normalizeZipCode = (value: string | number | null | undefined) => {
  const sanitized = sanitizeZipCode(value);
  return sanitized.length ? sanitized : undefined;
};
