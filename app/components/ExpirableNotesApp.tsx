"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Trash2,
  Share2,
  Clock,
  Trash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const MAX_CHARS = 1000;

type Note = {
  id: string;
  content: string;
  expiresAt: Date;
  displayAt: Date;
  isRead: boolean;
  autoDeleteAfterReading: boolean;
};

export default function ExpirableNotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [displayOption, setDisplayOption] = useState("now");
  const [expirationTime, setExpirationTime] = useState("1h");
  const [laterDate, setLaterDate] = useState("");
  const [laterTime, setLaterTime] = useState("");
  const [autoDeleteAfterReading, setAutoDeleteAfterReading] = useState(false);
  const [userNoteIds, setUserNoteIds] = useState<string[]>([]);
  const [expandedNotes, setExpandedNotes] = useState<string[]>([]);

  useEffect(() => {
    fetchNotes();
    const storedNoteIds = localStorage.getItem("userNoteIds");
    if (storedNoteIds) {
      setUserNoteIds(JSON.parse(storedNoteIds));
    }
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const fetchedNotes = await response.json();
        setNotes(
          fetchedNotes.map((note: any) => ({
            ...note,
            expiresAt: new Date(note.expiresAt),
            displayAt: new Date(note.displayAt),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const createNote = async () => {
    if (!newNote.trim() || newNote.length > MAX_CHARS) return;

    const now = new Date();
    let displayAt = new Date();
    if (displayOption === "later") {
      displayAt = new Date(`${laterDate}T${laterTime}`);
    }

    let expiresAt = new Date(displayAt.getTime());
    switch (expirationTime) {
      case "1h":
        expiresAt.setHours(expiresAt.getHours() + 1);
        break;
      case "1d":
        expiresAt.setDate(expiresAt.getDate() + 1);
        break;
      case "1w":
        expiresAt.setDate(expiresAt.getDate() + 7);
        break;
    }

    const newNoteObj: Note = {
      id: uuidv4(),
      content: newNote,
      expiresAt,
      displayAt,
      isRead: false,
      autoDeleteAfterReading,
    };

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNoteObj),
      });

      if (response.ok) {
        setNotes([...notes, newNoteObj]);
        // Add the new note ID to userNoteIds
        const updatedUserNoteIds = [...userNoteIds, newNoteObj.id];
        setUserNoteIds(updatedUserNoteIds);
        localStorage.setItem("userNoteIds", JSON.stringify(updatedUserNoteIds));
        // Clear the form
        setNewNote("");
        setDisplayOption("now");
        setExpirationTime("1h");
        setLaterDate("");
        setLaterTime("");
        setAutoDeleteAfterReading(false);
      }
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }


  const shareNote = (noteId: string) => {
    const shareableLink = `${window.location.origin}/share/${noteId}`;
    navigator.clipboard.writeText(shareableLink);
    alert("Shareable link copied to clipboard!");
  };

  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteId));
        // Remove the note ID from userNoteIds
        const updatedUserNoteIds = userNoteIds.filter((id) => id !== noteId);
        setUserNoteIds(updatedUserNoteIds);
        localStorage.setItem("userNoteIds", JSON.stringify(updatedUserNoteIds));
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const userNotes = notes.filter((note) => userNoteIds.includes(note.id));

  return (
    <>
      <div className="w-full max-w-[400px] mx-auto space-y-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create a New Note</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here"
              className="min-h-[150px] text-lg"
              maxLength={MAX_CHARS}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {newNote.length}/{MAX_CHARS} characters
              </span>
              {newNote.length > MAX_CHARS && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Note exceeds maximum character limit
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display-option">Display Option</Label>
                <Select value={displayOption} onValueChange={setDisplayOption}>
                  <SelectTrigger id="display-option">
                    <SelectValue placeholder="Display option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Now</SelectItem>
                    <SelectItem value="later">Later</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiration-time">Expiration Time</Label>
                <Select
                  value={expirationTime}
                  onValueChange={setExpirationTime}
                >
                  <SelectTrigger id="expiration-time">
                    <SelectValue placeholder="Expiration time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="1d">1 day</SelectItem>
                    <SelectItem value="1w">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {displayOption === "later" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="later-date">Date</Label>
                  <Input
                    id="later-date"
                    type="date"
                    value={laterDate}
                    onChange={(e) => setLaterDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="later-time">Time</Label>
                  <Input
                    id="later-time"
                    type="time"
                    value={laterTime}
                    onChange={(e) => setLaterTime(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-delete"
                checked={autoDeleteAfterReading}
                onCheckedChange={setAutoDeleteAfterReading}
              />
              <Label htmlFor="auto-delete">Auto-delete after reading</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={createNote} className="w-full">
              Create Note
            </Button>
          </CardFooter>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userNotes.map((note) => (
          <Card key={note.id} className="flex flex-col h-[350px]">
            <CardHeader>
              <CardTitle className="text-xl">Note</CardTitle>
              <CardDescription className="space-y-2">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>
                    {new Date() < note.displayAt
                      ? `Available from: ${note.displayAt.toLocaleString()}`
                      : `Expires at: ${note.expiresAt.toLocaleString()}`}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>
                    Auto-delete: {note.autoDeleteAfterReading ? "Yes" : "No"}
                  </span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <div className="relative h-full flex flex-col">
                <div className="overflow-y-auto flex-grow">
                  <p className="whitespace-pre-wrap text-gray-700 pb-8">
                    {expandedNotes.includes(note.id)
                      ? note.content
                      : truncateText(note.content, 200)}
                  </p>
                </div>
                {note.content.length > 200 && (
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => toggleNoteExpansion(note.id)}
                    >
                      {expandedNotes.includes(note.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          More
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                onClick={() => shareNote(note.id)}
                variant="outline"
                size="sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => deleteNote(note.id)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
