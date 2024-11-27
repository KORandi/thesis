export function extractAroundCursor(
  text: string,
  cursorMarker: string = "[[cursor]]",
  contextSize: number = 500
): string | null {
  const cursorIndex = text.indexOf(cursorMarker);

  if (cursorIndex === -1) {
    return null; // Cursor not found
  }

  // Calculate start and end indices
  const startIndex = Math.max(0, cursorIndex - contextSize);
  const endIndex = Math.min(
    text.length,
    cursorIndex + cursorMarker.length + contextSize
  );

  // Extract the substring
  const substring = text.slice(startIndex, endIndex);
  return substring;
}

// Example usage
const longString = "..."; // Replace with your long string
const result = extractAroundCursor(longString);
console.log(result);
