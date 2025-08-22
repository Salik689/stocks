import clientPromise from "./lib/mongodb.js";

async function resetEmailCounter() {
  const client = await clientPromise;
  const db = client.db("inventory");
  await db.collection("submissions").updateOne(
    { _id: "emailCounter" },
    { $set: { count: 0 } },
    { upsert: true }
  );
  console.log("Email counter reset to 0");
  process.exit(0);
}

resetEmailCounter();