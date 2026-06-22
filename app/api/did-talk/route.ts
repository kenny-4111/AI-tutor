import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("Content-Type");

    if (!contentType?.includes("application/octet-stream")) {
      return NextResponse.json(
        {
          error:
            "Send raw audio Blob with Content-Type: application/octet-stream",
        },
        { status: 400 }
      );
    }

    const audioBuffer = await req.arrayBuffer();

    // Convert audio to base64 data URL to send back to frontend
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return NextResponse.json({ audioUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Audio processing failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
