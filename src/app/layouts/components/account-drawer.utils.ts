import type { TFunction } from 'i18next';

import type { CurrentUser } from 'modules/auth/domain/services/current-user';
import type { AdminSessionUser } from 'shared/api/admin-types';
import type { IconifyName } from 'shared/ui/Iconify';
import { formatDate } from 'shared/utils/format-time';

export type AccountDrawerResolvedRole = 'superadmin' | 'productOwner' | 'businessPartner' | 'restaurantAdmin';

export type AccountDrawerRow = {
  label: string;
  value: string;
  icon: IconifyName;
};

export type AccountDrawerContent = {
  resolvedRole: AccountDrawerResolvedRole;
  badgeLabel: string;
  sectionTitle: string;
  rows: AccountDrawerRow[];
};

type TranslationSet = {
  tCommon: TFunction;
};

type AccountDrawerContext = TranslationSet & {
  profile: AdminSessionUser | null | undefined;
  user: CurrentUser | null | undefined;
};

type PartialSessionProfile = Pick<AdminSessionUser, 'isSuperuser' | 'businessPartnerId' | 'restaurantId'>;

function resolveValue(value?: string | null) {
  return value?.trim() ? value : '-';
}

function formatCount(value?: number | null) {
  return typeof value === 'number' ? String(value) : '-';
}

export function resolveAccountDrawerRole(profile?: PartialSessionProfile | null): AccountDrawerResolvedRole {
  if (profile?.isSuperuser) {
    return 'superadmin';
  }

  if (profile?.restaurantId) {
    return 'restaurantAdmin';
  }

  if (profile?.businessPartnerId) {
    return 'businessPartner';
  }

  return 'productOwner';
}

export function buildAccountDrawerContent({ profile, user, tCommon }: AccountDrawerContext): AccountDrawerContent {
  const resolvedRole = resolveAccountDrawerRole(profile);
  const usernameValue = resolveValue(user?.username);
  const phoneValue = resolveValue(user?.phone);
  const tariffValue =
    profile?.tariff?.name ??
    (profile?.activationType === 'custom' ? tCommon('accountDrawer.labels.customTariff') : '-');

  const commonRows: AccountDrawerRow[] = [
    {
      label: tCommon('labels.username'),
      value: usernameValue,
      icon: 'solar:user-bold-duotone',
    },
    {
      label: tCommon('labels.phone'),
      value: phoneValue,
      icon: 'solar:phone-bold-duotone',
    },
  ];

  const roleConfig: Record<AccountDrawerResolvedRole, Omit<AccountDrawerContent, 'resolvedRole'>> = {
    superadmin: {
      badgeLabel: tCommon('accountDrawer.roles.superadmin'),
      sectionTitle: tCommon('accountDrawer.sections.superadmin'),
      rows: commonRows.slice(0, 2),
    },
    productOwner: {
      badgeLabel: tCommon('accountDrawer.roles.productOwner'),
      sectionTitle: tCommon('accountDrawer.sections.productOwner'),
      rows: [
        ...commonRows.slice(0, 2),
        {
          label: tCommon('accountDrawer.labels.businessPartnersCount'),
          value: formatCount(profile?.businessPartnersCount),
          icon: 'solar:users-group-two-rounded-bold-duotone',
        },
      ],
    },
    businessPartner: {
      badgeLabel: tCommon('accountDrawer.roles.businessPartner'),
      sectionTitle: tCommon('accountDrawer.sections.businessPartner'),
      rows: [
        ...commonRows.slice(0, 2),
        {
          label: tCommon('accountDrawer.labels.companyName'),
          value: resolveValue(profile?.companyName),
          icon: 'solar:buildings-3-bold-duotone',
        },
        {
          label: tCommon('accountDrawer.labels.inn'),
          value: resolveValue(profile?.inn),
          icon: 'solar:document-text-bold-duotone',
        },
      ],
    },
    restaurantAdmin: {
      badgeLabel: tCommon('accountDrawer.roles.restaurantAdmin'),
      sectionTitle: tCommon('accountDrawer.sections.restaurantAdmin'),
      rows: [
        ...commonRows.slice(0, 2),
        {
          label: tCommon('accountDrawer.labels.restaurantName'),
          value: resolveValue(profile?.restaurantName),
          icon: 'solar:shop-bold-duotone',
        },
        {
          label: tCommon('accountDrawer.labels.tariff'),
          value: resolveValue(tariffValue),
          icon: 'solar:ticket-sale-bold-duotone',
        },
        {
          label: tCommon('accountDrawer.labels.activatedAt'),
          value: formatDate(profile?.activatedAt),
          icon: 'solar:calendar-bold-duotone',
        },
      ],
    },
  };

  return {
    resolvedRole,
    ...roleConfig[resolvedRole],
  };
}
