import clientPromise from "../../../lib/mongodb";

export async function POST(request) {
  try {
    const data = await request.json();
    // Ensure itemQuantity is a number
    data.itemQuantity = Number(data.itemQuantity);

    const client = await clientPromise;
    const db = client.db("inventory");
    const result = await db.collection("stock").insertOne(data);

    return new Response(JSON.stringify({ message: "Saved", id: result.insertedId }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to save" }), { status: 500 });
  }
}