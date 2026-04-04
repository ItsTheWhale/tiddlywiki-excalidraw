import type { IDefaultWidgetProps } from '$:/plugins/linonetwo/tw-react/index.js';
import { ParentWidgetContext } from '$:/plugins/linonetwo/tw-react/index.js';

import type { ExcalidrawElement, NonDeleted, OrderedExcalidrawElement } from '@excalidraw/element/dist/types/element/src/types';
import { Excalidraw, MainMenu, serializeAsJSON } from '@excalidraw/excalidraw';
import type { cleanAppStateForExport } from '@excalidraw/excalidraw/dist/types/excalidraw/appState';
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from '@excalidraw/excalidraw/dist/types/excalidraw/types';

import '@excalidraw/excalidraw/index.css';

import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

import { TiddlerEmbed } from './TiddlerEmbed.js';
import { WebEmbed } from './WebEmbed.js';
import { Wikify } from './Wikify.js';

export interface IProps {
  tiddler?: string;

  initialData: string;

  elementId?: string;

  width: string;
  height: string;

  scrollToContent: string;

  autoFocus?: string;

  langCode?: string;

  viewMode?: string;
  zenMode?: string;
  gridMode?: string;

  onSave: (tiddler: string | undefined, data: string) => void;
}

interface ImportedDataState {
  type: string;
  version: number;
  source: string;
  elements: readonly ExcalidrawElement[];
  appState: ReturnType<typeof cleanAppStateForExport>;
  files: BinaryFiles | undefined;
}

function yesOrNo(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;

  return value !== 'no';
}

export function App(props: IProps & IDefaultWidgetProps) {
  const {
    tiddler,
    initialData,
    elementId,
    width,
    height,
    scrollToContent,
    autoFocus,
    langCode,
    viewMode,
    zenMode,
    gridMode,
    onSave,
    parentWidget,
  } = props;

  const containerElementReference = useRef<HTMLDivElement>(null);

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(false);

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

  const initialDataObject: ExcalidrawInitialDataState = {
    ...(initialData ? JSON.parse(initialData) : {}),
    scrollToContent: yesOrNo(scrollToContent)
  };

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

  function handleFocus(): void {
    $tw.wiki.setText('$:/temp/itw/tw-excalidraw/FocusedTiddler', 'text', undefined, props.tiddler);
  }

  function handleWheelCapture(event: React.WheelEvent<HTMLDivElement>): void {
    if (!containerElementReference.current?.contains(document.activeElement)) event.stopPropagation();
  }

  function handleExitLayout(): void {
    $tw.wiki.setText('$:/layout', 'text', undefined, '$:/core/ui/PageTemplate');
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
      <div ref={containerElementReference} style={{ width, height }} onFocus={handleFocus} onWheelCapture={handleWheelCapture}>
        <ParentWidgetContext.Provider value={parentWidget}>
          <Excalidraw
            excalidrawAPI={setExcalidrawAPI}
            onChange={handleChange}
            generateLinkForSelection={generateLinkForSelection}
            onLinkOpen={handleLinkOpen}
            renderEmbeddable={renderEmbeddable}
            validateEmbeddable={true}
            initialData={initialDataObject}
            autoFocus={yesOrNo(autoFocus)}
            langCode={langCode}
            viewModeEnabled={yesOrNo(viewMode)}
            zenModeEnabled={yesOrNo(zenMode)}
            gridModeEnabled={yesOrNo(gridMode)}
          >
            <MainMenu>
              <MainMenu.Item onSelect={handleExitLayout} icon={<Wikify text='{{$:/core/images/standard-layout}}' />}>
                <Wikify text='<<tw-excalidraw-lingo StandardLayoutButtonCaption $:/plugins/itw/tw-excalidraw/language/>>' />
              </MainMenu.Item>
              <MainMenu.DefaultItems.LoadScene />
              <MainMenu.DefaultItems.SaveToActiveFile />
              <MainMenu.DefaultItems.Export />
              <MainMenu.DefaultItems.SaveAsImage />
              <MainMenu.DefaultItems.SearchMenu />
              <MainMenu.DefaultItems.Help />
              <MainMenu.DefaultItems.ClearCanvas />
              <MainMenu.Separator />
              <MainMenu.Group title='Excalidraw links'>
                <MainMenu.DefaultItems.Socials />
              </MainMenu.Group>
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
