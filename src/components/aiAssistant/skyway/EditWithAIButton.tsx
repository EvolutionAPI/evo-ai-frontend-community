import { useEffect, useState } from 'react';
import { Button } from '@evoapi/design-system';
import { Sparkles } from 'lucide-react';
import { buildSessionKey, loadSession } from '@/services/aiAssistant/aiSessionStore';

interface Props {
  /** Tipo da entidade — bate com a `feature` do CreateWithAIDialog (ex: 'pipeline', 'agent') */
  entityType: string;
  /** ID da entidade que está sendo editada */
  entityId: string;
  /** Disparado ao clicar — recebe a sessionKey pra reabrir o dialog */
  onOpen: (sessionKey: string) => void;
  /** Label override */
  newLabel?: string;
  continueLabel?: string;
  className?: string;
}

/**
 * SKYWAY — botão "Editar com IA" / "Continuar com IA" no header de edição
 * de qualquer entidade. Escopado em UM item específico.
 *
 * Estados:
 * - Se existe sessão salva pra esse `entityType:entityId` → "Continuar com IA"
 *   com dot pulsante mostrando que há conversa salva
 * - Caso contrário → "Editar com IA" (abre dialog vazio com contexto da entidade)
 */
export function EditWithAIButton({
  entityType,
  entityId,
  onOpen,
  newLabel = 'Editar com IA',
  continueLabel = 'Continuar com IA',
  className,
}: Props) {
  const sessionKey = buildSessionKey(entityType, entityId);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(!!loadSession(sessionKey));
  }, [sessionKey]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onOpen(sessionKey)}
      className={[
        'gap-1.5 border-primary/30 bg-primary/[0.04] hover:bg-primary/10 hover:border-primary/50',
        className ?? '',
      ].join(' ')}
    >
      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        {hasSession && (
          <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-background animate-pulse" />
        )}
      </span>
      {hasSession ? continueLabel : newLabel}
    </Button>
  );
}
