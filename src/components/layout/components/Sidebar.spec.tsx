import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Settings, Cog } from 'lucide-react';
import Sidebar from './Sidebar';
import type { MenuItem as MenuItemType } from '../config/menuItems';

vi.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({ t: (key: string) => key }),
}));

vi.mock('@evoapi/design-system', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button type="button" onClick={onClick} {...props}>{children}</button>
  ),
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <>{children}</>,
}));

vi.mock('./MenuItem', () => ({
  default: ({ item, onClick }: any) => (
    <button type="button" data-testid={`menu-item-${item.id || item.href}`} onClick={onClick}>
      {item.name}
    </button>
  ),
}));

const settingsItem: MenuItemType = {
  id: 'settings',
  name: 'Settings',
  href: '#',
  icon: Settings,
  subItems: [
    { name: 'General', href: '/settings/general', icon: Cog },
    { name: 'Security', href: '/settings/security', icon: Cog },
  ],
};

const contactsItem: MenuItemType = {
  id: 'contacts',
  name: 'Contacts',
  href: '/contacts',
  icon: Cog,
};

const defaultProps = {
  isCollapsed: true,
  menuItems: [settingsItem, contactsItem],
  activeSubmenu: null,
  activeMenu: null,
  isMenuWithSubItemsActive: () => false,
  handleMenuClick: vi.fn(),
  setActiveSubmenu: vi.fn(),
};

function renderSidebar(props = {}) {
  return render(
    <MemoryRouter>
      <Sidebar {...defaultProps} {...props} />
    </MemoryRouter>,
  );
}

describe('Sidebar — collapsed + activeSubmenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render flyout sub-items when activeSubmenu is null', () => {
    renderSidebar({ activeSubmenu: null });
    expect(screen.queryByText('General')).not.toBeInTheDocument();
    expect(screen.queryByText('Security')).not.toBeInTheDocument();
  });

  it('renders flyout sub-items when isCollapsed and activeSubmenu is set', () => {
    renderSidebar({ activeSubmenu: settingsItem });
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('does not apply absolute positioning when sidebar is expanded', () => {
    renderSidebar({ isCollapsed: false, activeSubmenu: settingsItem });
    const flyout = screen.getByText('General').closest('nav')?.parentElement;
    expect(flyout?.className).not.toMatch(/absolute/);
  });

  it('calls setActiveSubmenu(null) when Escape is pressed with flyout open', () => {
    const setActiveSubmenu = vi.fn();
    renderSidebar({ activeSubmenu: settingsItem, setActiveSubmenu });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(setActiveSubmenu).toHaveBeenCalledWith(null);
  });

  it('does not call setActiveSubmenu on Escape when sidebar is expanded', () => {
    const setActiveSubmenu = vi.fn();
    renderSidebar({ isCollapsed: false, activeSubmenu: settingsItem, setActiveSubmenu });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(setActiveSubmenu).not.toHaveBeenCalled();
  });

  it('calls setActiveSubmenu(null) when close button is clicked', () => {
    const setActiveSubmenu = vi.fn();
    renderSidebar({ activeSubmenu: settingsItem, setActiveSubmenu });
    const closeBtn = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
    fireEvent.click(closeBtn!);
    expect(setActiveSubmenu).toHaveBeenCalledWith(null);
  });

  it('switching between submenus: handleMenuClick is called for each icon', () => {
    const handleMenuClick = vi.fn();
    renderSidebar({ activeSubmenu: settingsItem, handleMenuClick });
    const contactsBtn = screen.getByTestId('menu-item-contacts');
    fireEvent.click(contactsBtn);
    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });
});
