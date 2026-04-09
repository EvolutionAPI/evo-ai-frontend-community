import { Handle, Position, useEdges } from "@xyflow/react";
import React from "react";
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from "@/lib/utils";
import { useDnD } from "@/contexts/DnDContext";
import { ArrowRight } from "lucide-react";

// Tipos para configuração do node - COMPATÍVEL COM BaseNode ATUAL
export interface BaseFlowNodeProps {
  // Props obrigatórias - compatível com BaseNode atual
  selected: boolean;
  hasTarget: boolean;
  children: React.ReactNode;
  borderColor: string;

  // Props opcionais - compatível com BaseNode atual
  isExecuting?: boolean;
  hasSource?: boolean;
  nodeId?: string;
  sourceHandleId?: string;

  // Props estendidas opcionais (não quebram compatibilidade)
  targetHandleId?: string;
  width?: string;
  className?: string;
  contentClassName?: string;
  targetPosition?: Position;
  sourcePosition?: Position;
  showSourceArrow?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  theme?: 'light' | 'dark' | 'auto';
}

// Cores disponíveis para borderColor
export type NodeBorderColor =
  | 'blue' | 'green' | 'orange' | 'red' | 'yellow'
  | 'purple' | 'indigo' | 'pink' | 'emerald' | 'slate'
  | 'cyan' | 'teal' | 'lime' | 'amber' | 'rose';

// Mapeamento de cores - COMPATÍVEL COM BaseNode ATUAL
const colorStyles = {
  blue: {
    border: "border-blue-700/70 hover:border-blue-500",
    gradient: "bg-gradient-to-br from-blue-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(59,130,246,0.3)]",
    handle: "bg-yellow-500 border-yellow-400" // Mantém o padrão atual de handles amarelos
  },
  orange: {
    border: "border-orange-700/70 hover:border-orange-500",
    gradient: "bg-gradient-to-br from-orange-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(249,115,22,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  green: {
    border: "border-green-700/70 hover:border-green-500",
    gradient: "bg-gradient-to-br from-green-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(34,197,94,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(34,197,94,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  red: {
    border: "border-red-700/70 hover:border-red-500",
    gradient: "bg-gradient-to-br from-red-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(239,68,68,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  yellow: {
    border: "border-yellow-700/70 hover:border-yellow-500",
    gradient: "bg-gradient-to-br from-yellow-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(234,179,8,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(234,179,8,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  purple: {
    border: "border-purple-700/70 hover:border-purple-500",
    gradient: "bg-gradient-to-br from-purple-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(168,85,247,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  indigo: {
    border: "border-indigo-700/70 hover:border-indigo-500",
    gradient: "bg-gradient-to-br from-indigo-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(99,102,241,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  pink: {
    border: "border-pink-700/70 hover:border-pink-500",
    gradient: "bg-gradient-to-br from-pink-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(236,72,153,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(236,72,153,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  emerald: {
    border: "border-emerald-700/70 hover:border-emerald-500",
    gradient: "bg-gradient-to-br from-emerald-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(16,185,129,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  slate: {
    border: "border-slate-700/70 hover:border-slate-500",
    gradient: "bg-gradient-to-br from-slate-800/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(100,116,139,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(100,116,139,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  // Cores extras mantendo compatibilidade
  cyan: {
    border: "border-cyan-700/70 hover:border-cyan-500",
    gradient: "bg-gradient-to-br from-cyan-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(6,182,212,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  teal: {
    border: "border-teal-700/70 hover:border-teal-500",
    gradient: "bg-gradient-to-br from-teal-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(20,184,166,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(20,184,166,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  lime: {
    border: "border-lime-700/70 hover:border-lime-500",
    gradient: "bg-gradient-to-br from-lime-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(132,204,22,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(132,204,22,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  amber: {
    border: "border-amber-700/70 hover:border-amber-500",
    gradient: "bg-gradient-to-br from-amber-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(245,158,11,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  rose: {
    border: "border-rose-700/70 hover:border-rose-500",
    gradient: "bg-gradient-to-br from-rose-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(244,63,94,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  },
  violet: {
    border: "border-violet-700/70 hover:border-violet-500",
    gradient: "bg-gradient-to-br from-violet-950/40 to-neutral-900/90",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.15)]",
    selectedGlow: "shadow-[0_0_25px_rgba(139,92,246,0.3)]",
    handle: "bg-yellow-500 border-yellow-400"
  }
};

export function BaseFlowNode({
  selected,
  hasTarget,
  children,
  borderColor,
  isExecuting = false,
  hasSource = true,
  nodeId,
  sourceHandleId = "output",
  targetHandleId = "input",
  width = "w-[350px]",
  className,
  contentClassName,
  targetPosition = Position.Left,
  sourcePosition = Position.Right,
  showSourceArrow = true,
}: BaseFlowNodeProps) {
  const { t } = useLanguage('common');
  const { pointerEvents } = useDnD();
  const edges = useEdges();

  // Verificar se o source handle está conectado - compatível com BaseNode atual
  const isHandleConnected = (handleId: string) => {
    return nodeId ? edges.some(edge => edge.source === nodeId && edge.sourceHandle === handleId) : false;
  };
  const isSourceHandleConnected = isHandleConnected(sourceHandleId);

  // Obter cores baseadas no borderColor - compatível com BaseNode atual
  const colorStyle = colorStyles[borderColor as keyof typeof colorStyles] || colorStyles.blue;

  // Estilos para selected e executing - mantém compatibilidade
  const selectedStyle = {
    border: "border-primary/90",
    glow: colorStyle.selectedGlow
  };

  const executingStyle = {
    border: "border-emerald-500",
    glow: "shadow-[0_0_25px_rgba(5,212,114,0.5)]"
  };

  return (
    <div
      className={cn(
        "relative z-0 rounded-2xl p-4 border-2 backdrop-blur-sm transition-all duration-300",
        "shadow-lg hover:shadow-xl",
        width,
        isExecuting ? executingStyle.glow : selected ? selectedStyle.glow : colorStyle.glow,
        isExecuting ? executingStyle.border : selected ? selectedStyle.border : colorStyle.border,
        colorStyle.gradient,
        isExecuting && "active-execution-node",
        className
      )}
      style={{
        backdropFilter: "blur(12px)",
      }}
      data-is-executing={isExecuting ? "true" : "false"}
    >
      {/* Target Handle - mantém comportamento exato do BaseNode atual */}
      {hasTarget && (
        <Handle
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "100%",
            borderRadius: "15px",
            height: "100%",
            backgroundColor: "transparent",
            border: "none",
            pointerEvents: pointerEvents === "none" ? "none" : "auto",
          }}
          type="target"
          position={targetPosition}
          id={targetHandleId}
        />
      )}

      {/* Conteúdo do node */}
      <div className={contentClassName}>
        {children}
      </div>

      {/* Source Handle - mantém comportamento exato do BaseNode atual */}
      {hasSource && (
        <div className="mt-2 flex items-center justify-end text-sm text-neutral-400 transition-colors">
          {showSourceArrow && (
            <div className="flex items-center space-x-1 rounded-md py-1 px-2">
              <span>{t('base.flow.node.nextStep')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          )}
          <Handle
            className={cn(
              "!w-3 !h-3 !rounded-full !border-2 transition-all duration-300 hover:scale-110",
              isSourceHandleConnected ? "!bg-yellow-500 !border-yellow-400" : "!bg-neutral-400 !border-neutral-500",
              selected && isSourceHandleConnected && "!bg-yellow-400 !border-yellow-300"
            )}
            style={{
              right: sourcePosition === Position.Right ? "-8px" : undefined,
              left: sourcePosition === Position.Left ? "-8px" : undefined,
              top: sourcePosition === Position.Right ? "calc(100% - 25px)" : undefined,
              bottom: sourcePosition === Position.Bottom ? "-8px" : undefined,
              transform: sourcePosition === Position.Right ? "translateY(-50%)" : undefined,
              pointerEvents: "auto", // Sempre permitir interação com handles
            }}
            type="source"
            position={sourcePosition}
            id={sourceHandleId}
          />
        </div>
      )}
    </div>
  );
}

// Componente para header padrão de nodes
export interface NodeHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}

export function NodeHeader({
  icon,
  title,
  subtitle,
  iconColor = "text-white",
  iconBg = "bg-blue-500",
  className
}: NodeHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3 mb-3", className)}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
        iconBg
      )}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// Componente para conteúdo padrão de nodes
export interface NodeContentProps {
  children: React.ReactNode;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  className?: string;
}

export function NodeContent({
  children,
  bgColor = "bg-blue-50 dark:bg-blue-950/20",
  borderColor = "border-blue-200 dark:border-blue-800/30",
  textColor = "text-blue-800 dark:text-blue-200",
  className
}: NodeContentProps) {
  return (
    <div className={cn(
      "p-3 rounded-lg border transition-all duration-200",
      bgColor,
      borderColor,
      className
    )}>
      <div className={cn("text-xs leading-relaxed", textColor)}>
        {children}
      </div>
    </div>
  );
}
