import { MainMenu } from '@excalidraw/excalidraw';

import { Lingo } from './Lingo.js';
import { Transclude } from './Transclude.js';

export function MainMenuItemExitLayout(props: {
  onSelect: (event: Event) => void;
}) {
  if ($tw.wiki.getTiddlerText('$:/layout') !== '$:/plugins/itw/tw-excalidraw/ui/layout') return null;

  return (
    <MainMenu.Item onSelect={props.onSelect} icon={<Transclude title='$:/core/images/standard-layout' />}>
      <Lingo title='ExitLayoutButtonCaption' />
    </MainMenu.Item>
  );
}
