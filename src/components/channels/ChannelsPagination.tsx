import { BasePagination } from '@/components/base';

interface ChannelsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  loading?: boolean;
}

export default function ChannelsPagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  onPageChange,
  onPerPageChange,
  loading = false,
}: ChannelsPaginationProps) {
  return (
    <BasePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalCount}
      itemsPerPage={perPage}
      onPageChange={onPageChange}
      onItemsPerPageChange={onPerPageChange}
      itemsPerPageOptions={[12, 24, 48, 96]} // Similar to agents
      showItemsPerPage={!!onPerPageChange}
      showTotalItems={true}
      showPageNumbers={true}
      disabled={loading}
    />
  );
}
