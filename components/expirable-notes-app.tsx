"use client"

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2, Share2, BookOpen } from 'lucide-react'

type Note = {
  id: string
  content: string
  expiresAt: Date
  displayAt: Date
  isRead: boolean
  autoDeleteAfterReading: boolean
}

export function ExpirableNotesAppComponent() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [displayOption, setDisplayOption] = useState('now')
  const [expirationTime, setExpirationTime] = useState('1h')
  const [laterDate, setLaterDate] = useState('')
  const [laterTime, setLaterTime] = useState('')
  const [autoDeleteAfterReading, setAutoDeleteAfterReading] = useState(false)

  useEffect(() => {
    const storedNotes = localStorage.getItem('notes')
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes, (key, value) => 
        key === 'expiresAt' || key === 'displayAt' ? new Date(value) : value
      ))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  const createNote = () => {
    if (!newNote.trim()) return

    const now = new Date()
    let displayAt = new Date()
    if (displayOption === 'later') {
      displayAt = new Date(`${laterDate}T${laterTime}`)
    }

    let expiresAt = new Date(displayAt.getTime())
    switch (expirationTime) {
      case '1h':
        expiresAt.setHours(expiresAt.getHours() + 1)
        break
      case '1d':
        expiresAt.setDate(expiresAt.getDate() + 1)
        break
      case '1w':
        expiresAt.setDate(expiresAt.getDate() + 7)
        break
    }

    const newNoteObj: Note = {
      id: uuidv4(),
      content: newNote,
      expiresAt,
      displayAt,
      isRead: false,
      autoDeleteAfterReading
    }

    setNotes([...notes, newNoteObj])
    setNewNote('')
    setAutoDeleteAfterReading(false)
  }

  const shareNote = (noteId: string) => {
    navigator.clipboard.writeText(`https://example.com/share/${noteId}`)
    alert('Shareable link copied to clipboard!')
  }

  const readNote = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, isRead: true } 
        : note
    ).filter(note => !(note.id === noteId && note.autoDeleteAfterReading)))
  }

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId))
  }

  const deleteExpiredNotes = () => {
    const now = new Date()
    setNotes(notes.filter(note => !note.isRead && note.expiresAt > now))
  }

  useEffect(() => {
    const interval = setInterval(deleteExpiredNotes, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [notes])

  const visibleNotes = notes.filter(note => {
    const now = new Date()
    return !note.isRead && note.displayAt <= now && note.expiresAt > now
  })

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Expirable Notes App</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Create a New Note</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note here"
            className="mb-2"
          />
          <Select value={displayOption} onValueChange={setDisplayOption}>
            <SelectTrigger>
              <SelectValue placeholder="Display option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">Now</SelectItem>
              <SelectItem value="later">Later</SelectItem>
            </SelectContent>
          </Select>
          {displayOption === 'later' && (
            <div className="flex gap-2 mt-2">
              <Input
                type="date"
                value={laterDate}
                onChange={(e) => setLaterDate(e.target.value)}
              />
              <Input
                type="time"
                value={laterTime}
                onChange={(e) => setLaterTime(e.target.value)}
              />
            </div>
          )}
          <Select value={expirationTime} onValueChange={setExpirationTime} className="mt-2">
            <SelectTrigger>
              <SelectValue placeholder="Expiration time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="1d">1 day</SelectItem>
              <SelectItem value="1w">1 week</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id="auto-delete"
              checked={autoDeleteAfterReading}
              onCheckedChange={setAutoDeleteAfterReading}
            />
            <Label htmlFor="auto-delete">Auto-delete after reading</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={createNote}>Create Note</Button>
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleNotes.map(note => (
          <Card key={note.id}>
            <CardHeader>
              <CardTitle>Note</CardTitle>
              <CardDescription>Expires at: {note.expiresAt.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{note.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => readNote(note.id)} variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Mark as Read
              </Button>
              <Button onClick={() => shareNote(note.id)} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => deleteNote(note.id)} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}