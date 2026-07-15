import { useMemo } from 'react';
import { useParams as _useParams } from 'react-router';

export function useParams<ParamsOrKey extends string | Record<string, string | undefined> = string>() {
  const params = _useParams<ParamsOrKey>();

  return useMemo(() => params, [params]);
}
