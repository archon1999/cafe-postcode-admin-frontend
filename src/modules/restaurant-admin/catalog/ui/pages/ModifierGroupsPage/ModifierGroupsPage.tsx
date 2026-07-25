import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { useShowAllBranches } from 'app/layouts/components/branch-scope-columns';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { useAdminRestaurantScopeId } from 'modules/auth';
import type { CatalogModifierGroup } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { formatMoney } from 'shared/utils/format-money';

import { useGetCatalogModifierGroupsQuery } from '../../../application';
import { CatalogModifierGroupForm } from '../../components/CatalogModifierGroupForm';

function ruleLabel(group: CatalogModifierGroup) {
  if (group.minSelections === 1 && group.maxSelections === 1) return 'Majburiy · bitta tanlov';
  if (group.maxSelections === 1) return 'Ixtiyoriy · bitta tanlov';
  return `${group.minSelections}–${group.maxSelections} ta tanlov`;
}

const ModifierGroupsPage = () => {
  const { t } = useTranslate('catalog');
  const restaurantId = useAdminRestaurantScopeId();
  const showBranchName = useShowAllBranches();
  const groupsQuery = useGetCatalogModifierGroupsQuery();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CatalogModifierGroup | null>(null);
  const groups = groupsQuery.data ?? [];

  const openCreate = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading="Xususiyatlar"
        links={[{ name: 'Menyu' }, { name: 'Xususiyatlar' }]}
        action={
          <Button
            variant="contained"
            color="black"
            startIcon={<Icon icon="mingcute:add-line" />}
            disabled={!restaurantId}
            onClick={openCreate}>
            {t('modifiers.newGroup')}
          </Button>
        }
      />
      <ListPageBody>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
            gap: 2.25,
          }}>
          {groupsQuery.isLoading
            ? Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} variant="rounded" height={230} sx={{ borderRadius: '24px' }} />
              ))
            : groups.map((group) => (
                <Box
                  key={group.id}
                  sx={(theme) => ({
                    p: 0.75,
                    borderRadius: '26px',
                    bgcolor: 'background.neutral',
                    boxShadow: `inset 0 0 0 1px ${theme.palette.divider}`,
                    transition: 'transform 360ms cubic-bezier(0.32,0.72,0,1)',
                    '&:hover': { transform: 'translateY(-4px)' },
                  })}>
                  <Box
                    sx={(theme) => ({
                      height: '100%',
                      p: 2.25,
                      borderRadius: '21px',
                      bgcolor: 'background.paper',
                      boxShadow: `0 18px 50px ${theme.palette.common.black}0B, inset 0 1px 0 ${theme.palette.common.white}99`,
                    })}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: '15px',
                              display: 'grid',
                              placeItems: 'center',
                              color: group.isActive ? 'primary.main' : 'text.disabled',
                              bgcolor: group.isActive ? 'primary.lighter' : 'background.neutral',
                            }}>
                            <Icon icon="solar:tuning-square-2-bold-duotone" width={24} />
                          </Box>
                          <Box minWidth={0}>
                            <Typography variant="h6" noWrap>
                              {group.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ruleLabel(group)}
                            </Typography>
                          </Box>
                        </Stack>
                        <IconButton
                          disabled={!restaurantId}
                          onClick={() => {
                            setEditingGroup(group);
                            setDialogOpen(true);
                          }}
                          sx={{ bgcolor: 'background.neutral' }}>
                          <Icon icon="solar:pen-new-square-bold-duotone" width={20} />
                        </IconButton>
                      </Stack>

                      {showBranchName ? (
                        <Typography variant="caption" color="text.secondary">
                          {group.restaurantName || '-'}
                        </Typography>
                      ) : null}

                      <Stack direction="row" spacing={0.75}>
                        <Chip
                          size="small"
                          color={group.isActive ? 'success' : 'default'}
                          variant="soft"
                          label={group.isActive ? 'Faol' : 'Nofaol'}
                        />
                        <Chip size="small" variant="outlined" label={`${group.productCount ?? 0} mahsulot`} />
                      </Stack>

                      <Stack spacing={0.75}>
                        {group.options
                          .filter((option) => option.isActive)
                          .map((option) => (
                            <Stack
                              key={option.id}
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              sx={{ px: 1.25, py: 0.9, borderRadius: '13px', bgcolor: 'background.neutral' }}>
                              <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
                                <Box
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    bgcolor: option.isDefault ? 'primary.main' : 'text.disabled',
                                  }}
                                />
                                <Typography variant="body2" noWrap>
                                  {option.name}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="subtitle2"
                                color={option.priceDelta ? 'primary.main' : 'text.secondary'}>
                                {option.priceDelta ? `+${formatMoney(option.priceDelta)}` : 'Bepul'}
                              </Typography>
                            </Stack>
                          ))}
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              ))}
        </Box>

        {!groupsQuery.isLoading && groups.length === 0 ? (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 10 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '22px',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
              }}>
              <Icon icon="solar:tuning-square-2-bold-duotone" width={32} />
            </Box>
            <Typography variant="h6">{t('modifiers.emptyTitle')}</Typography>
            <Typography color="text.secondary">{t('modifiers.emptyDescription')}</Typography>
            <Button variant="soft" disabled={!restaurantId} onClick={openCreate}>
              {t('modifiers.emptyAction')}
            </Button>
          </Stack>
        ) : null}
      </ListPageBody>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <CatalogModifierGroupForm
          group={editingGroup}
          onCancel={() => setDialogOpen(false)}
          onSuccess={() => setDialogOpen(false)}
        />
      </Dialog>
    </ListPageContent>
  );
};

export default ModifierGroupsPage;
