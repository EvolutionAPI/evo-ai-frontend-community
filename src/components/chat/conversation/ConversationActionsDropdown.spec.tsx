import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ConversationActionsDropdown from './ConversationActionsDropdown';

const mockConversations = vi.hoisted(() => ({
  updateConversationStatus: vi.fn(),
  updateConversationPriority: vi.fn(),
  pinConversation: vi.fn().mockResolvedValue({}),
  unpinConversation: vi.fn().mockResolvedValue({}),
  archiveConversation: vi.fn().mockResolvedValue({}),
  unarchiveConversation: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/chat/useConversations', () => ({
  useConversations: () => mockConversations,
}));

vi.mock('@evoapi/design-system/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@evoapi/design-system/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('@evoapi/design-system/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

const baseConversation = {
  id: 'conversation-1',
  status: 'open',
  priority: null,
  unread_count: 2,
  custom_attributes: {},
} as any;

describe('ConversationActionsDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when conversation is null', () => {
    const { container } = render(<ConversationActionsDropdown conversation={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onMarkAsRead when conversation has unread messages', () => {
    const onMarkAsRead = vi.fn();

    render(
      <ConversationActionsDropdown
        conversation={{ ...baseConversation, unread_count: 3 }}
        onMarkAsRead={onMarkAsRead}
      />,
    );

    fireEvent.click(screen.getByText('conversationActionsDropdown.markAsRead'));

    expect(onMarkAsRead).toHaveBeenCalledWith(expect.objectContaining({ id: 'conversation-1' }));
  });

  it('calls onMarkAsUnread when conversation has no unread messages', () => {
    const onMarkAsUnread = vi.fn();

    render(
      <ConversationActionsDropdown
        conversation={{ ...baseConversation, unread_count: 0 }}
        onMarkAsUnread={onMarkAsUnread}
      />,
    );

    fireEvent.click(screen.getByText('conversationActionsDropdown.markAsUnread'));

    expect(onMarkAsUnread).toHaveBeenCalledWith(expect.objectContaining({ id: 'conversation-1' }));
  });

  it('pins conversation when not pinned', async () => {
    render(
      <ConversationActionsDropdown
        conversation={{
          ...baseConversation,
          custom_attributes: { pinned: false },
        }}
      />,
    );

    fireEvent.click(screen.getByText('conversationActionsDropdown.pinConversation'));

    await waitFor(() => {
      expect(mockConversations.pinConversation).toHaveBeenCalledWith('conversation-1', undefined);
    });
  });
});
