"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Clock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button'
import Link from 'next/link'


type Note = {
  id: string
  content: string
  expiresAt: string
  displayAt: string
  isRead: boolean
  autoDeleteAfterReading: boolean
}

export default function SharedNotePage() {
  const params = useParams()
  const noteId = params.noteId as string
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true)
      if (!noteId) {
        setError("Invalid note ID.")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/notes/${noteId}`)
        if (response.ok) {
          const fetchedNote: Note = await response.json()
          const now = new Date()
          const noteDisplayAt = new Date(fetchedNote.displayAt)
          const noteExpiresAt = new Date(fetchedNote.expiresAt)

          if (now > noteExpiresAt) {
            setError("This note has expired.")
          } else if (now < noteDisplayAt) {
            setError(`This note will be available from ${noteDisplayAt.toLocaleString()}. Please come back at the scheduled time.`)
          } else {
            if (fetchedNote.isRead && fetchedNote.autoDeleteAfterReading) {
              await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
              setError("This note has been deleted after being read.")
            } else {
              setNote(fetchedNote)
              // Mark the note as read
              await fetch(`/api/notes/${noteId}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isRead: true }),
              })
            }
          }
        } else {
          setError("Note not found.")
        }
      } catch (error) {
        console.error('Failed to fetch note:', error)
        setError("An error occurred while fetching the note.")
      }
      setIsLoading(false)
    }

    fetchNote()
  }, [noteId])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <Alert variant="destructive" className="max-w-md w-full mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go to Home Page
          </Link>
        </Button>
      </div>
    )
  }

  if (!note) {
    return null
  }

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Shared Note</CardTitle>
          <CardDescription className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-2" />
            Expires at: {new Date(note.expiresAt).toLocaleString()}
          </CardDescription>
          {note.autoDeleteAfterReading && (
            <Alert variant={'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>This note will be deleted after reading.</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-gray-700 text-lg">{note.content}</p>
        </CardContent>
      </Card>
      <Button asChild className="mt-4">
        <Link href="/" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Create Your Own Note
        </Link>
      </Button>
    </div>
  )
}