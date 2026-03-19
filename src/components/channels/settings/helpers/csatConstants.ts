// CSAT Constants (matching Evolution patterns)
import i18n from '@/i18n/config';

export interface CSATRating {
  key: string;
  translationKey: string;
  emoji: string;
  value: number;
  color: string;
}

export const CSAT_RATINGS: CSATRating[] = [
  {
    key: 'disappointed',
    translationKey: 'CSAT.RATINGS.POOR',
    emoji: '😞',
    value: 1,
    color: '#FDAD2A',
  },
  {
    key: 'expressionless',
    translationKey: 'CSAT.RATINGS.FAIR',
    emoji: '😑',
    value: 2,
    color: '#FFC532',
  },
  {
    key: 'neutral',
    translationKey: 'CSAT.RATINGS.AVERAGE',
    emoji: '😐',
    value: 3,
    color: '#FCEC56',
  },
  {
    key: 'grinning',
    translationKey: 'CSAT.RATINGS.GOOD',
    emoji: '😀',
    value: 4,
    color: '#6FD86F',
  },
  {
    key: 'smiling',
    emoji: '😍',
    translationKey: 'CSAT.RATINGS.EXCELLENT',
    value: 5,
    color: '#44CE4B',
  },
];

export const CSAT_DISPLAY_TYPES = {
  EMOJI: 'emoji',
  STAR: 'star',
} as const;

export type CSATDisplayType = typeof CSAT_DISPLAY_TYPES[keyof typeof CSAT_DISPLAY_TYPES];

// Rating labels
export const getRatingLabels = () => ({
  1: i18n.t('channels:settings.csat.ratings.poor'),
  2: i18n.t('channels:settings.csat.ratings.fair'),
  3: i18n.t('channels:settings.csat.ratings.average'),
  4: i18n.t('channels:settings.csat.ratings.good'),
  5: i18n.t('channels:settings.csat.ratings.excellent'),
});

// Survey rule operators
export const getSurveyRuleOperators = () => [
  {
    label: i18n.t('channels:settings.csat.operators.contains'),
    value: 'contains',
  },
  {
    label: i18n.t('channels:settings.csat.operators.doesNotContain'),
    value: 'does_not_contain',
  },
];

// CSAT Trigger interface
export interface CSATTrigger {
  type: string;
  operator?: string;
  values?: string[];
  stage_ids?: string[];
  stage_names?: string[];
  pattern?: string;
  field?: string;
  days?: string[];
  time?: string;
  minutes?: number;
}

// CSAT Configuration interface
export interface CSATConfig {
  display_type: CSATDisplayType;
  message: string;
  survey_rules: {
    triggers: CSATTrigger[];
  };
}

// Default CSAT configuration
export const DEFAULT_CSAT_CONFIG: CSATConfig = {
  display_type: CSAT_DISPLAY_TYPES.EMOJI,
  message: '',
  survey_rules: {
    triggers: [],
  },
};
