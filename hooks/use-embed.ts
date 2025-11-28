"use client";

import * as React from "react";
import type {
  EmbedRequest,
  EmbedResponse,
  EmbedSingleResponse,
  EmbedMultipleResponse,
  EmbedErrorResponse,
} from "@/app/api/embed/route";

export type {
  EmbedRequest,
  EmbedResponse,
  EmbedSingleResponse,
  EmbedMultipleResponse,
  EmbedErrorResponse,
};

interface UseEmbedOptions {
  onSuccess?: (data: EmbedResponse) => void;
  onError?: (error: EmbedErrorResponse) => void;
}

interface UseEmbedState {
  data: EmbedResponse | null;
  error: EmbedErrorResponse | null;
  isLoading: boolean;
}

export type UseEmbedReturnType = ReturnType<typeof useEmbed>;

export const useEmbed = (options?: UseEmbedOptions) => {
  const [state, setState] = React.useState<UseEmbedState>({
    data: null,
    error: null,
    isLoading: false,
  });

  const embed = React.useCallback(
    async (request: EmbedRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        const json = await response.json();

        if (!response.ok) {
          const error = json as EmbedErrorResponse;
          setState({ data: null, error, isLoading: false });
          options?.onError?.(error);
          return { data: null, error };
        }

        const data = json as EmbedResponse;
        setState({ data, error: null, isLoading: false });
        options?.onSuccess?.(data);
        return { data, error: null };
      } catch (err) {
        const error: EmbedErrorResponse = {
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
    embed,
    reset,
  };
};

