import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurantPrintTemplates } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import {
  useCreatePrintTemplateVersionMutation,
  usePrintPresetCatalogQuery,
  usePrintTemplatesQuery,
  usePublishPrintTemplateVersionMutation,
} from 'modules/restaurant-admin/printing/application';
import type {
  PrintTemplateBlock,
  PrintTemplateKind,
  PrintTemplateLayout,
} from 'modules/restaurant-admin/printing/domain';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { PrintBlockEditor } from './components/PrintBlockEditor';
import { PrintTemplatePreview } from './components/PrintTemplatePreview';

const TEMPLATE_KINDS: PrintTemplateKind[] = ['kitchen_ticket', 'payment_receipt_plain', 'payment_receipt_fiscal'];

function cloneLayout(layout: PrintTemplateLayout): PrintTemplateLayout {
  return JSON.parse(JSON.stringify(layout)) as PrintTemplateLayout;
}

function newBlock(type: 'text' | 'divider' | 'spacer'): PrintTemplateBlock {
  const id = `custom-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  if (type === 'text') {
    return { id, type, text: 'Yangi matn', align: 'left' };
  }
  return { id, type };
}

export default function PrintTemplatesPage() {
  const { t } = useTranslate('printing');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const templatesQuery = usePrintTemplatesQuery();
  const catalogQuery = usePrintPresetCatalogQuery();
  const createVersionMutation = useCreatePrintTemplateVersionMutation();
  const publishVersionMutation = usePublishPrintTemplateVersionMutation();
  const [selectedKind, setSelectedKind] = useState<PrintTemplateKind>('kitchen_ticket');
  const [selectedPresetKey, setSelectedPresetKey] = useState('legacy_80');
  const [layout, setLayout] = useState<PrintTemplateLayout | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const canManage = canAccessMyRestaurantPrintTemplates(profile);
  const template = useMemo(
    () => templatesQuery.data?.find((item) => item.kind === selectedKind),
    [selectedKind, templatesQuery.data],
  );
  const variables = catalogQuery.data?.variablesByKind[selectedKind] ?? [];
  const selectedBlock = layout?.blocks.find((block) => block.id === selectedBlockId);
  const saving = createVersionMutation.isPending || publishVersionMutation.isPending;
  const visibleBlocks = layout?.blocks.filter((block) => block.type !== 'feed' && block.type !== 'cut') ?? [];

  useEffect(() => {
    if (profile && !canManage) {
      replace(RoutePath.main);
    }
  }, [canManage, profile, replace]);

  useEffect(() => {
    if (!template?.publishedVersion?.layout) return;
    const nextLayout = cloneLayout(template.publishedVersion.layout);
    setLayout(nextLayout);
    setSelectedBlockId(nextLayout.blocks[0]?.id ?? null);
    setSelectedPresetKey(template.publishedVersion.presetKey || 'legacy_80');
  }, [
    template?.id,
    template?.publishedVersion?.id,
    template?.publishedVersion?.layout,
    template?.publishedVersion?.presetKey,
  ]);

  if (profile && !canManage) return null;
  if (templatesQuery.isLoading || catalogQuery.isLoading || !layout || !template || !catalogQuery.data) {
    return <LoadingScreen />;
  }

  const loadPreset = (presetKey: string) => {
    const preset = catalogQuery.data.presets.find((item) => item.key === presetKey);
    if (!preset) return;
    const nextLayout = cloneLayout(preset.templates[selectedKind]);
    setSelectedPresetKey(presetKey);
    setLayout(nextLayout);
    setSelectedBlockId(nextLayout.blocks[0]?.id ?? null);
    toast.success(t('messages.presetLoaded'));
  };

  const updateSelectedBlock = (updated: PrintTemplateBlock) => {
    setLayout((current) =>
      current
        ? { ...current, blocks: current.blocks.map((block) => (block.id === updated.id ? updated : block)) }
        : current,
    );
  };

  const addBlock = (type: 'text' | 'divider' | 'spacer') => {
    const block = newBlock(type);
    setLayout((current) => {
      if (!current) return current;
      const insertAt = current.blocks.findIndex((item) => item.type === 'feed' || item.type === 'cut');
      const blocks = [...current.blocks];
      blocks.splice(insertAt < 0 ? blocks.length : insertAt, 0, block);
      return { ...current, blocks };
    });
    setSelectedBlockId(block.id);
  };

  const moveBlock = (blockId: string, offset: -1 | 1) => {
    setLayout((current) => {
      if (!current) return current;
      const index = current.blocks.findIndex((block) => block.id === blockId);
      const target = index + offset;
      if (index < 0 || target < 0 || target >= current.blocks.length) return current;
      const blocks = [...current.blocks];
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      return { ...current, blocks };
    });
  };

  const removeBlock = (block: PrintTemplateBlock) => {
    if (block.locked || block.role) return;
    setLayout((current) =>
      current ? { ...current, blocks: current.blocks.filter((item) => item.id !== block.id) } : current,
    );
    setSelectedBlockId(null);
  };

  const saveAndPublish = async () => {
    try {
      const version = await createVersionMutation.mutateAsync({
        templateId: template.id,
        payload: { layout, presetKey: selectedPresetKey },
      });
      await publishVersionMutation.mutateAsync({ templateId: template.id, versionId: version.id });
      toast.success(t('messages.published'));
    } catch {
      toast.error(t('messages.publishFailed'));
    }
  };

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('title')}
        action={
          <Button variant="contained" disabled={saving} onClick={() => void saveAndPublish()}>
            {saving ? t('actions.saving') : t('actions.saveAndPublish')}
          </Button>
        }
      />

      <Stack spacing={2.5}>
        <Card>
          <Tabs
            value={selectedKind}
            onChange={(_, value: PrintTemplateKind) => setSelectedKind(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: { xs: 1, sm: 2 } }}>
            {TEMPLATE_KINDS.map((kind) => (
              <Tab key={kind} value={kind} label={t(`kinds.${kind}`)} />
            ))}
          </Tabs>
          <Divider />
          <CardContent>
            <Select
              size="small"
              value={selectedPresetKey}
              onChange={(event) => loadPreset(event.target.value)}
              sx={{ minWidth: 220 }}>
              {catalogQuery.data.presets.map((preset) => (
                <MenuItem key={preset.key} value={preset.key}>
                  {t(`presetNames.${preset.key}`, { defaultValue: preset.name })}
                </MenuItem>
              ))}
            </Select>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 0.8fr) minmax(340px, 1fr) minmax(360px, 1.1fr)' },
            gap: 2,
            alignItems: 'start',
          }}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="subtitle1">{t('sections.blocks')}</Typography>
                <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.75}>
                  <Button size="small" variant="outlined" onClick={() => addBlock('text')}>
                    {t('actions.addText')}
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => addBlock('divider')}>
                    {t('actions.addDivider')}
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => addBlock('spacer')}>
                    {t('actions.addSpacer')}
                  </Button>
                </Stack>
                <List disablePadding>
                  {visibleBlocks.map((block) => {
                    const index = layout.blocks.findIndex((item) => item.id === block.id);
                    const styleSummary =
                      block.type === 'text' || block.type === 'items_table'
                        ? [t(`fontSizes.${block.size ?? 'normal'}`), block.bold ? t('fields.bold') : null]
                            .filter(Boolean)
                            .join(' · ')
                        : undefined;
                    return (
                      <ListItemButton
                        key={block.id}
                        selected={block.id === selectedBlockId}
                        onClick={() => setSelectedBlockId(block.id)}
                        sx={{ borderRadius: 1, pr: 0.5 }}>
                        <ListItemText
                          primary={t(`blockTypes.${block.type}`)}
                          secondary={styleSummary}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                          secondaryTypographyProps={{ noWrap: true }}
                        />
                        <IconButton
                          size="small"
                          disabled={index === 0}
                          aria-label={t('actions.moveUp')}
                          onClick={(event) => {
                            event.stopPropagation();
                            moveBlock(block.id, -1);
                          }}>
                          <Iconify icon="solar:alt-arrow-up-line-duotone" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={index >= layout.blocks.length - 3}
                          aria-label={t('actions.moveDown')}
                          onClick={(event) => {
                            event.stopPropagation();
                            moveBlock(block.id, 1);
                          }}>
                          <Iconify icon="solar:alt-arrow-down-line-duotone" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={Boolean(block.locked || block.role)}
                          aria-label={t('actions.delete')}
                          onClick={(event) => {
                            event.stopPropagation();
                            removeBlock(block);
                          }}>
                          <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                        </IconButton>
                      </ListItemButton>
                    );
                  })}
                </List>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <PrintBlockEditor block={selectedBlock} variables={variables} onChange={updateSelectedBlock} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <PrintTemplatePreview layout={layout} sampleData={catalogQuery.data.sampleData} />
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Content>
  );
}
