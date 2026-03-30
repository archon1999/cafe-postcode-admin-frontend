import { Skeleton, TableCell, TableRow } from '@mui/material';

type TableRowsSkeletonProps = {
  columns: number;
  rows?: number;
};

export const TableRowsSkeleton = ({ columns, rows = 6 }: TableRowsSkeletonProps) => (
  <>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <TableRow key={`skeleton-row-${rowIndex}`}>
        {Array.from({ length: columns }, (_, cellIndex) => (
          <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}>
            <Skeleton variant="text" width="100%" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);
