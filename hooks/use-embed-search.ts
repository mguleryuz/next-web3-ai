"use client";

import * as React from "react";
import type {
  EmbedSearchRequest,
  EmbedSearchResponse,
  EmbedSearchResult,
  EmbedSearchErrorResponse,
} from "@/app/api/embed/search/route";

export type {
  EmbedSearchRequest,
  EmbedSearchResponse,
  EmbedSearchResult,
  EmbedSearchErrorResponse,
};

interface UseEmbedSearchOptions {
  onSuccess?: (data: EmbedSearchResponse) => void;
  onError?: (error: EmbedSearchErrorResponse) => void;
}

interface UseEmbedSearchState {
  data: EmbedSearchResponse | null;
  error: EmbedSearchErrorResponse | null;
  isLoading: boolean;
}

export type UseEmbedSearchReturnType = ReturnType<typeof useEmbedSearch>;

export const useEmbedSearch = (options?: UseEmbedSearchOptions) => {
  const [state, setState] = React.useState<UseEmbedSearchState>({
    data: null,
    error: null,
    isLoading: false,
  });

  const search = React.useCallback(
    async (request: EmbedSearchRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/embed/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const json = await response.json();

        if (!response.ok) {
          const error = json as EmbedSearchErrorResponse;
          setState({ data: null, error, isLoading: false });
          options?.onError?.(error);
          return { data: null, error };
        }

        const data = json as EmbedSearchResponse;
        setState({ data, error: null, isLoading: false });
        options?.onSuccess?.(data);
        return { data, error: null };
      } catch (err) {
        const error: EmbedSearchErrorResponse = {
          error: "Network error",
          details: err instanceof Error ? err.message : "Unknown error",
        };
        setState({ data: null, error, isLoading: false });
        options?.onError?.(error);
        return { data: null, error };
      }
    },
    [options]
  );

  const reset = React.useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    search,
    reset,
  };
};

