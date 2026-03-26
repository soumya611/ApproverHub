import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  DEFAULT_COLUMNS,
  normalizeColumns,
  type ColumnConfigItem,
} from "../data/columnsConfig";

type ColumnsConfigContextValue = {
  columns: ColumnConfigItem[];
  setColumns: Dispatch<SetStateAction<ColumnConfigItem[]>>;
};

const ColumnsConfigContext = createContext<
  ColumnsConfigContextValue | undefined
>(undefined);

const STORAGE_KEY = "campaign_columns_config";

const readStoredColumns = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ColumnConfigItem[];
    if (!Array.isArray(parsed)) return null;
    return normalizeColumns(parsed);
  } catch {
    return null;
  }
};

export const ColumnsConfigProvider = ({ children }: { children: ReactNode }) => {
  const [columns, setColumns] = useState<ColumnConfigItem[]>(
    () => readStoredColumns() ?? normalizeColumns(DEFAULT_COLUMNS)
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(columns));
    } catch {
      // Ignore storage errors to avoid blocking UI updates.
    }
  }, [columns]);

  const value = useMemo(() => ({ columns, setColumns }), [columns]);

  return (
    <ColumnsConfigContext.Provider value={value}>
      {children}
    </ColumnsConfigContext.Provider>
  );
};

export const useColumnsConfig = () => {
  const context = useContext(ColumnsConfigContext);
  if (!context) {
    throw new Error(
      "useColumnsConfig must be used within a ColumnsConfigProvider"
    );
  }
  return context;
};
