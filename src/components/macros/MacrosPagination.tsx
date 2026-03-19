import { BasePagination } from '@/components/base';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/constants/pagination';

interface MacrosPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  loading?: boolean;
}

export default function MacrosPagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  onPageChange,
  onPerPageChange,
  loading = false,
}: MacrosPaginationProps) {
  return (
    <BasePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalCount}
      itemsPerPage={perPage}
      onPageChange={onPageChange}
      onItemsPerPageChange={onPerPageChange}
      itemsPerPageOptions={DEFAULT_PAGE_SIZE_OPTIONS}
      showItemsPerPage={!!onPerPageChange}
      showTotalItems={true}
      showPageNumbers={true}
      disabled={loading}
    />
  );
}
