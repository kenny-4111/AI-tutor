import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "D-ID avatar integration disabled." },
    { status: 410 }
  );
}
