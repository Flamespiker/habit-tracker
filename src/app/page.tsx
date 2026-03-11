import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-gray-900">
        🎯 The Habit Tracker 📅
      </h1>
      <p className="mt-4 text-lg text-gray-500">
        Your personal habit & goal tracking app
      </p>
      <p className="mt-2 text-sm text-gray-400">
        Phase 1 · Week 1 · Day 3 — scaffold complete
      </p>
    </main>
  )
}
