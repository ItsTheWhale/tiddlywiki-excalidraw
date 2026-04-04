declare global {
  interface Window {
    EXCALIDRAW_EXPORT_SOURCE: string;
  }
}

declare module '*.css' {
  const content: string;
  export default content;
}

import 'tw-react/dist/lib/type.d.ts';
