import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@evoapi/design-system';
import { ChevronDown, Search, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pipeline } from '@/types/analytics';

interface PipelineSwitcherProps {
  pipelines: Pipeline[];
  selectedPipeline?: Pipeline | null;
  onSwitchPipeline: (pipelineId: string) => void;
  className?: string;
}

export default function PipelineSwitcher({
  pipelines,
  selectedPipeline,
  onSwitchPipeline,
  className,
}: PipelineSwitcherProps) {
  const { t } = useLanguage('pipelines');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredPipelines = useMemo(() =>
    pipelines.filter(pipeline =>
      pipeline.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [pipelines, searchQuery]
  );

  const getPipelineColor = (pipeline: Pipeline) => {
    if (pipeline.stages && pipeline.stages.length > 0) {
      return pipeline.stages[0].color;
    }
    // Fallback color based on type
    switch (pipeline.pipeline_type) {
      case 'sales': return '#10b981';
      case 'support': return '#3b82f6';
      case 'marketing': return '#8b5cf6';
      default: return '#6366f1';
    }
  };

  // Focus no input quando dropdown abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handlePipelineSelect = useCallback((pipelineId: string) => {
    onSwitchPipeline(pipelineId);
    setSearchQuery('');
    setIsOpen(false);
  }, [onSwitchPipeline]);

  const getStatusText = (pipeline: Pipeline) => {
    return pipeline.is_active ? t('pipelineSwitcher.active') : t('pipelineSwitcher.inactive');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'bg-background border border-sidebar-border hover:bg-sidebar-accent text-foreground transition-colors',
            'flex items-center gap-3 px-4 py-3 text-sm font-medium shadow-sm w-full max-w-full sm:max-w-md',
            isOpen ? 'rounded-t-lg rounded-b-none' : 'rounded-lg',
            className
          )}
        >
          {/* Pipeline Icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: selectedPipeline ? getPipelineColor(selectedPipeline) : '#6B7280' }}
          >
            <GitBranch className="w-4 h-4" />
          </div>

          {/* Pipeline Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-foreground truncate">
              {selectedPipeline?.name || t('pipelineSwitcher.loading')}
            </div>
            {selectedPipeline?.description ? (
              <div className="text-xs text-muted-foreground truncate">
                {selectedPipeline.description.slice(0, 40)}
                {selectedPipeline.description.length > 40 ? '...' : ''}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {selectedPipeline ? t('pipelineSwitcher.noDescription') : t('pipelineSwitcher.waiting')}
              </div>
            )}
          </div>

          <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="min-w-[min(400px,calc(100vw-2rem))] p-0 bg-sidebar border border-sidebar-border shadow-lg rounded-t-none rounded-b-lg"
        sideOffset={0}
      >
        <div className="flex flex-col">
          {/* Search Bar */}
          <div className="p-3 bg-background border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('pipelineSwitcher.search')}
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2 text-sm bg-background border-0 rounded-lg focus:outline-none text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && searchQuery.length > 0) {
                    e.stopPropagation();
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }
                }}
              />
            </div>
          </div>

          {/* Pipelines List */}
          <div className="max-h-[300px] overflow-y-auto p-1 bg-background">
            {filteredPipelines.length === 0 ? (
              <div className="px-3 py-3 text-sm text-muted-foreground">
                {searchQuery ? t('pipelineSwitcher.noResults') : t('pipelineSwitcher.noAvailable')}
              </div>
            ) : (
              filteredPipelines.map((pipeline) => (
                <DropdownMenuItem
                  key={pipeline.id}
                  onClick={() => handlePipelineSelect(pipeline.id.toString())}
                  className="flex items-start gap-3 px-3 py-3 cursor-pointer text-sm text-foreground hover:bg-sidebar-accent rounded-sm mx-1"
                >
                  {/* Pipeline Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: getPipelineColor(pipeline) }}
                  >
                    <GitBranch className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="truncate font-medium">{pipeline.name}</div>
                      <span className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded-full",
                        pipeline.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      )}>
                        {getStatusText(pipeline)}
                      </span>
                    </div>

                    {pipeline.description && (
                      <div className="text-xs text-muted-foreground truncate mb-1">
                        {pipeline.description}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{t('pipelineSwitcher.conversationsCount', { count: pipeline.conversations_count || 0 })}</span>
                      <span>{t('pipelineSwitcher.stagesCount', { count: pipeline.stages?.length || 0 })}</span>
                      <span className="capitalize">{pipeline.pipeline_type}</span>
                    </div>
                  </div>

                  {selectedPipeline?.id === pipeline.id && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-3" />
                  )}
                </DropdownMenuItem>
              ))
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
