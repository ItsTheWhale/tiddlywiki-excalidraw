export function yesOrNo(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;

  return value !== 'no';
}
