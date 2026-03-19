
export interface AvailableMCP {
  id: string;
  name: string;
  description: string;
  logo: string;
  logoDark?: string;
}

export const getAvailableMCPs = (t: (key: string) => string): AvailableMCP[] => [
  {
    id: 'github',
    name: 'GitHub',
    description:
      t('mcpServers.github.description') ||
      'Integração com repositórios, issues, pull requests e ações do GitHub.',
    logo: '/integrations/github.png',
    logoDark: '/integrations/github.png',
  },
  {
    id: 'notion',
    name: 'Notion',
    description:
      t('mcpServers.notion.description') || 'Acesse e atualize páginas, databases e blocos do Notion.',
    logo: '/integrations/notion.png',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description:
      t('mcpServers.stripe.description') ||
      'Gerencie pagamentos, assinaturas e informações de clientes no Stripe.',
    logo: '/integrations/stripe.png',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description:
      t('mcpServers.hubspot.description') || 'Sincronize contatos, deals e atividades com o HubSpot CRM.',
    logo: '/integrations/hubspot.png',
    logoDark: '/integrations/hubspot-dark.png',
  },
  {
    id: 'linear',
    name: 'Linear',
    description:
      t('mcpServers.linear.description') || 'Crie e gerencie issues, projetos e roadmaps no Linear.',
    logo: '/integrations/linear.png',
    logoDark: '/integrations/linear-dark.png',
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description:
      t('mcpServers.monday.description') || 'Gerencie boards, itens e automações no Monday.com.',
    logo: '/integrations/monday.png',
    logoDark: '/integrations/monday.png',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description:
      t('mcpServers.supabase.description') ||
      'Acesse e gerencie projetos, bancos de dados e APIs do Supabase.',
    logo: '/integrations/supabase.png',
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    description:
      t('mcpServers.atlassian.description') ||
      'Acesse Jira, Confluence e outras ferramentas do Atlassian.',
    logo: '/integrations/atlassian.png',
    logoDark: '/integrations/atlassian.png',
  },
  {
    id: 'asana',
    name: 'Asana',
    description:
      t('mcpServers.asana.description') || 'Gerencie projetos, tarefas e equipes no Asana.',
    logo: '/integrations/asana.png',
    logoDark: '/integrations/asana.png',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description:
      t('mcpServers.paypal.description') ||
      'Gerencie pagamentos, transações e informações de clientes no PayPal.',
    logo: '/integrations/paypal.png',
  },
  {
    id: 'canva',
    name: 'Canva',
    description:
      t('mcpServers.canva.description') ||
      'Crie e edite designs, apresentações e materiais visuais com Canva.',
    logo: '/integrations/canva.png',
  },
];

