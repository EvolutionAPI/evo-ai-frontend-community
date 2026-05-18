/**
 * Mock do assistente de IA — apenas visual, sem backend.
 * Swap por implementação real chamando /api/assistant futuramente.
 */

export type AssistantFeature =
  | 'automation'
  | 'agent'
  | 'contacts'
  | 'pipeline'
  | 'products'
  | 'campaigns'
  | 'channels'
  | 'templates'
  | 'journey'
  | 'customTool'
  | 'customMcp'
  | 'segment'
  | 'macro'
  | 'role'
  | 'general';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

export interface AutomationPreviewState {
  name: string;
  description: string;
  event: string;
  conditions: Array<{ field: string; operator: string; value: string }>;
  actions: Array<{ name: string; param: string }>;
  active: boolean;
}

export type AgentType = 'llm' | 'task' | 'sequential' | 'parallel' | 'loop' | 'external';

export type AgentSection =
  | 'profile'
  | 'subAgents'
  | 'tools'
  | 'integrations'
  | 'mcpServers'
  | 'products'
  | 'configuration';

export interface AgentPreviewState {
  // Profile
  name: string;
  type: AgentType;
  role: string;
  goal: string;
  behavior: string;

  // Tools / Sub-agents / Integrations / MCP / Products
  subAgents: string[];
  tools: Array<{ name: string; method?: string; description?: string }>;
  integrations: string[];
  mcpServers: string[];
  products: string[];

  // Configuration
  model: string;
  apiProvider: string;
  capabilities: string[];
  conversationBehavior: string[];

  /** Qual seção está sendo destacada agora (highlight no preview) */
  currentSection: AgentSection | null;
  /** Seções já completadas (recebem ✓) */
  completedSections: AgentSection[];
}

export type FeaturePreview =
  | { feature: 'automation'; state: AutomationPreviewState }
  | { feature: 'agent'; state: AgentPreviewState }
  | { feature: 'journey'; state: JourneyPreviewState }
  | { feature: 'contacts'; state: ContactPreviewState }
  | { feature: 'pipeline'; state: PipelinePreviewState }
  | { feature: 'products'; state: ProductPreviewState }
  | { feature: 'campaigns'; state: CampaignPreviewState }
  | { feature: 'channels'; state: ChannelPreviewState };

// -- Contact ------------------------------------------------------------------

export interface ContactSocialProfile {
  network: 'linkedin' | 'instagram' | 'twitter' | 'facebook' | 'github';
  handle: string;
}

export interface ContactPreviewState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  city: string;
  country: string;
  description: string;
  labels: string[];
  socialProfiles: ContactSocialProfile[];
}

// -- Pipeline -----------------------------------------------------------------

export type PipelineType = 'sales' | 'support' | 'marketing' | 'custom';
export type PipelineVisibility = 'private' | 'public' | 'team';

export interface PipelineStage {
  name: string;
  color: string; // hex ou tailwind class
}

export interface PipelinePreviewState {
  name: string;
  description: string;
  type: PipelineType;
  visibility: PipelineVisibility;
  stages: PipelineStage[];
}

// -- Product ------------------------------------------------------------------

export interface ProductPreviewState {
  name: string;
  kind: 'physical' | 'digital';
  sku: string;
  price: number;
  currency: string;
  description: string;
  stockQuantity: number | null;
  labels: string[];
}

// -- Campaign -----------------------------------------------------------------

export type CampaignChannel = 'whatsapp' | 'email' | 'sms';
export type CampaignType = 'simple' | 'recurring' | 'trigger';
export type CampaignSchedule = 'now' | 'later';

export interface CampaignPreviewState {
  name: string;
  description: string;
  type: CampaignType;
  channel: CampaignChannel;
  audienceLabel: string;
  audienceSize: number;
  templates: string[];
  messagePreview: string;
  schedule: CampaignSchedule;
  scheduledFor: string;
  rateLimitPerHour: number | null;
  useBusinessHours: boolean;
}

// -- Channel ------------------------------------------------------------------

export type ChannelKind =
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'telegram'
  | 'email'
  | 'sms'
  | 'website'
  | 'api';

export interface ChannelPreviewState {
  name: string;
  kind: ChannelKind;
  provider: string;
  rationale: string;
  nextSteps: string[];
  estimatedSetupMinutes: number;
}

// -- Message Template ---------------------------------------------------------

export type TemplateChannelType = 'whatsapp' | 'email' | 'sms' | 'generic';
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'OTHER';

export interface TemplateVariable {
  name: string;
  /** Exemplo de preenchimento para o preview renderizado */
  example: string;
}

export interface TemplatePreviewState {
  name: string;
  category: TemplateCategory;
  language: string;
  channel: TemplateChannelType;
  content: string;
  /** Conteúdo com variáveis substituídas pelos exemplos — pré-calculado para o preview */
  contentRendered: string;
  variables: TemplateVariable[];
  /** Subject só faz sentido pra email */
  emailSubject?: string;
}

// -- Custom Tool (HTTP function tool definida pelo cliente) -------------------

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface CustomToolParam {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
  location: 'path' | 'query' | 'body' | 'header';
}

export interface CustomToolPreviewState {
  name: string;
  description: string;
  method: HttpMethod;
  baseUrl: string;
  path: string;
  authHeader?: string;
  params: CustomToolParam[];
  tags: string[];
  exampleResponse?: string;
}

// -- Segment (filtro de contatos) ---------------------------------------------

export interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

export interface SegmentPreviewState {
  name: string;
  description: string;
  /** AND/OR entre regras */
  logic: 'AND' | 'OR';
  rules: SegmentRule[];
  /** Quantos contatos batem com as regras (estimativa) */
  matchCount: number;
}

// -- Macro (sequência de ações pré-definidas) ---------------------------------

export interface MacroAction {
  type: 'send_message' | 'add_label' | 'remove_label' | 'assign_team' | 'assign_agent' | 'change_priority' | 'move_pipeline' | 'wait';
  label: string;
  /** Resumo curto da config */
  summary: string;
}

export interface MacroPreviewState {
  name: string;
  description: string;
  visibility: 'private' | 'public' | 'team';
  actions: MacroAction[];
}

// -- Role & Permissions -------------------------------------------------------

export interface RolePermissionGroup {
  resource: string;
  /** ações permitidas dentro do recurso */
  actions: string[];
  /** total de ações disponíveis no recurso */
  totalActions: number;
}

export interface RolePreviewState {
  name: string;
  description: string;
  /** Quantos usuários teriam essa role aplicada na proposta */
  estimatedUserCount: number;
  /** Permissões agrupadas por recurso */
  permissions: RolePermissionGroup[];
}

// -- Custom MCP Server --------------------------------------------------------

export interface CustomMcpPreviewState {
  name: string;
  description: string;
  url: string;
  /** Headers (auth, etc) — apenas chaves; valores ficam mascarados */
  headers: Array<{ key: string; valueMasked: string }>;
  /** Tools que o servidor MCP expõe (descobertas via handshake) */
  exposedTools: string[];
  timeoutSeconds: number;
  retryCount: number;
  tags: string[];
}

/**
 * Tipos canônicos dos nós da jornada (mapeiam para os existentes em
 * src/components/journey/nodes/actions). O preview usa apenas para iconografia
 * e label — não precisa cobrir 100% do schema do canvas real.
 */
export type JourneyNodeType =
  | 'trigger'
  | 'wait'
  | 'conditional'
  | 'split'
  | 'scheduled-action'
  | 'send-message'
  | 'send-transcript'
  | 'send-email-team'
  | 'send-webhook'
  | 'add-label'
  | 'remove-label'
  | 'update-contact'
  | 'update-custom-attribute'
  | 'set-variable'
  | 'assign-agent'
  | 'assign-team'
  | 'assign-bot'
  | 'mute-conversation'
  | 'defer-conversation'
  | 'resolve-conversation'
  | 'change-priority'
  | 'exit-journey'
  | 'transfer-journey';

export type JourneyTriggerType =
  | 'Manual'
  | 'Event'
  | 'Segment'
  | 'Schedule'
  | 'Webhook'
  | 'Label'
  | 'ContactCreated';

export interface JourneyPreviewNode {
  id: string;
  type: JourneyNodeType;
  label: string;
  /** Resumo curto da config (1-2 linhas) — ex: "Aguardar 2 dias" */
  summary?: string;
}

export interface JourneyPreviewState {
  name: string;
  description: string;
  trigger: JourneyTriggerType;
  triggerSummary: string;
  nodes: JourneyPreviewNode[];
  active: boolean;
}

export interface AssistantTemplate {
  id: string;
  title: string;
  subtitle: string;
  icon:
    | 'sparkles'
    | 'rocket'
    | 'target'
    | 'inbox'
    | 'tag'
    | 'megaphone'
    | 'route'
    | 'workflow'
    | 'bot'
    | 'headphones'
    | 'calendar'
    | 'shoppingBag';
  prompt: string;
}

const TEMPLATES: Record<AssistantFeature, AssistantTemplate[]> = {
  automation: [
    {
      id: 'auto-welcome',
      title: 'Boas-vindas automáticas',
      subtitle: 'Envie uma mensagem ao iniciar conversa',
      icon: 'sparkles',
      prompt:
        'Quando uma nova conversa for criada por um cliente novo, envie uma mensagem de boas-vindas apresentando a empresa e os horários de atendimento.',
    },
    {
      id: 'auto-vip',
      title: 'Encaminhar VIPs',
      subtitle: 'Roteia clientes com tag VIP para o time',
      icon: 'target',
      prompt:
        'Sempre que um contato com a tag "VIP" abrir uma conversa, atribua para o time de Contas Estratégicas e marque como prioridade alta.',
    },
    {
      id: 'auto-followup',
      title: 'Follow-up sem resposta',
      subtitle: 'Reengaja conversas paradas há 24h',
      icon: 'rocket',
      prompt:
        'Se uma conversa ficou 24h sem resposta do cliente, envie uma mensagem de follow-up amigável e marque com a tag "aguardando-cliente".',
    },
    {
      id: 'auto-handoff',
      title: 'Handoff humano',
      subtitle: 'Transfere do bot para humano',
      icon: 'workflow',
      prompt:
        'Quando o cliente disser "falar com atendente" ou "humano", desligue o agente de IA, atribua a um operador disponível e avise o cliente.',
    },
  ],
  agent: [
    {
      id: 'agent-sdr',
      title: 'SDR de vendas',
      subtitle: 'Qualifica leads e agenda reuniões',
      icon: 'target',
      prompt:
        'Crie um agente SDR para vendas B2B SaaS que qualifica leads usando BANT (orçamento, autoridade, necessidade, prazo), consulta o CRM para ver histórico do contato e agenda reuniões no Google Calendar.',
    },
    {
      id: 'agent-support',
      title: 'Atendente de suporte',
      subtitle: 'Resolve dúvidas e abre tickets',
      icon: 'headphones',
      prompt:
        'Crie um agente de suporte ao cliente que responde dúvidas a partir da Knowledge Nexus, consulta status de pedidos via Stripe, escala para humano quando o usuário pedir e abre tickets no Linear para bugs.',
    },
    {
      id: 'agent-scheduler',
      title: 'Agendador',
      subtitle: 'Marca reuniões automaticamente',
      icon: 'calendar',
      prompt:
        'Crie um agente que marca reuniões no Google Calendar a partir da conversa, sugerindo 3 horários disponíveis e respeitando o fuso horário do cliente.',
    },
    {
      id: 'agent-ecommerce',
      title: 'Consultor de produtos',
      subtitle: 'Recomenda do catálogo',
      icon: 'shoppingBag',
      prompt:
        'Crie um agente para e-commerce que recomenda produtos do catálogo com base no que o cliente descreve, mostra preços e estoque, e ajuda a finalizar a compra.',
    },
  ],
  contacts: [
    {
      id: 'cnt-decision-maker',
      title: 'Lead decision-maker',
      subtitle: 'Contato C-level de empresa enterprise',
      icon: 'target',
      prompt:
        'Crie um contato Carolina Mendes, CMO da Acme Corp (tecnologia), email carolina@acme.com, telefone +55 11 99876-5432, em São Paulo. Tags: VIP, decision-maker, enterprise. LinkedIn: /in/carolina-mendes.',
    },
    {
      id: 'cnt-warm',
      title: 'Lead morno do evento',
      subtitle: 'Veio do webinar de ontem',
      icon: 'rocket',
      prompt:
        'Crie um contato João Pedro Silva, gerente comercial de uma startup de fintech, jpsilva@startup.com.br, +55 21 98765-4321, Rio de Janeiro. Veio do webinar de ontem. Tags: webinar-junho, lead-morno.',
    },
    {
      id: 'cnt-support',
      title: 'Cliente em suporte',
      subtitle: 'Conta ativa com chamado aberto',
      icon: 'headphones',
      prompt:
        'Crie um contato Renata Oliveira, da empresa CloudSoft, renata@cloudsoft.io, +55 11 91234-5678. Cliente desde 2023, plano Business. Tags: cliente-ativo, suporte-aberto.',
    },
  ],
  pipeline: [
    {
      id: 'pipe-vendas',
      title: 'Funil de vendas B2B',
      subtitle: '5 estágios para SaaS enterprise',
      icon: 'route',
      prompt:
        'Crie um pipeline de vendas B2B SaaS com etapas Lead → Qualificação → Demo → Proposta → Negociação → Fechado/Ganho. Visibilidade privada.',
    },
    {
      id: 'pipe-suporte',
      title: 'Suporte por severidade',
      subtitle: 'Tickets ordenados por gravidade',
      icon: 'headphones',
      prompt:
        'Crie um pipeline de Suporte com etapas Triagem, Em andamento, Aguardando cliente, Resolvido. Visibilidade do time. Cores por severidade.',
    },
    {
      id: 'pipe-recruiting',
      title: 'Recrutamento técnico',
      subtitle: 'Processo seletivo de devs',
      icon: 'workflow',
      prompt:
        'Crie um pipeline de Recrutamento com Candidatura, Triagem, Entrevista técnica, Entrevista cultural, Proposta, Contratado. Visibilidade do time.',
    },
    {
      id: 'pipe-marketing',
      title: 'Funil de marketing',
      subtitle: 'Nutrição de leads',
      icon: 'megaphone',
      prompt:
        'Crie um pipeline de Marketing com estágios Visitante, MQL, SQL, Oportunidade, Cliente. Foco em nutrição automática.',
    },
  ],
  products: [
    {
      id: 'prod-physical',
      title: 'Produto físico com estoque',
      subtitle: 'SKU + variantes',
      icon: 'shoppingBag',
      prompt:
        'Crie um produto físico "Camiseta Premium Algodão" com SKU CT-001, preço R$ 89,90, estoque inicial 124 unidades. Tags: verão, algodão, unissex.',
    },
    {
      id: 'prod-digital',
      title: 'Produto digital',
      subtitle: 'E-book ou curso',
      icon: 'sparkles',
      prompt:
        'Crie um produto digital "E-book Guia de Vendas B2B 2025" com SKU EB-VND-25, preço R$ 47,00, sem controle de estoque. Tags: vendas, b2b, ebook.',
    },
    {
      id: 'prod-subscription',
      title: 'Plano de assinatura',
      subtitle: 'Recorrência mensal',
      icon: 'rocket',
      prompt:
        'Crie um produto digital "Plano Pro Mensal" com SKU PLAN-PRO-M, preço R$ 297,00 BRL, descrição curta de benefícios. Tags: saas, mensal, pro.',
    },
  ],
  campaigns: [
    {
      id: 'camp-blackfriday',
      title: 'Black Friday VIP',
      subtitle: 'Promoção para o segmento VIP',
      icon: 'megaphone',
      prompt:
        'Crie uma campanha de Black Friday para o segmento "VIP" via WhatsApp, agendada para 20/11 às 14h, com 2 templates em round-robin, dentro do horário comercial e limite de 200 envios por hora.',
    },
    {
      id: 'camp-reengage',
      title: 'Reengajamento de inativos',
      subtitle: 'Email para quem não abre há 60 dias',
      icon: 'rocket',
      prompt:
        'Crie campanha de email para reengajar contatos com tag "inativo-60d". Enviar imediatamente, template único com chamada "Sentimos sua falta", sem limite de rate.',
    },
    {
      id: 'camp-launch',
      title: 'Lançamento de produto',
      subtitle: 'WhatsApp pro segmento "Beta"',
      icon: 'sparkles',
      prompt:
        'Crie campanha de lançamento via WhatsApp para o segmento "Beta Testers", 3 templates em teste A/B, agendada para 10/03 às 9h, respeitando horário comercial.',
    },
  ],
  channels: [
    {
      id: 'ch-whatsapp-evo',
      title: 'WhatsApp para suporte 24/7',
      subtitle: 'Evolution API · alto volume',
      icon: 'headphones',
      prompt:
        'Preciso de um canal de WhatsApp para suporte 24/7 com alto volume mensal e sem custo por mensagem. Time pequeno.',
    },
    {
      id: 'ch-email-support',
      title: 'Email para tickets formais',
      subtitle: 'Gmail ou Outlook',
      icon: 'inbox',
      prompt:
        'Quero um canal de email para receber tickets formais de clientes enterprise. Usamos Google Workspace.',
    },
    {
      id: 'ch-instagram',
      title: 'Instagram DM',
      subtitle: 'Atendimento social',
      icon: 'sparkles',
      prompt:
        'Preciso atender clientes pelo Instagram Direct. Volume médio (50 conversas/dia), audiência majoritariamente jovem.',
    },
  ],
  templates: [
    {
      id: 'tpl-welcome',
      title: 'Boas-vindas para novo lead',
      subtitle: 'WhatsApp · saudação personalizada',
      icon: 'sparkles',
      prompt:
        'Crie um template de boas-vindas para WhatsApp dirigido a novos leads. Use o nome do contato e mencione o produto que a pessoa demonstrou interesse. Categoria marketing.',
    },
    {
      id: 'tpl-followup',
      title: 'Follow-up de proposta',
      subtitle: 'WhatsApp · após 48h sem resposta',
      icon: 'rocket',
      prompt:
        'Crie um template para follow-up de proposta comercial enviada há 48h sem resposta. Mencione nome, empresa e nome do vendedor. Tom consultivo, não pressionar. Categoria utility.',
    },
    {
      id: 'tpl-email-promo',
      title: 'Email promocional',
      subtitle: 'Black Friday — desconto',
      icon: 'megaphone',
      prompt:
        'Crie um template de email para promoção Black Friday. Assunto chamativo, corpo com nome do cliente, percentual de desconto e código do cupom. Variáveis: nome, desconto, cupom.',
    },
    {
      id: 'tpl-shipping',
      title: 'Confirmação de envio',
      subtitle: 'WhatsApp · pedido despachado',
      icon: 'shoppingBag',
      prompt:
        'Crie um template para confirmar envio de pedido via WhatsApp. Variáveis: nome do cliente, número do pedido, código de rastreio, transportadora, prazo estimado. Categoria utility.',
    },
    {
      id: 'tpl-otp',
      title: 'Código de verificação',
      subtitle: 'SMS · OTP',
      icon: 'target',
      prompt:
        'Crie um template de SMS para código de verificação OTP. Tom direto, curto, sem promoção. Variáveis: código, validade em minutos. Categoria authentication.',
    },
  ],
  segment: [
    {
      id: 'seg-inativos',
      title: 'Inativos há 60 dias',
      subtitle: 'Sem mensagem nem compra',
      icon: 'inbox',
      prompt:
        'Crie um segmento de contatos que não receberam mensagem nem compraram nada nos últimos 60 dias. Excluir quem tem tag "vip".',
    },
    {
      id: 'seg-vip',
      title: 'VIPs Brasil',
      subtitle: 'Top tier brasileiros',
      icon: 'target',
      prompt:
        'Crie um segmento de contatos com tag "VIP", país Brasil e que tiveram pelo menos 1 conversa ativa nos últimos 30 dias.',
    },
    {
      id: 'seg-rfm',
      title: 'Lead quente',
      subtitle: 'Engajados recentemente',
      icon: 'rocket',
      prompt:
        'Crie um segmento de leads quentes: contatos sem tag "cliente" mas com 3+ mensagens enviadas e última interação nos últimos 7 dias.',
    },
  ],
  macro: [
    {
      id: 'mac-vip',
      title: 'Tratar como VIP',
      subtitle: 'Tag + atribui time + prioridade',
      icon: 'target',
      prompt:
        'Crie uma macro que ao ser aplicada em uma conversa adiciona a tag "VIP", atribui ao time de Contas Estratégicas, define prioridade alta e envia uma mensagem padrão de boas-vindas VIP.',
    },
    {
      id: 'mac-encerrar',
      title: 'Encerrar com pesquisa NPS',
      subtitle: 'Resolve + NPS + mover etapa',
      icon: 'workflow',
      prompt:
        'Crie uma macro para encerrar atendimento: envia mensagem de despedida, dispara pesquisa NPS, marca como resolvido e move para etapa "Pós-venda" no pipeline.',
    },
    {
      id: 'mac-escalar',
      title: 'Escalar pro time técnico',
      subtitle: 'Atribui + tag + nota interna',
      icon: 'rocket',
      prompt:
        'Crie uma macro para escalar uma conversa: atribui ao time "Técnico Nível 2", adiciona tag "escalado" e prioridade urgente.',
    },
  ],
  role: [
    {
      id: 'role-sdr',
      title: 'SDR (Vendas)',
      subtitle: 'Acessa pipeline + contatos + conversas',
      icon: 'target',
      prompt:
        'Crie uma role para SDR: pode ler/criar/atualizar contatos e mover cards no pipeline, ler e responder conversas, mas não pode mexer em pipelines, automações ou settings.',
    },
    {
      id: 'role-support',
      title: 'Suporte L1',
      subtitle: 'Conversas + macros',
      icon: 'headphones',
      prompt:
        'Crie uma role para Suporte Nível 1: pode ler e responder conversas, aplicar macros, ver contatos e marcar como resolvido. Sem acesso a pipelines, agents, campanhas ou settings.',
    },
    {
      id: 'role-admin-ops',
      title: 'Admin Operações',
      subtitle: 'Quase tudo, exceto billing',
      icon: 'sparkles',
      prompt:
        'Crie uma role para Admin de Operações: acesso completo a contatos, pipelines, agents, automações, jornadas, campanhas e templates. Sem acesso a billing, users, roles ou admin settings.',
    },
  ],
  customTool: [
    {
      id: 'ct-stripe',
      title: 'Consultar cliente no Stripe',
      subtitle: 'GET /v1/customers/{id} com Bearer',
      icon: 'rocket',
      prompt:
        'Crie uma tool que consulta um cliente no Stripe via GET /v1/customers/{id}. Use Bearer token da minha conta. Retorna nome, email e status de assinatura.',
    },
    {
      id: 'ct-omie',
      title: 'Criar nota fiscal Omie',
      subtitle: 'POST com payload de NF-e',
      icon: 'workflow',
      prompt:
        'Crie uma tool POST para o Omie criar nota fiscal de serviço. Parâmetros: cliente_id, valor, descrição. Auth via API key no header.',
    },
    {
      id: 'ct-internal',
      title: 'Buscar produto no ERP interno',
      subtitle: 'GET com auth basic',
      icon: 'inbox',
      prompt:
        'Crie uma tool GET para o ERP interno em https://erp.local/api/v1/products/{sku}. Auth Basic. Retorna nome, estoque e preço.',
    },
  ],
  customMcp: [
    {
      id: 'mcp-notion',
      title: 'Notion MCP',
      subtitle: 'Acessar pages e databases',
      icon: 'sparkles',
      prompt:
        'Conecte o servidor MCP oficial do Notion em https://mcp.notion.com com minha integration key. Quero que o agente acesse pages e databases.',
    },
    {
      id: 'mcp-github',
      title: 'GitHub MCP',
      subtitle: 'Issues, PRs, commits',
      icon: 'workflow',
      prompt:
        'Conecte o GitHub MCP em https://api.githubcopilot.com/mcp/ com PAT. Quero ler issues, abrir PRs e comentar commits dos meus repos.',
    },
    {
      id: 'mcp-internal',
      title: 'MCP customizado interno',
      subtitle: 'Servidor MCP da empresa',
      icon: 'rocket',
      prompt:
        'Conecte o servidor MCP interno em https://mcp.minha-empresa.com/v1. Auth via header X-API-Key. Timeout 30s, retry 2 vezes.',
    },
  ],
  journey: [
    {
      id: 'jrn-onboarding',
      title: 'Onboarding em 7 dias',
      subtitle: 'Trilha de boas-vindas',
      icon: 'route',
      prompt:
        'Criar jornada de onboarding de 7 dias para novos clientes, com mensagens nos dias 0, 1, 3 e 7, marcando como ativado se responder e encerrando se não responder até o dia 7.',
    },
    {
      id: 'jrn-reengage',
      title: 'Reengajamento de inativos',
      subtitle: 'Reativar clientes parados há 30d',
      icon: 'rocket',
      prompt:
        'Criar jornada de reengajamento para o segmento "Inativos 30 dias". Envia mensagem de reativação, aguarda 3 dias, e se não responder marca como churn.',
    },
    {
      id: 'jrn-cart',
      title: 'Carrinho abandonado',
      subtitle: 'Recupera vendas perdidas',
      icon: 'shoppingBag',
      prompt:
        'Criar jornada para carrinho abandonado disparada por webhook. Aguarda 1 hora, envia lembrete com link, aguarda 1 dia, envia desconto de 10% se ainda não comprou.',
    },
    {
      id: 'jrn-feedback',
      title: 'Pesquisa pós-venda',
      subtitle: 'Coleta NPS após compra',
      icon: 'target',
      prompt:
        'Criar jornada de pós-venda. Aguarda 3 dias após compra, envia pesquisa NPS, se nota for baixa atribui ao time de Customer Success, senão adiciona tag "Promoter".',
    },
  ],
  general: [
    {
      id: 'gen-help',
      title: 'O que preciso fazer hoje?',
      subtitle: 'Resumo do seu CRM',
      icon: 'sparkles',
      prompt: 'Quais itens urgentes precisam da minha atenção hoje?',
    },
    {
      id: 'gen-meet',
      title: 'Prepare minha reunião',
      subtitle: 'Briefing das próximas conversas',
      icon: 'target',
      prompt: 'Prepare-me para as próximas reuniões do dia com base nos contatos do CRM.',
    },
    {
      id: 'gen-pending',
      title: 'Conversas sem resposta',
      subtitle: 'Lista de pendências',
      icon: 'inbox',
      prompt: 'Quais conversas de hoje ainda precisam de resposta minha?',
    },
  ],
};

export function getTemplates(feature: AssistantFeature): AssistantTemplate[] {
  return TEMPLATES[feature] ?? [];
}

/**
 * Sleep utilitário usado para simular streaming.
 */
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export interface StreamHandle {
  cancel: () => void;
}

// =============================================================================
// SKYWAY — eventos enriquecidos baseados nos padrões Lovable/Replit/V0/Cursor
// =============================================================================

export type AutonomyLevel = 'conservative' | 'balanced' | 'autopilot';
export type ToolRiskTag = 'safe' | 'confirm' | 'gated';
export type ChatMode = 'plan' | 'apply';

export interface SkywayPlanStep {
  id: string;
  /** Descrição humana em pt-BR */
  description: string;
  /** Tool ADK que será chamada (pra dar transparência) */
  toolName: string;
  /** Risco da ação — colore o card e afeta aprovação */
  risk: ToolRiskTag;
  /** Se a ação pode ser desfeita depois (move/tag/update = sim; envio de msg = não) */
  reversible: boolean;
  /** Pré-selecionado para aprovação? Default true exceto em `gated` que vem off */
  selectedByDefault: boolean;
}

export interface SkywayPlan {
  id: string;
  /** Resumo de uma linha do que o plano faz */
  summary: string;
  steps: SkywayPlanStep[];
}

export interface SkywayReceiptResult {
  stepId: string;
  description: string;
  status: 'success' | 'error' | 'skipped';
  errorMessage?: string;
  /** Entidade que foi tocada — link para abrir */
  entityRef?: { type: string; id: string; label: string };
  reversible: boolean;
}

export interface SkywayReceipt {
  id: string;
  results: SkywayReceiptResult[];
  /** Há ao menos 1 resultado reversível? Se sim, mostra botão Desfazer */
  undoable: boolean;
  /** ISO timestamp; após esse tempo o Desfazer expira (UX-only no mock) */
  undoExpiresAt: string;
}

export interface SkywayInlineForm {
  id: string;
  /** Headline pra explicar o que vai ser perguntado */
  title: string;
  fields: Array<
    | { name: string; label: string; type: 'text' | 'email' | 'tel'; placeholder?: string; required?: boolean }
    | { name: string; label: string; type: 'number'; placeholder?: string; required?: boolean; min?: number; max?: number; prefix?: string }
    | { name: string; label: string; type: 'date'; required?: boolean }
    | { name: string; label: string; type: 'select'; options: Array<{ value: string; label: string }>; required?: boolean }
  >;
  /** Texto do CTA primário */
  submitLabel: string;
}

export type MentionRefType = 'contato' | 'deal' | 'pipeline' | 'conversa' | 'campanha';
export interface MentionRef {
  type: MentionRefType;
  id: string;
  label: string;
}

export interface StreamCallbacks<TPreview = unknown> {
  onToken: (token: string) => void;
  onPreviewUpdate?: (state: TPreview) => void;
  onDone: (full: string) => void;
  /** SKYWAY: raciocínio resumido entre/antes de tool calls (F-UX-07) */
  onThinking?: (text: string) => void;
  /** SKYWAY: plano numerado antes de executar múltiplas ações (F-UX-03) */
  onPlan?: (plan: SkywayPlan) => void;
  /** SKYWAY: recibo da execução com flag undoable (F-UX-03) */
  onReceipt?: (receipt: SkywayReceipt) => void;
  /** SKYWAY: pergunta estruturada com schema renderizada inline no chat (F-UX-08) */
  onInlineForm?: (form: SkywayInlineForm) => void;
}

export interface StreamOptions {
  /** SKYWAY: contexto anexado via @mentions */
  mentions?: MentionRef[];
  /** SKYWAY: modo de execução — `plan` descreve sem agir; `apply` executa */
  mode?: ChatMode;
  /** SKYWAY: nível de autonomia atual do usuário */
  autonomy?: AutonomyLevel;
}

/**
 * Simula uma resposta da IA com streaming token a token + atualização incremental do preview.
 *
 * SKYWAY — também detecta triggers de demo no `userText` para emitir eventos
 * enriquecidos (thinking, plan, receipt, inline_form). Os triggers são:
 *   - `demo:plan` ou "siga em massa" / "todos" → emite Plan + Receipt
 *   - `demo:thinking` ou perguntas longas → emite Thinking events
 *   - `demo:form` ou pedidos com dado estruturado → emite InlineForm
 */
export function streamAssistantReply<TPreview = unknown>(
  userText: string,
  feature: AssistantFeature,
  cb: StreamCallbacks<TPreview>,
  options?: StreamOptions,
): StreamHandle {
  let cancelled = false;

  (async () => {
    const lower = userText.toLowerCase();
    const mode: ChatMode = options?.mode ?? 'apply';
    const autonomy: AutonomyLevel = options?.autonomy ?? 'balanced';

    // SKYWAY: triggers de demo só ativos no contexto certo.
    // - Em `general` (chat principal): heurística + demo:* explícito.
    // - Em features específicas (pipeline, agent, etc.): apenas demo:* explícito.
    //   Caso contrário, segue fluxo normal de streaming + preview_state, senão
    //   o painel direito (preview da entidade) fica em branco indevidamente.
    const isGeneral = feature === 'general';

    const showThinking = cb.onThinking && (
      lower.includes('demo:thinking') ||
      (isGeneral && (
        lower.includes('quais conversas') ||
        lower.includes('quem mais') ||
        lower.includes('manda um follow') ||
        lower.length > 80
      ))
    );
    const showPlan = cb.onPlan && (
      lower.includes('demo:plan') ||
      (isGeneral && (
        lower.includes('todos') ||
        lower.includes('em massa') ||
        lower.includes('manda um follow') ||
        lower.includes('reengaj') ||
        lower.includes('mover')
      ))
    );
    const showInlineForm = cb.onInlineForm && (
      lower.includes('demo:form') ||
      (isGeneral && (
        lower.includes('agendar') ||
        lower.includes('proposta') ||
        lower.includes('marcar reunião')
      ))
    );

    // 1. THINKING — antes de qualquer coisa, sinaliza que está pensando
    if (showThinking) {
      await wait(220);
      if (cancelled) return;
      cb.onThinking!('Entendendo o pedido…');
      await wait(450);
      if (cancelled) return;
      cb.onThinking!('Consultando o CRM e selecionando ferramentas…');
      await wait(550);
      if (cancelled) return;
    }

    // 2. INLINE FORM — antes da resposta principal, pede dado estruturado
    if (showInlineForm) {
      await wait(300);
      if (cancelled) return;
      cb.onInlineForm!(buildDemoInlineForm(userText));
      // Form bloqueia: fim do turno aguardando submit do usuário no UI.
      cb.onDone('');
      return;
    }

    // 3. PLAN — quando há múltiplas ações, mostra o plano antes
    if (showPlan) {
      await wait(300);
      if (cancelled) return;
      const plan = buildDemoPlan(userText, autonomy);
      cb.onPlan!(plan);

      // Em modo "plan" só descreve. Em "apply" entrega plano + breve resposta.
      if (mode === 'plan') {
        await streamReplyTokens(
          `Aqui está o plano que eu executaria. Em modo Planejar não toco em nada — alterna para "Aplicar" no header quando quiser executar.`,
          cb,
          () => cancelled,
        );
        cb.onDone('');
        return;
      }

      // Em apply, espera 'confirm' externo pra rodar (no mock, o usuário aprova no PlanCard).
      // O receipt é emitido por approvePlan() abaixo, chamado pelo front.
      await streamReplyTokens(
        plan.summary + ' Revise o plano e clique em "Executar" para aplicar.',
        cb,
        () => cancelled,
      );
      cb.onDone('');
      return;
    }

    // 4. Fluxo padrão: streaming de tokens da resposta + previewState
    const reply = composeReply(userText, feature);
    const previewSteps = buildPreviewSteps(userText, feature) as TPreview[];

    await wait(280);
    if (cancelled) return;

    let acc = '';
    const tokens = reply.split(/(\s+)/);

    for (let i = 0; i < tokens.length; i += 1) {
      if (cancelled) return;
      const tok = tokens[i];
      acc += tok;
      cb.onToken(tok);

      const stepIdx = Math.floor((i / tokens.length) * previewSteps.length);
      if (cb.onPreviewUpdate && previewSteps[stepIdx]) {
        cb.onPreviewUpdate(previewSteps[stepIdx]);
      }

      await wait(tok.trim() === '' ? 15 : 28);
    }

    if (!cancelled) cb.onDone(acc);
  })();

  return {
    cancel: () => {
      cancelled = true;
    },
  };
}

/**
 * Compositor de resposta canned. Detecta intenções comuns para soar contextual.
 */
function composeReply(userText: string, feature: AssistantFeature): string {
  const lower = userText.toLowerCase();

  if (feature === 'automation') {
    if (lower.includes('vip') || lower.includes('prioridade')) {
      return [
        'Entendi. Vou montar uma automação que dispara quando uma conversa for criada,',
        'filtra contatos que tenham a tag "VIP" e atribui ao time de Contas Estratégicas',
        'com prioridade alta. Pré-visualização à direita — pode revisar e clicar em',
        '"Criar automação" para salvar.',
      ].join(' ');
    }
    if (lower.includes('follow') || lower.includes('24h') || lower.includes('sem resposta')) {
      return [
        'Configurei uma automação que monitora conversas sem resposta há 24h e envia uma',
        'mensagem de follow-up. Adicionei também uma tag "aguardando-cliente" para você',
        'filtrar depois. Revise no preview à direita.',
      ].join(' ');
    }
    if (lower.includes('boas-vindas') || lower.includes('welcome') || lower.includes('saudação')) {
      return [
        'Pronto — automação de boas-vindas montada. Quando uma nova conversa for criada',
        'por um contato novo, ela envia a mensagem com a apresentação e os horários.',
        'Você pode editar o texto direto no preview antes de criar.',
      ].join(' ');
    }
    return [
      'Beleza. Estruturei uma automação a partir do que você descreveu, escolhendo o',
      'evento mais provável, as condições e a ação. Veja o preview à direita —',
      'qualquer ajuste é só me pedir aqui no chat.',
    ].join(' ');
  }

  if (feature === 'agent') {
    if (lower.includes('sdr') || lower.includes('vendas') || lower.includes('qualific')) {
      return [
        'Configurei um agente SDR completo. Comecei pelo perfil — nome, papel e objetivo. ',
        'Adicionei a metodologia BANT no behavior. Conectei a ferramenta de busca no CRM, ',
        'a integração do Google Calendar e o produto principal para recomendação. Configurei ',
        'o modelo GPT-4 Turbo e habilitei o handoff para humano. Veja todas as seções à direita.',
      ].join('');
    }
    if (lower.includes('suporte') || lower.includes('support') || lower.includes('ticket')) {
      return [
        'Pronto, criei um agente de suporte. Perfil definido como atendente nível 1. Conectei ',
        'a Knowledge Nexus para consulta da base de conhecimento e o MCP do Linear para ',
        'abertura de tickets. Configurei escalação para humano sob demanda e o modelo ',
        'mais econômico. Revise no preview e pode criar.',
      ].join('');
    }
    if (lower.includes('agenda') || lower.includes('reuni') || lower.includes('calend')) {
      return [
        'Configurei um agente focado em agendamento. Liguei a integração do Google Calendar, ',
        'instruí o agente a propor 3 horários disponíveis respeitando o fuso do cliente, e ',
        'definí o modelo GPT-4 Turbo. Pronto para usar.',
      ].join('');
    }
    if (lower.includes('produto') || lower.includes('catálog') || lower.includes('e-commerce') || lower.includes('ecommerce')) {
      return [
        'Montei um consultor de produtos. Vinculei os produtos do seu catálogo, conectei o ',
        'MCP do Stripe para consultar preços e estoque, e configurei o agente para recomendar ',
        'até 3 produtos por interação. Veja o resumo à direita.',
      ].join('');
    }
    return [
      'Configurei o agente baseado no que você descreveu. Defini o perfil, escolhi as ferramentas ',
      'e integrações mais relevantes, e ajustei o modelo. Veja todas as 7 seções no preview à direita.',
    ].join('');
  }

  if (feature === 'contacts') {
    return [
      'Pronto, montei o contato com os dados que você passou. Adicionei tags relevantes ',
      'e dei uma estruturada no perfil. Veja o card à direita — pode revisar e criar.',
    ].join('');
  }

  if (feature === 'pipeline') {
    return [
      'Estruturei o pipeline com as etapas mais comuns para esse caso. Defini o tipo, ',
      'a visibilidade e adicionei cores às etapas para facilitar o scan visual. Veja ',
      'a prévia kanban à direita.',
    ].join('');
  }

  if (feature === 'products') {
    return [
      'Configurei o produto. Defini o tipo (físico/digital), gerei um SKU, ajustei o ',
      'preço e adicionei tags. Revise o card à direita antes de criar.',
    ].join('');
  }

  if (feature === 'campaigns') {
    return [
      'Montei a campanha de ponta a ponta: audiência, canal, templates, agendamento ',
      'e limites. Resumo completo no preview à direita — você pode ajustar qualquer ',
      'campo no chat.',
    ].join('');
  }

  if (feature === 'channels') {
    return [
      'Com base no que você descreveu, escolhi o canal e o provider que mais se ',
      'encaixam. Mostrei o porquê e os próximos passos para configurar. Veja a ',
      'recomendação à direita.',
    ].join('');
  }

  if (feature === 'segment') {
    return [
      'Montei o segmento. Defini as regras com a lógica AND/OR mais natural pro caso, ',
      'estimei a contagem de contatos que batem e listei tudo pra você revisar antes de criar.',
    ].join('');
  }

  if (feature === 'macro') {
    return [
      'Configurei a macro com a sequência de ações. Cada uma é executada em ordem quando ',
      'um operador aplica a macro numa conversa. Você pode reordenar ou editar antes de salvar.',
    ].join('');
  }

  if (feature === 'role') {
    return [
      'Estruturei a role com as permissões mínimas pra esse perfil. Veja o que está ',
      'liberado por recurso à direita — pode marcar/desmarcar antes de criar.',
    ].join('');
  }

  if (feature === 'customTool') {
    return [
      'Configurei a function tool HTTP. Defini método, URL, parâmetros (com tipo e local: path/query/body/header) ',
      'e autenticação. Veja a especificação à direita — você pode testá-la antes de salvar.',
    ].join('');
  }

  if (feature === 'customMcp') {
    return [
      'Conectei ao servidor MCP. Fiz handshake e descobri as tools que ele expõe. ',
      'Configurei timeout, retry e headers de auth (mascarados). Revise as ferramentas disponíveis no preview.',
    ].join('');
  }

  if (feature === 'templates') {
    return [
      'Pronto, escrevi o template com base no que você pediu. Detectei as variáveis ',
      'automaticamente e gerei a prévia já preenchida com exemplos. Você pode ajustar ',
      'o tom ou pedir variações no chat antes de salvar.',
    ].join('');
  }

  if (feature === 'journey') {
    if (lower.includes('onboarding') || lower.includes('boas-vindas') || lower.includes('novo cliente')) {
      return [
        'Estruturei uma jornada de onboarding de 7 dias. Comecei com gatilho automático ',
        'na criação do contato, mensagem de boas-vindas, espera, mensagem de valor no dia 3, ',
        'check-in no dia 7 e encerramento. Veja o fluxo completo à direita.',
      ].join('');
    }
    if (lower.includes('reengaja') || lower.includes('inativ') || lower.includes('churn')) {
      return [
        'Montei a jornada de reengajamento. O gatilho é a entrada no segmento "Inativos 30 dias". ',
        'A jornada envia mensagem de reativação, aguarda 3 dias, e bifurca: se respondeu, ',
        'remove a tag de inativo; se não, marca como churn e encerra.',
      ].join('');
    }
    if (lower.includes('carrinho') || lower.includes('cart') || lower.includes('abandon')) {
      return [
        'Configurei a jornada de carrinho abandonado. Gatilho via webhook do checkout, ',
        'espera de 1 hora, lembrete com link do carrinho, espera de 1 dia, oferta de 10% ',
        'de desconto. Bifurca quando o cliente recompra.',
      ].join('');
    }
    if (lower.includes('nps') || lower.includes('feedback') || lower.includes('pesquisa') || lower.includes('pós-venda') || lower.includes('pos-venda')) {
      return [
        'Pronto, criei a jornada de pesquisa pós-venda. Aguarda 3 dias após o gatilho, ',
        'envia o NPS e bifurca: notas 0–6 vão para o time de Customer Success, 9–10 ',
        'recebem a tag "Promoter". Veja o fluxo no preview.',
      ].join('');
    }
    return [
      'Desenhei uma jornada com base no seu pedido. Defini o gatilho, montei a sequência ',
      'de nós conectados e adicionei as ramificações. Veja o fluxo no preview à direita ',
      '— você pode abrir no canvas depois para ajustar.',
    ].join('');
  }

  if (feature === 'general') {
    return [
      'Aqui está um resumo do que encontrei no seu CRM. Posso aprofundar em qualquer',
      'item, criar uma automação, abrir uma conversa ou puxar um relatório — é só',
      'pedir.',
    ].join(' ');
  }

  return [
    'Entendi o que você quer. Já tenho uma primeira versão pronta no preview à direita.',
    'Posso ajustar nomes, regras e ações — só dizer aqui no chat.',
  ].join(' ');
}

/**
 * Cria sequência incremental de estados do preview para parecer "construção ao vivo".
 * Retorna AutomationPreviewState[] | AgentPreviewState[] dependendo da feature.
 */
function buildPreviewSteps(userText: string, feature: AssistantFeature): unknown[] {
  if (feature === 'agent') return buildAgentSteps(userText);
  if (feature === 'journey') return buildJourneySteps(userText);
  if (feature === 'contacts') return buildContactSteps(userText);
  if (feature === 'pipeline') return buildPipelineSteps(userText);
  if (feature === 'products') return buildProductSteps(userText);
  if (feature === 'campaigns') return buildCampaignSteps(userText);
  if (feature === 'channels') return buildChannelSteps(userText);
  if (feature === 'templates') return buildTemplateSteps(userText);
  if (feature === 'customTool') return buildCustomToolSteps(userText);
  if (feature === 'customMcp') return buildCustomMcpSteps(userText);
  if (feature === 'segment') return buildSegmentSteps(userText);
  if (feature === 'macro') return buildMacroSteps(userText);
  if (feature === 'role') return buildRoleSteps(userText);
  if (feature !== 'automation') return [];

  const lower = userText.toLowerCase();

  const base: AutomationPreviewState = {
    name: '',
    description: '',
    event: '',
    conditions: [],
    actions: [],
    active: true,
  };

  if (lower.includes('vip') || lower.includes('prioridade')) {
    return [
      { ...base, name: 'Roteamento VIP' },
      { ...base, name: 'Roteamento VIP', event: 'conversation_created' },
      {
        ...base,
        name: 'Roteamento VIP',
        event: 'conversation_created',
        conditions: [{ field: 'contact.tag', operator: 'contém', value: 'VIP' }],
      },
      {
        name: 'Roteamento VIP',
        description: 'Atribui clientes VIP ao time estratégico com prioridade alta.',
        event: 'conversation_created',
        conditions: [{ field: 'contact.tag', operator: 'contém', value: 'VIP' }],
        actions: [
          { name: 'assign_team', param: 'Contas Estratégicas' },
          { name: 'set_priority', param: 'alta' },
        ],
        active: true,
      },
    ];
  }

  if (lower.includes('follow') || lower.includes('24h') || lower.includes('sem resposta')) {
    return [
      { ...base, name: 'Follow-up 24h' },
      { ...base, name: 'Follow-up 24h', event: 'conversation_idle_24h' },
      {
        ...base,
        name: 'Follow-up 24h',
        event: 'conversation_idle_24h',
        conditions: [{ field: 'last_message.from', operator: 'igual a', value: 'agente' }],
      },
      {
        name: 'Follow-up 24h',
        description: 'Reengaja conversas sem resposta do cliente há 24 horas.',
        event: 'conversation_idle_24h',
        conditions: [{ field: 'last_message.from', operator: 'igual a', value: 'agente' }],
        actions: [
          { name: 'send_message', param: 'Oi! Ainda posso te ajudar com algo?' },
          { name: 'add_tag', param: 'aguardando-cliente' },
        ],
        active: true,
      },
    ];
  }

  if (lower.includes('boas-vindas') || lower.includes('welcome') || lower.includes('saudação')) {
    return [
      { ...base, name: 'Boas-vindas' },
      { ...base, name: 'Boas-vindas', event: 'conversation_created' },
      {
        ...base,
        name: 'Boas-vindas',
        event: 'conversation_created',
        conditions: [{ field: 'contact.is_new', operator: 'igual a', value: 'true' }],
      },
      {
        name: 'Boas-vindas',
        description: 'Mensagem inicial para novos contatos com horários de atendimento.',
        event: 'conversation_created',
        conditions: [{ field: 'contact.is_new', operator: 'igual a', value: 'true' }],
        actions: [
          {
            name: 'send_message',
            param:
              'Olá! Que bom ter você por aqui. Atendemos de segunda a sexta, 9h às 18h. Como posso ajudar?',
          },
        ],
        active: true,
      },
    ];
  }

  // Fallback genérico
  return [
    { ...base, name: 'Nova automação' },
    { ...base, name: 'Nova automação', event: 'conversation_created' },
    {
      name: 'Nova automação',
      description: userText.slice(0, 120),
      event: 'conversation_created',
      conditions: [],
      actions: [{ name: 'send_message', param: 'Resposta automática gerada pela IA.' }],
      active: true,
    },
  ];
}

/**
 * Cria sequência de estados do AgentPreview, simulando o agente sendo montado
 * seção por seção (Profile → Sub Agents → Tools → ...).
 */
function buildAgentSteps(userText: string): AgentPreviewState[] {
  const lower = userText.toLowerCase();

  const empty: AgentPreviewState = {
    name: '',
    type: 'llm',
    role: '',
    goal: '',
    behavior: '',
    subAgents: [],
    tools: [],
    integrations: [],
    mcpServers: [],
    products: [],
    model: '',
    apiProvider: '',
    capabilities: [],
    conversationBehavior: [],
    currentSection: null,
    completedSections: [],
  };

  const variant = (() => {
    if (lower.includes('sdr') || lower.includes('vendas') || lower.includes('qualific')) {
      return {
        name: 'SDR de Vendas',
        type: 'llm' as AgentType,
        role: 'SDR consultivo para SaaS B2B',
        goal: 'Qualificar leads enterprise usando metodologia BANT e agendar reuniões.',
        behavior:
          'Você é um SDR experiente. Use BANT (orçamento, autoridade, necessidade, prazo) para qualificar. Seja consultivo, faça perguntas abertas e nunca pressione. Se o lead estiver qualificado, ofereça agendar reunião.',
        tools: [
          { name: 'search_crm', method: 'GET', description: 'Busca histórico do contato' },
          { name: 'log_qualification', method: 'POST', description: 'Registra dados BANT' },
        ],
        integrations: ['Google Calendar', 'Knowledge Nexus'],
        mcpServers: ['HubSpot'],
        products: ['Plano Enterprise', 'Plano Business'],
        model: 'GPT-4 Turbo',
        apiProvider: 'OpenAI',
        capabilities: ['Planner'],
        conversationBehavior: ['Transferir para humano', 'Permitir registrar lembretes'],
      };
    }
    if (lower.includes('suporte') || lower.includes('support') || lower.includes('ticket')) {
      return {
        name: 'Atendente de Suporte N1',
        type: 'llm' as AgentType,
        role: 'Atendente de suporte nível 1',
        goal: 'Resolver dúvidas comuns consultando a base e escalar quando necessário.',
        behavior:
          'Você é um atendente cordial. Sempre consulte a Knowledge Nexus antes de responder. Se a dúvida exigir bug fix ou acesso a dados privados, abra um ticket no Linear e escale para humano.',
        tools: [
          { name: 'create_ticket', method: 'POST', description: 'Abre ticket no Linear' },
        ],
        integrations: ['Knowledge Nexus'],
        mcpServers: ['Linear', 'Stripe'],
        products: [],
        model: 'GPT-4o Mini',
        apiProvider: 'OpenAI',
        capabilities: [],
        conversationBehavior: ['Transferir para humano', 'Permitir editar contatos'],
      };
    }
    if (lower.includes('agenda') || lower.includes('reuni') || lower.includes('calend')) {
      return {
        name: 'Agendador Inteligente',
        type: 'llm' as AgentType,
        role: 'Especialista em agendamento',
        goal: 'Marcar reuniões automaticamente respeitando agenda e fuso.',
        behavior:
          'Proponha 3 horários disponíveis no Google Calendar respeitando o fuso do cliente. Confirme apenas com o slot aceito. Use linguagem amigável.',
        tools: [],
        integrations: ['Google Calendar'],
        mcpServers: [],
        products: [],
        model: 'GPT-4 Turbo',
        apiProvider: 'OpenAI',
        capabilities: [],
        conversationBehavior: ['Permitir registrar lembretes'],
      };
    }
    if (lower.includes('produto') || lower.includes('catálog') || lower.includes('ecommerce') || lower.includes('e-commerce')) {
      return {
        name: 'Consultor de Produtos',
        type: 'llm' as AgentType,
        role: 'Consultor de e-commerce',
        goal: 'Recomendar produtos do catálogo com base no que o cliente descreve.',
        behavior:
          'Recomende até 3 produtos relevantes do catálogo. Mostre preço e disponibilidade. Se o cliente pedir, ajude a finalizar a compra.',
        tools: [
          { name: 'check_stock', method: 'GET', description: 'Consulta estoque' },
        ],
        integrations: [],
        mcpServers: ['Stripe'],
        products: ['Camiseta Premium', 'Calça Jeans', 'Tênis Esportivo'],
        model: 'GPT-4o Mini',
        apiProvider: 'OpenAI',
        capabilities: [],
        conversationBehavior: ['Permitir gravar vendas no pipeline'],
      };
    }
    // Fallback genérico
    return {
      name: 'Novo Agente',
      type: 'llm' as AgentType,
      role: 'Assistente conversacional',
      goal: userText.slice(0, 120) || 'Apoiar o usuário em tarefas conversacionais.',
      behavior: 'Seja prestativo, claro e direto. Confirme antes de executar ações.',
      tools: [],
      integrations: [],
      mcpServers: [],
      products: [],
      model: 'GPT-4o Mini',
      apiProvider: 'OpenAI',
      capabilities: [],
      conversationBehavior: ['Transferir para humano'],
    };
  })();

  // Sequência incremental: cada step preenche uma seção e marca a anterior como completa.
  const steps: AgentPreviewState[] = [];

  // 1. Profile
  steps.push({
    ...empty,
    name: variant.name,
    type: variant.type,
    currentSection: 'profile',
  });
  steps.push({
    ...empty,
    name: variant.name,
    type: variant.type,
    role: variant.role,
    goal: variant.goal,
    behavior: variant.behavior,
    currentSection: 'profile',
  });

  // 2. Tools
  steps.push({
    ...empty,
    name: variant.name,
    type: variant.type,
    role: variant.role,
    goal: variant.goal,
    behavior: variant.behavior,
    tools: variant.tools,
    currentSection: 'tools',
    completedSections: ['profile'],
  });

  // 3. Integrations
  steps.push({
    ...empty,
    name: variant.name,
    type: variant.type,
    role: variant.role,
    goal: variant.goal,
    behavior: variant.behavior,
    tools: variant.tools,
    integrations: variant.integrations,
    currentSection: 'integrations',
    completedSections: ['profile', 'tools'],
  });

  // 4. MCP Servers
  steps.push({
    ...empty,
    name: variant.name,
    type: variant.type,
    role: variant.role,
    goal: variant.goal,
    behavior: variant.behavior,
    tools: variant.tools,
    integrations: variant.integrations,
    mcpServers: variant.mcpServers,
    currentSection: 'mcpServers',
    completedSections: ['profile', 'tools', 'integrations'],
  });

  // 5. Products
  steps.push({
    ...empty,
    name: variant.name,
    type: variant.type,
    role: variant.role,
    goal: variant.goal,
    behavior: variant.behavior,
    tools: variant.tools,
    integrations: variant.integrations,
    mcpServers: variant.mcpServers,
    products: variant.products,
    currentSection: 'products',
    completedSections: ['profile', 'tools', 'integrations', 'mcpServers'],
  });

  // 6. Configuration (final)
  steps.push({
    ...empty,
    name: variant.name,
    type: variant.type,
    role: variant.role,
    goal: variant.goal,
    behavior: variant.behavior,
    tools: variant.tools,
    integrations: variant.integrations,
    mcpServers: variant.mcpServers,
    products: variant.products,
    model: variant.model,
    apiProvider: variant.apiProvider,
    capabilities: variant.capabilities,
    conversationBehavior: variant.conversationBehavior,
    currentSection: 'configuration',
    completedSections: ['profile', 'tools', 'integrations', 'mcpServers', 'products'],
  });

  // Final completo
  steps.push({
    ...empty,
    name: variant.name,
    type: variant.type,
    role: variant.role,
    goal: variant.goal,
    behavior: variant.behavior,
    tools: variant.tools,
    integrations: variant.integrations,
    mcpServers: variant.mcpServers,
    products: variant.products,
    model: variant.model,
    apiProvider: variant.apiProvider,
    capabilities: variant.capabilities,
    conversationBehavior: variant.conversationBehavior,
    currentSection: null,
    completedSections: ['profile', 'tools', 'integrations', 'mcpServers', 'products', 'configuration'],
  });

  return steps;
}

/**
 * Gera estados incrementais do JourneyPreview, simulando o fluxo sendo desenhado
 * nó por nó (cada step adiciona mais um nó à lista).
 */
function buildJourneySteps(userText: string): JourneyPreviewState[] {
  const lower = userText.toLowerCase();

  type Variant = {
    name: string;
    description: string;
    trigger: JourneyTriggerType;
    triggerSummary: string;
    nodes: JourneyPreviewNode[];
  };

  const variant: Variant = (() => {
    if (lower.includes('onboarding') || lower.includes('boas-vindas') || lower.includes('novo cliente')) {
      return {
        name: 'Onboarding 7 dias',
        description: 'Trilha de boas-vindas para novos clientes',
        trigger: 'ContactCreated',
        triggerSummary: 'Quando um contato for criado',
        nodes: [
          { id: 'n1', type: 'send-message', label: 'Mensagem de boas-vindas', summary: 'Olá {{nome}}! Bem-vindo(a)…' },
          { id: 'n2', type: 'wait', label: 'Aguardar', summary: '1 dia' },
          { id: 'n3', type: 'send-message', label: 'Dica de uso', summary: 'Mostra recurso principal' },
          { id: 'n4', type: 'wait', label: 'Aguardar', summary: '2 dias' },
          { id: 'n5', type: 'send-message', label: 'Mensagem de valor', summary: 'Cases de sucesso' },
          { id: 'n6', type: 'wait', label: 'Aguardar', summary: '4 dias' },
          { id: 'n7', type: 'conditional', label: 'O cliente respondeu?', summary: 'Sim → ativar · Não → reengajar' },
          { id: 'n8', type: 'add-label', label: 'Marcar como ativado', summary: 'tag "ativado"' },
          { id: 'n9', type: 'exit-journey', label: 'Encerrar jornada' },
        ],
      };
    }
    if (lower.includes('reengaja') || lower.includes('inativ') || lower.includes('churn')) {
      return {
        name: 'Reengajamento de inativos',
        description: 'Reativa clientes parados há 30 dias',
        trigger: 'Segment',
        triggerSummary: 'Entrou no segmento "Inativos 30 dias"',
        nodes: [
          { id: 'n1', type: 'send-message', label: 'Mensagem de reativação', summary: '"Sentimos sua falta!"' },
          { id: 'n2', type: 'wait', label: 'Aguardar', summary: '3 dias' },
          { id: 'n3', type: 'conditional', label: 'O cliente respondeu?', summary: 'Sim → engajado · Não → churn' },
          { id: 'n4', type: 'remove-label', label: 'Remover tag inativo' },
          { id: 'n5', type: 'add-label', label: 'Marcar como churn' },
          { id: 'n6', type: 'exit-journey', label: 'Encerrar jornada' },
        ],
      };
    }
    if (lower.includes('carrinho') || lower.includes('cart') || lower.includes('abandon')) {
      return {
        name: 'Carrinho abandonado',
        description: 'Recupera vendas perdidas no checkout',
        trigger: 'Webhook',
        triggerSummary: 'POST /webhook/cart-abandoned',
        nodes: [
          { id: 'n1', type: 'wait', label: 'Aguardar', summary: '1 hora' },
          { id: 'n2', type: 'send-message', label: 'Lembrete com link', summary: '"Você esqueceu seu carrinho 🛒"' },
          { id: 'n3', type: 'wait', label: 'Aguardar', summary: '1 dia' },
          { id: 'n4', type: 'conditional', label: 'Já comprou?', summary: 'Sim → sair · Não → cupom' },
          { id: 'n5', type: 'send-message', label: 'Cupom de 10%', summary: 'Código DESCONTO10' },
          { id: 'n6', type: 'exit-journey', label: 'Encerrar jornada' },
        ],
      };
    }
    if (lower.includes('nps') || lower.includes('feedback') || lower.includes('pesquisa') || lower.includes('pós-venda') || lower.includes('pos-venda')) {
      return {
        name: 'Pesquisa pós-venda NPS',
        description: 'Coleta NPS 3 dias após a compra',
        trigger: 'Event',
        triggerSummary: 'Evento "order.completed"',
        nodes: [
          { id: 'n1', type: 'wait', label: 'Aguardar', summary: '3 dias' },
          { id: 'n2', type: 'send-message', label: 'Pesquisa NPS', summary: '"De 0 a 10..."' },
          { id: 'n3', type: 'wait', label: 'Aguardar resposta', summary: 'até 48h' },
          { id: 'n4', type: 'split', label: 'Por nota', summary: '0-6 / 7-8 / 9-10' },
          { id: 'n5', type: 'assign-team', label: 'Atribuir CS', summary: 'Time Customer Success' },
          { id: 'n6', type: 'add-label', label: 'Tag "Promoter"' },
          { id: 'n7', type: 'exit-journey', label: 'Encerrar jornada' },
        ],
      };
    }
    return {
      name: 'Nova jornada',
      description: userText.slice(0, 120),
      trigger: 'Manual',
      triggerSummary: 'Manual',
      nodes: [
        { id: 'n1', type: 'send-message', label: 'Mensagem inicial' },
        { id: 'n2', type: 'wait', label: 'Aguardar', summary: '1 dia' },
        { id: 'n3', type: 'exit-journey', label: 'Encerrar jornada' },
      ],
    };
  })();

  const baseEmpty: JourneyPreviewState = {
    name: '',
    description: '',
    trigger: 'Manual',
    triggerSummary: '',
    nodes: [],
    active: true,
  };

  const steps: JourneyPreviewState[] = [];

  // 1. Só o nome
  steps.push({ ...baseEmpty, name: variant.name });
  // 2. Nome + descrição
  steps.push({ ...baseEmpty, name: variant.name, description: variant.description });
  // 3. Trigger definido
  steps.push({
    ...baseEmpty,
    name: variant.name,
    description: variant.description,
    trigger: variant.trigger,
    triggerSummary: variant.triggerSummary,
  });
  // 4..N: adicionando nós um por um
  for (let i = 0; i < variant.nodes.length; i += 1) {
    steps.push({
      name: variant.name,
      description: variant.description,
      trigger: variant.trigger,
      triggerSummary: variant.triggerSummary,
      nodes: variant.nodes.slice(0, i + 1),
      active: true,
    });
  }

  return steps;
}

// =============================================================================
// Builders das demais features (Contact, Pipeline, Product, Campaign, Channel)
// =============================================================================

function buildContactSteps(userText: string): ContactPreviewState[] {
  const lower = userText.toLowerCase();

  type V = Omit<ContactPreviewState, never>;
  const variant: V = (() => {
    if (lower.includes('cmo') || lower.includes('decision') || lower.includes('carolina')) {
      return {
        firstName: 'Carolina',
        lastName: 'Mendes',
        email: 'carolina@acme.com',
        phone: '+55 11 99876-5432',
        company: 'Acme Corp',
        industry: 'Tecnologia',
        city: 'São Paulo',
        country: 'Brasil',
        description: 'CMO responsável pela aquisição de novos clientes enterprise.',
        labels: ['VIP', 'decision-maker', 'enterprise'],
        socialProfiles: [{ network: 'linkedin', handle: '/in/carolina-mendes' }],
      };
    }
    if (lower.includes('webinar') || lower.includes('joão') || lower.includes('startup') || lower.includes('fintech')) {
      return {
        firstName: 'João Pedro',
        lastName: 'Silva',
        email: 'jpsilva@startup.com.br',
        phone: '+55 21 98765-4321',
        company: 'Startup Fintech',
        industry: 'Fintech',
        city: 'Rio de Janeiro',
        country: 'Brasil',
        description: 'Gerente comercial. Veio do webinar de ontem.',
        labels: ['webinar-junho', 'lead-morno'],
        socialProfiles: [],
      };
    }
    if (lower.includes('renata') || lower.includes('cloud') || lower.includes('cliente ativo') || lower.includes('cliente-ativo')) {
      return {
        firstName: 'Renata',
        lastName: 'Oliveira',
        email: 'renata@cloudsoft.io',
        phone: '+55 11 91234-5678',
        company: 'CloudSoft',
        industry: 'SaaS',
        city: 'São Paulo',
        country: 'Brasil',
        description: 'Cliente desde 2023, plano Business. Chamado de suporte aberto.',
        labels: ['cliente-ativo', 'suporte-aberto', 'business'],
        socialProfiles: [],
      };
    }
    return {
      firstName: 'Novo',
      lastName: 'Contato',
      email: 'contato@exemplo.com',
      phone: '+55 11 90000-0000',
      company: '',
      industry: '',
      city: '',
      country: '',
      description: userText.slice(0, 120),
      labels: [],
      socialProfiles: [],
    };
  })();

  const empty: ContactPreviewState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    industry: '',
    city: '',
    country: '',
    description: '',
    labels: [],
    socialProfiles: [],
  };

  return [
    { ...empty, firstName: variant.firstName, lastName: variant.lastName },
    {
      ...empty,
      firstName: variant.firstName,
      lastName: variant.lastName,
      email: variant.email,
      phone: variant.phone,
    },
    {
      ...empty,
      firstName: variant.firstName,
      lastName: variant.lastName,
      email: variant.email,
      phone: variant.phone,
      company: variant.company,
      industry: variant.industry,
      city: variant.city,
      country: variant.country,
    },
    variant,
  ];
}

function buildPipelineSteps(userText: string): PipelinePreviewState[] {
  const lower = userText.toLowerCase();

  type V = PipelinePreviewState;
  const variant: V = (() => {
    if (lower.includes('vendas') || lower.includes('b2b') || lower.includes('saas')) {
      return {
        name: 'Funil de Vendas B2B',
        description: 'Pipeline para qualificar e fechar leads SaaS enterprise.',
        type: 'sales' as PipelineType,
        visibility: 'private' as PipelineVisibility,
        stages: [
          { name: 'Lead', color: 'slate' },
          { name: 'Qualificação', color: 'sky' },
          { name: 'Demo', color: 'violet' },
          { name: 'Proposta', color: 'amber' },
          { name: 'Negociação', color: 'orange' },
          { name: 'Fechado/Ganho', color: 'emerald' },
        ],
      };
    }
    if (lower.includes('suporte') || lower.includes('ticket')) {
      return {
        name: 'Suporte por Severidade',
        description: 'Tickets ordenados por urgência.',
        type: 'support' as PipelineType,
        visibility: 'team' as PipelineVisibility,
        stages: [
          { name: 'Triagem', color: 'sky' },
          { name: 'Em andamento', color: 'amber' },
          { name: 'Aguardando cliente', color: 'violet' },
          { name: 'Resolvido', color: 'emerald' },
        ],
      };
    }
    if (lower.includes('recruta') || lower.includes('candidato') || lower.includes('vagas')) {
      return {
        name: 'Recrutamento Técnico',
        description: 'Pipeline de processo seletivo de devs.',
        type: 'custom' as PipelineType,
        visibility: 'team' as PipelineVisibility,
        stages: [
          { name: 'Candidatura', color: 'slate' },
          { name: 'Triagem', color: 'sky' },
          { name: 'Entrevista técnica', color: 'violet' },
          { name: 'Cultural', color: 'amber' },
          { name: 'Proposta', color: 'orange' },
          { name: 'Contratado', color: 'emerald' },
        ],
      };
    }
    if (lower.includes('marketing') || lower.includes('mql') || lower.includes('sql') || lower.includes('nutrição')) {
      return {
        name: 'Funil de Marketing',
        description: 'Nutrição de leads do topo ao cliente.',
        type: 'marketing' as PipelineType,
        visibility: 'public' as PipelineVisibility,
        stages: [
          { name: 'Visitante', color: 'slate' },
          { name: 'MQL', color: 'sky' },
          { name: 'SQL', color: 'violet' },
          { name: 'Oportunidade', color: 'amber' },
          { name: 'Cliente', color: 'emerald' },
        ],
      };
    }
    return {
      name: 'Novo Pipeline',
      description: userText.slice(0, 120),
      type: 'custom',
      visibility: 'private',
      stages: [
        { name: 'A fazer', color: 'slate' },
        { name: 'Em andamento', color: 'sky' },
        { name: 'Concluído', color: 'emerald' },
      ],
    };
  })();

  const empty: PipelinePreviewState = {
    name: '',
    description: '',
    type: 'custom',
    visibility: 'private',
    stages: [],
  };

  const steps: PipelinePreviewState[] = [];
  steps.push({ ...empty, name: variant.name });
  steps.push({ ...empty, name: variant.name, description: variant.description, type: variant.type, visibility: variant.visibility });
  // estágios adicionados um por um
  for (let i = 0; i < variant.stages.length; i += 1) {
    steps.push({
      ...variant,
      stages: variant.stages.slice(0, i + 1),
    });
  }
  return steps;
}

function buildProductSteps(userText: string): ProductPreviewState[] {
  const lower = userText.toLowerCase();

  type V = ProductPreviewState;
  const variant: V = (() => {
    if (lower.includes('camiseta') || lower.includes('físic') || lower.includes('fisico') || lower.includes('estoque')) {
      return {
        name: 'Camiseta Premium Algodão',
        kind: 'physical' as const,
        sku: 'CT-001',
        price: 89.9,
        currency: 'BRL',
        description: 'Camiseta unissex em algodão Pima premium, edição verão.',
        stockQuantity: 124,
        labels: ['verão', 'algodão', 'unissex'],
      };
    }
    if (lower.includes('ebook') || lower.includes('e-book') || lower.includes('curso')) {
      return {
        name: 'E-book Guia de Vendas B2B 2025',
        kind: 'digital' as const,
        sku: 'EB-VND-25',
        price: 47.0,
        currency: 'BRL',
        description: 'Guia completo com estratégias de vendas B2B SaaS atualizado para 2025.',
        stockQuantity: null,
        labels: ['vendas', 'b2b', 'ebook'],
      };
    }
    if (lower.includes('plano') || lower.includes('assinatura') || lower.includes('recorr') || lower.includes('saas') || lower.includes('mensal')) {
      return {
        name: 'Plano Pro Mensal',
        kind: 'digital' as const,
        sku: 'PLAN-PRO-M',
        price: 297.0,
        currency: 'BRL',
        description: 'Acesso completo a todos os recursos Pro, faturamento mensal.',
        stockQuantity: null,
        labels: ['saas', 'mensal', 'pro'],
      };
    }
    return {
      name: 'Novo Produto',
      kind: 'physical',
      sku: 'SKU-001',
      price: 0,
      currency: 'BRL',
      description: userText.slice(0, 120),
      stockQuantity: 0,
      labels: [],
    };
  })();

  const empty: ProductPreviewState = {
    name: '',
    kind: 'physical',
    sku: '',
    price: 0,
    currency: 'BRL',
    description: '',
    stockQuantity: null,
    labels: [],
  };

  return [
    { ...empty, name: variant.name, kind: variant.kind },
    { ...empty, name: variant.name, kind: variant.kind, sku: variant.sku, currency: variant.currency },
    { ...empty, name: variant.name, kind: variant.kind, sku: variant.sku, currency: variant.currency, price: variant.price },
    { ...variant },
  ];
}

function buildCampaignSteps(userText: string): CampaignPreviewState[] {
  const lower = userText.toLowerCase();

  type V = CampaignPreviewState;
  const variant: V = (() => {
    if (lower.includes('black friday') || lower.includes('black-friday') || lower.includes('vip')) {
      return {
        name: 'Black Friday VIP 2025',
        description: 'Oferta exclusiva para o segmento VIP.',
        type: 'simple',
        channel: 'whatsapp',
        audienceLabel: 'Segmento "VIP"',
        audienceSize: 1250,
        templates: ['Black Friday — Desconto 30%', 'Black Friday — Frete grátis'],
        messagePreview: 'Olá {{nome}}, sua oferta VIP de Black Friday está liberada: 30% OFF em…',
        schedule: 'later',
        scheduledFor: '20/11/2025 às 14h00 (BRT)',
        rateLimitPerHour: 200,
        useBusinessHours: true,
      };
    }
    if (lower.includes('reengaja') || lower.includes('inativ') || lower.includes('email') || lower.includes('e-mail')) {
      return {
        name: 'Reengajamento Inativos 60d',
        description: 'Email para contatos sem interação há 60 dias.',
        type: 'simple',
        channel: 'email',
        audienceLabel: 'Tag "inativo-60d"',
        audienceSize: 3420,
        templates: ['Sentimos sua falta — promo exclusiva'],
        messagePreview: 'Oi {{nome}}! Há tempos não falamos. Voltamos com novidades que…',
        schedule: 'now',
        scheduledFor: 'Envio imediato',
        rateLimitPerHour: null,
        useBusinessHours: false,
      };
    }
    if (lower.includes('lançamento') || lower.includes('lancamento') || lower.includes('beta')) {
      return {
        name: 'Lançamento Beta — v2',
        description: 'WhatsApp para o time de beta testers com 3 templates em A/B.',
        type: 'simple',
        channel: 'whatsapp',
        audienceLabel: 'Segmento "Beta Testers"',
        audienceSize: 487,
        templates: ['Lançamento A — direto', 'Lançamento B — story', 'Lançamento C — vídeo'],
        messagePreview: '{{nome}}, a v2 chegou! Conta novidades pra você antes de todo mundo…',
        schedule: 'later',
        scheduledFor: '10/03 às 09h00 (BRT)',
        rateLimitPerHour: 100,
        useBusinessHours: true,
      };
    }
    return {
      name: 'Nova Campanha',
      description: userText.slice(0, 120),
      type: 'simple',
      channel: 'whatsapp',
      audienceLabel: 'Todos os contatos',
      audienceSize: 0,
      templates: [],
      messagePreview: '',
      schedule: 'now',
      scheduledFor: 'Imediato',
      rateLimitPerHour: null,
      useBusinessHours: false,
    };
  })();

  const empty: CampaignPreviewState = {
    name: '',
    description: '',
    type: 'simple',
    channel: 'whatsapp',
    audienceLabel: '',
    audienceSize: 0,
    templates: [],
    messagePreview: '',
    schedule: 'now',
    scheduledFor: '',
    rateLimitPerHour: null,
    useBusinessHours: false,
  };

  return [
    { ...empty, name: variant.name, description: variant.description, type: variant.type },
    { ...empty, name: variant.name, description: variant.description, type: variant.type, audienceLabel: variant.audienceLabel, audienceSize: variant.audienceSize },
    { ...empty, name: variant.name, description: variant.description, type: variant.type, audienceLabel: variant.audienceLabel, audienceSize: variant.audienceSize, channel: variant.channel, templates: variant.templates },
    { ...empty, name: variant.name, description: variant.description, type: variant.type, audienceLabel: variant.audienceLabel, audienceSize: variant.audienceSize, channel: variant.channel, templates: variant.templates, messagePreview: variant.messagePreview },
    { ...variant },
  ];
}

function buildChannelSteps(userText: string): ChannelPreviewState[] {
  const lower = userText.toLowerCase();

  type V = ChannelPreviewState;
  const variant: V = (() => {
    if (lower.includes('whatsapp') || lower.includes('zap') || lower.includes('alto volume') || lower.includes('24/7')) {
      return {
        name: 'WhatsApp — Suporte',
        kind: 'whatsapp',
        provider: 'Evolution API',
        rationale:
          'Evolution API é a melhor escolha para alto volume sem custo por mensagem. Permite múltiplas instâncias e webhook customizado.',
        nextSteps: [
          'Criar instância no Evolution API',
          'Escanear QR Code com o WhatsApp',
          'Configurar webhook de recebimento',
          'Testar mensagem de saída',
        ],
        estimatedSetupMinutes: 10,
      };
    }
    if (lower.includes('email') || lower.includes('e-mail') || lower.includes('gmail') || lower.includes('workspace')) {
      return {
        name: 'Email — Tickets',
        kind: 'email',
        provider: 'Gmail (OAuth)',
        rationale:
          'Você já usa Google Workspace — o OAuth do Gmail é o caminho mais rápido. Recebe e responde direto no inbox da conta.',
        nextSteps: [
          'Autorizar via OAuth Google',
          'Configurar etiqueta "CRM" no Gmail',
          'Definir email de envio padrão',
        ],
        estimatedSetupMinutes: 5,
      };
    }
    if (lower.includes('instagram') || lower.includes('direct') || lower.includes('insta')) {
      return {
        name: 'Instagram — DMs',
        kind: 'instagram',
        provider: 'Meta API',
        rationale:
          'Para Instagram DMs você precisa de uma conta Business conectada a uma Página do Facebook. Volume médio é suportado tranquilamente.',
        nextSteps: [
          'Converter conta para Business',
          'Conectar à Página do Facebook',
          'Autorizar via OAuth',
          'Configurar regras de auto-resposta',
        ],
        estimatedSetupMinutes: 15,
      };
    }
    if (lower.includes('telegram')) {
      return {
        name: 'Telegram — Atendimento',
        kind: 'telegram',
        provider: 'Bot API nativa',
        rationale:
          'Telegram tem API oficial gratuita. Ótimo para canais técnicos e comunidades.',
        nextSteps: [
          'Criar bot via @BotFather',
          'Copiar token e colar nas configurações',
          'Configurar webhook',
        ],
        estimatedSetupMinutes: 8,
      };
    }
    return {
      name: 'Novo Canal',
      kind: 'whatsapp',
      provider: 'Evolution API',
      rationale: 'Recomendação padrão para começar.',
      nextSteps: ['Configurar credenciais', 'Testar mensagem'],
      estimatedSetupMinutes: 10,
    };
  })();

  const empty: ChannelPreviewState = {
    name: '',
    kind: 'whatsapp',
    provider: '',
    rationale: '',
    nextSteps: [],
    estimatedSetupMinutes: 0,
  };

  return [
    { ...empty, kind: variant.kind, name: variant.name },
    { ...empty, kind: variant.kind, name: variant.name, provider: variant.provider },
    { ...empty, kind: variant.kind, name: variant.name, provider: variant.provider, rationale: variant.rationale, estimatedSetupMinutes: variant.estimatedSetupMinutes },
    { ...variant },
  ];
}

function renderTemplate(content: string, vars: TemplateVariable[]): string {
  return vars.reduce(
    (acc, v) => acc.replace(new RegExp(`{{\\s*${v.name}\\s*}}`, 'g'), v.example),
    content,
  );
}

function buildTemplateSteps(userText: string): TemplatePreviewState[] {
  const lower = userText.toLowerCase();

  type Variant = Omit<TemplatePreviewState, 'contentRendered'>;
  const variant: Variant = (() => {
    if (lower.includes('boas-vindas') || lower.includes('welcome') || lower.includes('novo lead')) {
      const vars: TemplateVariable[] = [
        { name: 'nome', example: 'Carolina' },
        { name: 'produto', example: 'Plano Pro' },
      ];
      return {
        name: 'boas_vindas_lead',
        category: 'MARKETING',
        language: 'pt_BR',
        channel: 'whatsapp',
        content:
          'Olá {{nome}}! Vi que você se interessou pelo {{produto}}. Posso te enviar uma demonstração rápida agora?',
        variables: vars,
      };
    }
    if (lower.includes('follow-up') || lower.includes('follow up') || lower.includes('proposta') || lower.includes('48h')) {
      const vars: TemplateVariable[] = [
        { name: 'nome', example: 'João' },
        { name: 'empresa', example: 'Acme Corp' },
        { name: 'vendedor', example: 'Marina' },
      ];
      return {
        name: 'followup_proposta_48h',
        category: 'UTILITY',
        language: 'pt_BR',
        channel: 'whatsapp',
        content:
          'Oi {{nome}}, aqui é a {{vendedor}}. Enviei a proposta para a {{empresa}} faz uns dois dias. Conseguiu olhar com calma? Tem alguma dúvida em que eu possa ajudar?',
        variables: vars,
      };
    }
    if (lower.includes('email') || lower.includes('e-mail') || lower.includes('promo') || lower.includes('black friday')) {
      const vars: TemplateVariable[] = [
        { name: 'nome', example: 'Renata' },
        { name: 'desconto', example: '30%' },
        { name: 'cupom', example: 'BLACK30' },
      ];
      return {
        name: 'email_black_friday',
        category: 'MARKETING',
        language: 'pt_BR',
        channel: 'email',
        emailSubject: '{{nome}}, sua oferta Black Friday está liberada 🔥',
        content:
          'Olá {{nome}},\n\nA Black Friday começou e separamos uma oferta exclusiva para você: {{desconto}} de desconto em qualquer plano.\n\nUse o cupom {{cupom}} no checkout — válido até domingo.\n\nQualquer dúvida, é só responder este email.',
        variables: vars,
      };
    }
    if (lower.includes('envio') || lower.includes('pedido') || lower.includes('rastreio') || lower.includes('despach')) {
      const vars: TemplateVariable[] = [
        { name: 'nome', example: 'Pedro' },
        { name: 'pedido', example: '#10234' },
        { name: 'rastreio', example: 'BR1234567XX' },
        { name: 'transportadora', example: 'Correios' },
        { name: 'prazo', example: '3 a 5 dias úteis' },
      ];
      return {
        name: 'confirmacao_envio',
        category: 'UTILITY',
        language: 'pt_BR',
        channel: 'whatsapp',
        content:
          'Oi {{nome}}! Seu pedido {{pedido}} acabou de ser despachado pela {{transportadora}}. Código de rastreio: {{rastreio}}. Prazo estimado: {{prazo}}.',
        variables: vars,
      };
    }
    if (lower.includes('otp') || lower.includes('código de verifica') || lower.includes('autentic') || lower.includes('sms')) {
      const vars: TemplateVariable[] = [
        { name: 'codigo', example: '482910' },
        { name: 'validade', example: '5' },
      ];
      return {
        name: 'otp_sms',
        category: 'AUTHENTICATION',
        language: 'pt_BR',
        channel: 'sms',
        content:
          'Seu código de verificação é {{codigo}}. Válido por {{validade}} minutos. Não compartilhe.',
        variables: vars,
      };
    }
    // Fallback genérico — detecta variáveis no texto livre
    const detected = Array.from(userText.matchAll(/\{\{\s*(\w+)\s*\}\}/g)).map((m) => ({
      name: m[1],
      example: m[1],
    }));
    return {
      name: 'novo_template',
      category: 'MARKETING',
      language: 'pt_BR',
      channel: 'whatsapp',
      content: userText.slice(0, 240) || 'Olá {{nome}}, em que posso ajudar?',
      variables:
        detected.length > 0
          ? detected
          : [{ name: 'nome', example: 'Cliente' }],
    };
  })();

  const empty: TemplatePreviewState = {
    name: '',
    category: 'MARKETING',
    language: 'pt_BR',
    channel: 'whatsapp',
    content: '',
    contentRendered: '',
    variables: [],
  };

  const finalState: TemplatePreviewState = {
    ...variant,
    contentRendered: renderTemplate(variant.content, variant.variables),
  };

  return [
    // 1. Nome + categoria
    { ...empty, name: variant.name, category: variant.category, channel: variant.channel, language: variant.language },
    // 2. + Conteúdo bruto (sem render ainda)
    {
      ...empty,
      name: variant.name,
      category: variant.category,
      channel: variant.channel,
      language: variant.language,
      emailSubject: variant.emailSubject,
      content: variant.content,
      contentRendered: variant.content, // ainda com {{x}}
    },
    // 3. + Variáveis detectadas
    {
      ...empty,
      name: variant.name,
      category: variant.category,
      channel: variant.channel,
      language: variant.language,
      emailSubject: variant.emailSubject,
      content: variant.content,
      contentRendered: variant.content,
      variables: variant.variables,
    },
    // 4. Renderizado com exemplos
    finalState,
  ];
}

// =============================================================================
// SKYWAY — helpers para emitir eventos enriquecidos no mock
// =============================================================================

async function streamReplyTokens(
  text: string,
  cb: { onToken: (t: string) => void },
  isCancelled: () => boolean,
): Promise<void> {
  const tokens = text.split(/(\s+)/);
  for (const tok of tokens) {
    if (isCancelled()) return;
    cb.onToken(tok);
    await wait(tok.trim() === '' ? 15 : 28);
  }
}

function uid(prefix = 'sk'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function buildDemoPlan(userText: string, autonomy: AutonomyLevel): SkywayPlan {
  const lower = userText.toLowerCase();

  if (lower.includes('reengaj') || lower.includes('inativ') || lower.includes('manda um follow')) {
    const steps: SkywayPlanStep[] = [
      {
        id: uid('s'),
        description: 'Buscar 7 conversas sem resposta nos últimos 3 dias',
        toolName: 'search_messages',
        risk: 'safe',
        reversible: true,
        selectedByDefault: true,
      },
      {
        id: uid('s'),
        description: 'Adicionar tag "follow-up-junho" aos contatos relacionados',
        toolName: 'add_label',
        risk: 'confirm',
        reversible: true,
        selectedByDefault: true,
      },
      {
        id: uid('s'),
        description: 'Enviar template "Sentimos sua falta" para os 7 contatos',
        toolName: 'bulk_send_template',
        risk: 'gated',
        reversible: false,
        selectedByDefault: autonomy === 'autopilot',
      },
      {
        id: uid('s'),
        description: 'Mover esses contatos para a etapa "Reengajamento"',
        toolName: 'move_contact_to_pipeline',
        risk: 'confirm',
        reversible: true,
        selectedByDefault: true,
      },
    ];
    return {
      id: uid('plan'),
      summary: 'Identifiquei 7 contatos parados há 3+ dias. Posso reengajar com 1 template + tag + mover de etapa.',
      steps,
    };
  }

  if (lower.includes('mover') || lower.includes('move')) {
    return {
      id: uid('plan'),
      summary: 'Encontrei 12 contatos elegíveis para a movimentação.',
      steps: [
        {
          id: uid('s'),
          description: 'Validar permissão para os 12 pipelines envolvidos',
          toolName: 'check_permission',
          risk: 'safe',
          reversible: true,
          selectedByDefault: true,
        },
        {
          id: uid('s'),
          description: 'Mover 12 contatos para a etapa "Qualificado"',
          toolName: 'move_contact_to_pipeline',
          risk: 'confirm',
          reversible: true,
          selectedByDefault: true,
        },
        {
          id: uid('s'),
          description: 'Adicionar tag "qualificado-junho"',
          toolName: 'add_label',
          risk: 'confirm',
          reversible: true,
          selectedByDefault: true,
        },
      ],
    };
  }

  // Fallback genérico
  return {
    id: uid('plan'),
    summary: 'Estruturei o que precisa ser feito em 3 passos.',
    steps: [
      {
        id: uid('s'),
        description: 'Consultar entidades relacionadas no CRM',
        toolName: 'search_crm',
        risk: 'safe',
        reversible: true,
        selectedByDefault: true,
      },
      {
        id: uid('s'),
        description: 'Aplicar a mudança principal',
        toolName: 'apply_change',
        risk: 'confirm',
        reversible: true,
        selectedByDefault: true,
      },
      {
        id: uid('s'),
        description: 'Registrar a operação no log de auditoria',
        toolName: 'audit_log',
        risk: 'safe',
        reversible: false,
        selectedByDefault: true,
      },
    ],
  };
}

function buildDemoInlineForm(userText: string): SkywayInlineForm {
  const lower = userText.toLowerCase();

  if (lower.includes('agendar') || lower.includes('reunião') || lower.includes('reunir')) {
    return {
      id: uid('form'),
      title: 'Pra agendar, preciso de alguns dados:',
      fields: [
        { name: 'contact', label: 'Com quem é a reunião?', type: 'text', placeholder: 'Nome do contato', required: true },
        { name: 'date', label: 'Quando?', type: 'date', required: true },
        {
          name: 'duration',
          label: 'Duração',
          type: 'select',
          required: true,
          options: [
            { value: '30', label: '30 minutos' },
            { value: '60', label: '1 hora' },
            { value: '90', label: '1h30' },
          ],
        },
      ],
      submitLabel: 'Agendar reunião',
    };
  }

  if (lower.includes('proposta')) {
    return {
      id: uid('form'),
      title: 'Vou montar a proposta. Me confirme os dados:',
      fields: [
        { name: 'contact', label: 'Cliente', type: 'text', required: true },
        { name: 'value', label: 'Valor', type: 'number', prefix: 'R$', required: true, min: 0 },
        {
          name: 'plan',
          label: 'Plano',
          type: 'select',
          required: true,
          options: [
            { value: 'starter', label: 'Starter' },
            { value: 'business', label: 'Business' },
            { value: 'enterprise', label: 'Enterprise' },
          ],
        },
        { name: 'validity', label: 'Validade', type: 'date', required: true },
      ],
      submitLabel: 'Criar proposta',
    };
  }

  return {
    id: uid('form'),
    title: 'Preciso de alguns dados pra prosseguir:',
    fields: [
      { name: 'value', label: 'Valor', type: 'number', prefix: 'R$', required: true },
      { name: 'when', label: 'Quando?', type: 'date', required: true },
    ],
    submitLabel: 'Confirmar',
  };
}

/**
 * SKYWAY — chamado pelo front quando o usuário aprova um plano.
 * Simula a execução dos steps aprovados e emite o receipt.
 */
export function approvePlan(
  plan: SkywayPlan,
  approvedStepIds: string[],
  cb: Pick<StreamCallbacks<unknown>, 'onToken' | 'onThinking' | 'onReceipt' | 'onDone'>,
): StreamHandle {
  let cancelled = false;

  (async () => {
    const approved = plan.steps.filter((s) => approvedStepIds.includes(s.id));
    if (approved.length === 0) {
      cb.onToken('Nenhum passo foi selecionado — nada a fazer.');
      cb.onDone('Nenhum passo foi selecionado — nada a fazer.');
      return;
    }

    cb.onThinking?.(`Executando ${approved.length} ${approved.length === 1 ? 'passo' : 'passos'}…`);
    await wait(400);
    if (cancelled) return;

    const results: SkywayReceiptResult[] = [];
    for (const step of approved) {
      if (cancelled) return;
      cb.onThinking?.(`${step.description}…`);
      await wait(450 + Math.floor(Math.random() * 350));
      if (cancelled) return;

      // 90% sucesso para parecer realista — 1 em ~10 falha
      const success = Math.random() > 0.1;
      results.push({
        stepId: step.id,
        description: step.description,
        status: success ? 'success' : 'error',
        errorMessage: success ? undefined : 'Permissão negada para alguns contatos',
        entityRef: success
          ? { type: step.toolName, id: uid('ent'), label: step.description }
          : undefined,
        reversible: step.reversible && success,
      });
    }

    if (cancelled) return;

    const undoable = results.some((r) => r.reversible);
    const receipt: SkywayReceipt = {
      id: uid('rcpt'),
      results,
      undoable,
      undoExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    cb.onReceipt?.(receipt);

    const okCount = results.filter((r) => r.status === 'success').length;
    const errCount = results.filter((r) => r.status === 'error').length;
    const summary = errCount === 0
      ? `Tudo certo — ${okCount} ${okCount === 1 ? 'ação executada' : 'ações executadas'} com sucesso.`
      : `Executei ${okCount} de ${results.length}. ${errCount} ${errCount === 1 ? 'falhou' : 'falharam'} — veja os detalhes no recibo.`;

    await streamReplyTokens(summary, cb, () => cancelled);
    cb.onDone(summary);
  })();

  return { cancel: () => { cancelled = true; } };
}

/**
 * SKYWAY — usado pelo InlineForm pra continuar a conversa depois do submit.
 */
export function submitInlineForm(
  form: SkywayInlineForm,
  values: Record<string, string>,
  cb: Pick<StreamCallbacks<unknown>, 'onToken' | 'onThinking' | 'onReceipt' | 'onDone'>,
): StreamHandle {
  let cancelled = false;

  (async () => {
    cb.onThinking?.('Processando dados…');
    await wait(500);
    if (cancelled) return;

    const summary =
      form.fields
        .map((f) => `${f.label}: ${values[f.name] ?? '—'}`)
        .join(' · ');

    const receipt: SkywayReceipt = {
      id: uid('rcpt'),
      results: [
        {
          stepId: uid('s'),
          description: `${form.submitLabel} — ${summary}`,
          status: 'success',
          entityRef: { type: 'form_submission', id: uid('ent'), label: form.submitLabel },
          reversible: true,
        },
      ],
      undoable: true,
      undoExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    };

    cb.onReceipt?.(receipt);
    await streamReplyTokens(`Pronto — ${form.submitLabel.toLowerCase()} ✓`, cb, () => cancelled);
    cb.onDone(`Pronto — ${form.submitLabel.toLowerCase()} ✓`);
  })();

  return { cancel: () => { cancelled = true; } };
}

// =============================================================================
// SKYWAY — sugestões de @mentions (mock pra popover)
// =============================================================================

export const DEMO_MENTIONS: MentionRef[] = [
  { type: 'contato', id: 'c-001', label: 'Carolina Mendes — Acme Corp' },
  { type: 'contato', id: 'c-002', label: 'João Pedro Silva — Startup Fintech' },
  { type: 'contato', id: 'c-003', label: 'Renata Oliveira — CloudSoft' },
  { type: 'deal', id: 'd-101', label: 'Acme Plano Enterprise · R$ 24k/ano' },
  { type: 'deal', id: 'd-102', label: 'CloudSoft Business · R$ 8.4k/ano' },
  { type: 'pipeline', id: 'p-vendas', label: 'Funil de Vendas B2B' },
  { type: 'pipeline', id: 'p-suporte', label: 'Suporte por Severidade' },
  { type: 'conversa', id: 'cv-880', label: 'Carolina · WhatsApp · 12 mensagens' },
  { type: 'conversa', id: 'cv-881', label: 'João Pedro · WhatsApp · 4 mensagens' },
  { type: 'campanha', id: 'cmp-bf', label: 'Black Friday VIP 2025' },
  { type: 'campanha', id: 'cmp-reeng', label: 'Reengajamento Inativos 60d' },
];

export function searchMentions(query: string): MentionRef[] {
  if (!query.trim()) return DEMO_MENTIONS.slice(0, 6);
  const q = query.toLowerCase();
  return DEMO_MENTIONS.filter((m) => m.label.toLowerCase().includes(q)).slice(0, 6);
}

function buildCustomToolSteps(userText: string): CustomToolPreviewState[] {
  const lower = userText.toLowerCase();

  type V = CustomToolPreviewState;
  const variant: V = (() => {
    if (lower.includes('stripe') || lower.includes('cliente')) {
      return {
        name: 'get_stripe_customer',
        description: 'Consulta dados de um cliente no Stripe pelo ID',
        method: 'GET' as HttpMethod,
        baseUrl: 'https://api.stripe.com',
        path: '/v1/customers/{id}',
        authHeader: 'Authorization: Bearer sk_live_••••••••••KX9a',
        params: [
          { name: 'id', type: 'string', required: true, location: 'path', description: 'ID do cliente Stripe (cus_xxx)' },
        ],
        tags: ['stripe', 'billing', 'lookup'],
        exampleResponse: '{ "id": "cus_NXXX", "email": "carolina@acme.com", "name": "Carolina Mendes", "subscriptions": { "active": true } }',
      };
    }
    if (lower.includes('omie') || lower.includes('nota fiscal') || lower.includes('nf-e')) {
      return {
        name: 'create_omie_invoice',
        description: 'Cria uma nota fiscal de serviço no Omie',
        method: 'POST' as HttpMethod,
        baseUrl: 'https://app.omie.com.br',
        path: '/api/v1/services/invoice/',
        authHeader: 'X-Api-Key: ••••••••••omie',
        params: [
          { name: 'cliente_id', type: 'string', required: true, location: 'body', description: 'ID do cliente no Omie' },
          { name: 'valor', type: 'number', required: true, location: 'body', description: 'Valor total em BRL' },
          { name: 'descricao', type: 'string', required: true, location: 'body', description: 'Descrição do serviço' },
        ],
        tags: ['omie', 'fiscal', 'billing'],
        exampleResponse: '{ "nfse_id": "12345", "status": "issued", "pdf_url": "https://..." }',
      };
    }
    if (lower.includes('erp') || lower.includes('estoque') || lower.includes('produto')) {
      return {
        name: 'get_internal_product',
        description: 'Busca produto no ERP interno por SKU',
        method: 'GET' as HttpMethod,
        baseUrl: 'https://erp.local',
        path: '/api/v1/products/{sku}',
        authHeader: 'Authorization: Basic dXNlcjo••••',
        params: [
          { name: 'sku', type: 'string', required: true, location: 'path', description: 'SKU único do produto' },
        ],
        tags: ['erp', 'internal', 'inventory'],
        exampleResponse: '{ "sku": "CT-001", "name": "Camiseta Premium", "stock": 124, "price_brl": 89.90 }',
      };
    }
    return {
      name: 'new_custom_tool',
      description: userText.slice(0, 120) || 'Nova ferramenta HTTP',
      method: 'GET',
      baseUrl: 'https://api.exemplo.com',
      path: '/recurso',
      params: [],
      tags: [],
    };
  })();

  const empty: CustomToolPreviewState = {
    name: '',
    description: '',
    method: 'GET',
    baseUrl: '',
    path: '',
    params: [],
    tags: [],
  };

  return [
    { ...empty, name: variant.name, method: variant.method },
    { ...empty, name: variant.name, description: variant.description, method: variant.method, baseUrl: variant.baseUrl, path: variant.path },
    {
      ...empty,
      name: variant.name,
      description: variant.description,
      method: variant.method,
      baseUrl: variant.baseUrl,
      path: variant.path,
      authHeader: variant.authHeader,
      params: variant.params,
    },
    variant,
  ];
}

function buildCustomMcpSteps(userText: string): CustomMcpPreviewState[] {
  const lower = userText.toLowerCase();

  type V = CustomMcpPreviewState;
  const variant: V = (() => {
    if (lower.includes('notion')) {
      return {
        name: 'Notion MCP',
        description: 'Acesso a pages e databases do Notion via MCP oficial',
        url: 'https://mcp.notion.com/sse',
        headers: [
          { key: 'Authorization', valueMasked: 'Bearer secret_••••••••••Ntn' },
        ],
        exposedTools: ['notion.search', 'notion.get_page', 'notion.update_page', 'notion.query_database', 'notion.create_page'],
        timeoutSeconds: 30,
        retryCount: 2,
        tags: ['notion', 'docs', 'knowledge'],
      };
    }
    if (lower.includes('github') || lower.includes('git')) {
      return {
        name: 'GitHub MCP',
        description: 'Issues, PRs, commits e arquivos via MCP oficial do GitHub',
        url: 'https://api.githubcopilot.com/mcp/',
        headers: [
          { key: 'Authorization', valueMasked: 'Bearer ghp_••••••••••GH7' },
        ],
        exposedTools: ['gh.search_issues', 'gh.create_issue', 'gh.list_prs', 'gh.merge_pr', 'gh.read_file', 'gh.commit_history'],
        timeoutSeconds: 30,
        retryCount: 2,
        tags: ['github', 'dev', 'code'],
      };
    }
    if (lower.includes('interno') || lower.includes('empresa') || lower.includes('local')) {
      return {
        name: 'MCP Interno',
        description: 'Servidor MCP customizado da empresa',
        url: 'https://mcp.minha-empresa.com/v1',
        headers: [
          { key: 'X-API-Key', valueMasked: '••••••••••EMP' },
        ],
        exposedTools: ['internal.get_customer', 'internal.create_order', 'internal.list_inventory'],
        timeoutSeconds: 30,
        retryCount: 2,
        tags: ['internal', 'custom'],
      };
    }
    return {
      name: 'Novo MCP',
      description: userText.slice(0, 120) || 'Servidor MCP customizado',
      url: 'https://mcp.exemplo.com',
      headers: [],
      exposedTools: [],
      timeoutSeconds: 30,
      retryCount: 2,
      tags: [],
    };
  })();

  const empty: CustomMcpPreviewState = {
    name: '',
    description: '',
    url: '',
    headers: [],
    exposedTools: [],
    timeoutSeconds: 30,
    retryCount: 2,
    tags: [],
  };

  return [
    { ...empty, name: variant.name, url: variant.url },
    { ...empty, name: variant.name, description: variant.description, url: variant.url, headers: variant.headers },
    { ...empty, name: variant.name, description: variant.description, url: variant.url, headers: variant.headers, exposedTools: variant.exposedTools.slice(0, Math.max(1, Math.floor(variant.exposedTools.length / 2))) },
    variant,
  ];
}

function buildSegmentSteps(userText: string): SegmentPreviewState[] {
  const lower = userText.toLowerCase();

  type V = SegmentPreviewState;
  const variant: V = (() => {
    if (lower.includes('inativ') || lower.includes('60 dias') || lower.includes('30 dias')) {
      return {
        name: 'Inativos 60 dias',
        description: 'Contatos sem interação recente, excluindo VIPs.',
        logic: 'AND' as const,
        rules: [
          { field: 'last_message_at', operator: 'menor que', value: 'hoje - 60 dias' },
          { field: 'last_purchase_at', operator: 'menor que', value: 'hoje - 60 dias' },
          { field: 'tags', operator: 'não contém', value: 'vip' },
        ],
        matchCount: 1842,
      };
    }
    if (lower.includes('vip') || lower.includes('brasil')) {
      return {
        name: 'VIPs Brasil',
        description: 'VIPs brasileiros ativos no último mês.',
        logic: 'AND' as const,
        rules: [
          { field: 'tags', operator: 'contém', value: 'vip' },
          { field: 'country', operator: 'igual a', value: 'BR' },
          { field: 'last_conversation_at', operator: 'maior que', value: 'hoje - 30 dias' },
        ],
        matchCount: 142,
      };
    }
    if (lower.includes('lead quente') || lower.includes('engaj')) {
      return {
        name: 'Leads Quentes',
        description: 'Leads engajados recentemente, ainda não convertidos.',
        logic: 'AND' as const,
        rules: [
          { field: 'tags', operator: 'não contém', value: 'cliente' },
          { field: 'messages_count', operator: 'maior que', value: '3' },
          { field: 'last_interaction_at', operator: 'maior que', value: 'hoje - 7 dias' },
        ],
        matchCount: 87,
      };
    }
    return {
      name: 'Novo Segmento',
      description: userText.slice(0, 120) || 'Filtro customizado',
      logic: 'AND',
      rules: [],
      matchCount: 0,
    };
  })();

  const empty: SegmentPreviewState = {
    name: '',
    description: '',
    logic: 'AND',
    rules: [],
    matchCount: 0,
  };

  const steps: SegmentPreviewState[] = [];
  steps.push({ ...empty, name: variant.name, description: variant.description });
  for (let i = 0; i < variant.rules.length; i += 1) {
    steps.push({
      ...empty,
      name: variant.name,
      description: variant.description,
      logic: variant.logic,
      rules: variant.rules.slice(0, i + 1),
      matchCount: 0,
    });
  }
  steps.push(variant);
  return steps;
}

function buildMacroSteps(userText: string): MacroPreviewState[] {
  const lower = userText.toLowerCase();

  type V = MacroPreviewState;
  const variant: V = (() => {
    if (lower.includes('vip')) {
      return {
        name: 'Tratar como VIP',
        description: 'Marca conversa como prioritária e atribui ao time estratégico.',
        visibility: 'team' as const,
        actions: [
          { type: 'add_label', label: 'Adicionar tag', summary: 'tag "VIP"' },
          { type: 'assign_team', label: 'Atribuir time', summary: 'Contas Estratégicas' },
          { type: 'change_priority', label: 'Definir prioridade', summary: 'alta' },
          { type: 'send_message', label: 'Enviar mensagem', summary: '"Olá! Você é VIP — atendimento prioritário."' },
        ],
      };
    }
    if (lower.includes('encerrar') || lower.includes('nps') || lower.includes('pesquisa')) {
      return {
        name: 'Encerrar com NPS',
        description: 'Fecha o atendimento e dispara pesquisa de satisfação.',
        visibility: 'public' as const,
        actions: [
          { type: 'send_message', label: 'Enviar mensagem', summary: '"Foi um prazer atender você."' },
          { type: 'send_message', label: 'Enviar pesquisa', summary: 'Template NPS_1to10' },
          { type: 'add_label', label: 'Adicionar tag', summary: 'tag "nps-enviado"' },
          { type: 'move_pipeline', label: 'Mover etapa', summary: 'pipeline "Pós-venda"' },
        ],
      };
    }
    if (lower.includes('escalar') || lower.includes('técnico') || lower.includes('tecnico')) {
      return {
        name: 'Escalar Técnico Nível 2',
        description: 'Encaminha para o time técnico com urgência.',
        visibility: 'team' as const,
        actions: [
          { type: 'assign_team', label: 'Atribuir time', summary: 'Técnico Nível 2' },
          { type: 'add_label', label: 'Adicionar tag', summary: 'tag "escalado"' },
          { type: 'change_priority', label: 'Definir prioridade', summary: 'urgente' },
        ],
      };
    }
    return {
      name: 'Nova Macro',
      description: userText.slice(0, 120),
      visibility: 'private',
      actions: [],
    };
  })();

  const empty: MacroPreviewState = {
    name: '',
    description: '',
    visibility: 'private',
    actions: [],
  };

  const steps: MacroPreviewState[] = [];
  steps.push({ ...empty, name: variant.name, description: variant.description, visibility: variant.visibility });
  for (let i = 0; i < variant.actions.length; i += 1) {
    steps.push({
      ...empty,
      name: variant.name,
      description: variant.description,
      visibility: variant.visibility,
      actions: variant.actions.slice(0, i + 1),
    });
  }
  return steps;
}

function buildRoleSteps(userText: string): RolePreviewState[] {
  const lower = userText.toLowerCase();

  type V = RolePreviewState;
  const variant: V = (() => {
    if (lower.includes('sdr') || lower.includes('vendas')) {
      return {
        name: 'SDR',
        description: 'Vendedor de qualificação inicial. Acessa pipeline e contatos.',
        estimatedUserCount: 4,
        permissions: [
          { resource: 'Contatos', actions: ['read', 'create', 'update'], totalActions: 5 },
          { resource: 'Conversas', actions: ['read', 'reply'], totalActions: 4 },
          { resource: 'Pipeline', actions: ['read', 'move_card'], totalActions: 6 },
          { resource: 'Templates', actions: ['read', 'use'], totalActions: 4 },
          { resource: 'Agents', actions: [], totalActions: 5 },
          { resource: 'Automações', actions: [], totalActions: 5 },
          { resource: 'Settings', actions: [], totalActions: 10 },
        ],
      };
    }
    if (lower.includes('suporte') || lower.includes('support')) {
      return {
        name: 'Suporte L1',
        description: 'Atendente de primeiro nível. Foca em conversas e macros.',
        estimatedUserCount: 6,
        permissions: [
          { resource: 'Conversas', actions: ['read', 'reply', 'resolve', 'transfer'], totalActions: 4 },
          { resource: 'Contatos', actions: ['read'], totalActions: 5 },
          { resource: 'Macros', actions: ['read', 'use'], totalActions: 3 },
          { resource: 'Templates', actions: ['read', 'use'], totalActions: 4 },
          { resource: 'Pipeline', actions: [], totalActions: 6 },
          { resource: 'Agents', actions: [], totalActions: 5 },
          { resource: 'Settings', actions: [], totalActions: 10 },
        ],
      };
    }
    if (lower.includes('admin') || lower.includes('ops') || lower.includes('opera')) {
      return {
        name: 'Admin Operações',
        description: 'Acesso quase completo, exceto billing e gestão de roles.',
        estimatedUserCount: 2,
        permissions: [
          { resource: 'Contatos', actions: ['read', 'create', 'update', 'delete', 'import'], totalActions: 5 },
          { resource: 'Conversas', actions: ['read', 'reply', 'resolve', 'transfer'], totalActions: 4 },
          { resource: 'Pipeline', actions: ['read', 'create', 'update', 'delete', 'move_card', 'configure'], totalActions: 6 },
          { resource: 'Agents', actions: ['read', 'create', 'update', 'delete', 'configure'], totalActions: 5 },
          { resource: 'Automações', actions: ['read', 'create', 'update', 'delete', 'execute'], totalActions: 5 },
          { resource: 'Jornadas', actions: ['read', 'create', 'update', 'delete', 'publish'], totalActions: 5 },
          { resource: 'Campanhas', actions: ['read', 'create', 'update', 'delete', 'execute'], totalActions: 5 },
          { resource: 'Templates', actions: ['read', 'create', 'update', 'delete'], totalActions: 4 },
          { resource: 'Billing', actions: [], totalActions: 4 },
          { resource: 'Users & Roles', actions: [], totalActions: 6 },
        ],
      };
    }
    return {
      name: 'Nova Role',
      description: userText.slice(0, 120),
      estimatedUserCount: 0,
      permissions: [],
    };
  })();

  const empty: RolePreviewState = {
    name: '',
    description: '',
    estimatedUserCount: 0,
    permissions: [],
  };

  const steps: RolePreviewState[] = [];
  steps.push({ ...empty, name: variant.name, description: variant.description });
  // Adiciona as permissões progressivamente
  const stride = Math.max(1, Math.floor(variant.permissions.length / 4));
  for (let i = stride; i <= variant.permissions.length; i += stride) {
    steps.push({
      ...variant,
      permissions: variant.permissions.slice(0, i),
    });
  }
  steps.push(variant);
  return steps;
}

export function newMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    role,
    content,
    createdAt: Date.now(),
  };
}
