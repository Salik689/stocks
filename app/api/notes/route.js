import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = 'inventory'; // Your database name

export async function POST(request) {
  try {
    const body = await request.json();
    const { shoba, notes } = body;

    if (!shoba || !notes) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('notes');

    await collection.insertOne({
      shoba,
      notes,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ message: 'Note saved successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ POST error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('notes');

    const notes = await collection.find().sort({ createdAt: -1 }).toArray();

    return new Response(JSON.stringify(notes), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ GET error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch notes' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}