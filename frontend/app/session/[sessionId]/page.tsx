"use client";

import { useParams } from "next/navigation";

export default function SessionPage() {
  const params = useParams();

  const sessionId = params.sessionId as string;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            KnowLink AI
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Research Workspace
        </h2>

        <p className="mt-2 text-gray-600">
          Session ID: {sessionId}
        </p>

        <div className="mt-8 rounded-xl border bg-white p-8">
          <p className="text-gray-600">
            Your research workspace will be built here.
          </p>
        </div>
      </section>
    </main>
  );
}