import { MainMenu } from '@excalidraw/excalidraw';

import { Lingo } from './Lingo.js';
import { Wikify } from './Wikify.js';

export function MainMenuItemEnterLayout(props: {
  onSelect: (event: Event) => void;
}) {
  if ($tw.wiki.getTiddlerText('$:/layout') === '$:/plugins/itw/tw-excalidraw/ui/layout') return null;

  return (
    <MainMenu.Item onSelect={props.onSelect} icon={<Wikify text='{{$:/core/images/standard-layout}}' />}>
      <Lingo title='EnterLayoutButtonCaption' />
    </MainMenu.Item>
  );
}
