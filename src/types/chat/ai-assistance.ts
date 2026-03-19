export type AIActionType =
  | 'rephrase'
  | 'fix_spelling_grammar'
  | 'expand'
  | 'shorten'
  | 'make_friendly'
  | 'make_formal'
  | 'simplify'
  | 'reply_suggestion'
  | 'summarize'
  | 'analyze_sentiment';

export interface AIAction {
  key: AIActionType;
  // Labels and descriptions are now handled by i18n translations
  // See: aiAssistance.actions.{key}.label and aiAssistance.actions.{key}.description
  label: string;
  description?: string;
}

// Actions available when there's a draft message
// Labels and descriptions are obtained from i18n translations
export const AI_ACTIONS: readonly AIAction[] = [
  { key: 'rephrase', label: '', description: '' },
  { key: 'fix_spelling_grammar', label: '', description: '' },
  { key: 'expand', label: '', description: '' },
  { key: 'shorten', label: '', description: '' },
  { key: 'make_friendly', label: '', description: '' },
  { key: 'make_formal', label: '', description: '' },
  { key: 'simplify', label: '', description: '' },
  { key: 'analyze_sentiment', label: '', description: '' },
] as const;

// Actions available when there's no draft message
// Labels and descriptions are obtained from i18n translations
export const AI_ACTIONS_NO_DRAFT: readonly AIAction[] = [
  { key: 'reply_suggestion', label: '', description: '' },
  { key: 'summarize', label: '', description: '' },
  ...AI_ACTIONS,
] as const;
