import { useWidget } from '$:/plugins/linonetwo/tw-react/index.js';

import type { IParseTreeNode } from 'tiddlywiki';

import type { JSX, RefObject } from 'react';
import { useMemo, useRef } from 'react';

export function Wikify({ text }: { text: string }): JSX.Element {
  const transcludeContainerReference = useRef<HTMLDivElement>(null);

  const parseTreeNode = useMemo<IParseTreeNode>(() => {
    return {
      type: 'tiddler',
      children: $tw.wiki.parseText('text/vnd.tiddlywiki', text).tree,
    };
  }, [text]);

  // While useWidget accepts a nullable ref, this is not reflected in its type
  useWidget(parseTreeNode, transcludeContainerReference as RefObject<HTMLDivElement>, {
    skip: false,
  });

  return <div ref={transcludeContainerReference} />;
}
