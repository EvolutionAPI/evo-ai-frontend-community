import { describe, it, expect, beforeEach } from 'vitest';
import { RecaptchaService } from './recaptcha';

describe('RecaptchaService', () => {
  let service: RecaptchaService;

  beforeEach(() => {
    service = RecaptchaService.getInstance();
    service.configure(null); // Reset to default
  });

  it('is disabled when no site key is configured', () => {
    service.configure(null);
    expect(service.isEnabled()).toBe(false);
  });

  it('is enabled when configured with a site key from backend API', () => {
    service.configure('6Lc_backend_key');
    expect(service.isEnabled()).toBe(true);
  });

  it('is disabled when configured with empty string', () => {
    service.configure('');
    expect(service.isEnabled()).toBe(false);
  });

  it('prefers backend API key over env var', () => {
    // Configure with a backend key — should be enabled regardless of VITE_* value
    service.configure('6Lc_from_api');
    expect(service.isEnabled()).toBe(true);
  });

  it('can be reconfigured multiple times', () => {
    service.configure('6Lc_first_key');
    expect(service.isEnabled()).toBe(true);

    service.configure(null);
    expect(service.isEnabled()).toBe(false);

    service.configure('6Lc_second_key');
    expect(service.isEnabled()).toBe(true);
  });
});
