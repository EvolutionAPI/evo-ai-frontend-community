import { BasePagination } from '@/components/base';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/constants/pagination';

interface ContactsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  loading?: boolean;
}

export default function ContactsPagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  onPageChange,
  onPerPageChange,
  loading = false,
}: ContactsPaginationProps) {
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
