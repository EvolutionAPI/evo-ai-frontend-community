import { BasePagination } from '@/components/base';

interface AgentsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  loading?: boolean;
}

export default function AgentsPagination({
  currentPage,
  totalPages,
  totalCount,
  perPage,
  onPageChange,
  onPerPageChange,
  loading = false,
}: AgentsPaginationProps) {
  return (
    <BasePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalCount}
      itemsPerPage={perPage}
      onPageChange={onPageChange}
      onItemsPerPageChange={onPerPageChange}
      itemsPerPageOptions={[20, 24, 48, 96]} // Adjusted for agents (cards/table), default is 20
      showItemsPerPage={!!onPerPageChange}
      showTotalItems={true}
      showPageNumbers={true}
      disabled={loading}
    />
  );
}
