/*\
title: $:/plugins/itw/tw-excalidraw/parser.ts
type: application/javascript
module-type: parser

The Excalidraw dummy parser parses an Excalidraw tiddler into a warning message.

\*/

import type { IParseOptions, IParseTreeNode } from 'tiddlywiki';

class ExcalidrawDummyParser {
  tree: IParseTreeNode[];
  source: string;
  type: string;

  constructor(type: string, text: string, _: IParseOptions) {
    this.tree = [{
      type: 'element',
      tag: 'p',
      children: [{
        type: 'transclude',
        attributes: {
          $tiddler: { type: 'string', value: '$:/plugins/itw/tw-excalidraw/ui/parser-warning' },
        },
      }],
    }];
    this.source = text;
    this.type = type;
  }
}

declare let exports: {
  'application/vnd.excalidraw+json': typeof ExcalidrawDummyParser;
};
exports['application/vnd.excalidraw+json'] = ExcalidrawDummyParser;
