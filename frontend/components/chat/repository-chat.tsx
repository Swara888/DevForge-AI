"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";

import {
  createChatSession,
  getChatSession,
  listRepositorySessions,
  sendChatMessage,
} from "@/lib/chat-api";

interface RepositoryChatProps {
  repositoryId: string;
  token: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages?: ChatMessage[];
}

export default function RepositoryChat({
  repositoryId,
  token,
}: RepositoryChatProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setInitializing(true);
        setError("");

        const response = await listRepositorySessions(
          repositoryId,
          token,
        );

        const loadedSessions = response.data.sessions ?? [];

        setSessions(loadedSessions);

        if (loadedSessions.length > 0) {
          const firstSession = loadedSessions[0];

          setSessionId(firstSession.id);

          const sessionResponse = await getChatSession(
            firstSession.id,
            token,
          );

          setMessages(
            sessionResponse.data.session.messages ?? [],
          );
        } else {
          const sessionResponse = await createChatSession(
            repositoryId,
            token,
            "Repository Chat",
          );

          const newSession = sessionResponse.data.session;

          setSessions([newSession]);
          setSessionId(newSession.id);
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to load chat:", err);

        setError(
          "Failed to load repository chat.",
        );
      } finally {
        setInitializing(false);
      }
    };

    loadSessions();
  }, [repositoryId, token]);

  const selectSession = async (id: string) => {
    try {
      setError("");
      setSessionId(id);

      const response = await getChatSession(
        id,
        token,
      );

      setMessages(
        response.data.session.messages ?? [],
      );
    } catch (err) {
      console.error(
        "Failed to load chat session:",
        err,
      );

      setError("Failed to load chat session.");
    }
  };

  const handleNewSession = async () => {
    try {
      setError("");

      const response = await createChatSession(
        repositoryId,
        token,
        "New Chat",
      );

      const newSession = response.data.session;

      setSessions((previous) => [
        newSession,
        ...previous,
      ]);

      setSessionId(newSession.id);
      setMessages([]);
    } catch (err) {
      console.error(
        "Failed to create chat session:",
        err,
      );

      setError("Failed to create a new chat.");
    }
  };

  const handleSend = async () => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || loading || !sessionId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      setMessages((previous) => [
        ...previous,
        {
          id: `temp-user-${Date.now()}`,
          role: "user",
          content: cleanQuestion,
        },
      ]);

      setQuestion("");

      const response = await sendChatMessage(
        sessionId,
        token,
        cleanQuestion,
      );

      setMessages((previous) => [
        ...previous,
        response.data.message,
      ]);
    } catch (err) {
      console.error(
        "Failed to send chat message:",
        err,
      );

      setError(
        "Failed to get an answer. Please try again.",
      );

      setMessages((previous) =>
        previous.filter(
          (message) =>
            !message.id.startsWith("temp-user-"),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading repository chat...
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sessions */}
      <aside className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">
            Chat Sessions
          </h2>

          <button
            type="button"
            onClick={handleNewSession}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            New
          </button>
        </div>

        <div className="space-y-2">
          {sessions.length === 0 ? (
            <p className="text-xs text-slate-500">
              No chat sessions.
            </p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() =>
                  selectSession(session.id)
                }
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  session.id === sessionId
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="truncate">
                  {session.title || "New Chat"}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Chat */}
      <section className="flex min-h-[600px] flex-col rounded-xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/15 text-blue-400">
              <MessageSquare size={20} />
            </div>

            <div>
              <h1 className="text-xl font-semibold">
                Code Chat
              </h1>

              <p className="text-sm text-slate-400">
                Ask questions about your repository.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-5 mt-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <MessageSquare
                  size={32}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-3 text-sm text-slate-400">
                  Ask anything about your codebase.
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  For example: &quot;Explain the authentication flow&quot;
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isUser =
                message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-3 ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="mb-1 text-xs font-medium opacity-60">
                      {isUser
                        ? "You"
                        : "DevForge AI"}
                    </div>

                    <div className="whitespace-pre-wrap text-sm leading-7">
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-5">
          <div className="flex gap-3">
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask something about your code..."
              rows={3}
              disabled={loading}
              className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-50"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={
                loading || !question.trim()
              }
              className="self-end inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Send size={16} />
              )}

              {loading ? "Thinking..." : "Send"}
            </button>
          </div>

          <p className="mt-2 text-xs text-slate-600">
            Press Enter to send. Shift + Enter for a new
            line.
          </p>
        </div>
      </section>
    </div>
  );
}