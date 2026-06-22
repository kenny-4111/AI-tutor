import { NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

export async function POST(request: Request) {
  if (!ELEVENLABS_API_KEY) {
    console.error("ElevenLabs API Key missing");
    return NextResponse.json(
      { error: "ElevenLabs API Key is not configured." },
      { status: 500 }
    );
  }

  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided for Text-to-Speech." },
        { status: 400 }
      );
    }

    const limitedText =
      text.length > 1000 ? text.substring(0, 1000) + "..." : text;

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: limitedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      console.error(
        "ElevenLabs API Error:",
        elevenLabsResponse.status,
        errorText
      );

      return NextResponse.json(
        { error: `TTS failed: ${elevenLabsResponse.status}` },
        { status: 500 }
      );
    }

    return new NextResponse(elevenLabsResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error while generating speech." },
      { status: 500 }
    );
  }
}
