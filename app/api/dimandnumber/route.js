export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");

    // Increment and fetch new dimand number
    const counterDoc = await db.collection("counters").findOneAndUpdate(
      { _id: "dimandCounter" },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    const dimandNumber = counterDoc.value.count;
    return NextResponse.json({ dimandNumber });
  } catch (err) {
    console.error("Failed to increment dimand number:", err);
    return NextResponse.json({ error: "Failed to increment dimand number" }, { status: 500 });
  }
}
import clientPromise from "../../../backend/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");

    // Fetch current dimand number
    const counterDoc = await db.collection("counters").findOne({ _id: "dimandCounter" });
    const dimandNumber = counterDoc?.count ?? 0;

    return NextResponse.json({ dimandNumber });
  } catch (err) {
    console.error("Failed to fetch dimand number:", err);
    return NextResponse.json({ error: "Failed to fetch dimand number" }, { status: 500 });
  }
}
