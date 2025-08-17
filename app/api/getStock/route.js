import clientPromise from "../../../backend/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const stock = await db.collection("stock").find({}).toArray();
    return new Response(JSON.stringify(stock), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("MongoDB error:", err); // More detailed error
    return new Response(JSON.stringify({ error: "Failed to fetch stock", details: err.message }), { status: 500 });
  }
}