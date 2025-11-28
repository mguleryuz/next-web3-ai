import { embed } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "auth";
import dbConnect from "@/lib/mongodb";
import { EmbeddingModel, type FindSimilarOptions } from "@/lib/embedding.mongo";

// Request types
export interface EmbedSearchRequest {
  query: string;
  agent_id?: string;
  run_id?: string;
  app_id?: string;
  categories?: string[];
  metadata?: Record<string, unknown>;
  limit?: number;
  model?: "text-embedding-3-small" | "text-embedding-3-large" | "text-embedding-ada-002";
  dimensions?: number;
}

// Response types
export interface EmbedSearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
  categories?: string[];
  created_at: Date;
}

export interface EmbedSearchResponse {
  results: EmbedSearchResult[];
}

export interface EmbedSearchErrorResponse {
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

    const body: EmbedSearchRequest = await request.json();
    const {
      query,
      agent_id,
      run_id,
      app_id,
      categories,
      metadata,
      limit = 10,
      model = "text-embedding-3-small",
      dimensions,
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    const userId = session.user.id;

    // Generate embedding for the query
    const { embedding } = await embed({
      model: openai.textEmbedding(model),
      value: query,
      providerOptions: {
        openai: {
          ...(dimensions && { dimensions }),
          user: userId,
        },
      },
    });

    // Search for similar embeddings
    const searchOptions: FindSimilarOptions = {
      user_id: userId,
      limit,
      ...(agent_id && { agent_id }),
      ...(run_id && { run_id }),
      ...(app_id && { app_id }),
      ...(categories && { categories }),
      ...(metadata && { metadata }),
    };

    const results = await EmbeddingModel.findSimilar(embedding, searchOptions);

    return NextResponse.json({
      results: results.map((doc) => ({
        id: doc._id.toString(),
        content: doc.content,
        similarity: (doc as unknown as { similarity: number }).similarity,
        metadata: doc.metadata,
        categories: doc.categories,
        created_at: doc.created_at,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error: "Failed to search embeddings",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

