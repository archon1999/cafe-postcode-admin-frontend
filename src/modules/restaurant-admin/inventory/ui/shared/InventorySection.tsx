import { Box, Card, Stack } from '@mui/material';
import { createContext, useContext, type ReactNode } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard/content';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Scrollbar } from 'shared/ui/Scrollbar';

import { InventoryHelp } from './InventoryHelp';

export const InventoryPageToolsContext = createContext<ReactNode>(null);

export function InventorySection({
  title,
  action,
  help,
  toolbar,
  summary,
  footer,
  plain = false,
  children,
}: {
  title: string;
  action?: ReactNode;
  help?: ReactNode;
  toolbar?: ReactNode;
  summary?: ReactNode;
  footer?: ReactNode;
  plain?: boolean;
  children: ReactNode;
}) {
  const tools = useContext(InventoryPageToolsContext);
  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={title}
        action={
          <Stack direction="row" alignItems="center" gap={1}>
            <InventoryHelp>{help}</InventoryHelp>
            {action}
          </Stack>
        }
      />
      <ListPageBody sx={{ overflow: 'auto', m: -3, p: 3 }}>
        {summary}
        <Card
          sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: { xs: 420, md: 0 }, overflow: 'hidden' }}>
          {(toolbar || tools) && (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ md: 'center' }}
              gap={1.5}
              sx={{ px: 2.5, py: 2, flexShrink: 0 }}>
              {toolbar}
              {tools && <Box sx={{ ml: { md: 'auto' }, flexShrink: 0, width: { xs: 1, md: 220 } }}>{tools}</Box>}
            </Stack>
          )}
          <Scrollbar
            autoHide={false}
            fillContent={false}
            ariaLabel={title}
            tabIndex={0}
            sx={{ flex: '1 1 0', height: 0 }}>
            {plain ? <Box sx={{ px: { xs: 2, md: 2.5 }, pb: 2.5 }}>{children}</Box> : children}
          </Scrollbar>
          {footer && <Box sx={{ borderTop: 1, borderColor: 'divider', px: 2, py: 1.5, flexShrink: 0 }}>{footer}</Box>}
        </Card>
      </ListPageBody>
    </ListPageContent>
  );
}
