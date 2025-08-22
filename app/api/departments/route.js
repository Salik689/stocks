
import { NextResponse } from "next/server";
import clientPromise from "../../../backend/lib/mongodb";


export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("inventory");
    const departments = await db.collection("departments").find({}).toArray();
    // Ensure output is an array of objects with a 'department' property
    const result = departments.map((d) => ({ department: d.department || d.name || d._id }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load departments from database" }, { status: 500 });
  }
}
