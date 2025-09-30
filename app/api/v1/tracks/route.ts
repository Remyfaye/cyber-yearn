// app/api/v1/tracks/route.ts
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { directus } from "../../../../lib/directus-service";

export async function GET() {
  try {
    // Memory monitoring
    if (process.env.NODE_ENV === "production") {
      const used = process.memoryUsage();
      console.log("Memory usage:", used);
    }

    const tracks = await directus.getPublishedTracks();

    return NextResponse.json(tracks, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 503 });
  }
}
