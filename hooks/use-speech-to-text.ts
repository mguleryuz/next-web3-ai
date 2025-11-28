"use client";

import * as React from "react";
import type {
  SpeechToTextRequest,
  SpeechToTextResponse,
  SpeechToTextErrorResponse,
} from "@/app/api/speech-to-text/route";

export type { SpeechToTextRequest, SpeechToTextResponse, SpeechToTextErrorResponse };

interface UseSpeechToTextOptions {
  onSuccess?: (data: SpeechToTextResponse) => void;
  onError?: (error: SpeechToTextErrorResponse) => void;
}

interface UseSpeechToTextState {
  data: SpeechToTextResponse | null;
  error: SpeechToTextErrorResponse | null;
  isLoading: boolean;
}

export type UseSpeechToTextReturnType = ReturnType<typeof useSpeechToText>;

export const useSpeechToText = (options?: UseSpeechToTextOptions) => {
  const [state, setState] = React.useState<UseSpeechToTextState>({
    data: null,
    error: null,
    isLoading: false,
  });

  const transcribe = React.useCallback(
    async (request: SpeechToTextRequest) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const formData = new FormData();
        formData.append("audio", request.audio);
        if (request.language) formData.append("language", request.language);
        if (request.model) formData.append("model", request.model);

        const response = await fetch("/api/speech-to-text", {
          method: "POST",
          body: formData,
        });

        const json = await response.json();

        if (!response.ok) {
          const error = json as SpeechToTextErrorResponse;
          setState({ data: null, error, isLoading: false });
          options?.onError?.(error);
          return { data: null, error };
        }

        const data = json as SpeechToTextResponse;
        setState({ data, error: null, isLoading: false });
        options?.onSuccess?.(data);
        return { data, error: null };
      } catch (err) {
        const error: SpeechToTextErrorResponse = {
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
    transcribe,
    reset,
  };
};

