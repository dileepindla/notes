import ExpirableNotesApp from "./components/ExpirableNotesApp";

export default function Home() {
  return (
    <main className="flex-grow flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-7xl">
        <ExpirableNotesApp />
      </div>
    </main>
  );
}