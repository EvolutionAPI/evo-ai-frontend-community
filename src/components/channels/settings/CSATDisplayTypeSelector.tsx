import { Star } from 'lucide-react';
import { CSAT_RATINGS, CSAT_DISPLAY_TYPES, CSATDisplayType } from './helpers/csatConstants';
import { useLanguage } from '@/hooks/useLanguage';

interface CSATDisplayTypeSelectorProps {
  selectedType: CSATDisplayType;
  onUpdate: (type: CSATDisplayType) => void;
}

export default function CSATDisplayTypeSelector({ selectedType, onUpdate }: CSATDisplayTypeSelectorProps) {
  const { t } = useLanguage('channels');
  return (
    <div className="flex flex-wrap gap-6 mt-2">
      {/* Emoji Display Type */}
      <EmojiDisplayOption
        selected={selectedType === CSAT_DISPLAY_TYPES.EMOJI}
        onSelect={() => onUpdate(CSAT_DISPLAY_TYPES.EMOJI)}
      />

      {/* Star Display Type */}
      <StarDisplayOption
        selected={selectedType === CSAT_DISPLAY_TYPES.STAR}
        onSelect={() => onUpdate(CSAT_DISPLAY_TYPES.STAR)}
        t={t}
      />
    </div>
  );
}

interface DisplayOptionProps {
  selected: boolean;
  onSelect: () => void;
}

function EmojiDisplayOption({ selected, onSelect }: DisplayOptionProps) {
  return (
    <button
      className={`
        flex items-center rounded-lg transition-all duration-500 cursor-pointer
        outline outline-1 px-4 py-2 gap-2 min-w-56
        ${selected
          ? 'outline-primary bg-primary/5'
          : 'outline-border bg-muted/20 hover:outline-primary/50'
        }
      `}
      onClick={onSelect}
    >
      {CSAT_RATINGS.map((rating) => (
        <div
          key={rating.key}
          className="rounded-full p-1 transition-transform duration-150 focus:outline-none flex items-center flex-shrink-0"
        >
          <span
            className={`text-2xl ${selected ? '' : 'grayscale opacity-60'}`}
          >
            {rating.emoji}
          </span>
        </div>
      ))}
    </button>
  );
}

function StarDisplayOption({ selected, onSelect, t }: DisplayOptionProps & { t: any }) {
  return (
    <button
      className={`
        flex items-center rounded-lg transition-all duration-300 cursor-pointer
        outline outline-1 px-4 py-2 gap-2 min-w-56
        ${selected
          ? 'outline-primary bg-primary/5'
          : 'outline-border bg-muted/20 hover:outline-primary/50'
        }
      `}
      onClick={onSelect}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={`star-${n}`}
          className="rounded-full p-1 transition-transform duration-150 focus:outline-none flex items-center flex-shrink-0"
          aria-label={t('settings.csat.displayType.starLabel', { number: n })}
        >
          <Star
            className={`w-6 h-6 ${selected ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted-foreground'}`}
          />
        </div>
      ))}
    </button>
  );
}
