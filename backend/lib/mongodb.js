import { MongoClient } from "mongodb";
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' }) // Load env variables first

const uri = process.env.MONGODB_URI; // Your MongoDB connection string from .env.local
const options = {};

// This variable is used to store the connection (so we don't reconnect every time)
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("❌ Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the connection across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, just connect once
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
