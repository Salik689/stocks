import clientPromise from "../../../backend/lib/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    const requestData = await request.json();
    const { items, done, shoba, nameDetails, aimsId } = requestData;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "No items provided" }), { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("inventory");

    let updatedItems = [];
    for (const { id, change, taken } of items) {
      if (!id || typeof change !== "number") {
        return new Response(JSON.stringify({ error: "Invalid item data" }), { status: 400 });
      }
      await db.collection("stock").updateOne(
        { _id: new ObjectId(id) },
        { $inc: { itemQuantity: change } }
      );
      const updatedItem = await db.collection("stock").findOne({ _id: new ObjectId(id) });
      updatedItems.push({
        ...updatedItem,
        taken: taken ?? Math.abs(change)
      });
    }

    // Prepare plain text for email
    const plainText = `Stock update completed.\n\nShoba: ${shoba || "N/A"}\nName: ${nameDetails || "N/A"}\nAims Id: ${aimsId || "N/A"}\n\nUpdated Items:\n${updatedItems.map(item => 
      `- ${item.itemName || "Unknown"} | Taken: ${item.taken ?? 0} | Left: ${item.itemQuantity ?? 0}`
    ).join("\n")}`;

    // 1. Send plain email
    if (done) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: "salikahmed6809@gmail.com",
          subject: "Stock Quantities Updated",
          text: plainText
        });
        console.log("Email sent:", info.response);
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    // Store submission metadata in MongoDB
    await db.collection('submissions').insertOne({
      ...requestData,
      updatedItems,
      createdAt: new Date()
    });

    return new Response(JSON.stringify({ success: true, updatedItems }), { status: 200 });

  } catch (err) {
    console.error("Update error:", err);
    return new Response(JSON.stringify({ error: "Failed to update stock", details: err.message }), { status: 500 });
  }
}
