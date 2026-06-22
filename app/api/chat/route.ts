import { NextResponse } from "next/server";
import { OpenAI } from "openai";

// Initialize OpenAI-compatible client for Hugging Face
const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_API_KEY,
});

// You can optionally configure your model/tag here
const MODEL_ID = "moonshotai/Kimi-K2-Thinking:novita";

function stripMarkdown(text: string) {
  return text
    .replace(/[*_~`#>-]/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .trim();
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Something went wrong while communicating with the model.";
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const { prompt } = (await req.json()) as { prompt?: string };

    if (!prompt?.trim()) {
      return NextResponse.json(
        { text: "You didn't provide a prompt!" },
        { status: 400 }
      );
    }

    // Send prompt to Hugging Face chat model
    const chatCompletion = await client.chat.completions.create({
      model: MODEL_ID,
      max_tokens: 4000,

      messages: [
        {
          role: "system",
          content:
            "You must respond in clean plain text. No markdown, no asterisks, no headings, no bold formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract generated text
    const raw = chatCompletion.choices?.[0]?.message?.content || "No response.";
    const text = stripMarkdown(raw);

    return NextResponse.json({ text });
  } catch (err: unknown) {
    console.error("Error in chat API:", err);

    // Handle Hugging Face API errors
    const message = getErrorMessage(err);
    return NextResponse.json({ text: message }, { status: 500 });
  }
}
