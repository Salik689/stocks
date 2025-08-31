import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const dbName = 'inventory'; // Your database name

// POST: Save return submission and update stock quantities
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, aimsId, shoba, items } = body;

    // Validate required fields
    if (!name || !aimsId || !shoba || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing required fields or items' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = await clientPromise;
    const db = client.db(dbName);

    // Save the return submission
    await db.collection('returnItems').insertOne({
      name: name.trim(),
      aimsId: aimsId.trim(),
      shoba: shoba.trim(),
      items,
      createdAt: new Date(),
    });

    // Update stock quantities for each returned item
    for (const item of items) {
      if (!item.itemId || typeof item.taken !== 'number') continue;

      await db.collection('stock').updateOne(
        { _id: new ObjectId(item.itemId) },
        { $inc: { itemQuantity: item.taken } } // Increment quantity
      );
    }

    return new Response(JSON.stringify({ message: 'Return items saved and stock updated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ POST error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// GET: Fetch all return submissions
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);

    const returnItems = await db.collection('returnItems')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(JSON.stringify(returnItems), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ GET error:', error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}