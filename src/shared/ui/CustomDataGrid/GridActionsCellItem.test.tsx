/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ElementType, ReactNode } from 'react';
import { createElement, forwardRef } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

type MockActionElementProps = {
  'aria-label'?: string;
  className?: string;
  href?: string;
  children?: ReactNode;
  onClick?: () => void;
  rel?: string;
  target?: string;
};

type MockGridActionsCellItemProps = Omit<MockActionElementProps, 'children'> & {
  component?: ElementType<MockActionElementProps>;
  icon?: ReactNode;
  label?: ReactNode;
  showInMenu?: boolean;
};

vi.mock('@mui/x-data-grid', () => ({
  GridActionsCellItem: forwardRef<HTMLElement, MockGridActionsCellItemProps>(function MockGridActionsCellItem(
    { className, component, href, icon, label, onClick, rel, showInMenu = false, target },
    _ref,
  ) {
    const Component: ElementType<MockActionElementProps> = component ?? (href ? 'a' : 'button');

    return createElement(
      Component,
      {
        'aria-label': typeof label === 'string' ? label : undefined,
        className,
        href,
        onClick,
        rel,
        target,
      },
      icon,
      showInMenu ? label : null,
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
