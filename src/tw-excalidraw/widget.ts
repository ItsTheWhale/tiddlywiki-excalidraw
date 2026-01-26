import { widget as Widget } from '$:/plugins/linonetwo/tw-react/widget.js';
import { App, IProps } from './components/App';

import './widget.css';

class WhiteboardExcalidrawWidget extends Widget<IProps> {
  public reactComponent = App;
  public getProps = () => {
    const editTitle = this.getAttribute('tiddler');

    return {
      tiddler: editTitle,
      initialData: editTitle ? $tw.wiki.getTiddlerText(editTitle) ?? '' : '',
      langCode: $tw.wiki.getTiddlerText('$:/language')
        ?.replace(/^\$:\/languages\//, '')
        .replace('zh-Hans', 'zh-CN')
        .replace('zh-Hant', 'zh-TW') ?? undefined,
      width: this.getAttribute('width', '100%'),
      height: this.getAttribute('height', '400px'),
      viewMode: this.getAttribute('view-mode'),
      zenMode: this.getAttribute('zen-mode'),
      gridMode: this.getAttribute('grid-mode'),
      onSave: this.onSave.bind(this),
    };
  };

  private lastModified = new Date().getTime();

  private onSave(tiddlerTitle: string | undefined, data: string): void {
    if (!tiddlerTitle) return;

    const tiddler = $tw.wiki.getTiddler(tiddlerTitle);

    if (
      // We created the tiddler already, so if it does not exist, it must be deleted
      !tiddler ||
      // If the update is unnecessary
      tiddler.fields.text === data ||
      // If another instance modified the tiddler
      (tiddler.fields.modified?.getTime() ?? -Infinity) > this.lastModified
    ) return;

    $tw.wiki.setText(tiddlerTitle, 'text', undefined, data);

    if (tiddler.fields.type !== 'application/vnd.excalidraw+json') {
      $tw.wiki.setText(tiddlerTitle, 'type', undefined, 'application/vnd.excalidraw+json');
    }

    this.lastModified = $tw.wiki.getTiddler(tiddlerTitle)?.fields.modified?.getTime() ?? Infinity;
  }

  refresh(): boolean {
    const tiddler = this.getAttribute('tiddler');
    const changedAttributes = this.computeAttributes();

    // Do not refresh if:
    if (
      // No tiddler
      !tiddler ||
      // If tiddler:
      (
        // Another instance did not modify the tiddler
        ($tw.wiki.getTiddler(tiddler)?.fields.modified?.getTime() ?? -Infinity) <= this.lastModified &&
        // Attributes did not change
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !changedAttributes['tiddler'] &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !changedAttributes['width'] &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !changedAttributes['height'] &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !changedAttributes['view-mode'] &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !changedAttributes['zen-mode'] &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        !changedAttributes['grid-mode']
      )
    ) return false;

    console.warn('Yay!');
    this.refreshSelf();
    return true;
  }

  public refreshSelf(): void {
    super.destroy();
    this.root = undefined;
    super.refreshSelf();
  }
}

declare let exports: {
  'whiteboard-excalidraw': typeof WhiteboardExcalidrawWidget;
};
exports['whiteboard-excalidraw'] = WhiteboardExcalidrawWidget;
