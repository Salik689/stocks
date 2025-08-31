import clientPromise from "../../../lib/mongodb"; // MongoDB connection
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";

export async function POST(request) {
  try {
    // Log environment variables for debugging
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' : 'NOT SET');

    // Parse request body
    const requestData = await request.json();
    const { items, done, shoba, nameDetails, aimsId } = requestData;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      console.error('No items provided in request');
      return new Response(JSON.stringify({ error: "No items provided" }), { status: 400 });
    }

  console.log('Connecting to MongoDB...');
  const client = await clientPromise;
  const db = client.db("inventory");
  console.log('Connected to MongoDB');

  let updatedItems = [];
  console.log('Updating stock quantities...');

    // Update stock quantities
    for (const { id, change, taken } of items) {
      if (!id || typeof change !== "number") {
        console.error('Invalid item data:', { id, change, taken });
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
    console.log('Stock quantities updated.');

    // Always increment demand number in the backend
    // Try with returnDocument: "after" (MongoDB v4+), fallback to just fetching if result is missing
    let counterDoc = await db.collection("counters").findOneAndUpdate(
      { _id: "dimandCounter" },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    let dimandNumber;
    if (counterDoc && counterDoc.value && typeof counterDoc.value.count === 'number') {
      dimandNumber = counterDoc.value.count;
    } else {
      // As a last resort, fetch the document (do NOT increment again)
      const doc = await db.collection("counters").findOne({ _id: "dimandCounter" });
      dimandNumber = doc?.count ?? 0;
    }
    console.log('Demand number incremented:', dimandNumber);

    // Prepare email content
    const plainText = `Stock update completed.\n\nDimand Number: ${dimandNumber}\nShoba: ${shoba || "N/A"}\nName: ${nameDetails || "N/A"}\nAims Id: ${aimsId || "N/A"}\n\nUpdated Items:\n${updatedItems.map(item =>
      `- ${item.itemName || "Unknown"} | Taken: ${item.taken} | Left: ${item.itemQuantity}`
    ).join("\n")}`;

    // Send email if "done" flag is true
    if (done) {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Missing EMAIL_USER or EMAIL_PASS in environment variables.");
        return new Response(JSON.stringify({ error: "Email credentials not set in environment." }), { status: 500 });
      }
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: ["lager.jalsa@gmail.com", "hafizawais0325@gmail.com","mubashirmirza32@gmail.com","ahmedsalik689689@gmail.com"],
          subject: "Stock Quantities Updated",
          text: plainText
        });
        console.log("Email sent successfully to salikahmed6809@gmail.com");
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
        return new Response(JSON.stringify({ error: "Failed to send email", details: emailErr.message }), { status: 500 });
      }
    }

    // Save submission record
    try {
      await db.collection('submissions').insertOne({
        shoba,
        nameDetails,
        aimsId,
        items,
        updatedItems,
        emailBody: plainText,
        dimandNumber, // store dimand number
        createdAt: new Date()
      });
      console.log('Submission saved to database.');
    } catch (dbErr) {
      console.error('Failed to save submission:', dbErr);
      return new Response(JSON.stringify({ error: "Failed to save submission", details: dbErr.message }), { status: 500 });
    }

    // Return success response
  return new Response(JSON.stringify({ success: true, updatedItems, dimandNumber }), { status: 200 });

  } catch (err) {
    console.error("Update-stock error:", err);
    return new Response(JSON.stringify({ error: "Failed to update stock", details: err.message }), { status: 500 });
  }
}
