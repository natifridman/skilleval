export function nfkcNormalize(str: string): string {
  return str.normalize("NFKC");
}
