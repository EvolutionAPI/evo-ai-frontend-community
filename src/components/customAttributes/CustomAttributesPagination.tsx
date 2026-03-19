import BasePagination from '@/components/base/BasePagination';

interface CustomAttributesPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  loading: boolean;
}

export default function CustomAttributesPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  perPage,
}: CustomAttributesPaginationProps) {
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
