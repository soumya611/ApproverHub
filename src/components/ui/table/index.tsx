import { ReactNode, HTMLAttributes } from "react";

// Props for Table
interface TableProps {
  children: ReactNode; // Table content (thead, tbody, etc.)
  className?: string; // Optional className for styling
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode; // Header row(s)
  className?: string; // Optional className for styling
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode; // Body row(s)
  className?: string; // Optional className for styling
}

// Props for TableRow
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode; // Cells (th or td)
  className?: string; // Optional className for styling
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode; // Cell content
  isHeader?: boolean; // If true, renders as <th>, otherwise <td>
  className?: string; // Optional className for styling
}

export interface HeaderCellConfig {
  content: ReactNode;
  className?: string;
}

export interface TableHeaderRowProps<T> {
  columns: T[];
  renderColumn: (column: T) => ReactNode;
  getColumnKey?: (column: T, index: number) => string;
  className?: string;
  columnClassName?: string;
  prefixCells?: HeaderCellConfig[];
  suffixCells?: HeaderCellConfig[];
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`min-w-full  ${className}`}>{children}</table>;
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className = "", ...rest }) => {
  return (
    <tr className={className} {...rest}>
      {children}
    </tr>
  );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={` ${className}`}>{children}</CellTag>;
};

const TableHeaderRow = <T,>({
  columns,
  renderColumn,
  getColumnKey,
  className = "",
  columnClassName = "",
  prefixCells = [],
  suffixCells = [],
}: TableHeaderRowProps<T>) => {
  const resolveKey =
    getColumnKey ??
    ((column: T, index: number) => {
      if (column && typeof column === "object" && "id" in column) {
        const columnId = (column as { id?: string }).id;
        if (columnId) return columnId;
      }
      return String(index);
    });

  return (
    <tr className={className}>
      {prefixCells.map((cell, index) => (
        <th key={`prefix-${index}`} className={cell.className}>
          {cell.content}
        </th>
      ))}
      {columns.map((column, index) => (
        <th key={resolveKey(column, index)} className={columnClassName}>
          {renderColumn(column)}
        </th>
      ))}
      {suffixCells.map((cell, index) => (
        <th key={`suffix-${index}`} className={cell.className}>
          {cell.content}
        </th>
      ))}
    </tr>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderRow };
