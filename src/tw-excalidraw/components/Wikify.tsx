import { useWidget } from '$:/plugins/linonetwo/tw-react/index.js';

import type { JSX, RefObject } from 'react';
import { useRef } from 'react';

export function Wikify({ text }: { text: string }): JSX.Element {
  const transcludeContainerReference = useRef<HTMLDivElement>(null);

  const parseTreeNode = {
    type: 'tiddler',
    children: $tw.wiki.parseText('text/vnd.tiddlywiki', text).tree,
  };

  // While useWidget accepts a nullable ref, this is not reflected in its type
  useWidget(parseTreeNode, transcludeContainerReference as RefObject<HTMLDivElement>, {
    skip: false,
  });

  return <div ref={transcludeContainerReference} />;
}
