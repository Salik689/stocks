import clientPromise from "../../../backend/lib/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const { id, change, done, shoba } = await request.json();
    const client = await clientPromise;
    const db = client.db("inventory");

    // Update DB
    await db.collection("stock").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { itemQuantity: change } }
    );

    // Get updated item
    const updatedItem = await db.collection("stock").findOne({ _id: new ObjectId(id) });

    // Send email only when "Done" is clicked
    if (done) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "salikahmed6809@gmail.com",
        subject: "Stock Quantity Updated",
        text: `Item Name: ${updatedItem.itemName}
Quantity left: ${updatedItem.itemQuantity}
Shoba: ${shoba}`,
      });
    }

    return new Response(JSON.stringify({ success: true, updatedItem }), { status: 200 });
  } catch (err) {
    console.error("Update error:", err);
    return new Response(JSON.stringify({ error: "Failed to update stock" }), { status: 500 });
  }
}