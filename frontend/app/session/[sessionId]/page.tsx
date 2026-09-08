"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Source {
  id: string;
  title: string;
  url: string;
}

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();

  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [addingSource, setAddingSource] = useState(false);

  const addSource = async () => {
  if (!sourceUrl.trim()) {
    setError("URL is required");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
    return;
  }

  setAddingSource(true);
  setError("");

  try {
    const data = await apiRequest("/sources", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        url: sourceUrl.trim(),
      }),
    });

    setSources((currentSources) => [
      data.source,
      ...currentSources,
    ]);

    setSourceUrl("");
    setShowAddSource(false);
  } catch (error) {
    console.error("Add source error:", error);

    setError(
      error instanceof Error
        ? error.message
        : "Failed to add source"
    );
  } finally {
    setAddingSource(false);
  }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [sessionData, sourceData] = await Promise.all([
          apiRequest(`/sessions/${sessionId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          
          apiRequest(`/sources/session/${sessionId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
        
        setSession(sessionData.session);
        setSources(sourceData.sources);
      } catch (error) {
        console.error("Failed to load session:", error);
        
        setError(
          error instanceof Error
          ? error.message
          : "Failed to load session"
        );
      } finally{
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading session...</p>
      </main>
    );
  }

  if (error || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Unable to load session
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || "Session not found"}
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              KnowLink AI
            </h1>

            <p className="text-sm text-gray-500">
              Research Workspace
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-900">
          {session.title}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Created{" "}
          {new Date(session.createdAt).toLocaleDateString()}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Sources
              </h3>

              <button 
                onClick={ ()=> {
                  setError("");
                  setShowAddSource(true);
                }}
                className="rounded-lg bg-black px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                + Add Url
              </button>
            
              <span className="text-sm text-gray-500">
                {sources.length}
              </span>
            </div>

            {showAddSource && (
              <div className="mt-4 rounded-lg border p-4">
                <label
                  htmlFor="sourceUrl"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Source URL
                </label>


                <input
                  id="sourceUrl"
                  type="url"
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  placeholder="https://example.com"
                  autoFocus
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
                />

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={addSource}
                    disabled={addingSource}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {addingSource ? "Adding..." : "Add URL"}
                  </button>

                  <button
                    onClick={() => {
                      setShowAddSource(false);
                      setSourceUrl("");
                      setError("");
                    }}
                    disabled={addingSource}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
               </div>
             </div>
            )}
            
            {sources.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">
                No sources added yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-lg border p-3"
                  >
                    <p className="font-medium text-gray-900">
                      {source.title}
                    </p>
                      
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {source.url}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-6 md:col-span-2">
            <h3 className="font-semibold text-gray-900">
              AI Research Assistant
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Ask questions about your sources here.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}