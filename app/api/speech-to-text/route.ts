import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "auth";

// Request types (FormData fields)
export interface SpeechToTextRequest {
  audio: File;
  language?: string;
  model?: "gpt-4o-transcribe" | "gpt-4o-mini-transcribe" | "whisper-1";
}

// Response types
export interface TranscriptSegment {
  text: string;
  startSecond: number;
  endSecond: number;
}

export interface SpeechToTextResponse {
  text: string;
  segments?: TranscriptSegment[];
  duration?: number;
  language?: string;
}

export interface SpeechToTextErrorResponse {
  error: string;
  details?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const language = (formData.get("language") as string) || undefined;
    const model =
      (formData.get("model") as string) || "gpt-4o-transcribe";

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file is required" },
        { status: 400 }
      );
    }

    // Convert File to Uint8Array
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioData = new Uint8Array(arrayBuffer);

    // Transcribe using AI SDK
    const result = await transcribe({
      model: openai.transcription(model),
      audio: audioData,
      providerOptions: {
        openai: {
          ...(language && { language }),
          timestampGranularities: ["segment"],
        },
      },
    });

    return NextResponse.json({
      text: result.text,
      segments: result.segments,
      duration: result.durationInSeconds,
      language: result.language,
    });
  } catch (error) {
    console.error("Speech-to-text error:", error);
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

