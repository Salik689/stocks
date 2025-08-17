import clientPromise from "../../../backend/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const { id, newLocation } = await request.json();
    const client = await clientPromise;
    const db = client.db("inventory");

    // Convert id to ObjectId and update itemLocation
    await db.collection("stock").updateOne(
      { _id: new ObjectId(id) },
      { $set: { itemLocation: newLocation } }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Update location error:", err);
    return new Response(JSON.stringify({ error: "Failed to update location" }), { status: 500 });
  }
}