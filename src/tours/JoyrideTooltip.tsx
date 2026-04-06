import type { TooltipRenderProps } from 'react-joyride';
import { useTranslation } from '@/hooks/useTranslation';

export function JoyrideTooltip({
  continuous,
  index,
  isLastStep,
  size,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
}: TooltipRenderProps) {
  const { t } = useTranslation('tours');
  return (
    <div
      {...tooltipProps}
      style={{
        background: '#252836',
        border: '1px solid #2e3344',
        borderRadius: '10px',
        padding: '16px',
        maxWidth: '340px',
        width: '340px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00C48C',
              flexShrink: 0,
            }}
          />
          {step.title && (
            <span
              style={{
                color: '#ffffff',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: 1.4,
              }}
            >
              {step.title}
            </span>
          )}
        </div>
        <button
          {...closeProps}
          style={{
            background: 'none',
            border: 'none',
            color: '#8b8fa8',
            cursor: 'pointer',
            padding: '0 0 0 8px',
            fontSize: '18px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          color: '#8b8fa8',
          fontSize: '13px',
          lineHeight: 1.6,
          marginBottom: '16px',
        }}
      >
        {step.content}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: "X de Y" + progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#8b8fa8', fontSize: '11px', whiteSpace: 'nowrap' }}>
            {t('stepOf', { current: index + 1, total: size })}
          </span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {Array.from({ length: size }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: i === index ? '#00C48C' : '#2e3344',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: Back + Next/Finish buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{
                background: 'transparent',
                border: '1px solid #2e3344',
                color: '#8b8fa8',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                cursor: 'pointer',
                lineHeight: 1.4,
              }}
            >
              {t('back')}
            </button>
          )}
          {continuous && (
            <button
              {...primaryProps}
              style={{
                background: '#00C48C',
                border: 'none',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                lineHeight: 1.4,
              }}
            >
              {isLastStep ? t('finish') : t('next')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
