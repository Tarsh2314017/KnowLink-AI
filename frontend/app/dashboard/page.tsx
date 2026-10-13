"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";


interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router=useRouter();
  
  const { user, token, logout, loading: authLoading } = useAuth();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState("");

  const [creatingSession, setCreatingSession] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");

  

  const createSession = async () => {
    if (!sessionTitle.trim()) {
      setError("Session title is required");
      return;
    }


    if (!token) {
      window.location.href = "/login";
      return;
    }

    setCreatingSession(true);
    setError("");

    try {
      const data = await apiRequest("/sessions", {
        method: "POST",
        token,
        body: JSON.stringify({
          title: sessionTitle.trim(),
        }),
      });

      setSessions((currentSessions) => [
        data.session,
        ...currentSessions,
      ]);

      setSessionTitle("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Create session error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create session"
      );
    } finally {
      setCreatingSession(false);
    }
  };
  const deleteSession = async (sessionId: string) => {

    if (!token) {
      router.push("/login");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this session?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingSessionId(sessionId);
    setError("");

    try {
      await apiRequest(`/sessions/${sessionId}`, {
        method: "DELETE",
        token,
      });

      setSessions((currentSessions) =>
        currentSessions.filter((session) => session.id !== sessionId)
      );
    } catch (error) {
      console.error("Delete session error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete session"
      );
    } finally {
      setDeletingSessionId(null);
    }
  };

  useEffect(() => {
  if (authLoading) {
    return;
  }

  if (!token) {
    router.push("/login");
    return;
  }

  const fetchSessions = async () => {
    try {
      const sessionData = await apiRequest("/sessions", {
        method: "GET",
        token,
      });

      setSessions(sessionData.sessions);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
      setSessionsLoading(false);
    }
  };

  fetchSessions();
}, [authLoading, token, router]);


  if (loading || authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900">
            <p className="mt-4 text-sm text-gray-600">
              Loading your Workspace...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            KnowLink AI
          </h1>

          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={()=>{
                  logout();
                  router.push("/login");
                }}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Your Research Workspace
          </h2>

          <p className="mt-2 text-gray-600">
            Create a research session and start exploring your
            sources with AI.
          </p>
        </div>

        {error && (
          <div 
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-semibold text-red-700">
              Something went wrong
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <Button
            type="button"
            onClick={() => {
              setError("");
              setShowCreateForm(true);
            }}
            className="px-5 py-3"
          >
            + Create Research Session
          </Button>

          {showCreateForm && (
            <div className="mt-4 max-w-md rounded-xl border bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Create Research Session
              </h3>

              <input
                type="text"
                value={sessionTitle}
                onChange={(event) =>
                  setSessionTitle(event.target.value)
                }
                placeholder="Enter session title"
                maxLength={100}
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
              />

              <div className="mt-4 flex gap-3">
                <button
                  onClick={createSession}
                  disabled={creatingSession}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingSession ? "Creating..." : "Create"}
                </button>

                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setSessionTitle("");
                    setError("");
                  }}
                  disabled={creatingSession}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Your Sessions
          </h3>

          {sessionsLoading ? (
            <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
              <p className="mt-3 text-sm text-gray-500">
                Loading sessions...
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-2xl">
                📚
              </div>

              <h4 className="mt-4 text-lg font-semibold text-gray-900">
                No research sessions yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Create your first research session and start adding sources to explore them with AI.
              </p>

              <button
                type="button"
                onClick={()=>{
                  setError("");
                  setShowCreateForm(true);
                }}
                className="mt-5 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Create your first session
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => router.push(`/session/${session.id}`)}
                  className="cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-900">
                          {session.title}
                        </h4>

                        <p className="mt-2 text-sm text-gray-500">
                          Created{" "}
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(event) => {
                        event.stopPropagation();
                        deleteSession(session.id);
                        }}
                        disabled={deletingSessionId === session.id}
                        className="shrink-0 text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingSessionId === session.id
                        ? "Deleting..."
                        : "Delete"}
                      </button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}