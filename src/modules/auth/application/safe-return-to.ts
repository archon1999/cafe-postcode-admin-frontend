export function getSafeAdminReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null;
  }
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin) {
      return null;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getSafeAdminReturnTarget(value: string | null, fragment = window.location.hash): string | null {
  const returnTo = getSafeAdminReturnTo(value);
  if (!returnTo) {
    return null;
  }
  const url = new URL(returnTo, window.location.origin);
  if (url.pathname === '/pair' && !url.hash && fragment.startsWith('#')) {
    return `${returnTo}${fragment}`;
  }
  return returnTo;
}
