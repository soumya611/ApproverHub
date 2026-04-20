import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Search } from "../../../icons";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
  icon?: ReactNode;
  iconSize?: string;
  iconPosition?: "left" | "right";
  onSearchTrigger?: (value: string) => void;
  debounceMs?: number;
  minSearchLength?: number;
  triggerSearchOnBlur?: boolean;
}

export default function SearchInput({
  containerClassName = "",
  inputClassName = "",
  iconClassName = "",
  icon,
  iconSize,
  iconPosition = "left",
  onSearchTrigger,
  debounceMs = 350,
  minSearchLength = 3,
  triggerSearchOnBlur = true,
  className = "",
  value,
  defaultValue,
  onChange,
  onBlur,
  ...props
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(() =>
    typeof value === "string"
      ? value
      : typeof defaultValue === "string"
        ? defaultValue
        : String(value ?? defaultValue ?? "")
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === undefined) return;
    setInputValue(typeof value === "string" ? value : String(value ?? ""));
  }, [value]);

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const emitSearch = useCallback(
    (nextValue: string) => {
      onSearchTrigger?.(nextValue);
    },
    [onSearchTrigger]
  );

  const scheduleSearch = useCallback(
    (nextValue: string) => {
      if (!onSearchTrigger) return;

      clearDebounce();

      const trimmedValue = nextValue.trim();
      const meetsMinimumLength =
        trimmedValue.length === 0 || trimmedValue.length >= Math.max(1, minSearchLength);

      if (!meetsMinimumLength) return;

      debounceTimerRef.current = setTimeout(() => {
        emitSearch(nextValue);
        debounceTimerRef.current = null;
      }, Math.max(0, debounceMs));
    },
    [clearDebounce, debounceMs, emitSearch, minSearchLength, onSearchTrigger]
  );

  useEffect(
    () => () => {
      clearDebounce();
    },
    [clearDebounce]
  );

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (triggerSearchOnBlur && onSearchTrigger) {
      clearDebounce();
      emitSearch(event.target.value);
    }
    onBlur?.(event);
  };

  return (
    <div className={`flex items-center gap-2 ${containerClassName}`}>
      {iconPosition === "left" && (  
        <span className={iconClassName}>
          {icon ?? (
            <Search className={`h-6 w-6 ${iconSize}`} />
          )}
        </span>
      )}
      <input
        type="text"
        value={inputValue}
        onChange={(event) => {
          const nextValue = event.target.value;
          setInputValue(nextValue);
          onChange?.(event);
          scheduleSearch(nextValue);
        }}
        onBlur={handleBlur}
        className={`w-full bg-transparent text-lg text-disabled-text placeholder:text-gray-400 focus:outline-none ${className} ${inputClassName}`}
        {...props}
      />
      {iconPosition === "right" && ( 
        <span className={iconClassName}>
          {icon ?? (
            <Search className={`h-6 w-6 text-disabled-text ${iconSize}`} />
          )}
        </span>
      )}
    </div>
  );
}
