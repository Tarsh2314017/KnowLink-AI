"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface User {
  name: string;
  email: string;
}

interface Session {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router=useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
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

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setCreatingSession(true);
    setError("");

    try {
      const data = await apiRequest("/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const [userData, sessionData] = await Promise.all([
          apiRequest("/auth/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          apiRequest("/sessions", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setUser(userData.user);
        setSessions(sessionData.sessions);
      } catch (error) {
        console.error("Dashboard error:", error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load dashboard");
        }
      } finally {
        setLoading(false);
        setSessionsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading...</p>
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
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                {user.email}
              </p>
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
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-8">
          <button
            className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
            onClick={() => {
              setError("");
              setShowCreateForm(true);
            }}
          >
            + Create Research Session
          </button>

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
            <p className="text-gray-600">
              Loading sessions...
            </p>
          ) : sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="text-gray-600">
                You don't have any research sessions yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <div
                key={session.id}
                onClick={() => router.push(`/session/${session.id}`)}
                className="cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <h4 className="font-semibold text-gray-900">
                    {session.title}
                  </h4>

                  <p className="mt-2 text-sm text-gray-500">
                    Created{" "}
                    {new Date(
                      session.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}