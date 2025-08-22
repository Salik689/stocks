import { NextResponse } from "next/server";
import clientPromise from "../../../backend/lib/mongodb";

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    await db.collection("counters").updateOne(
      { _id: "emailCounter" },
      { $set: { count: 0 } },
      { upsert: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
