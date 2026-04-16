export interface StickyColumnsOptions<T extends string> {
  stickyColumnCount?: number;
  prefixColumnWidths?: number[];
  visibleColumnIds: T[];
  dataColumnWidths?: Partial<Record<T, number>>;
  defaultDataColumnWidth?: number;
}

export interface StickyColumnsResult<T extends string> {
  stickyPrefixIndexes: Set<number>;
  stickyPrefixOffsets: number[];
  stickyDataColumnIds: Set<T>;
  stickyDataOffsets: Partial<Record<T, number>>;
}

export const getStickyColumns = <T extends string>({
  stickyColumnCount = 0,
  prefixColumnWidths = [],
  visibleColumnIds,
  dataColumnWidths = {},
  defaultDataColumnWidth = 150,
}: StickyColumnsOptions<T>): StickyColumnsResult<T> => {
  const normalizedStickyCount = Number.isFinite(stickyColumnCount)
    ? Math.max(0, Math.trunc(stickyColumnCount))
    : 0;

  let remainingStickyColumns = normalizedStickyCount;
  let currentLeftOffset = 0;

  const stickyPrefixIndexes = new Set<number>();
  const stickyPrefixOffsets: number[] = [];

  prefixColumnWidths.forEach((width, index) => {
    stickyPrefixOffsets[index] = currentLeftOffset;

    if (remainingStickyColumns <= 0) {
      return;
    }

    stickyPrefixIndexes.add(index);
    currentLeftOffset += width;
    remainingStickyColumns -= 1;
  });

  const stickyDataColumnIds = new Set<T>();
  const stickyDataOffsets: Partial<Record<T, number>> = {};

  visibleColumnIds.forEach((columnId) => {
    if (remainingStickyColumns <= 0) {
      return;
    }

    stickyDataColumnIds.add(columnId);
    stickyDataOffsets[columnId] = currentLeftOffset;
    currentLeftOffset += dataColumnWidths[columnId] ?? defaultDataColumnWidth;
    remainingStickyColumns -= 1;
  });

  return {
    stickyPrefixIndexes,
    stickyPrefixOffsets,
    stickyDataColumnIds,
    stickyDataOffsets,
  };
};
