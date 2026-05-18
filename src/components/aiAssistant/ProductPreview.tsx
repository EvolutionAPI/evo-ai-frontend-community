import { Check, Cloud, Hash, Package } from 'lucide-react';
import type { ProductPreviewState } from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: ProductPreviewState | null;
  isBuilding?: boolean;
}

const KIND_TONE: Record<ProductPreviewState['kind'], { bg: string; text: string; ring: string; label: string; icon: typeof Package }> = {
  physical: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    ring: 'ring-amber-500/20',
    label: 'Físico',
    icon: Package,
  },
  digital: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-300',
    ring: 'ring-violet-500/20',
    label: 'Digital',
    icon: Cloud,
  },
};

function formatPrice(price: number, currency: string): string {
  if (currency === 'BRL') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
}

export function ProductPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview do produto</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva o produto no chat. O cartão completo aparece aqui conforme
          a IA preenche os dados.
        </p>
      </div>
    );
  }

  const ready = Boolean(state.name && state.sku && state.price > 0);
  const kind = KIND_TONE[state.kind];
  const KindIcon = kind.icon;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-primary ${isBuilding ? 'animate-pulse' : ''}`}
            />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {isBuilding ? 'IA configurando produto...' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-sm">
          <div className="overflow-hidden rounded-2xl border border-border bg-card animate-fadeIn">
            {/* Thumbnail */}
            <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-muted to-card">
              <KindIcon className="h-12 w-12 text-muted-foreground/40" />
              <span
                className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ring-1 ${kind.bg} ${kind.text} ${kind.ring}`}
              >
                <KindIcon className="h-3 w-3" />
                {kind.label}
              </span>
              {state.stockQuantity !== null && state.kind === 'physical' && (
                <span className="absolute right-3 top-3 inline-flex items-center rounded-md bg-card/80 px-2 py-0.5 text-[10px] font-medium text-foreground ring-1 ring-border backdrop-blur">
                  Estoque: {state.stockQuantity}
                </span>
              )}
            </div>

            {/* Conteúdo */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {state.name || (
                    <span className="text-muted-foreground italic font-normal">
                      Aguardando nome...
                    </span>
                  )}
                </h3>
                {state.sku && (
                  <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    {state.sku}
                  </p>
                )}
              </div>

              {state.price > 0 && (
                <p className="text-xl font-bold text-foreground">
                  {formatPrice(state.price, state.currency)}
                </p>
              )}

              {state.description && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {state.description}
                </p>
              )}

              {state.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {state.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-md bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-300 ring-1 ring-sky-500/20"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {ready && !isBuilding && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Produto pronto para cadastro.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
