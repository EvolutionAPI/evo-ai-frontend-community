import { FlowNode } from '@/components/journey/_ui/FlowNode';
import { FlowCategoryBadge } from '@/components/journey/_ui/FlowCategoryBadge';
import { FlowFeedbackBanner } from '@/components/journey/_ui/FlowFeedbackBanner';

const NODE_VARIANTS = ['trigger', 'condition', 'control', 'exit'] as const;
const ACTION_SUBTYPES = ['message', 'webhook', 'label', 'pipeline'] as const;
const BADGE_VARIANTS = ['trigger', 'action', 'condition', 'control', 'exit'] as const;
const BANNER_VARIANTS = ['info', 'warn', 'error', 'success'] as const;

const NODE_TOKEN_KEYS: ReadonlyArray<{ key: string; bg: string; fg: string; border: string }> = [
  { key: 'trigger', bg: 'bg-flow-node-trigger-bg', fg: 'bg-flow-node-trigger-fg', border: 'bg-flow-node-trigger-border' },
  { key: 'condition', bg: 'bg-flow-node-condition-bg', fg: 'bg-flow-node-condition-fg', border: 'bg-flow-node-condition-border' },
  { key: 'control', bg: 'bg-flow-node-control-bg', fg: 'bg-flow-node-control-fg', border: 'bg-flow-node-control-border' },
  { key: 'exit', bg: 'bg-flow-node-exit-bg', fg: 'bg-flow-node-exit-fg', border: 'bg-flow-node-exit-border' },
  { key: 'action-message', bg: 'bg-flow-node-action-message-bg', fg: 'bg-flow-node-action-message-fg', border: 'bg-flow-node-action-message-border' },
  { key: 'action-webhook', bg: 'bg-flow-node-action-webhook-bg', fg: 'bg-flow-node-action-webhook-fg', border: 'bg-flow-node-action-webhook-border' },
  { key: 'action-label', bg: 'bg-flow-node-action-label-bg', fg: 'bg-flow-node-action-label-fg', border: 'bg-flow-node-action-label-border' },
  { key: 'action-pipeline', bg: 'bg-flow-node-action-pipeline-bg', fg: 'bg-flow-node-action-pipeline-fg', border: 'bg-flow-node-action-pipeline-border' },
];

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`h-10 w-full rounded border border-border ${className}`} aria-hidden="true" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function FlowDesignSystemDemo() {
  return (
    <main className="p-6 space-y-10 max-w-6xl mx-auto">
      <header>
        <h1 className="text-2xl font-semibold">Flow Design System Demo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visual reference for tokens and bridge components delivered by EVO-1253. Dev-only route. Toggle dark/light via the CRM header to verify both modes.
        </p>
      </header>

      <section aria-labelledby="nodes-heading" className="space-y-3">
        <h2 id="nodes-heading" className="text-lg font-medium">FlowNode variants</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {NODE_VARIANTS.map((variant) => (
            <FlowNode key={variant} variant={variant}>
              {variant}
            </FlowNode>
          ))}
          {ACTION_SUBTYPES.map((subtype) => (
            <FlowNode key={subtype} variant="action" subtype={subtype}>
              action · {subtype}
            </FlowNode>
          ))}
        </div>
      </section>

      <section aria-labelledby="badges-heading" className="space-y-3">
        <h2 id="badges-heading" className="text-lg font-medium">FlowCategoryBadge variants</h2>
        <div className="flex flex-wrap gap-3">
          {BADGE_VARIANTS.map((variant) => (
            <FlowCategoryBadge key={variant} variant={variant}>
              {variant}
            </FlowCategoryBadge>
          ))}
        </div>
      </section>

      <section aria-labelledby="feedback-heading" className="space-y-3">
        <h2 id="feedback-heading" className="text-lg font-medium">FlowFeedbackBanner variants</h2>
        <div className="space-y-2 max-w-2xl">
          {BANNER_VARIANTS.map((variant) => (
            <FlowFeedbackBanner key={variant} variant={variant}>
              Example {variant} message describing what happened or what to do next.
            </FlowFeedbackBanner>
          ))}
        </div>
      </section>

      <section aria-labelledby="tokens-heading" className="space-y-3">
        <h2 id="tokens-heading" className="text-lg font-medium">Node category token swatches</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6">
          {NODE_TOKEN_KEYS.map(({ key, bg, fg, border }) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-mono text-muted-foreground">{key}</p>
              <Swatch label="bg" className={bg} />
              <Swatch label="fg" className={fg} />
              <Swatch label="border" className={border} />
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="canvas-heading" className="space-y-3">
        <h2 id="canvas-heading" className="text-lg font-medium">Canvas chrome</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Swatch label="canvas-bg" className="bg-flow-canvas-bg" />
          <Swatch label="canvas-grid" className="bg-flow-canvas-grid" />
          <Swatch label="canvas-grid-strong" className="bg-flow-canvas-grid-strong" />
        </div>
      </section>

      <section aria-labelledby="palette-heading" className="space-y-3">
        <h2 id="palette-heading" className="text-lg font-medium">Palette chrome</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Swatch label="palette-bg" className="bg-flow-palette-bg" />
          <Swatch label="palette-surface" className="bg-flow-palette-surface" />
          <Swatch label="palette-divider" className="bg-flow-palette-divider" />
        </div>
      </section>

      <section aria-labelledby="panel-heading" className="space-y-3">
        <h2 id="panel-heading" className="text-lg font-medium">Panel chrome — reference for EVO-1264</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          These tokens are declared here so EVO-1264 [10.11] NodeConfigModal can consume them without re-curating colors. EVO-1253 does not deliver the modal component.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Swatch label="panel-bg" className="bg-flow-panel-bg" />
          <Swatch label="panel-header-bg" className="bg-flow-panel-header-bg" />
          <Swatch label="panel-divider" className="bg-flow-panel-divider" />
        </div>
      </section>

      <section aria-labelledby="edges-heading" className="space-y-3">
        <h2 id="edges-heading" className="text-lg font-medium">Edge colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Swatch label="edge-default" className="bg-flow-edge-default" />
          <Swatch label="edge-active" className="bg-flow-edge-active" />
          <Swatch label="edge-error" className="bg-flow-edge-error" />
        </div>
      </section>
    </main>
  );
}
