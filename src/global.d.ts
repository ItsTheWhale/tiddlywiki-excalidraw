declare global {
  interface Window {
    EXCALIDRAW_EXPORT_SOURCE: string;
  }
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'react' {
  interface CSSProperties {
    // Allow any CSS variable starting with '--'
    [key: `--${string}`]: string | number;
  }
}

import 'tw-react/dist/lib/type.d.ts';
