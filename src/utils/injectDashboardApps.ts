import { ExternalLink } from 'lucide-react';
import { MenuItem } from '@/components/layout/config/menuItems';
import { DashboardApp } from '@/types/integrations';

/**
 * Injects dashboard apps into menu items at specified positions
 * Apps can be placed 'before' or 'after' a specific menu item
 *
 * @param menuItems - Base menu items array
 * @param dashboardApps - Dashboard apps to inject
 * @returns Modified menu items array with injected apps
 */
export function injectDashboardAppsIntoMenu(
  menuItems: MenuItem[],
  dashboardApps: DashboardApp[]
): MenuItem[] {
  if (!dashboardApps || dashboardApps.length === 0) {
    return menuItems;
  }

  // Filter only sidebar type apps
  const sidebarApps = dashboardApps.filter(app => app.display_type === 'sidebar');

  if (sidebarApps.length === 0) {
    return menuItems;
  }

  // Create a map of apps grouped by menu position
  const appsByMenu = new Map<string, { before: DashboardApp[]; after: DashboardApp[] }>();

  sidebarApps.forEach(app => {
    const menu = app.sidebar_menu || 'conversations';
    const position = app.sidebar_position || 'after';

    if (!appsByMenu.has(menu)) {
      appsByMenu.set(menu, { before: [], after: [] });
    }

    const group = appsByMenu.get(menu)!;
    group[position].push(app);
  });

  // Map to find menu items by their route base
  const menuKeyMap: Record<string, string> = {
    conversations: '/conversations',
    contacts: '/contacts',
    pipelines: '/pipelines',
    campaigns: '/campaigns',
    automation: '/automation',
    agents: '/agents',
    channels: '/channels',
    reports: '/reports',
    settings: '#', // Settings is a parent with subitems
  };

  // Convert dashboard apps to menu items
  const convertAppToMenuItem = (app: DashboardApp): MenuItem => ({
    name: app.title,
    href: `/dashboard-app/${app.id}`,
    icon: ExternalLink,
    resource: 'integrations',
    action: 'read',
  });

  // Process each menu group
  const result: MenuItem[] = [];

  menuItems.forEach(menuItem => {
    // Find if this menu has apps to inject
    let appsToInject: { before: DashboardApp[]; after: DashboardApp[] } | undefined;

    // Try to match by href
    for (const [menuKey, menuHref] of Object.entries(menuKeyMap)) {
      if (menuItem.href === menuHref && appsByMenu.has(menuKey)) {
        appsToInject = appsByMenu.get(menuKey);
        break;
      }
    }

    // Add 'before' apps
    if (appsToInject?.before && appsToInject.before.length > 0) {
      appsToInject.before.forEach(app => {
        result.push(convertAppToMenuItem(app));
      });
    }

    // Add the original menu item
    result.push(menuItem);

    // Add 'after' apps
    if (appsToInject?.after && appsToInject.after.length > 0) {
      appsToInject.after.forEach(app => {
        result.push(convertAppToMenuItem(app));
      });
    }
  });

  return result;
}

