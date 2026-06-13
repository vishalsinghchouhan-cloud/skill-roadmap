import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const skillSlug = searchParams.get("skillSlug");

    if (!userId || !skillSlug) {
      return NextResponse.json(
        { error: "userId and skillSlug are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_progress")
      .select("node_id")
      .eq("user_id", userId)
      .eq("skill_slug", skillSlug)
      .eq("completed", true);

    if (error) throw error;

    return NextResponse.json({
      completedNodes: data.map((row) => row.node_id),
    });
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, skillSlug, nodeId, completed } = await request.json();

    if (!userId || !skillSlug || !nodeId) {
      return NextResponse.json(
        { error: "userId, skillSlug, and nodeId are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from("user_progress").upsert(
      {
        user_id: userId,
        skill_slug: skillSlug,
        node_id: nodeId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,skill_slug,node_id" }
    );

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
