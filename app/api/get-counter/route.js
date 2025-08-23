import clientPromise from "../../../backend/lib/mongodb";

export async function GET() {
	try {
		const client = await clientPromise;
		const db = client.db("inventory");
		const counterDoc = await db.collection("counters").findOne({ _id: "emailCounter" });
		const count = counterDoc?.count ?? 0;
		return new Response(JSON.stringify({ count }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: "Failed to fetch counter", details: err.message }), { status: 500 });
	}
}
