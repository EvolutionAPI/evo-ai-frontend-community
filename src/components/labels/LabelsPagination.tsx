import BasePagination from '@/components/base/BasePagination';

interface LabelsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export default function LabelsPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  perPage,
}: LabelsPaginationProps) {
  return (
    <BasePagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalCount}
      itemsPerPage={perPage}
      onPageChange={onPageChange}
    />
  );
}
