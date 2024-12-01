export function extractAroundCursor(
  text: string,
  cursorMarker: string = "[[cursor]]",
  contextSize: number = 500
): string | null {
  const cursorIndex = text.indexOf(cursorMarker);

  if (cursorIndex === -1) {
    return null;
  }

  const startIndex = Math.max(0, cursorIndex - contextSize);
  const endIndex = Math.min(
    text.length,
    cursorIndex + cursorMarker.length + contextSize
  );
  const substring = text.slice(startIndex, endIndex);
  return substring;
}
