import { widget as Widget } from '$:/plugins/linonetwo/tw-react/widget.js';
import { App, IProps } from './components/App';

import './widget.css';

// TODO: Excalidraw v0.18.0 does not correctly respect this. A pnpm patch is used as a temporary measure. Fix awaits next release https://github.com/excalidraw/excalidraw/pull/9525
window.EXCALIDRAW_EXPORT_SOURCE = 'tw-excalidraw';

class ExcalidrawWidget extends Widget<IProps> {
  public reactComponent = App;
  public getProps = () => {
    const editTitle = this.getAttribute('tiddler');

    return {
      tiddler: editTitle,
      initialDataText: editTitle ? $tw.wiki.getTiddlerText(editTitle) ?? '' : '',
      elementId: this.getAttribute('elementId'),
      width: this.getAttribute('width', '100%'),
      height: this.getAttribute('height', '400px'),
      scrollToContent: this.getAttribute('scrollToContent', 'yes'),
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

  private isRefresh: boolean = false;
  private lastModified: number = new Date().getTime();

  private onSave(tiddlerTitle: string | undefined, data: string): void {
    if (!tiddlerTitle) return;

    const tiddler = $tw.wiki.getTiddler(tiddlerTitle);
    const modified = tiddler?.fields.modified?.getTime() ?? -Infinity;

    // As Excalidraw fires an onSave event on unmount, prevent infinite saving loops if this widget is not newly constructed
    if (this.isRefresh) {
      this.lastModified = modified;
      this.isRefresh = false;
      return;
    }

    if (
      // We created the tiddler already, so if it does not exist, it must be deleted
      !tiddler ||
      // If the update is unnecessary
      tiddler.fields.text === data ||
      // If another instance modified the tiddler
      modified > this.lastModified
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
        Object.keys(changedAttributes).length === 0
      )
    ) return false;

    this.refreshSelf();

    return true;
  }

  public refreshSelf(): void {
    super.destroy();
    this.root = undefined;
    super.refreshSelf();

    // Here we set isRefresh to true to signal that this is not a newly constructed widget
    this.isRefresh = true;
  }
}

declare let exports: {
  excalidraw: typeof ExcalidrawWidget;
};
exports['excalidraw'] = ExcalidrawWidget;
