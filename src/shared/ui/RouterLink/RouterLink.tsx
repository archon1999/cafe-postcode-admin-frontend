import { forwardRef } from 'react';
import type { LinkProps } from 'react-router';
import { Link } from 'react-router';

interface RouterLinkProps extends Omit<LinkProps, 'to'> {
  href: string;
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(function RouterLink({ href, ...other }, ref) {
  return <Link ref={ref} to={href} {...other} />;
});
