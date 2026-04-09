import { useLanguage } from '@/hooks/useLanguage';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@evoapi/design-system';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '@/constants/pagination';

export interface BasePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
  showTotalItems?: boolean;
  showPageNumbers?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function BasePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showItemsPerPage = true,
  showTotalItems = true,
  showPageNumbers = true,
  className = '',
  disabled = false,
}: BasePaginationProps) {
  const { t } = useLanguage('common');

  // Ensure itemsPerPage has a valid value (default to 20 if undefined)
  const safeItemsPerPage = itemsPerPage ?? DEFAULT_PAGE_SIZE;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * safeItemsPerPage + 1;
  const endItem = Math.min(currentPage * safeItemsPerPage, totalItems);

  const canGoPrevious = currentPage > 1 && !disabled;
  const canGoNext = currentPage < totalPages && !disabled;

  const handlePageChange = (page: number) => {
    if (disabled) return;

    const validPage = Math.max(1, Math.min(page, totalPages));
    if (validPage !== currentPage) {
      onPageChange(validPage);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    if (disabled || !onItemsPerPageChange) return;

    const newItemsPerPage = parseInt(value, 10);
    if (newItemsPerPage !== safeItemsPerPage) {
      onItemsPerPageChange(newItemsPerPage);
      // Reset to first page when changing items per page
      if (currentPage > 1) {
        onPageChange(1);
      }
    }
  };

  const getVisiblePageNumbers = (): number[] => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push(-2, totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((v, i, a) => a.indexOf(v) === i && v > 0);
  };

  const renderPageButton = (page: number, isActive = false) => (
    <Button
      key={page}
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={() => handlePageChange(page)}
      disabled={disabled || isActive}
      className={cn(
        'min-w-9 disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'bg-primary border-primary text-primary-foreground hover:bg-primary/85'
          : 'bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent'
      )}
    >
      {page}
    </Button>
  );

  const renderDots = (key: string) => (
    <div key={key} className="flex items-center justify-center px-2">
      <span className="text-sidebar-foreground/50">...</span>
    </div>
  );

  // Always show pagination if there are items, even if just one page
  if (totalItems === 0) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {/* Items per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-sidebar-foreground/70 whitespace-nowrap">
            {t('base.pagination.itemsPerPage')}
          </span>
          <Select
            value={safeItemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-auto min-w-16 bg-sidebar border-sidebar-border text-sidebar-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-sidebar border-sidebar-border">
              {itemsPerPageOptions.map(option => (
                <SelectItem
                  key={option}
                  value={option.toString()}
                  className="text-sidebar-foreground focus:bg-sidebar-accent"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Total items info */}
      {showTotalItems && (
        <div className="flex items-center justify-center sm:flex-1">
          <span className="text-sm text-sidebar-foreground/70">
            {t('base.pagination.showing', { start: startItem, end: endItem, total: totalItems })}
          </span>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className="min-w-9 bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {showPageNumbers && totalPages <= 7 ? (
          // Show all pages if 7 or fewer
          Array.from({ length: totalPages }, (_, i) => i + 1).map(page =>
            renderPageButton(page, page === currentPage),
          )
        ) : showPageNumbers ? (
          // Show smart pagination with dots
          <>
            {currentPage > 2 && (
              <>
                {renderPageButton(1)}
                {currentPage > 3 && renderDots('start-dots')}
              </>
            )}

            {getVisiblePageNumbers().map(page => {
              if (page === -1 || page === -2) {
                return renderDots(`dots-${page}`);
              }
              return renderPageButton(page, page === currentPage);
            })}

            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && renderDots('end-dots')}
                {renderPageButton(totalPages)}
              </>
            )}
          </>
        ) : (
          // Just show current page info
          <div className="px-3 py-1.5 text-sm text-sidebar-foreground/70">
            {t('base.pagination.page', { current: currentPage, total: totalPages })}
          </div>
        )}

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="min-w-9 bg-sidebar border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
