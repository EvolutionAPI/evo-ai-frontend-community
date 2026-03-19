import { useState } from 'react';
import { Card, CardContent, Button, Badge } from '@evoapi/design-system';
import { ArrowRight, ArrowLeft, Bot, ListChecks, ArrowRight as ArrowRightIcon, GitBranch, RefreshCw, Plug } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface Step2Props {
  data: { type: string };
  onChange: (data: { type: string }) => void;
  onNext: () => void;
  onBack: () => void;
}

const getAgentTypes = (t: (key: string) => string) => [
  {
    value: 'llm',
    label: t('wizard.step2.types.llm.label'),
    description: t('wizard.step2.types.llm.description'),
    icon: Bot,
    badge: t('wizard.step2.badges.mostPopular'),
    badgeVariant: 'default' as const,
    color: 'from-purple-500 to-blue-500',
  },
  {
    value: 'task',
    label: t('wizard.step2.types.task.label'),
    description: t('wizard.step2.types.task.description'),
    icon: ListChecks,
    badge: null,
    badgeVariant: 'outline' as const,
    color: 'from-green-500 to-teal-500',
  },
  {
    value: 'sequential',
    label: t('wizard.step2.types.sequential.label'),
    description: t('wizard.step2.types.sequential.description'),
    icon: ArrowRightIcon,
    badge: null,
    badgeVariant: 'outline' as const,
    color: 'from-orange-500 to-red-500',
  },
  {
    value: 'parallel',
    label: t('wizard.step2.types.parallel.label'),
    description: t('wizard.step2.types.parallel.description'),
    icon: GitBranch,
    badge: null,
    badgeVariant: 'outline' as const,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'loop',
    label: t('wizard.step2.types.loop.label'),
    description: t('wizard.step2.types.loop.description'),
    icon: RefreshCw,
    badge: null,
    badgeVariant: 'outline' as const,
    color: 'from-pink-500 to-purple-500',
  },
  {
    value: 'external',
    label: t('wizard.step2.types.external.label'),
    description: t('wizard.step2.types.external.description'),
    icon: Plug,
    badge: null,
    badgeVariant: 'secondary' as const,
    color: 'from-indigo-500 to-purple-500',
  },
];

const Step2_Type = ({ data, onChange, onNext, onBack }: Step2Props) => {
  const { t } = useLanguage('aiAgents');
  const [error, setError] = useState<string>('');
  const agentTypes = getAgentTypes(t);

  const handleNext = () => {
    if (!data.type) {
      setError(t('validation.typeRequired'));
      return;
    }
    onNext();
  };

  const handleTypeSelect = (type: string) => {
    onChange({ type });
    setError('');
  };

  return (
    <div className="flex flex-col h-full min-h-0 max-w-6xl mx-auto py-2 px-4">
      <div className="flex-1 min-h-0 grid grid-cols-2 lg:grid-cols-3 gap-2 mb-2 overflow-y-auto p-1 content-center">
        {agentTypes.map((type) => {
          const IconComponent = type.icon;
          const isSelected = data.type === type.value;

          return (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] flex flex-col min-h-[150px] ${
                isSelected
                  ? 'border-primary border-2 bg-primary/5 shadow-lg scale-[1.01]'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleTypeSelect(type.value)}
            >
              <CardContent className="p-2.5 flex flex-col flex-1 items-center justify-center text-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-md`}
                >
                  <IconComponent className="h-4 w-4 text-white" />
                </div>

                <div className="w-full max-w-[220px] space-y-1">
                  <h3 className="font-semibold text-sm">{type.label}</h3>
                  <p className="text-[11px] text-muted-foreground leading-tight min-h-[30px] flex items-center justify-center">
                    {type.description}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 min-h-[28px]">
                  {type.badge && (
                    <Badge variant={type.badgeVariant} className="text-xs">
                      {type.badge}
                    </Badge>
                  )}

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600 text-center mb-3 flex-shrink-0">{error}</p>}

      <div className="flex justify-between flex-shrink-0 pt-2 border-t">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('actions.back')}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!data.type}
          className="gap-2 px-6"
        >
          {t('actions.continue')}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Step2_Type;
