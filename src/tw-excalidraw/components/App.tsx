import type { ExcalidrawElement, OrderedExcalidrawElement } from '@excalidraw/element/dist/types/element/src/types';
import { Excalidraw, serializeAsJSON } from '@excalidraw/excalidraw';
import type { cleanAppStateForExport } from '@excalidraw/excalidraw/dist/types/excalidraw/appState';
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/dist/types/excalidraw/types';

import '@excalidraw/excalidraw/index.css';
import { useEffect } from 'react';

export interface IProps {
  tiddler?: string;

  initialData: string;

  langCode?: string;

  width: string;
  height: string;

  viewMode: string | undefined;
  zenMode: string | undefined;
  gridMode: string | undefined;

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

export function App(props: IProps) {
  const { tiddler, initialData, langCode, width, height, viewMode, zenMode, gridMode, onSave } = props;

  useEffect(() => {
    if (tiddler && !$tw.wiki.getTiddler(tiddler)) {
      $tw.wiki.addTiddler({
        title: tiddler,
      });
    }
  });

  const initialDataObject = initialData ? JSON.parse(initialData) as ImportedDataState : {};

  function onChange(
    excalidrawElements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    binaryFiles: BinaryFiles,
  ): void {
    const data = serializeAsJSON(excalidrawElements, appState, binaryFiles, 'local');

    onSave(tiddler, data);
  }

  return (
    <>
      <div style={{ width, height }} onFocus={onFocus}>
        <Excalidraw
          onChange={onChange}
          initialData={initialDataObject}
          langCode={langCode}
          viewModeEnabled={yesOrNo(viewMode)}
          zenModeEnabled={yesOrNo(zenMode)}
          gridModeEnabled={yesOrNo(gridMode)}
        />
      </div>
    </>
  );
}
