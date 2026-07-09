import type { JSX } from 'react';
import { Transclude } from './Transclude';

export function TiddlerEmbed({ title }: { title: string }): JSX.Element {
  return (
    <div
      style={{
        height: '100%',
        overflow: 'auto',
        overscrollBehavior: 'contain',
        paddingLeft: '1em',
        paddingRight: '1em',
      }}
      onKeyDownCapture={(event) => {
        event.stopPropagation();
      }}
    >
      <Transclude title={title} />
    </div>
  );
}
