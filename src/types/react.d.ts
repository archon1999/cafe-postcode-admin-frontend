import 'react';

declare module 'react' {
  interface DOMAttributes<T> {
    'data-testid'?: string;
  }

  interface HTMLAttributes<T> extends DOMAttributes<T> {
    'data-testid'?: string;
  }

  interface SVGAttributes<T> extends DOMAttributes<T> {
    'data-testid'?: string;
  }
}
