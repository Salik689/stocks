import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(req) {
  try {
    const { id } = await req.json(); // parse body
    if (!id) {
      return new Response(JSON.stringify({ message: "Missing ID" }), {
        status: 400,
      });
    }

    const client = await clientPromise;
    const db = client.db("inventory"); // change to your DB
    await db.collection("stock").deleteOne({ _id: new ObjectId(id) });

    return new Response(
      JSON.stringify({ message: "Item deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting item:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}
