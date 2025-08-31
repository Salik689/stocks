// app/api/returnItems/route.js
import clientPromise from '@/lib/mongodb';

const dbName = 'inventory';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('returnItems');

    const returnItems = await collection.find().sort({ createdAt: -1 }).toArray();

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

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, aimsId, shoba, items } = body;

    if (!name || !aimsId || !shoba || !items) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('returnItems');

    await collection.insertOne({
      name: name.trim(),
      aimsId: aimsId.trim(),
      shoba: shoba.trim(),
      items: items.trim(),
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ message: 'Return items saved successfully' }), {
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