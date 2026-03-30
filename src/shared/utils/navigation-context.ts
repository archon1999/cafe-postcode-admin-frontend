import { BACK_LABEL_QUERY_PARAM, BACK_ORIGIN_QUERY_PARAM, BACK_TO_QUERY_PARAM } from 'shared/constants';

type NavigationContext = {
  backLabel?: string | null;
  backTo?: string | null;
  origin?: string | null;
};

type PathLocation = {
  pathname: string;
  search: string;
  hash: string;
};

const normalizeValue = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const resolveCurrentPathFromLocation = (location: PathLocation) => {
  return `${location.pathname}${location.search}${location.hash}`;
};

export const appendNavigationContext = (href: string, context: NavigationContext) => {
  const backTo = normalizeValue(context.backTo);
  const origin = normalizeValue(context.origin);
  const backLabel = normalizeValue(context.backLabel);

  if (!backTo && !origin && !backLabel) {
    return href;
  }

  const [pathWithSearch, ...hashParts] = href.split('#');
  const hash = hashParts.length > 0 ? `#${hashParts.join('#')}` : '';
  const [pathname, search = ''] = pathWithSearch.split('?');
  const searchParams = new URLSearchParams(search);

  if (backTo) {
    searchParams.set(BACK_TO_QUERY_PARAM, backTo);
  }

  if (origin) {
    searchParams.set(BACK_ORIGIN_QUERY_PARAM, origin);
  }

  if (backLabel) {
    searchParams.set(BACK_LABEL_QUERY_PARAM, backLabel);
  }

  const nextSearch = searchParams.toString();
  return `${pathname}${nextSearch ? `?${nextSearch}` : ''}${hash}`;
};
