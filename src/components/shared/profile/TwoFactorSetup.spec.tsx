import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TwoFactorSetup from './TwoFactorSetup';

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('@/services/profile/twoFactorService', () => ({
  twoFactorService: {
    enable: vi.fn(),
    verify: vi.fn(),
    disable: vi.fn(),
    regenerateBackupCodes: vi.fn(),
    sendEmailCode: vi.fn(),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('TwoFactorSetup — mfa_setup_incomplete warning banner (EVO-1104)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the setup incomplete warning when mfa_setup_incomplete is true and MFA is disabled', () => {
    mockUseAuth.mockReturnValue({
      user: { mfa_enabled: false, mfa_setup_incomplete: true },
    });

    render(<TwoFactorSetup />);

    expect(screen.getByText('twoFactor.setupIncompleteWarning')).toBeInTheDocument();
  });

  it('does not show the warning when mfa_setup_incomplete is false', () => {
    mockUseAuth.mockReturnValue({
      user: { mfa_enabled: false, mfa_setup_incomplete: false },
    });

    render(<TwoFactorSetup />);

    expect(screen.queryByText('twoFactor.setupIncompleteWarning')).not.toBeInTheDocument();
  });

  it('does not show the warning when MFA is fully enabled', () => {
    mockUseAuth.mockReturnValue({
      user: { mfa_enabled: true, mfa_setup_incomplete: true },
    });

    render(<TwoFactorSetup />);

    expect(screen.queryByText('twoFactor.setupIncompleteWarning')).not.toBeInTheDocument();
  });

  it('does not show the warning when user has no mfa_setup_incomplete field', () => {
    mockUseAuth.mockReturnValue({
      user: { mfa_enabled: false },
    });

    render(<TwoFactorSetup />);

    expect(screen.queryByText('twoFactor.setupIncompleteWarning')).not.toBeInTheDocument();
  });
});
