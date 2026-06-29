export interface TextStats {
  words: number;
  characters: number;
  readingMinutes: number;
}

export const getTextStats = (content: string): TextStats => {
  const trimmed = content.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const characters = content.length;
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));

  return { words, characters, readingMinutes };
};
