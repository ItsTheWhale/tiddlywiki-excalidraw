import { MainMenu } from '@excalidraw/excalidraw';

import { Wikify } from './Wikify.js';

export function MainMenuItemEnterLayout(props: {
  onSelect: (event: Event) => void;
}) {
  if ($tw.wiki.getTiddlerText('$:/layout') === '$:/plugins/itw/tw-excalidraw/ui/layout') return null;

  return (
    <MainMenu.Item onSelect={props.onSelect} icon={<Wikify text='{{$:/core/images/standard-layout}}' />}>
      <Wikify text='<<tw-excalidraw-lingo EnterLayoutButtonCaption $:/plugins/itw/tw-excalidraw/language/>>' />
    </MainMenu.Item>
  );
}
