import { MainMenu } from '@excalidraw/excalidraw';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/dist/types/excalidraw/types';

import { Wikify } from './Wikify.js';

export function MainMenuItemEmbedTiddler(props: {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  onSelect: (event: Event) => void;
}) {
  if (props.excalidrawAPI?.getAppState().viewModeEnabled) return null;

  return (
    <MainMenu.Item onSelect={props.onSelect} icon={<Wikify text='{{$:/core/images/transcludify}}' />}>
      <Wikify text='<<tw-excalidraw-lingo EmbedTiddlerButtonCaption $:/plugins/itw/tw-excalidraw/language/>>' />
    </MainMenu.Item>
  );
}
