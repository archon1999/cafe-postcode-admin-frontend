import { Alert, MenuItem, TextField } from '@mui/material';
import { Fragment, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { StorageService } from 'shared/lib/storage';

import { useInventoryAccess, useInventoryReference } from '../../../application';
import { InventoryPageToolsContext, InventorySection, QueryState } from '../../shared';

import { BalancesPanel } from './components/BalancesPanel';
import { DocumentsPanel } from './components/DocumentsPanel';
import { InsightsPanel } from './components/InsightsPanel';
import { RecipesPanel } from './components/RecipesPanel';
import { ReferencesPanel } from './components/ReferencesPanel';
import { ReportsPanel } from './components/ReportsPanel';

type InventorySectionKey =
  | 'balances'
  | 'documents'
  | 'recipes'
  | 'reports'
  | 'insights'
  | 'items'
  | 'suppliers'
  | 'warehouses';

export default function InventoryPage({ section }: { section: InventorySectionKey }) {
  const { t } = useTranslate('inventory');
  const { ready, scope } = useInventoryAccess();
  if (!ready) {
    return (
      <InventorySection title={t(`sections.${section}`)}>
        <Alert severity="info">{t('selectRestaurant')}</Alert>
      </InventorySection>
    );
  }
  return <InventoryWorkspace key={scope} section={section} scope={scope} />;
}

function InventoryWorkspace({ section, scope }: { section: InventorySectionKey; scope: string }) {
  const { t } = useTranslate('inventory');
  const needsWarehouse = ['balances', 'documents', 'reports', 'insights'].includes(section);
  const warehouses = useInventoryReference('warehouses', needsWarehouse);
  const storageKey = `inventory-warehouse:${scope}`;
  const [selectedWarehouse, setSelectedWarehouse] = useState(() => StorageService.getItem<string>(storageKey) || '');
  const warehouse =
    warehouses.data?.find((item) => item.id === selectedWarehouse)?.id ||
    warehouses.data?.find((item) => item.isDefault)?.id ||
    warehouses.data?.[0]?.id ||
    '';

  if (needsWarehouse && (warehouses.isLoading || warehouses.isError)) {
    return (
      <InventorySection title={t(`sections.${section}`)}>
        <QueryState query={warehouses}>{null}</QueryState>
      </InventorySection>
    );
  }

  const warehouseControl = needsWarehouse ? (
    <TextField
      select
      fullWidth
      size="medium"
      label={t('warehouse')}
      value={warehouse}
      onChange={(event) => {
        setSelectedWarehouse(event.target.value);
        StorageService.setItem(storageKey, event.target.value);
      }}>
      {warehouses.data?.map((item) => (
        <MenuItem key={item.id} value={item.id}>
          {item.name}
          {!item.isActive ? ` (${t('inactive')})` : ''}
        </MenuItem>
      ))}
    </TextField>
  ) : null;

  return (
    <InventoryPageToolsContext.Provider value={warehouseControl}>
      <Fragment key={`${scope}-${warehouse}`}>
        {section === 'balances' && <BalancesPanel warehouse={warehouse} />}
        {section === 'documents' && <DocumentsPanel warehouse={warehouse} />}
        {section === 'recipes' && <RecipesPanel />}
        {section === 'reports' && <ReportsPanel warehouse={warehouse} />}
        {section === 'insights' && <InsightsPanel warehouse={warehouse} />}
        {(section === 'items' || section === 'suppliers' || section === 'warehouses') && (
          <ReferencesPanel kind={section} />
        )}
      </Fragment>
    </InventoryPageToolsContext.Provider>
  );
}
