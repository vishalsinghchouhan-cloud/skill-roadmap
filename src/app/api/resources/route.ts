import { NextRequest, NextResponse } from "next/server";
import { generateNodeResources } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const { nodeId, title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Node title is required" },
        { status: 400 }
      );
    }

    const resources = await generateNodeResources(title, description || "");

    return NextResponse.json({ nodeId, resources });
  } catch (error) {
    console.error("Resource generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate resources" },
      { status: 500 }
    );
  }
}
