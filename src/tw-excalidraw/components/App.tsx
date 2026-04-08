import type { IDefaultWidgetProps } from '$:/plugins/linonetwo/tw-react/index.js';
import { ParentWidgetContext } from '$:/plugins/linonetwo/tw-react/index.js';

import type { ExcalidrawElement, ExcalidrawEmbeddableElement, NonDeleted, OrderedExcalidrawElement } from '@excalidraw/element/dist/types/element/src/types';
import { Excalidraw, MainMenu, restoreElements, serializeAsJSON } from '@excalidraw/excalidraw';
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/dist/types/excalidraw/types';

import '@excalidraw/excalidraw/index.css';

import { PositionObserver } from 'position-observer';

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

import { yesOrNo } from '../utils/yes-or-no.js';
import { MainMenuItemEmbedTiddler } from './MainMenuItemEmbedTiddler.js';
import { MainMenuItemEnterLayout } from './MainMenuItemEnterLayout.js';
import { MainMenuItemExitLayout } from './MainMenuItemExitLayout.js';
import { TiddlerEmbed } from './TiddlerEmbed.js';
import { WebEmbed } from './WebEmbed.js';

export interface IProps {
  tiddler?: string;

  initialData?: ExcalidrawInitialDataState;

  elementId?: string;

  width: string;
  height: string;

  autoFocus?: string;

  langCode?: string;

  theme?: string;

  viewMode?: string;
  zenMode?: string;
  gridMode?: string;

  onSave: (tiddler: string | undefined, data: string) => void;
}

export function App(props: IProps & IDefaultWidgetProps) {
  const {
    tiddler,
    initialData,
    elementId,
    width,
    height,
    autoFocus,
    langCode,
    theme,
    viewMode,
    zenMode,
    gridMode,
    onSave,
    parentWidget,
  } = props;

  const containerElementReference = useRef<HTMLDivElement>(null);

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(false);

  function insertTiddlerEmbed(title: string): void {
    if (!excalidrawAPI) return;

    const appState = excalidrawAPI.getAppState();

    const embed = restoreElements([{
      type: 'embeddable',
      x: appState.scrollX,
      y: appState.scrollY,
      width: 560,
      height: 315,
      link: `{{${title}}}`,
      roundness: {
        type: 3,
      },
    } as unknown as ExcalidrawEmbeddableElement], undefined);

    excalidrawAPI.updateScene({
      elements: [...excalidrawAPI.getSceneElements(), ...embed],
    });
  }

  useEffect(() => {
    if (!excalidrawAPI) return;

    function handler(event: {
      param?: string;
      paramObject?: Record<string, unknown>;
    }): boolean {
      if (!excalidrawAPI) return true;

      const eventTiddler = event.paramObject?.tiddler;

      if (!eventTiddler || typeof eventTiddler !== 'string' || eventTiddler !== tiddler || !event.param) return true;

      insertTiddlerEmbed(event.param);

      return false;
    }

    $tw.rootWidget.addEventListener('tw-excalidraw-search', handler);

    return () => {
      $tw.rootWidget.removeEventListener('tw-excalidraw-search', handler);
    };
  }, [excalidrawAPI]);

  useEffect(() => {
    if (tiddler && !$tw.wiki.getTiddler(tiddler)) {
      $tw.wiki.addTiddler({
        title: tiddler,
      });
    }
  }, [tiddler]);

  useEffect(() => {
    excalidrawAPI?.scrollToContent(elementId, {
      fitToContent: true,
      animate: false,
    });
  }, [excalidrawAPI, elementId]);

  // Recompute offsets after every position change
  useEffect(() => {
    if (!containerElementReference.current) return;

    const observer = new PositionObserver(() => {
      excalidrawAPI?.refresh();
    });

    observer.observe(containerElementReference.current);

    return () => {
      if (containerElementReference.current) observer.unobserve(containerElementReference.current);
    };
  }, [containerElementReference, excalidrawAPI]);

  function handleChange(
    excalidrawElements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    binaryFiles: BinaryFiles,
  ): void {
    // This is an awful idea, but there is no other option
    if (!isInitialLoad && excalidrawAPI) {
      setIsInitialLoad(true);

      if (elementId) {
        excalidrawAPI.scrollToContent(elementId, {
          fitToContent: true,
          animate: false,
        });
      }
    }

    const data = serializeAsJSON(excalidrawElements, appState, binaryFiles, 'local');

    onSave(tiddler, data);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    if (viewMode) return;

    console.log(event);

    const title = event.dataTransfer.getData('text/plain');
    const data = event.dataTransfer.getData('text/vnd.tiddler');

    if (!title || !data) return;

    if (!$tw.wiki.getTiddler(title)) {
      parentWidget?.dispatchEvent({
        type: 'tm-import-tiddlers',
        param: JSON.stringify([JSON.parse(data)]),
      });
    }

    insertTiddlerEmbed(title);
  }

  function handleFocus(): void {
    $tw.wiki.setText('$:/temp/itw/tw-excalidraw/FocusedTiddler', 'text', undefined, props.tiddler);
  }

  function handleWheelCapture(event: React.WheelEvent<HTMLDivElement>): void {
    if (!containerElementReference.current?.contains(document.activeElement)) event.stopPropagation();
  }

  function handleOpenLayout(): void {
    $tw.wiki.setText('$:/layout', 'text', undefined, '$:/plugins/itw/tw-excalidraw/ui/layout');
  }

  function handleExitLayout(): void {
    $tw.wiki.setText('$:/layout', 'text', undefined, '$:/core/ui/PageTemplate');
  }

  function handleEmbedTiddler(): void {
    props.parentWidget?.dispatchEvent({
      type: 'tm-modal',
      param: '$:/plugins/itw/tw-excalidraw/ui/search-modal',
      paramObject: {
        tiddler,
      },
    });
  }

  function generateLinkForSelection(id: string): string {
    return `##${id}`;
  }

  function matchTiddlerLink(link: string): string | undefined {
    // Tiddler links are surrounded by square brackets
    // [[title]]
    return link.match(/^\[\[(.+)\]\]$/)?.[1];
  }

  function matchTiddlerTransclusion(link: string): string | undefined {
    // Tiddler transclusions are surrounded by curly brackets
    // {{title}}
    return link.match(/^{{(.+)}}$/)?.[1];
  }

  function matchElementLink(link: string): string | undefined {
    // Element links are prefixed just like DataTiddler named properties
    // ##element
    return link.match(/^##(.+)$/)?.[1];
  }

  function handleLinkOpen(element: NonDeleted<ExcalidrawElement>, event: Event): void {
    const link = element.link;

    if (!link) return;

    const tiddlerLink = matchTiddlerLink(link);
    const tiddlerTransclusion = matchTiddlerTransclusion(link);
    const elementLink = matchElementLink(link);

    if (tiddlerLink) {
      parentWidget?.dispatchEvent({
        type: 'tm-navigate',
        navigateTo: tiddlerLink,
      });

      event.preventDefault();
    } else if (tiddlerTransclusion) {
      parentWidget?.dispatchEvent({
        type: 'tm-navigate',
        navigateTo: tiddlerTransclusion,
      });

      event.preventDefault();
    } else if (elementLink) {
      excalidrawAPI?.scrollToContent(elementLink);

      event.preventDefault();
    }
  }

  function renderEmbeddable(element: NonDeleted<ExcalidrawElement>, _: AppState): JSX.Element | null {
    const link = element.link;

    if (!link) return null;

    const transcludedTiddler = matchTiddlerTransclusion(element.link);

    if (transcludedTiddler) return <TiddlerEmbed title={transcludedTiddler} />;

    return <WebEmbed link={element.link} />;
  }

  return (
    <>
      <div
        ref={containerElementReference}
        style={{ width, height, '--tw-excalidraw-height': height }}
        onDrop={handleDrop}
        onFocus={handleFocus}
        onWheelCapture={handleWheelCapture}
      >
        <ParentWidgetContext.Provider value={parentWidget}>
          <Excalidraw
            excalidrawAPI={setExcalidrawAPI}
            onChange={handleChange}
            generateLinkForSelection={generateLinkForSelection}
            onLinkOpen={handleLinkOpen}
            renderEmbeddable={renderEmbeddable}
            validateEmbeddable={true}
            initialData={initialData}
            autoFocus={yesOrNo(autoFocus)}
            langCode={langCode}
            theme={theme === 'light' ? 'light' : (theme === 'dark' ? 'dark' : undefined)}
            viewModeEnabled={yesOrNo(viewMode)}
            zenModeEnabled={yesOrNo(zenMode)}
            gridModeEnabled={yesOrNo(gridMode)}
          >
            <MainMenu>
              <MainMenuItemEnterLayout onSelect={handleOpenLayout} />
              <MainMenuItemExitLayout onSelect={handleExitLayout} />
              <MainMenuItemEmbedTiddler excalidrawAPI={excalidrawAPI} onSelect={handleEmbedTiddler} />
              <MainMenu.Separator />
              <MainMenu.DefaultItems.LoadScene />
              <MainMenu.DefaultItems.SaveToActiveFile />
              <MainMenu.DefaultItems.Export />
              <MainMenu.DefaultItems.SaveAsImage />
              <MainMenu.DefaultItems.SearchMenu />
              <MainMenu.DefaultItems.Help />
              <MainMenu.DefaultItems.ClearCanvas />
              <MainMenu.Separator />
              <MainMenu.DefaultItems.Socials />
              <MainMenu.Separator />
              <MainMenu.DefaultItems.ToggleTheme />
              <MainMenu.DefaultItems.ChangeCanvasBackground />
            </MainMenu>
          </Excalidraw>
        </ParentWidgetContext.Provider>
      </div>
    </>
  );
}
