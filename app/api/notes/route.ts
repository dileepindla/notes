import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("expirableNotes")
    const notes = await db.collection("notes").find({}).toArray()
    return NextResponse.json(notes)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("expirableNotes")
    const note = await request.json()
    const result = await db.collection("notes").insertOne(note)
    return NextResponse.json({ id: result.insertedId })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}