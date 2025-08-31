import clientPromise from "../../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const submissions = await db.collection("submissions")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return new Response(JSON.stringify(submissions), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch submissions", details: err.message }), { status: 500 });
  }
}
