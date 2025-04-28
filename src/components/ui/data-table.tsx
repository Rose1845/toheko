/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export type AccessorFn<T> = (row: T) => any;

export interface Column<T> {
  header: string;
  accessorKey: keyof T | AccessorFn<T>;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  caption?: string;
  className?: string;
  searchable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  caption,
  className,
  searchable = true,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof T | AccessorFn<T> | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data, searchTerm, pageSize]);

  // Helper function to get value from row using accessor
  const getRowValue = (row: T, accessor: keyof T | AccessorFn<T>): any => {
    if (typeof accessor === "function") {
      return accessor(row);
    }
    return row[accessor as keyof T];
  };

  // Filter data based on search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter((item) => {
      return columns.some((column) => {
        const value = getRowValue(item, column.accessorKey);
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, columns, searchTerm]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getRowValue(a, sortColumn);
      const bValue = getRowValue(b, sortColumn);

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Handle sort
  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const accessorKey = column.accessorKey;

    if (sortColumn === accessorKey) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(accessorKey);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    if (sortColumn !== column.accessorKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  // Get cell value
  const getCellValue = (row: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(row);
    }

    return getRowValue(row, column.accessorKey);
  };

  return (
    <div className="w-full">
      {searchable && (
        <div className="flex items-center mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table className={cn("w-full", className)}>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={cn(
                    column.sortable && "cursor-pointer select-none",
                    column.className
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && getSortIcon(column)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={String(row[keyField])}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined
                  }
                >
                  {columns.map((column, cellIndex) => (
                    <TableCell key={cellIndex} className={column.className}>
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mt-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} entries
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select
                className="h-8 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">{currentPage}</span>
                <span className="text-sm text-muted-foreground">
                  of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
