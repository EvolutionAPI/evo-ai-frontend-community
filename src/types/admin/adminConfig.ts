export type MailerType = 'smtp' | 'bms' | 'resend';

export interface SmtpConfig {
  MAILER_TYPE: MailerType;
  SMTP_ADDRESS: string;
  SMTP_PORT: number;
  SMTP_USERNAME: string;
  SMTP_PASSWORD_SECRET: string | null;
  SMTP_AUTHENTICATION: 'plain' | 'login' | 'cram_md5';
  SMTP_DOMAIN: string;
  SMTP_ENABLE_STARTTLS_AUTO: boolean;
  SMTP_OPENSSL_VERIFY_MODE: 'none' | 'peer';
  MAILER_SENDER_EMAIL: string;
}

export interface BmsConfig {
  MAILER_TYPE: MailerType;
  BMS_API_SECRET: string | null;
  BMS_IPPOOL: string;
  MAILER_SENDER_EMAIL: string;
}

export interface ResendConfig {
  MAILER_TYPE: MailerType;
  RESEND_API_SECRET: string | null;
  MAILER_SENDER_EMAIL: string;
}

export type EmailConfig = SmtpConfig | BmsConfig | ResendConfig;

export type AdminConfigData = Record<string, string | number | boolean | null | undefined>;
