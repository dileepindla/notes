import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest, context: unknown) {
    const { id } = (context as { params: { id: string } }).params;
  
  try {
    const client = await clientPromise
    const db = client.db("expirableNotes")
    const note = await db.collection("notes").findOne({ id: id })
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json(note)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: unknown) {
    const { id } = (context as { params: { id: string } }).params;
  
  try {
    const client = await clientPromise
    const db = client.db("expirableNotes")
    const update = await request.json()
    const result = await db.collection("notes").updateOne(
      { id: id },
      { $set: update }
    )
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: unknown) {
    const { id } = (context as { params: { id: string } }).params;
  
  try {
    const client = await clientPromise
    const db = client.db("expirableNotes")
    const result = await db.collection("notes").deleteOne({ id: id })
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}