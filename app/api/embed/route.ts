import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "auth";
import dbConnect from "@/lib/mongodb";
import { EmbeddingModel, type IEmbedding } from "@/lib/embedding.mongo";

// Request types
export interface EmbedRequest {
  content: string | string[];
  agent_id?: string;
  run_id?: string;
  app_id?: string;
  metadata?: Record<string, unknown>;
  categories?: string[];
  expiration_date?: string;
  model?: "text-embedding-3-small" | "text-embedding-3-large" | "text-embedding-ada-002";
  dimensions?: number;
}

// Response types
export interface EmbedSingleResponse {
  success: true;
  id: string;
}

export interface EmbedMultipleResponse {
  success: true;
  count: number;
  ids: string[];
}

export type EmbedResponse = EmbedSingleResponse | EmbedMultipleResponse;

export interface EmbedErrorResponse {
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

    const body: EmbedRequest = await request.json();
    const {
      content,
      agent_id,
      run_id,
      app_id,
      metadata,
      categories,
      expiration_date,
      model = "text-embedding-3-small",
      dimensions,
    } = body;

    if (!content || (Array.isArray(content) && content.length === 0)) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    const userId = session.user.id;
    const isMultiple = Array.isArray(content);

    if (isMultiple) {
      // Embed multiple texts at once
      const { embeddings } = await embedMany({
        model: openai.textEmbedding(model),
        values: content,
        providerOptions: {
          openai: {
            ...(dimensions && { dimensions }),
            user: userId,
          },
        },
      });

      // Create embedding documents
      const embeddingDocs: Omit<IEmbedding, "created_at" | "updated_at">[] =
        content.map((text, index) => ({
          content: text,
          embedding: embeddings[index],
          user_id: userId,
          agent_id,
          run_id,
          app_id,
          metadata,
          categories,
          ...(expiration_date && { expiration_date: new Date(expiration_date) }),
        }));

      // Save to MongoDB
      const savedEmbeddings = await EmbeddingModel.insertMany(embeddingDocs);

      return NextResponse.json({
        success: true,
        count: savedEmbeddings.length,
        ids: savedEmbeddings.map((doc) => doc._id.toString()),
      });
    } else {
      // Embed single text
      const { embedding } = await embed({
        model: openai.textEmbedding(model),
        value: content,
        providerOptions: {
          openai: {
            ...(dimensions && { dimensions }),
            user: userId,
          },
        },
      });

      // Create and save embedding document
      const embeddingDoc = new EmbeddingModel({
        content,
        embedding,
        user_id: userId,
        agent_id,
        run_id,
        app_id,
        metadata,
        categories,
        ...(expiration_date && { expiration_date: new Date(expiration_date) }),
      });

      await embeddingDoc.save();

      return NextResponse.json({
        success: true,
        id: embeddingDoc._id.toString(),
      });
    }
  } catch (error) {
    console.error("Embed error:", error);
    return NextResponse.json(
      {
        error: "Failed to embed content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

