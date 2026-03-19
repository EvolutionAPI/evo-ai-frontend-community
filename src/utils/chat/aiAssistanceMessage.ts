const EMPTY_HTML_PATTERNS = /<[^>]*>/g;
const BREAK_TAGS = /<br\s*\/?>/gi;
const NBSP_ENTITIES = /&nbsp;/gi;
const ZERO_WIDTH_CHARS = /[\u200B-\u200D\uFEFF]/g;

export const getVisibleMessageContent = (content = ''): string => {
  return content
    .replace(BREAK_TAGS, ' ')
    .replace(EMPTY_HTML_PATTERNS, '')
    .replace(NBSP_ENTITIES, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(ZERO_WIDTH_CHARS, '')
    .trim();
};

export const hasVisibleMessageContent = (content = ''): boolean => {
  return getVisibleMessageContent(content).length > 0;
};
