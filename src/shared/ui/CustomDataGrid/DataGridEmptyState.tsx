import { EmptyContent } from 'shared/ui/EmptyContent';

type DataGridEmptyMessage = {
  title: string;
  description?: string;
};

type DataGridEmptyStateProps = {
  hasActiveFilters?: boolean;
  noData: DataGridEmptyMessage;
  noResults: DataGridEmptyMessage;
  forceFiltered?: boolean;
};

export const DataGridEmptyState = ({
  hasActiveFilters = false,
  noData,
  noResults,
  forceFiltered = false,
}: DataGridEmptyStateProps) => {
  const content = forceFiltered || hasActiveFilters ? noResults : noData;

  return <EmptyContent title={content.title} description={content.description} />;
};
