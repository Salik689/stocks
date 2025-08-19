import clientPromise from "../../../backend/lib/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { items, done, shoba, nameDetails, aimsId } = await request.json();
    const client = await clientPromise;
    const db = client.db("inventory");

    let updatedItems = [];

    // Update all items and keep track of taken quantity
    for (const { id, change, taken } of items) {
      await db.collection("stock").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { itemQuantity: change } }
      );
      const updatedItem = await db.collection("stock").findOne({ _id: new ObjectId(id) });
      updatedItems.push({
        ...updatedItem,
        taken: taken ?? Math.abs(change) // fallback if taken is not sent
      });
    }

    // Send a single email with all updated items
    if (done) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const itemsText = updatedItems.map(item =>
        `Item Name: ${item.itemName}
Quantity taken: ${item.taken}
Quantity left: ${item.itemQuantity}`
      ).join('\n\n');

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "hafizawais0325@gmail.com",
        subject: "Stock Quantities Updated",
        text: `${itemsText}
Details:
Shoba: ${shoba}
Name: ${nameDetails}
Aims Id: ${aimsId}`,
      });
    }

    return new Response(JSON.stringify({ success: true, updatedItems }), { status: 200 });
  } catch (err) {
    console.error("Update error:", err);
    return new Response(JSON.stringify({ error: "Failed to update stock" }), { status: 500 });
  }
}