import {
  Briefcase,
  Building2,
  Check,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  ContactPreviewState,
  ContactSocialProfile,
} from '@/services/aiAssistant/mockAssistant';

interface Props {
  state: ContactPreviewState | null;
  isBuilding?: boolean;
}

const SOCIAL_ICON: Record<ContactSocialProfile['network'], LucideIcon> = {
  linkedin: Linkedin,
  instagram: Briefcase,
  twitter: Briefcase,
  facebook: Briefcase,
  github: Briefcase,
};

export function ContactPreview({ state, isBuilding = false }: Props) {
  if (!state) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-base font-medium text-foreground">Preview do contato</h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Descreva o contato no chat ao lado. O cartão completo aparece aqui em
          tempo real conforme a IA estrutura os dados.
        </p>
      </div>
    );
  }

  const fullName = `${state.firstName} ${state.lastName}`.trim();
  const initials =
    `${state.firstName.charAt(0)}${state.lastName.charAt(0)}`.toUpperCase() || '?';
  const hasName = Boolean(state.firstName || state.lastName);
  const ready = hasName && Boolean(state.email || state.phone);

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
            {isBuilding ? 'IA montando contato...' : ready ? 'Pronto para criar' : 'Rascunho'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-md">
          {/* Cartão principal */}
          <div className="rounded-2xl border border-border bg-card/60 p-5 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary text-lg font-semibold ring-1 ring-primary/20">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-foreground">
                  {fullName || (
                    <span className="text-muted-foreground italic font-normal">
                      Aguardando nome...
                    </span>
                  )}
                </h3>
                {state.company && (
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {state.company}
                    {state.industry ? ` · ${state.industry}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Contato */}
            <div className="mt-5 space-y-2">
              {state.email && (
                <Row icon={Mail} text={state.email} />
              )}
              {state.phone && (
                <Row icon={Phone} text={state.phone} />
              )}
              {(state.city || state.country) && (
                <Row icon={MapPin} text={[state.city, state.country].filter(Boolean).join(', ')} />
              )}
              {state.company && !state.industry && (
                <Row icon={Building2} text={state.company} />
              )}
            </div>

            {/* Descrição */}
            {state.description && (
              <div className="mt-5 rounded-xl bg-muted/40 px-3 py-2.5">
                <p className="text-xs leading-relaxed text-foreground">{state.description}</p>
              </div>
            )}

            {/* Labels */}
            {state.labels.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {state.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex items-center rounded-md bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-300 ring-1 ring-violet-500/20"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social */}
            {state.socialProfiles.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Redes sociais
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {state.socialProfiles.map((sp) => {
                    const Icon = SOCIAL_ICON[sp.network];
                    return (
                      <span
                        key={`${sp.network}-${sp.handle}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
                      >
                        <Icon className="h-3 w-3 text-sky-400" />
                        {sp.handle}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {ready && !isBuilding && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Contato pronto. Pode criar quando quiser.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{text}</span>
    </div>
  );
}
