import { Box, Card, Stack } from '@mui/material';
import { createContext, useContext, type ReactNode } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard/content';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

export const InventoryPageToolsContext = createContext<ReactNode>(null);

export function InventorySection({
  title,
  action,
  toolbar,
  summary,
  footer,
  plain = false,
  children,
}: {
  title: string;
  action?: ReactNode;
  toolbar?: ReactNode;
  summary?: ReactNode;
  footer?: ReactNode;
  plain?: boolean;
  children: ReactNode;
}) {
  const tools = useContext(InventoryPageToolsContext);
  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={title} action={action} />
      <ListPageBody>
        {summary}
        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
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
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', ...(plain && { px: 2.5, pb: 2 }) }}>{children}</Box>
          {footer && <Box sx={{ borderTop: 1, borderColor: 'divider', px: 2, py: 1.5, flexShrink: 0 }}>{footer}</Box>}
        </Card>
      </ListPageBody>
    </ListPageContent>
  );
}
