import { NextRequest, NextResponse } from "next/server";
import { generateRoadmap } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const { skill } = await request.json();

    if (!skill || typeof skill !== "string") {
      return NextResponse.json(
        { error: "Skill name is required" },
        { status: 400 }
      );
    }

    const roadmap = await generateRoadmap(skill);

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}
