import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Signup API not connected to a database yet. Please try Google sign-in or use the demo credentials.",
    },
    { status: 501 }
  );
}
