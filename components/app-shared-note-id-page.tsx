"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Note = {
  id: string
  content: string
  expiresAt: Date
  displayAt: Date
  isRead: boolean
  autoDeleteAfterReading: boolean
}

type PageProps = {
  params: { noteId?: string }
}

export function BlockPage({ params }: PageProps) {
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchNote = () => {
      setIsLoading(true)
      if (!params || !params.noteId) {
        setError("Invalid note ID.")
        setIsLoading(false)
        return
      }

      // In a real app, this would be an API call
      const storedNotes = localStorage.getItem('notes')
      if (storedNotes) {
        const notes: Note[] = JSON.parse(storedNotes, (key, value) => 
          key === 'expiresAt' || key === 'displayAt' ? new Date(value) : value
        )
        const foundNote = notes.find(n => n.id === params.noteId)
        if (foundNote) {
          const now = new Date()
          if (now > foundNote.expiresAt) {
            setError("This note has expired.")
          } else if (now < foundNote.displayAt) {
            setError(`This note will be available from ${foundNote.displayAt.toLocaleString()}.`)
          } else {
            setNote(foundNote)
            setIsVisible(true)
          }
        } else {
          setError("Note not found.")
        }
      } else {
        setError("No notes available.")
      }
      setIsLoading(false)
    }

    fetchNote()
  }, [params])

  const handleReadNote = () => {
    if (note) {
      // In a real app, this would be an API call
      const storedNotes = localStorage.getItem('notes')
      if (storedNotes) {
        let notes: Note[] = JSON.parse(storedNotes, (key, value) => 
          key === 'expiresAt' || key === 'displayAt' ? new Date(value) : value
        )
        notes = notes.map(n => 
          n.id === note.id ? { ...n, isRead: true } : n
        )
        if (note.autoDeleteAfterReading) {
          notes = notes.filter(n => n.id !== note.id)
        }
        localStorage.setItem('notes', JSON.stringify(notes))
      }
      
      if (note.autoDeleteAfterReading) {
        router.push('/shared/note-deleted')
      } else {
        setNote({ ...note, isRead: true })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!note || !isVisible) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Shared Note</CardTitle>
          <CardDescription className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Expires at: {note.expiresAt.toLocaleString()}
          </CardDescription>
          {note.autoDeleteAfterReading && (
            <CardDescription className="flex items-center text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              This note will be deleted after reading
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{note.content}</p>
        </CardContent>
        <CardFooter>
          {!note.isRead && (
            <Button onClick={handleReadNote}>
              Mark as Read
            </Button>
          )}
          {note.isRead && (
            <p className="text-muted-foreground">This note has been read.</p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}