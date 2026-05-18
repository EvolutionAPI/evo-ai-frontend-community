import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@evoapi/design-system';
import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Cog,
  DollarSign,
  Gauge,
  Key,
  Rocket,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AutonomySlider } from '@/components/aiAssistant/skyway';
import type { AutonomyLevel, ToolRiskTag } from '@/services/aiAssistant/mockAssistant';

// =============================================================================
// MOCK DATA — populated state for pitch/demo
// =============================================================================

const LLM_PROVIDERS = [
  { id: 'openai', label: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'] },
  { id: 'anthropic', label: 'Anthropic', models: ['claude-haiku-4.5', 'claude-sonnet-4.6', 'claude-opus-4.7'] },
  { id: 'fireworks', label: 'Fireworks AI', models: ['llama-3.1-70b', 'mixtral-8x22b'] },
  { id: 'self_hosted', label: 'Self-hosted (OpenAI-compatible)', models: ['custom'] },
];

const MOCK_USERS = [
  { id: 'u-001', name: 'Davidson Gomes', email: 'davidson@evolution.api', autonomy: 'autopilot' as AutonomyLevel, role: 'Admin' },
  { id: 'u-002', name: 'Marina Silva', email: 'marina@equipe.com', autonomy: 'balanced' as AutonomyLevel, role: 'SDR' },
  { id: 'u-003', name: 'Pedro Costa', email: 'pedro@equipe.com', autonomy: 'balanced' as AutonomyLevel, role: 'Suporte' },
  { id: 'u-004', name: 'Camila Rocha', email: 'camila@equipe.com', autonomy: 'conservative' as AutonomyLevel, role: 'Vendedora' },
  { id: 'u-005', name: 'Lucas Almeida', email: 'lucas@equipe.com', autonomy: 'conservative' as AutonomyLevel, role: 'Estagiário' },
];

const MOCK_TOOLS: Array<{
  name: string;
  domain: string;
  description: string;
  risk: ToolRiskTag;
  enabled: boolean;
  callsToday: number;
}> = [
  { name: 'get_contact', domain: 'Contatos', description: 'Busca dados de um contato', risk: 'safe', enabled: true, callsToday: 412 },
  { name: 'list_pipelines', domain: 'Pipeline', description: 'Lista pipelines disponíveis', risk: 'safe', enabled: true, callsToday: 87 },
  { name: 'query_evolution_docs', domain: 'Knowledge', description: 'Consulta documentação Evolution', risk: 'safe', enabled: true, callsToday: 156 },
  { name: 'query_knowledge_nexus', domain: 'Knowledge', description: 'Consulta a Knowledge Nexus do cliente', risk: 'safe', enabled: false, callsToday: 0 },
  { name: 'create_contact', domain: 'Contatos', description: 'Cria um novo contato', risk: 'confirm', enabled: true, callsToday: 23 },
  { name: 'add_label', domain: 'Contatos', description: 'Adiciona tag a contato', risk: 'confirm', enabled: true, callsToday: 67 },
  { name: 'move_contact_to_pipeline', domain: 'Pipeline', description: 'Move contato entre etapas', risk: 'confirm', enabled: true, callsToday: 41 },
  { name: 'send_message', domain: 'Mensagens', description: 'Envia mensagem a um contato', risk: 'confirm', enabled: true, callsToday: 89 },
  { name: 'create_agent_with_tools', domain: 'Agents', description: 'Cria agente IA com tools', risk: 'confirm', enabled: true, callsToday: 4 },
  { name: 'bulk_send_template', domain: 'Mensagens', description: 'Envia template para múltiplos contatos', risk: 'gated', enabled: true, callsToday: 7 },
  { name: 'delete_contact', domain: 'Contatos', description: 'Apaga um contato (LGPD)', risk: 'gated', enabled: true, callsToday: 1 },
  { name: 'export_user_data', domain: 'Privacy', description: 'Exporta dados do usuário (LGPD)', risk: 'gated', enabled: true, callsToday: 0 },
  { name: 'request_data_deletion', domain: 'Privacy', description: 'Solicita deleção de dados (LGPD)', risk: 'gated', enabled: true, callsToday: 0 },
];

const USAGE_MOCK = {
  today: { calls: 1287, tokens: 487_320, costUSD: 0.42, errors: 18 },
  week: { calls: 8421, tokens: 3_120_440, costUSD: 2.81, errors: 92 },
  month: { calls: 34_207, tokens: 12_840_120, costUSD: 11.34, errors: 318 },
  budgetUSD: 50,
  limitTokensPerUser: 50_000,
  limitTokensPerSession: 500_000,
};

const RISK_META: Record<ToolRiskTag, { label: string; tone: string; icon: LucideIcon; description: string }> = {
  safe: {
    label: 'Seguro',
    tone: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20',
    icon: ShieldCheck,
    description: 'Executa direto, sem confirmação',
  },
  confirm: {
    label: 'Pede confirmação',
    tone: 'bg-amber-500/10 text-amber-300 ring-amber-500/20',
    icon: ShieldHalf,
    description: 'Mostra ação no chat antes de executar',
  },
  gated: {
    label: 'Sensível',
    tone: 'bg-rose-500/10 text-rose-300 ring-rose-500/20',
    icon: ShieldAlert,
    description: 'Aprovação explícita registrada em audit',
  },
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SkywayConfig() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Hero */}
      <div className="flex items-start gap-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-foreground">
            Skyway · Camada IA do Evo CRM
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure o provedor de LLM, autonomia dos usuários, gating de ferramentas
            sensíveis e limites de uso. Toda interação IA do sistema passa por aqui.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              Skyway ativo
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
              <BrainCircuit className="h-3 w-3" />
              OpenAI · gpt-4o-mini
            </Badge>
            <Badge variant="outline" className="gap-1.5 text-muted-foreground">
              <Activity className="h-3 w-3" />
              1.287 calls hoje
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="llm">
        <TabsList>
          <TabsTrigger value="llm" className="gap-1.5">
            <Key className="h-3.5 w-3.5" />
            LLM Provider
          </TabsTrigger>
          <TabsTrigger value="autonomy" className="gap-1.5">
            <Gauge className="h-3.5 w-3.5" />
            Autonomia
          </TabsTrigger>
          <TabsTrigger value="tools" className="gap-1.5">
            <Cog className="h-3.5 w-3.5" />
            Tool Gating
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            Limits & Usage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="llm" className="mt-6">
          <LLMProviderSection />
        </TabsContent>
        <TabsContent value="autonomy" className="mt-6">
          <AutonomySection />
        </TabsContent>
        <TabsContent value="tools" className="mt-6">
          <ToolGatingSection />
        </TabsContent>
        <TabsContent value="limits" className="mt-6">
          <LimitsAndUsageSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// SECTION 1: LLM Provider & API Key
// =============================================================================

function LLMProviderSection() {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('sk-proj-••••••••••••••••••••••••KX9a');
  const [showKey, setShowKey] = useState(false);
  const [defaultModel, setDefaultModel] = useState('gpt-4o-mini');
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('success');

  const selectedProvider = LLM_PROVIDERS.find((p) => p.id === provider);
  const isExternal = provider !== 'self_hosted';

  const testConnection = () => {
    setTestStatus('testing');
    setTimeout(() => setTestStatus('success'), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Provider selection */}
      <SettingsCard
        icon={Key}
        title="Provedor de LLM"
        description="BYO key — os dados nunca saem da sua instalação. Você escolhe o provedor."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="provider">Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LLM_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="defaultModel">Modelo padrão</Label>
            <Select value={defaultModel} onValueChange={setDefaultModel}>
              <SelectTrigger id="defaultModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {selectedProvider?.models.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="apiKey">API Key</Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={isExternal ? 'sk-…' : 'opcional para self-hosted'}
              className="pr-24 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              {showKey ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            A chave fica criptografada em <code className="rounded bg-muted px-1 font-mono text-[10px]">.env</code> ou no painel. Nunca é enviada a terceiros.
          </p>
        </div>

        {provider === 'self_hosted' && (
          <div className="space-y-1.5">
            <Label htmlFor="baseUrl">Base URL (OpenAI-compatible)</Label>
            <Input
              id="baseUrl"
              placeholder="https://meu-ollama.local/v1"
              className="font-mono text-xs"
            />
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
          <div className="flex items-center gap-2">
            {testStatus === 'success' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-foreground">Conectado · responde em ~640ms</span>
              </>
            )}
            {testStatus === 'testing' && (
              <>
                <Activity className="h-4 w-4 animate-pulse text-amber-400" />
                <span className="text-sm text-muted-foreground">Testando…</span>
              </>
            )}
            {testStatus === 'idle' && (
              <span className="text-sm text-muted-foreground">Não testado</span>
            )}
            {testStatus === 'error' && (
              <>
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span className="text-sm text-rose-400">Falha na conexão</span>
              </>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={testConnection} disabled={testStatus === 'testing'}>
            Testar conexão
          </Button>
        </div>
      </SettingsCard>

      {/* Privacy consent */}
      {isExternal && (
        <SettingsCard
          icon={ShieldAlert}
          title="Consentimento de envio a terceiros (LGPD)"
          description="O provedor escolhido é externo. As mensagens dos usuários e dados do CRM consumidos por tool calls serão enviados para a API do provedor."
        >
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <Switch checked={consentAccepted} onCheckedChange={setConsentAccepted} />
            <div className="flex-1 text-sm">
              <p className="font-medium text-foreground">
                Aceito enviar dados do meu CRM para a API do provedor selecionado
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Aceito por: <span className="text-foreground">Davidson Gomes</span> em 18/05/2026 às 14:32 ·{' '}
                <button className="text-primary hover:underline">Ver histórico de consentimentos</button>
              </p>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* Per-agent model override */}
      <SettingsCard
        icon={Bot}
        title="Modelos por tipo de agente"
        description="Override o modelo padrão para agentes específicos. Use modelos mais baratos em alto volume."
      >
        <div className="space-y-2">
          {[
            { agent: 'onboarding_agent', label: 'Onboarding', model: 'gpt-4o-mini', volume: '~12 calls/dia' },
            { agent: 'general_agent', label: 'Assistente Geral', model: 'gpt-4o-mini', volume: '~847 calls/dia' },
            { agent: 'automation_creator_agent', label: 'Criar Automação', model: 'gpt-4-turbo', volume: '~12 calls/dia' },
            { agent: 'agent_creator_agent', label: 'Criar Agente', model: 'gpt-4-turbo', volume: '~5 calls/dia' },
            { agent: 'journey_creator_agent', label: 'Criar Jornada', model: 'gpt-4-turbo', volume: '~3 calls/dia' },
          ].map((row) => (
            <div
              key={row.agent}
              className="flex items-center gap-3 rounded-lg border border-border bg-card/40 px-3 py-2"
            >
              <code className="font-mono text-xs text-muted-foreground shrink-0">{row.agent}</code>
              <span className="text-sm text-foreground flex-1">{row.label}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{row.volume}</span>
              <Select defaultValue={row.model}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider?.models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

// =============================================================================
// SECTION 2: Autonomy
// =============================================================================

function AutonomySection() {
  const [defaultLevel, setDefaultLevel] = useState<AutonomyLevel>('balanced');
  const [overrides, setOverrides] = useState(MOCK_USERS);

  const updateUser = (id: string, level: AutonomyLevel) => {
    setOverrides((prev) => prev.map((u) => (u.id === id ? { ...u, autonomy: level } : u)));
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        icon={Gauge}
        title="Autonomia padrão da instalação"
        description="Nível aplicado a novos usuários por default. Cada usuário pode ter override (abaixo)."
      >
        <div className="flex items-center gap-4">
          <AutonomySlider value={defaultLevel} onChange={setDefaultLevel} />
          <div className="flex-1 text-xs text-muted-foreground">
            {defaultLevel === 'conservative' && 'IA pede confirmação em quase tudo. Mais seguro, mais cliques.'}
            {defaultLevel === 'balanced' && 'IA auto-executa ações seguras; pede confirmação em ações sensíveis.'}
            {defaultLevel === 'autopilot' && 'IA executa tudo; só pede aprovação em ações destrutivas em massa.'}
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={Users}
        title="Overrides por usuário"
        description="Defina exceções por usuário. Útil pra dar autopilot a admins e conservador a estagiários."
      >
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left">
                <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Usuário</th>
                <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Papel</th>
                <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground text-right">Autonomia</th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium">
                        {u.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="text-sm text-foreground">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{u.role}</td>
                  <td className="px-3 py-2 text-right">
                    <AutonomySlider value={u.autonomy} onChange={(lvl) => updateUser(u.id, lvl)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Users className="h-3 w-3" />
          {overrides.length} usuários · {overrides.filter((u) => u.autonomy !== defaultLevel).length} com override
        </div>
      </SettingsCard>
    </div>
  );
}

// =============================================================================
// SECTION 3: Tool Gating
// =============================================================================

function ToolGatingSection() {
  const [tools, setTools] = useState(MOCK_TOOLS);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | ToolRiskTag>('all');

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (filterRisk !== 'all' && t.risk !== filterRisk) return false;
      if (search && !`${t.name} ${t.domain} ${t.description}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [tools, search, filterRisk]);

  const updateTool = (name: string, patch: Partial<typeof MOCK_TOOLS[number]>) => {
    setTools((prev) => prev.map((t) => (t.name === name ? { ...t, ...patch } : t)));
  };

  const counts = useMemo(() => {
    return {
      total: tools.length,
      enabled: tools.filter((t) => t.enabled).length,
      safe: tools.filter((t) => t.risk === 'safe').length,
      confirm: tools.filter((t) => t.risk === 'confirm').length,
      gated: tools.filter((t) => t.risk === 'gated').length,
    };
  }, [tools]);

  return (
    <div className="space-y-6">
      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Tools totais" value={counts.total} icon={Cog} />
        <StatBox label="Habilitadas" value={counts.enabled} icon={CheckCircle2} tone="emerald" />
        <StatBox label="Pedem confirmação" value={counts.confirm} icon={ShieldHalf} tone="amber" />
        <StatBox label="Sensíveis (gated)" value={counts.gated} icon={ShieldAlert} tone="rose" />
      </div>

      <SettingsCard
        icon={ShieldHalf}
        title="Tags de risco por tool"
        description="Defina o nível de aprovação necessário pra cada ferramenta. Tools sensíveis exigem aprovação explícita registrada em audit."
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tool por nome, domínio ou descrição…"
              className="pl-9"
            />
          </div>
          <Select value={filterRisk} onValueChange={(v) => setFilterRisk(v as typeof filterRisk)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os riscos</SelectItem>
              <SelectItem value="safe">Apenas seguros</SelectItem>
              <SelectItem value="confirm">Apenas confirmação</SelectItem>
              <SelectItem value="gated">Apenas sensíveis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          {filtered.map((t) => {
            const meta = RISK_META[t.risk];
            const Icon = meta.icon;
            return (
              <div
                key={t.name}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-center rounded-lg border border-border bg-card/40 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="font-mono text-xs text-foreground">{t.name}()</code>
                    <Badge variant="outline" className="text-[10px] h-5">
                      {t.domain}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                </div>
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  {t.callsToday} hoje
                </span>
                <Select value={t.risk} onValueChange={(v) => updateTool(t.name, { risk: v as ToolRiskTag })}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <span className={`inline-flex items-center gap-1.5 rounded px-1.5 py-px text-[10px] ring-1 ${meta.tone}`}>
                      <Icon className="h-2.5 w-2.5" />
                      {meta.label}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {(['safe', 'confirm', 'gated'] as ToolRiskTag[]).map((r) => {
                      const m = RISK_META[r];
                      const I = m.icon;
                      return (
                        <SelectItem key={r} value={r}>
                          <span className="inline-flex items-center gap-1.5">
                            <I className="h-3 w-3" />
                            {m.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Switch
                  checked={t.enabled}
                  onCheckedChange={(v) => updateTool(t.name, { enabled: v })}
                  aria-label={`${t.enabled ? 'Desabilitar' : 'Habilitar'} ${t.name}`}
                />
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
            Nenhuma tool encontrada com esses filtros.
          </div>
        )}
      </SettingsCard>
    </div>
  );
}

// =============================================================================
// SECTION 4: Limits & Usage
// =============================================================================

function LimitsAndUsageSection() {
  const [budget, setBudget] = useState(USAGE_MOCK.budgetUSD);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [limitPerUser, setLimitPerUser] = useState(USAGE_MOCK.limitTokensPerUser);
  const [limitPerSession, setLimitPerSession] = useState(USAGE_MOCK.limitTokensPerSession);

  const monthSpent = USAGE_MOCK.month.costUSD;
  const budgetPct = (monthSpent / budget) * 100;
  const isWarning = budgetPct >= alertThreshold;

  return (
    <div className="space-y-6">
      {/* Usage cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <UsageBox period="Hoje" data={USAGE_MOCK.today} />
        <UsageBox period="Esta semana" data={USAGE_MOCK.week} />
        <UsageBox period="Este mês" data={USAGE_MOCK.month} />
      </div>

      {/* Budget */}
      <SettingsCard
        icon={DollarSign}
        title="Orçamento mensal"
        description="Quando o gasto bater o limite, novas sessões IA são bloqueadas até o próximo mês."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="budget">Limite mensal (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="alert">Alertar em (%)</Label>
            <Input
              id="alert"
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              min={50}
              max={100}
            />
          </div>
        </div>

        {/* Budget bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              <span className="text-foreground font-medium">${monthSpent.toFixed(2)}</span> de ${budget.toFixed(2)}
            </span>
            <span className={`font-medium ${isWarning ? 'text-amber-400' : 'text-muted-foreground'}`}>
              {budgetPct.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPct >= 100 ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
          {isWarning && (
            <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-300 ring-1 ring-amber-500/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              Você passou de {alertThreshold}% do orçamento mensal. Considere otimizar uso ou aumentar o limite.
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Token limits */}
      <SettingsCard
        icon={Zap}
        title="Limites de tokens"
        description="Protege contra runaway costs em sessões longas ou usuários abusivos."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="limitPerUser">Por usuário / dia</Label>
            <Input
              id="limitPerUser"
              type="number"
              value={limitPerUser}
              onChange={(e) => setLimitPerUser(Number(e.target.value))}
            />
            <p className="text-[10px] text-muted-foreground">
              ~{Math.round(limitPerUser / 1000)}k tokens · ~{Math.round(limitPerUser / 500)} mensagens
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="limitPerSession">Por sessão</Label>
            <Input
              id="limitPerSession"
              type="number"
              value={limitPerSession}
              onChange={(e) => setLimitPerSession(Number(e.target.value))}
            />
            <p className="text-[10px] text-muted-foreground">
              Sessão fica read-only depois de atingir
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Top users */}
      <SettingsCard
        icon={TrendingUp}
        title="Top consumidores (este mês)"
        description="Quem mais usou tokens. Click para ver detalhes."
      >
        <div className="space-y-1.5">
          {[
            { name: 'Davidson Gomes', tokens: 1_240_000, percent: 38, calls: 1840 },
            { name: 'Marina Silva', tokens: 820_000, percent: 25, calls: 1230 },
            { name: 'Pedro Costa', tokens: 510_000, percent: 16, calls: 720 },
            { name: 'Camila Rocha', tokens: 340_000, percent: 11, calls: 480 },
            { name: 'Lucas Almeida', tokens: 90_000, percent: 3, calls: 140 },
          ].map((u) => (
            <div
              key={u.name}
              className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_140px_80px_60px] items-center gap-3 rounded-lg bg-card/40 px-3 py-2.5"
            >
              <span className="text-sm text-foreground truncate">{u.name}</span>
              <div className="hidden sm:block">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${u.percent}%` }} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground text-right">{u.calls} calls</span>
              <span className="text-xs font-mono text-foreground text-right">
                {(u.tokens / 1000).toFixed(0)}k
              </span>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Audit link */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <div className="text-sm font-medium text-foreground">Auditoria completa de tool calls</div>
            <div className="text-xs text-muted-foreground">
              Todas as 34.207 chamadas deste mês com input/output/custo/usuário
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          Abrir Audit Log
          <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Helpers
// =============================================================================

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function StatBox({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'emerald' | 'amber' | 'rose' | 'default';
}) {
  const toneCls =
    tone === 'emerald'
      ? 'text-emerald-300'
      : tone === 'amber'
        ? 'text-amber-300'
        : tone === 'rose'
          ? 'text-rose-300'
          : 'text-foreground';
  return (
    <div className="rounded-lg border border-border bg-card/40 px-4 py-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className={`mt-1 text-2xl font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}

function UsageBox({
  period,
  data,
}: {
  period: string;
  data: { calls: number; tokens: number; costUSD: number; errors: number };
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4 space-y-2">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{period}</div>
      <div className="text-2xl font-semibold text-foreground">{data.calls.toLocaleString('pt-BR')}</div>
      <div className="text-[10px] text-muted-foreground">tool calls</div>
      <div className="flex items-center justify-between pt-1 border-t border-border text-xs">
        <span className="text-muted-foreground">
          <span className="font-mono text-foreground">{(data.tokens / 1000).toFixed(0)}k</span> tokens
        </span>
        <span className="text-muted-foreground">
          <span className="font-mono text-emerald-300">${data.costUSD.toFixed(2)}</span>
        </span>
      </div>
      {data.errors > 0 && (
        <div className="text-[10px] text-rose-400 flex items-center gap-1">
          <Rocket className="h-2.5 w-2.5" />
          {data.errors} erros
        </div>
      )}
    </div>
  );
}
