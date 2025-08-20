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

    // Save form data
    await collection.insertOne(formData);

    // Prepare plain text for email
    const plainText = `Stock update completed.\n\nShoba: ${formData.shoba || "N/A"}\nName: ${formData.nameDetails || "N/A"}\nAims Id: ${formData.aimsId || "N/A"}\n\nUpdated Items:\n${formData.items?.map(item =>
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
        to: "salikahmed6809@gmail.com",
        subject: "Stock Quantities Updated",
        text: plainText
      });
      console.log("Email sent!");
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr);
    }

    res.status(200).json({ message: "Stock updated and email sent." });
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