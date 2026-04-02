import { widget as Widget } from '$:/plugins/linonetwo/tw-react/widget.js';
import { App, IProps } from './components/App';

import './widget.css';

class ExcalidrawWidget extends Widget<IProps> {
  public reactComponent = App;
  public getProps = () => {
    const editTitle = this.getAttribute('tiddler');

    return {
      tiddler: editTitle,
      initialData: editTitle ? $tw.wiki.getTiddlerText(editTitle) ?? '' : '',
      width: this.getAttribute('width', '100%'),
      height: this.getAttribute('height', '400px'),
      autoFocus: this.getAttribute('autoFocus'),
      langCode: $tw.wiki.getTiddlerText('$:/language')
        ?.replace(/^\$:\/languages\//, '')
        .replace('zh-Hans', 'zh-CN')
        .replace('zh-Hant', 'zh-TW') ?? undefined,
      viewMode: this.getAttribute('viewMode'),
      zenMode: this.getAttribute('zenMode'),
      gridMode: this.getAttribute('gridMode'),
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
        $tw.utils.count(changedAttributes) === 0
      )
    ) return false;

    this.refreshSelf();

    return true;
  }

  public refreshSelf(): void {
    super.destroy();
    this.root = undefined;
    super.refreshSelf();

    this.lastModified = new Date().getTime();
  }
}

declare let exports: {
  excalidraw: typeof ExcalidrawWidget;
};
exports['excalidraw'] = ExcalidrawWidget;
