import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState, type ClipboardEvent } from 'react';

import { useTranslate } from 'app/providers/locales';
import type { CatalogCategory } from 'shared/api/admin-types';
import { SALE_UNIT_IDS, getSaleUnit } from 'shared/domain/sale-units';
import { Iconify } from 'shared/ui/Iconify';

import { useCommitCatalogDraftMutation, useCreateCatalogDraftMutation } from '../../application';
import type { CatalogDraft, CatalogDraftRow } from '../../domain';

import { errorText } from './assistant-errors';
import { CatalogBotLink } from './CatalogBotLink';

type Props = { restaurantId: string | null | undefined; categoryId: string | null; categories: CatalogCategory[] };

export function CatalogAssistant({ restaurantId, categoryId, categories }: Props) {
  const { t } = useTranslate('catalog');
  const currentRestaurant = useRef(restaurantId);
  currentRestaurant.current = restaurantId;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [draft, setDraft] = useState<CatalogDraft | null>(null);
  const [rows, setRows] = useState<CatalogDraftRow[]>([]);
  const [inputError, setInputError] = useState('');
  const create = useCreateCatalogDraftMutation();
  const commit = useCommitCatalogDraftMutation();
  const busy = create.isPending || commit.isPending;
  const saved = Boolean(draft?.committed);
  const selected = rows.filter((row) => row.selected);
  const valid =
    selected.length > 0 &&
    selected.every(
      (row) =>
        row.name.trim() &&
        row.price !== null &&
        Number.isInteger(row.price) &&
        row.price >= 0 &&
        (row.categoryId || (row.categoryName.trim() && /^\d{17}$/.test(row.categoryMxik))),
    );

  useEffect(() => {
    setDraft(null);
    setRows([]);
    setText('');
    setFiles([]);
    setOpen(false);
    setInputError('');
  }, [restaurantId]);

  const addFiles = (incoming: File[]) => {
    if (files.length + incoming.length > 5 || incoming.some((file) => file.size > 10 * 1024 * 1024)) {
      setInputError(t('assistant.fileLimit'));
      return;
    }
    setInputError('');
    setFiles((current) => [...current, ...incoming]);
  };
  const paste = (event: ClipboardEvent) => {
    const pasted = Array.from(event.clipboardData.files);
    if (pasted.length) {
      event.preventDefault();
      addFiles(pasted);
    }
  };
  const update = (index: number, values: Partial<CatalogDraftRow>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...values } : row)));

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="flex-start" flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:magic-stick-3-bold" />}
          disabled={!restaurantId}
          onClick={() => setOpen(true)}>
          {t('assistant.open')}
        </Button>
        <CatalogBotLink />
      </Stack>
      <Dialog open={open} onClose={busy ? undefined : () => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{t('assistant.title')}</DialogTitle>
        <DialogContent onPaste={paste}>
          <Stepper activeStep={saved ? 2 : draft ? 1 : 0} sx={{ my: 2 }}>
            {['input', 'review', 'saved'].map((key) => (
              <Step key={key}>
                <StepLabel>{t(`assistant.${key}`)}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {busy && <LinearProgress sx={{ mb: 2 }} />}
          {!draft ? (
            <Stack spacing={2}>
              <TextField
                autoFocus
                multiline
                minRows={7}
                label={t('assistant.source')}
                value={text}
                placeholder={t('assistant.placeholder')}
                disabled={busy}
                onChange={(event) => setText(event.target.value)}
                slotProps={{ htmlInput: { maxLength: 40000 } }}
              />
              <Button component="label" variant="outlined" disabled={busy}>
                {t('assistant.files')}
                <input
                  hidden
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,.xlsx,.csv,.tsv,.txt"
                  onChange={(event) => {
                    addFiles(Array.from(event.target.files ?? []));
                    event.target.value = '';
                  }}
                />
              </Button>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {files.map((file, index) => (
                  <Chip
                    key={`${file.name}-${index}`}
                    label={file.name}
                    onDelete={busy ? undefined : () => setFiles((current) => current.filter((_, i) => i !== index))}
                  />
                ))}
              </Stack>
            </Stack>
          ) : saved ? (
            <Alert severity="success">{t('assistant.savedCount', { count: draft.result.count })}</Alert>
          ) : (
            <Stack spacing={2}>
              <Box sx={{ overflowX: 'auto' }}>
                <Stack spacing={2}>
                  {rows.map((row, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: row.selected ? 'divider' : 'transparent',
                        borderRadius: 2,
                        opacity: row.selected ? 1 : 0.6,
                      }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Checkbox
                          checked={row.selected}
                          disabled={busy}
                          onChange={(_, selectedValue) => update(index, { selected: selectedValue })}
                          inputProps={{ 'aria-label': t('assistant.selectRow', { index: index + 1 }) }}
                        />
                        <Stack spacing={1.5} flex={1} minWidth={0}>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              fullWidth
                              size="small"
                              label={t('fields.name')}
                              value={row.name}
                              disabled={busy}
                              onChange={(event) => update(index, { name: event.target.value })}
                            />
                            <TextField
                              size="small"
                              label={t('fields.price')}
                              type="number"
                              value={row.price ?? ''}
                              error={row.selected && row.price === null}
                              disabled={busy}
                              onChange={(event) =>
                                update(index, { price: event.target.value === '' ? null : Number(event.target.value) })
                              }
                            />
                            <TextField
                              select
                              size="small"
                              label={t('fields.saleUnit')}
                              value={row.saleUnit}
                              disabled={busy}
                              sx={{ minWidth: 110 }}
                              onChange={(event) => update(index, { saleUnit: event.target.value })}>
                              {SALE_UNIT_IDS.map((unit) => (
                                <MenuItem key={unit} value={unit}>
                                  {t(getSaleUnit(unit).adminLabelKey)}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Stack>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              label={t('fields.category')}
                              value={row.categoryId ?? ''}
                              disabled={busy}
                              onChange={(event) => update(index, { categoryId: event.target.value || null })}>
                              <MenuItem value="">{t('assistant.newCategory')}</MenuItem>
                              {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                  {category.name}
                                </MenuItem>
                              ))}
                            </TextField>
                            <TextField
                              fullWidth
                              size="small"
                              label={t('assistant.russianName')}
                              value={row.nameRu}
                              disabled={busy}
                              onChange={(event) => update(index, { nameRu: event.target.value })}
                            />
                          </Stack>
                          {!row.categoryId && (
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <TextField
                                fullWidth
                                size="small"
                                label={t('assistant.categoryName')}
                                value={row.categoryName}
                                disabled={busy}
                                onChange={(event) => update(index, { categoryName: event.target.value })}
                              />
                              <TextField
                                fullWidth
                                size="small"
                                label={t('fields.mxikCode')}
                                value={row.categoryMxik}
                                disabled={busy}
                                onChange={(event) => update(index, { categoryMxik: event.target.value })}
                              />
                            </Stack>
                          )}
                          <TextField
                            size="small"
                            label={t('fields.description')}
                            value={row.description}
                            disabled={busy}
                            onChange={(event) => update(index, { description: event.target.value })}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {row.evidence}
                          </Typography>
                          {row.warning && <Alert severity="warning">{row.warning}</Alert>}
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
          {inputError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {inputError}
            </Alert>
          )}
          {(create.error || commit.error) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorText(create.error || commit.error)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setOpen(false)}>
            {t('assistant.close')}
          </Button>
          {draft && !saved && (
            <Button
              disabled={busy}
              onClick={() => {
                setDraft(null);
                commit.reset();
                create.reset();
              }}>
              {t('assistant.back')}
            </Button>
          )}
          {!draft && (
            <Button
              variant="contained"
              loading={create.isPending}
              disabled={!restaurantId || (!text.trim() && !files.length)}
              onClick={async () => {
                const result = await create
                  .mutateAsync({ text, files, restaurantId: restaurantId!, categoryId })
                  .catch(() => null);
                if (result && result.restaurantId === currentRestaurant.current) {
                  setDraft(result);
                  setRows(result.rows);
                }
              }}>
              {t('assistant.generate')}
            </Button>
          )}
          {draft && !saved && (
            <Button
              variant="contained"
              loading={commit.isPending}
              disabled={!valid}
              onClick={async () => {
                const result = await commit.mutateAsync({ draft, rows }).catch(() => null);
                if (result && result.restaurantId === currentRestaurant.current) setDraft(result);
              }}>
              {t('assistant.save', { count: selected.length })}
            </Button>
          )}
          {saved && (
            <Button
              onClick={() => {
                setDraft(null);
                setRows([]);
                setText('');
                setFiles([]);
                create.reset();
                commit.reset();
              }}>
              {t('assistant.another')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}
