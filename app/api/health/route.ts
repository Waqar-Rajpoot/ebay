import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";

export const dynamic = "force-dynamic";

/** Reports whether the database connection is working. */
export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase();
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}