import { Wikify } from './Wikify.js';

export function Lingo({ title }: {
  title: string;
}) {
  return <Wikify text={`<<tw-excalidraw-lingo ${title} $:/plugins/itw/tw-excalidraw/language/>>`} />;
}
