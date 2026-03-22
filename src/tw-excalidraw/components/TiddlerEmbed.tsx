import type { JSX } from 'react';

import { Wikify } from './Wikify.js';

export function TiddlerEmbed({ title }: { title: string }): JSX.Element {
  const tiddler = $tw.wiki.getTiddler(title);

  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        overscrollBehavior: 'contain',
        marginLeft: '1em',
        marginRight: '1em',
      }}
    >
      <h2>{title}</h2>
      <Wikify text={tiddler?.fields.text ?? ''} />
    </div>
  );
}
