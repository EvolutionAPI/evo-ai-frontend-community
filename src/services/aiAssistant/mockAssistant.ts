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

export interface StreamCallbacks<TPreview = unknown> {
  onToken: (token: string) => void;
  onPreviewUpdate?: (state: TPreview) => void;
  onDone: (full: string) => void;
}

/**
 * Simula uma resposta da IA com streaming token a token + atualização incremental do preview.
 */
export function streamAssistantReply<TPreview = unknown>(
  userText: string,
  feature: AssistantFeature,
  cb: StreamCallbacks<TPreview>,
): StreamHandle {
  let cancelled = false;

  (async () => {
    const reply = composeReply(userText, feature);
    const previewSteps = buildPreviewSteps(userText, feature) as TPreview[];

    // Pequena pausa antes do primeiro token, como um modelo real.
    await wait(280);
    if (cancelled) return;

    let acc = '';
    const tokens = reply.split(/(\s+)/);

    for (let i = 0; i < tokens.length; i += 1) {
      if (cancelled) return;
      const tok = tokens[i];
      acc += tok;
      cb.onToken(tok);

      // Vai aplicando o preview no meio da resposta para dar sensação de "trabalhando".
      const stepIdx = Math.floor((i / tokens.length) * previewSteps.length);
      if (cb.onPreviewUpdate && previewSteps[stepIdx]) {
        cb.onPreviewUpdate(previewSteps[stepIdx]);
      }

      // Velocidade do typewriter — não usar Math.random para deixar previsível.
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

export function newMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    role,
    content,
    createdAt: Date.now(),
  };
}
