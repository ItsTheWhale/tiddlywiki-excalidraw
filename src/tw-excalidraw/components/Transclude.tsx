import { Wikify } from './Wikify.js';

export function Transclude({ title }: {
  title: string;
}) {
  const tiddler = $tw.wiki.getTiddler(title);

  return <Wikify text={tiddler?.fields.text ?? ''} />;
}
