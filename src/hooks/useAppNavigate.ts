import { useCallback } from "react";
import { useLocation, useNavigate, type NavigateOptions, type To } from "react-router";

type PrimitiveParam = string | number | boolean;
type ParamValue = PrimitiveParam | null | undefined;
type QueryValue = ParamValue | ParamValue[];

export type RouteParams = Record<string, ParamValue>;
export type QueryParams = Record<string, QueryValue>;

type NavigateLifecycleOptions = {
  onBeforeNavigate?: () => void;
  onAfterNavigate?: () => void;
};

export type GoToOptions<TState = unknown> = NavigateOptions &
  NavigateLifecycleOptions & {
    state?: TState;
  };

export type GoBackOptions<TState = unknown> = NavigateLifecycleOptions & {
  fallbackTo?: To;
  replace?: boolean;
  state?: TState;
};

export type GoToPathOptions<TState = unknown> = NavigateLifecycleOptions & {
  params?: RouteParams;
  query?: QueryParams;
  replace?: boolean;
  state?: TState;
};

export const buildRoutePath = (template: string, params: RouteParams = {}) =>
  template.replace(/:([a-zA-Z0-9_]+)/g, (_segment, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) {
      return `:${key}`;
    }
    return encodeURIComponent(String(value));
  });

export const withQueryParams = (path: string, query?: QueryParams) => {
  if (!query) return path;

  const searchParams = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry === undefined || entry === null) return;
        searchParams.append(key, String(entry));
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  if (!queryString) return path;

  return path.includes("?") ? `${path}&${queryString}` : `${path}?${queryString}`;
};

export const useAppNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = useCallback(() => {
    const historyState = window.history.state as { idx?: number } | null;
    if (typeof historyState?.idx === "number") {
      return historyState.idx > 0;
    }

    return window.history.length > 1;
  }, []);

  const goTo = useCallback(
    <TState = unknown>(to: To, options: GoToOptions<TState> = {}) => {
      const { onBeforeNavigate, onAfterNavigate, ...navigateOptions } = options;
      onBeforeNavigate?.();
      navigate(to, navigateOptions);
      onAfterNavigate?.();
    },
    [navigate]
  );

  const goBack = useCallback(
    <TState = unknown>(options: GoBackOptions<TState> = {}) => {
      const {
        fallbackTo = "/",
        replace = true,
        state,
        onBeforeNavigate,
        onAfterNavigate,
      } = options;

      onBeforeNavigate?.();
      if (canGoBack()) {
        navigate(-1);
      } else {
        navigate(fallbackTo, { replace, state });
      }
      onAfterNavigate?.();
    },
    [canGoBack, navigate]
  );

  const goToPath = useCallback(
    <TState = unknown>(template: string, options: GoToPathOptions<TState> = {}) => {
      const { params, query, replace, state, onBeforeNavigate, onAfterNavigate } = options;
      const path = buildRoutePath(template, params);
      const to = withQueryParams(path, query);

      goTo<TState>(to, {
        replace,
        state,
        onBeforeNavigate,
        onAfterNavigate,
      });
    },
    [goTo]
  );

  return {
    goTo,
    goBack,
    goToPath,
    canGoBack,
    currentPath: location.pathname,
  };
};

export const useNavigationState = <TState = unknown>(fallback?: TState) => {
  const location = useLocation();
  const state = location.state as TState | null;
  return state ?? fallback;
};

