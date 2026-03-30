import './styles.css';

import { isEqualPath } from 'minimal-shared/utils';
import NProgress from 'nprogress';
import { useRef, useEffect } from 'react';

import { usePathname } from 'shared/hooks/router';

function isValidAnchor(element: HTMLAnchorElement): boolean {
  if (!element) return false;

  const href = element.getAttribute('href')?.trim() ?? '';
  const target = element.getAttribute('target');
  const rel = element.getAttribute('rel');

  return (
    href.startsWith('/') && target !== '_blank' && (!rel || !['noopener', 'noreferrer'].some((v) => rel.includes(v)))
  );
}

function useProgressBar() {
  const pathname = usePathname();
  const currentUrlRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      currentUrlRef.current = window.location.href;
    }
  }, []);

  useEffect(() => {
    const handleNavigation = (newUrl: string) => {
      try {
        if (newUrl && !isEqualPath(newUrl, currentUrlRef.current, { deep: false })) {
          currentUrlRef.current = newUrl;
          NProgress.start();
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Navigation progress error:', error);
        }
        NProgress.done();
      }
    };

    const handleClickAnchor = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;

      if (anchor && isValidAnchor(anchor)) {
        handleNavigation(anchor.href);
      }
    };

    const handlePopState = () => {
      handleNavigation(window.location.href);
    };

    const patchHistoryMethod = (method: 'pushState' | 'replaceState') => {
      const originalMethod = window.history[method];

      window.history[method] = new Proxy(originalMethod, {
        apply: (target, thisArg, args: [data: any, unused: string, url?: string | URL | null]) => {
          const newUrl = args[2];
          if (typeof newUrl === 'string') {
            handleNavigation(new URL(newUrl, window.location.origin).href);
          }
          return target.apply(thisArg, args);
        },
      });
    };

    patchHistoryMethod('pushState');
    patchHistoryMethod('replaceState');

    document.addEventListener('click', handleClickAnchor);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleClickAnchor);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => NProgress.done(), 100);
    return () => clearTimeout(timeout);
  }, [pathname]);
}

export function ProgressBar() {
  useEffect(() => {
    NProgress.configure({ showSpinner: false });
    return () => {
      NProgress.done();
    };
  }, []);

  useProgressBar();

  return null;
}
