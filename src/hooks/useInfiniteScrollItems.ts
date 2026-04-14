import { useEffect, useMemo, useRef, useState } from "react";

interface UseInfiniteScrollItemsOptions {
  initialCount?: number;
  step?: number;
  resetKey?: string;
}

export function useInfiniteScrollItems<T>(
  items: T[],
  {
    initialCount = 10,
    step = 10,
    resetKey = "",
  }: UseInfiniteScrollItemsOptions = {}
) {
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const totalCount = items.length;
  const hasMore = visibleCount < totalCount;

  useEffect(() => {
    setVisibleCount(initialCount);
  }, [initialCount, resetKey]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader || !hasMore || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }

        setVisibleCount((previous) => Math.min(totalCount, previous + step));
      },
      {
        rootMargin: "0px 0px 240px 0px",
      }
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [hasMore, step, totalCount]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount]
  );

  return {
    visibleItems,
    visibleCount,
    hasMore,
    loaderRef,
  };
}
