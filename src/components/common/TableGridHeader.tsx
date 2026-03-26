type Align = "left" | "center" | "right";

export interface TableGridHeaderColumn {
  /** Text to show in the header cell (can be empty string for icon/action columns) */
  label: string;
  /** Text alignment for this column; defaults to "left" */
  align?: Align;
}

interface TableGridHeaderProps {
  /** Tailwind grid classes, e.g. "grid grid-cols-[2fr_1fr] px-4 pb-2" */
  gridClassName: string;
  /** List of columns to render */
  columns: TableGridHeaderColumn[];
}

export default function TableGridHeader({
  gridClassName,
  columns,
}: TableGridHeaderProps) {
  const alignClass = (align: Align | undefined) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  return (
    <div className={gridClassName}>
      {columns.map((col, index) => (
        <div
          key={index}
          className={`text-sm font-medium text-gray-700 ${alignClass(col.align)}`}
        >
          {col.label}
        </div>
      ))}
    </div>
  );
}

