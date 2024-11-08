import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-8">
        <p className="text-sm text-muted-foreground">
          Crafting ephemeral moments, one note at a time.
        </p>
        <Link
          href="https://github.com/dileepindla/notes"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
        >
          Open Source Project
        </Link>
      </div>
    </footer>
  )
}