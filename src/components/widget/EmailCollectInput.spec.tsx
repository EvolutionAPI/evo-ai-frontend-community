import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailCollectInput } from './EmailCollectInput';

// Mock useLanguage
vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'emailCollect.placeholder': 'Enter your email',
        'emailCollect.button': 'Send',
        'emailCollect.invalidEmail': 'Invalid email',
        'emailCollect.success': 'Email saved!',
        'emailCollect.error': 'Error saving email',
      };
      return map[key] || key;
    },
  }),
}));

// Mock widgetService
const mockUpdateMessage = vi.fn();
vi.mock('@/services/widget/widgetService', () => ({
  widgetService: {
    updateMessage: (...args: unknown[]) => mockUpdateMessage(...args),
  },
}));

describe('EmailCollectInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up window.location.search with a token
    Object.defineProperty(window, 'location', {
      value: { search: '?website_token=test-token' },
      writable: true,
    });
  });

  it('renders input and submit button', () => {
    render(<EmailCollectInput messageId="123" widgetColor="#00d4aa" />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(screen.getByText('Send')).toBeTruthy();
  });

  it('shows success state when alreadySubmitted is true', () => {
    render(<EmailCollectInput messageId="123" widgetColor="#00d4aa" alreadySubmitted />);
    expect(screen.getByText('Email saved!')).toBeTruthy();
    expect(screen.queryByPlaceholderText('Enter your email')).toBeNull();
  });

  it('shows validation error for invalid email', () => {
    render(<EmailCollectInput messageId="123" widgetColor="#00d4aa" />);
    const input = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(input, { target: { value: 'notanemail' } });
    fireEvent.click(screen.getByText('Send'));
    expect(screen.getByText('Invalid email')).toBeTruthy();
  });

  it('submits valid email and shows success', async () => {
    mockUpdateMessage.mockResolvedValueOnce({});
    const onSubmitted = vi.fn();

    render(
      <EmailCollectInput
        messageId="123"
        widgetColor="#00d4aa"
        onSubmitted={onSubmitted}
      />,
    );

    const input = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText('Email saved!')).toBeTruthy();
    });
    expect(mockUpdateMessage).toHaveBeenCalledWith('test-token', '123', 'user@example.com');
    expect(onSubmitted).toHaveBeenCalledWith('user@example.com');
  });

  it('shows error when token is missing', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true,
    });

    render(<EmailCollectInput messageId="123" widgetColor="#00d4aa" />);
    const input = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText('Send'));
    expect(screen.getByText('Error saving email')).toBeTruthy();
  });

  it('shows error when API call fails', async () => {
    mockUpdateMessage.mockRejectedValueOnce(new Error('Network error'));

    render(<EmailCollectInput messageId="123" widgetColor="#00d4aa" />);
    const input = screen.getByPlaceholderText('Enter your email');
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText('Error saving email')).toBeTruthy();
    });
  });
});
