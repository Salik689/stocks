import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';
import cors from 'cors';
import clientPromise from './lib/mongodb.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// POST route: save form data and send email
app.post('/', async (req, res) => {
  try {
    const formData = req.body;
    const client = await clientPromise;
    const db = client.db('inventory');
    const collection = db.collection('stock');

    // Save form data (if needed, or update stock as per your logic)
    await collection.insertOne(formData);

    // Increment the email counter in 'counters' collection
    const counterDoc = await db.collection('counters').findOneAndUpdate(
      { _id: 'emailCounter' },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    const emailCount = counterDoc.value?.count || 1;

    // Prepare plain text for email with Dimand number
    const plainText = `Stock update completed.\n\nDimand number: ${emailCount}\nShoba: ${formData.shoba || "N/A"}\nName: ${formData.nameDetails || "N/A"}\nAims Id: ${formData.aimsId || "N/A"}\n\nUpdated Items:\n${formData.items?.map(item =>
      `- ${item.itemName || "Unknown"} | Taken: ${item.taken ?? 0} | Left: ${item.itemQuantity ?? 0}`
    ).join("\n")}`;

    // Send plain email
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "hafizawais0325@gamil.com",
        subject: "Stock Quantities Updated",
        text: plainText
      });
      console.log("Email sent!");
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr);
    }

    // Store all relevant submission data in MongoDB, including the email count
    await db.collection('submissions').insertOne({
      ...formData,
      emailBody: plainText,
      dimandNumber: emailCount,
      createdAt: new Date()
    });

    res.status(200).json({ message: "Stock updated and email sent.", dimandNumber: emailCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET route: fetch submissions
app.get('/submissions', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('inventory');
    const submissions = await db.collection('submissions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});