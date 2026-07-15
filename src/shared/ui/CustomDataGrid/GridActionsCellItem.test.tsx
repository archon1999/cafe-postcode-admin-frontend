/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ElementType, ReactNode } from 'react';
import { forwardRef } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

type MockGridActionsCellItemProps = {
  'aria-label'?: string;
  className?: string;
  component?: ElementType<{ href?: string }>;
  href?: string;
  icon?: ReactNode;
  label?: ReactNode;
  onClick?: () => void;
  rel?: string;
  showInMenu?: boolean;
  target?: string;
};

vi.mock('@mui/x-data-grid', () => ({
  GridActionsCellItem: forwardRef<HTMLElement, MockGridActionsCellItemProps>(function MockGridActionsCellItem(
    { className, component, href, icon, label, onClick, rel, showInMenu = false, target },
    ref,
  ) {
    const Component = component ?? (href ? 'a' : 'button');

    return (
      <Component
        ref={ref}
        aria-label={typeof label === 'string' ? label : undefined}
        className={className}
        href={href}
        onClick={onClick}
        rel={rel}
        target={target}>
        {icon}
        {showInMenu ? label : null}
      </Component>
    );
  }),
}));

import { CustomGridActionsCellItem, type GridActionKind } from './GridActionsCellItem';

const ACTION_CASES: Array<{ actionKind: GridActionKind; label: string }> = [
  { actionKind: 'view', label: 'View details' },
  { actionKind: 'edit', label: 'Edit item' },
  { actionKind: 'delete', label: 'Delete item' },
  { actionKind: 'constructor', label: 'Open constructor' },
];

afterEach(() => {
  cleanup();
});

describe('CustomGridActionsCellItem', () => {
  it.each(ACTION_CASES)('applies semantic class for $actionKind actions', ({ actionKind, label }) => {
    render(
      <CustomGridActionsCellItem
        actionKind={actionKind}
        label={label}
        showInMenu={false}
        icon={<span data-testid={`${actionKind}-icon`} />}
        onClick={() => {}}
      />,
    );

    const actionButton = screen.getByRole('button', { name: label });

    expect(actionButton).toHaveClass('custom-grid-action');
    expect(actionButton).toHaveClass(`custom-grid-action--${actionKind}`);
  });

  it('shows an inline tooltip that reuses the action label', async () => {
    render(
      <CustomGridActionsCellItem
        actionKind="view"
        label="View details"
        showInMenu={false}
        icon={<span data-testid="view-icon" />}
        onClick={() => {}}
      />,
    );

    const actionButton = screen.getByRole('button', { name: 'View details' });
    fireEvent.mouseOver(actionButton);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('View details');
  });

  it('renders menu actions with visible label text by default', () => {
    render(
      <CustomGridActionsCellItem actionKind="view" label="View details" icon={<span data-testid="view-icon" />} />,
    );

    const actionButton = screen.getByRole('button', { name: 'View details' });

    expect(actionButton).toHaveTextContent('View details');
    expect(actionButton).toHaveClass('custom-grid-action');
    expect(actionButton).toHaveClass('custom-grid-action--view');
  });

  it('renders internal href actions through the application router', () => {
    render(
      <MemoryRouter>
        <CustomGridActionsCellItem
          actionKind="view"
          href="/users/user-1"
          label="View details"
          icon={<span data-testid="view-icon" />}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute('href', '/users/user-1');
  });

  it('opens external href actions in a protected new tab', () => {
    render(
      <CustomGridActionsCellItem
        actionKind="view"
        href="https://example.com/details"
        label="External details"
        icon={<span data-testid="external-icon" />}
      />,
    );

    const link = screen.getByRole('link', { name: 'External details' });

    expect(link).toHaveAttribute('href', 'https://example.com/details');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
