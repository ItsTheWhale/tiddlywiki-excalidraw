import type { JSX } from 'react';
import { Transclude } from './Transclude';

export function TiddlerEmbed({ title }: { title: string }): JSX.Element {
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
      <Transclude title={title} />
    </div>
  );
}
