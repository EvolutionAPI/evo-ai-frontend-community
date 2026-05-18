import { Loader2 } from 'lucide-react';

interface Props {
  text: string;
  /** Se a IA ainda está pensando (mostra spinner). Quando false, mostra como "registro" passado */
  active?: boolean;
}

export function ThinkingLine({ text, active = true }: Props) {
  return (
    <div className="flex items-center gap-2 px-3 py-1 text-xs italic text-muted-foreground animate-fadeIn">
      {active ? (
        <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
      ) : (
        <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" />
      )}
      <span>{text}</span>
    </div>
  );
}
