# ConfigurationSection

Componente refatorado para configuração de agentes AI.

## Estrutura

```
ConfigurationSection/
├── index.tsx                 # Componente principal com tabs
├── helpers/
│   └── agentTypeValidation.ts   # Helper para validação de tipos de agente
└── components/
    ├── index.ts              # Exportações
    ├── GeneralTab.tsx        # Aba Geral (Modelo, Capacidades, Output)
    ├── SystemTab.tsx         # Aba Sistema (Comportamento, Mensagens)
    ├── InactivityActionsTab.tsx  # Aba Ações de Inatividade
    ├── TransferRulesModal.tsx    # Modal de Regras de Transferência
    └── PipelineRulesModal.tsx    # Modal de Regras de Pipeline
```

## Validação de Tipos

O arquivo `helpers/agentTypeValidation.ts` contém funções helper para determinar quais features estão disponíveis para cada tipo de agente:

- `isLLMAgent(type)` - Verifica se é agente LLM
- `isA2AAgent(type)` - Verifica se é agente A2A
- `isTaskAgent(type)` - Verifica se é agente Task
- `supportsModelConfig(type)` - Suporta configuração de modelo
- `supportsBehaviorSettings(type)` - Suporta configurações de comportamento
- `supportsMessageHandling(type)` - Suporta tratamento de mensagens
- `supportsCapabilities(type)` - Suporta capacidades (memória, planner)
- `supportsOutputFormat(type)` - Suporta formato de saída
- `supportsInactivityActions(type)` - Suporta ações de inatividade
- `supportsTransferRules(type)` - Suporta regras de transferência
- `supportsPipelineRules(type)` - Suporta regras de pipeline
- `getAvailableTabs(type)` - Retorna lista de abas disponíveis

## Componentes

### GeneralTab

Renderiza:
- Modelo e API (apenas LLM)
- Formulários específicos de A2A e Task
- Capacidades do Agente (memória, planner)
- Formato de Saída (output key, schema)

### SystemTab

Renderiza:
- Comportamento na Conversa (transfer, reminders, pipeline, timezone)
- Tratamento de Mensagens (wait time, signature, segmentation, emojis, reply)

### InactivityActionsTab

Wrapper simples para o componente InactivityActions.

### TransferRulesModal

Modal que contém o componente TransferRules para configuração de regras de transferência.

### PipelineRulesModal

Modal que contém o componente PipelineRules para configuração de regras de pipeline.

## Uso

```tsx
<ConfigurationSection
  agent={agent}
  llmConfigData={llmConfigData}
  a2aConfigData={a2aConfigData}
  taskConfigData={taskConfigData}
  apiKeys={apiKeys}
  outputSchema={outputSchema}
  advancedSettings={advancedSettings}
  behaviorSettings={behaviorSettings}
  inactivityActions={inactivityActions}
  transferRules={transferRules}
  pipelineRules={pipelineRules}
  availablePipelines={availablePipelines}
  onLLMConfigChange={onLLMConfigChange}
  onA2AConfigChange={onA2AConfigChange}
  onTaskConfigChange={onTaskConfigChange}
  onOutputSchemaChange={onOutputSchemaChange}
  onAdvancedSettingsChange={onAdvancedSettingsChange}
  onBehaviorSettingsChange={onBehaviorSettingsChange}
  onInactivityActionsChange={onInactivityActionsChange}
  onTransferRulesChange={onTransferRulesChange}
  onPipelineRulesChange={onPipelineRulesChange}
  onInstructionSync={onInstructionSync}
  onApiKeysReload={onApiKeysReload}
/>
```

## Benefícios da Refatoração

1. **Separação de Responsabilidades**: Cada aba é um componente separado
2. **Código Mais Limpo**: Arquivo principal reduzido de ~1040 linhas para ~180 linhas
3. **Validação Centralizada**: Helper para validar tipos de agente em um só lugar
4. **Manutenibilidade**: Mais fácil encontrar e modificar código específico
5. **Reutilização**: Componentes podem ser reutilizados em outros contextos
6. **Testabilidade**: Componentes menores são mais fáceis de testar
