/**
 * Google Sheets Integration Types
 * Types for Google Sheets integration with agent tools
 */

export interface GoogleSheetsConfig {
  provider: 'google_sheets';
  email?: string;
  connected?: boolean;
  spreadsheets?: GoogleSheetsItem[];
  settings?: SheetsSettings;
}

export interface GoogleSheetsItem {
  id: string;
  name: string;
  url?: string;
  selected?: boolean;
}

export interface SheetsSettings {
  selectedSpreadsheetId?: string;
  allowRead?: boolean;
  allowWrite?: boolean;
  allowCreate?: boolean;
  autoSyncEnabled?: boolean;
}

export interface GoogleSheetsOAuthResponse {
  url: string;
}

export interface GoogleSheetsConnectionResponse {
  success: boolean;
  email?: string;
  spreadsheets?: GoogleSheetsItem[];
  error?: string;
}
