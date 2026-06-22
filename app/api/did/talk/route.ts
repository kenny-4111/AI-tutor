import { NextResponse } from "next/server";

const DID_API_KEY = process.env.DID_API_KEY;
const DID_PRESENTER_ID = process.env.DID_PRESENTER_ID;

const DID_API_BASE = "https://api.d-id.com/v1";

function getAuthHeader() {
  if (!DID_API_KEY) return undefined;
  // Key should be "apiKey:apiSecret" already; encode in base64 for Basic auth.
  const encoded = Buffer.from(DID_API_KEY).toString("base64");
  return `Basic ${encoded}`;
}

type CreateTalkResponse = {
  id: string;
  status: string;
  result_url?: string;
};

type TalkStatusResponse = {
  status: string;
  result_url?: string;
};

async function pollTalk(id: string): Promise<string> {
  const auth = getAuthHeader();
  if (!auth) throw new Error("D-ID API key missing");

  const pollUrl = `${DID_API_BASE}/talks/${id}`;
  const maxAttempts = 15; // ~30 seconds @ 2s interval
  const delayMs = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const res = await fetch(pollUrl, {
      headers: {
        Authorization: auth,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`D-ID status poll failed: ${res.status} ${text}`);
    }

    const data = (await res.json()) as TalkStatusResponse;
    if (data.status === "done" && data.result_url) {
      return data.result_url;
    }

    if (data.status === "error") {
      throw new Error("D-ID reported an error while generating the video");
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("D-ID video generation timed out");
}

export async function POST(request: Request) {
  if (!DID_API_KEY) {
    return NextResponse.json(
      { error: "D-ID API key is not configured." },
      { status: 500 },
    );
  }

  if (!DID_PRESENTER_ID) {
    return NextResponse.json(
      { error: "D-ID presenter ID is not configured." },
      { status: 500 },
    );
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "No text provided for D-ID video." },
        { status: 400 },
      );
    }

    const auth = getAuthHeader();
    if (!auth) {
      return NextResponse.json(
        { error: "D-ID API key is invalid." },
        { status: 500 },
      );
    }

    const payload: Record<string, unknown> = {
      script: {
        type: "text",
        input: text,
      },
      config: {
        stitch: false,
      },
    };

    payload.presenter_id = DID_PRESENTER_ID;

    // Optional: choose a built-in voice
    payload.voice = {
      language: "en-US",
      name: "jenny",
    };

    const createRes = await fetch(`${DID_API_BASE}/talks`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!createRes.ok) {
      const textResponse = await createRes.text();
      console.error("D-ID create error", createRes.status, textResponse);
      return NextResponse.json(
        { error: "Failed to create D-ID talk." },
        { status: 502 },
      );
    }

    const createData = (await createRes.json()) as CreateTalkResponse;

    if (createData.status === "done" && createData.result_url) {
      return NextResponse.json({ videoUrl: createData.result_url });
    }

    const videoUrl = await pollTalk(createData.id);
    return NextResponse.json({ videoUrl });
  } catch (error) {
    console.error("D-ID route error", error);
    return NextResponse.json(
      { error: "Internal Server Error while generating D-ID video." },
      { status: 500 },
    );
  }
}
