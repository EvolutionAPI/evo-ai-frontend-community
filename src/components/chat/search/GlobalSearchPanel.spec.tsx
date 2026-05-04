import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GlobalSearchPanel from './GlobalSearchPanel';
import type { UseGlobalSearchResult } from '@/hooks/chat/useGlobalSearch';

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

const stableT = (key: string) => key;

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({ t: stableT }),
}));

const mockUseGlobalSearch = vi.fn<[string], UseGlobalSearchResult>();

vi.mock('@/hooks/chat/useGlobalSearch', () => ({
  __esModule: true,
  default: (term: string) => mockUseGlobalSearch(term),
  useGlobalSearch: (term: string) => mockUseGlobalSearch(term),
}));

const buildResult = (overrides: Partial<UseGlobalSearchResult> = {}): UseGlobalSearchResult => ({
  status: 'success',
  error: null,
  conversations: [],
  contacts: [],
  messages: [],
  isEmpty: false,
  term: 'acme',
  ...overrides,
});

const conversation = {
  id: 'c-1',
  display_id: 123,
  created_at: 0,
  message: { id: 1, content: 'hello world', message_type: 0, content_type: 'text', source_id: null, inbox_id: 1, conversation_id: 123, created_at: 0 },
  contact: { id: 1, name: 'Acme Contact', email: null, phone_number: null, identifier: null },
  inbox: { id: 1, name: 'Website' },
  agent: null,
  additional_attributes: {},
};

const contact = {
  id: 42,
  name: 'Acme Contact',
  email: 'acme@example.com',
  phone_number: null,
  identifier: null,
};

const message = {
  id: 999,
  content: 'Acme mentioned here',
  message_type: 0,
  content_type: 'text',
  source_id: null,
  inbox_id: 1,
  conversation_id: 123,
  created_at: 0,
  sender: { id: 5, name: 'Operator', type: 'user', available_name: 'Operator' },
  inbox: { id: 1, name: 'Website' },
};

describe('GlobalSearchPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGlobalSearch.mockReturnValue(buildResult());
  });

  const baseProps = {
    isOpen: true,
    searchTerm: 'acme',
    rawInputValue: 'acme',
    onClose: vi.fn(),
    onSelectConversation: vi.fn(),
    onSelectContact: vi.fn(),
    onSelectMessage: vi.fn(),
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<GlobalSearchPanel {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state', () => {
    mockUseGlobalSearch.mockReturnValue(buildResult({ status: 'loading' }));
    render(<GlobalSearchPanel {...baseProps} />);
    expect(screen.getByText('globalSearch.loading')).toBeInTheDocument();
  });

  it('shows error state with custom error message', () => {
    mockUseGlobalSearch.mockReturnValue(
      buildResult({ status: 'error', error: 'boom' }),
    );
    render(<GlobalSearchPanel {...baseProps} />);
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('shows "noResults" empty state on successful empty search', () => {
    mockUseGlobalSearch.mockReturnValue(
      buildResult({ status: 'success', isEmpty: true }),
    );
    render(<GlobalSearchPanel {...baseProps} />);
    expect(screen.getByText('globalSearch.noResults')).toBeInTheDocument();
  });

  it('renders three sections when all entity types have results', () => {
    mockUseGlobalSearch.mockReturnValue(
      buildResult({
        conversations: [conversation],
        contacts: [contact],
        messages: [message],
      }),
    );
    render(<GlobalSearchPanel {...baseProps} />);

    expect(screen.getByText('globalSearch.sections.conversations')).toBeInTheDocument();
    expect(screen.getByText('globalSearch.sections.contacts')).toBeInTheDocument();
    expect(screen.getByText('globalSearch.sections.messages')).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0].textContent).toContain('Acme Contact');
    expect(options[0].textContent).toContain('#123');
    expect(options[1].textContent).toContain('acme@example.com');
    expect(options[2].textContent).toContain('Acme mentioned here');
  });

  it('invokes onSelectConversation and onClose when a conversation result is clicked', async () => {
    mockUseGlobalSearch.mockReturnValue(buildResult({ conversations: [conversation] }));
    const props = { ...baseProps, onSelectConversation: vi.fn(), onClose: vi.fn() };
    render(<GlobalSearchPanel {...props} />);

    await userEvent.click(screen.getByRole('option'));

    expect(props.onSelectConversation).toHaveBeenCalledWith(conversation);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('invokes onSelectContact and onClose when a contact result is clicked', async () => {
    mockUseGlobalSearch.mockReturnValue(buildResult({ contacts: [contact] }));
    const props = { ...baseProps, onSelectContact: vi.fn(), onClose: vi.fn() };
    render(<GlobalSearchPanel {...props} />);

    await userEvent.click(screen.getByRole('option'));

    expect(props.onSelectContact).toHaveBeenCalledWith(contact);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('invokes onSelectMessage and onClose when a message result is clicked', async () => {
    mockUseGlobalSearch.mockReturnValue(buildResult({ messages: [message] }));
    const props = { ...baseProps, onSelectMessage: vi.fn(), onClose: vi.fn() };
    render(<GlobalSearchPanel {...props} />);

    await userEvent.click(screen.getByRole('option'));

    expect(props.onSelectMessage).toHaveBeenCalledWith(message);
    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls onClose when the user presses Escape', () => {
    const props = { ...baseProps, onClose: vi.fn() };
    render(<GlobalSearchPanel {...props} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(props.onClose).toHaveBeenCalled();
  });

  it('calls onClose when the user clicks outside the panel', () => {
    const props = { ...baseProps, onClose: vi.fn() };
    const { container } = render(
      <>
        <div data-testid="outside">outside</div>
        <GlobalSearchPanel {...props} />
      </>,
    );

    const outside = container.querySelector('[data-testid="outside"]') as HTMLElement;
    fireEvent.mouseDown(outside);

    expect(props.onClose).toHaveBeenCalled();
  });

  it('shows per-section empty fallback when only some sections have results', () => {
    mockUseGlobalSearch.mockReturnValue(
      buildResult({
        conversations: [conversation],
        contacts: [],
        messages: [],
      }),
    );
    render(<GlobalSearchPanel {...baseProps} />);

    expect(screen.queryByText('globalSearch.sections.conversationsEmpty')).not.toBeInTheDocument();
    expect(screen.getByText('globalSearch.sections.contactsEmpty')).toBeInTheDocument();
    expect(screen.getByText('globalSearch.sections.messagesEmpty')).toBeInTheDocument();
  });

  it('limits each section to 5 results', () => {
    const manyConversations = Array.from({ length: 8 }, (_, i) => ({
      ...conversation,
      id: `c-${i}`,
      display_id: 100 + i,
      contact: { ...conversation.contact!, id: i + 1, name: `Contact ${i}` },
    }));
    mockUseGlobalSearch.mockReturnValue(buildResult({ conversations: manyConversations }));
    render(<GlobalSearchPanel {...baseProps} />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(5);
  });
});
