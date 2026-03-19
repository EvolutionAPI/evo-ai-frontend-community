/**
 * CSAT Survey Types
 * Types for Customer Satisfaction surveys
 */

export interface CSATSurveyResponse {
  rating?: number;
  feedback_message?: string;
}

export interface SurveyDetails {
  inbox_avatar_url: string;
  inbox_name: string;
  csat_survey_response: CSATSurveyResponse | null;
  display_type: 'emoji' | 'star';
  content?: string;
  locale?: string;
}
