import { useState, useEffect, useRef } from "react";
import { Send, Plus, MessageSquare, Trash2 } from "lucide-react";
import aiChatService from "../services/aiChatService";
import ReactMarkdown from "react-markdown";

export default function AIChatPage() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadSessionDetails(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSessions = async () => {
    try {
      const data = await aiChatService.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  const loadSessionDetails = async (id) => {
    try {
      const data = await aiChatService.getSession(id);
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to load session details:", error);
    }
  };

  const createNewSession = async () => {
    try {
      const newSession = await aiChatService.createSession("New Chat");
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const deleteSession = async (e, id) => {
    e.stopPropagation();
    try {
      await aiChatService.deleteSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(sessions.length > 1 ? sessions.find(s => s.id !== id).id : null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      try {
        const newSession = await aiChatService.createSession("New Chat");
        setSessions([newSession, ...sessions]);
        currentSessionId = newSession.id;
        setActiveSessionId(currentSessionId);
      } catch (error) {
        console.error("Failed to create session:", error);
        return;
      }
    }

    const newMessage = { role: "user", content: inputValue };
    setMessages([...messages, newMessage]);
    setInputValue("");
    setLoading(true);

    try {
      const aiMessage = await aiChatService.sendMessage(currentSessionId, newMessage.content);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[var(--cx-bg)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-[var(--cx-border)] bg-[var(--cx-surface)] flex flex-col">
        <div className="p-4 border-b border-[var(--cx-border)]">
          <button
            onClick={createNewSession}
            className="w-full flex items-center justify-center gap-2 cx-btn-primary py-2 text-sm"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                activeSessionId === session.id
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-[var(--cx-text-muted)] hover:bg-[var(--cx-surface-elevated)]"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <MessageSquare size={16} />
                <span className="text-sm truncate">{session.title}</span>
              </div>
              <button
                onClick={(e) => deleteSession(e, session.id)}
                className="opacity-0 hover:opacity-100 transition-opacity text-red-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center mt-20 text-[var(--cx-text-muted)]">
                <div className="mb-4 rounded-full bg-[var(--cx-surface-elevated)] p-4">
                  <MessageSquare className="h-8 w-8 text-primary-400/50" />
                </div>
                <h3 className="text-lg font-medium text-[var(--cx-text)]">
                  How can I help you today?
                </h3>
                <p className="mt-2 text-sm max-w-md">
                  I am your AI Nutrition Coach. Ask me about your diet, ask for meal plans, or tell me to log a meal for you.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === "user"
                        ? "bg-primary-500 text-white"
                        : "bg-[var(--cx-surface-elevated)] text-[var(--cx-text)] border border-[var(--cx-border)]"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none text-sm">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--cx-surface-elevated)] border border-[var(--cx-border)] rounded-2xl px-5 py-3">
                  <div className="flex space-x-1 items-center h-5">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[var(--cx-border)] bg-[var(--cx-surface)]">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message AI Coach..."
              className="w-full bg-[var(--cx-surface-elevated)] border border-[var(--cx-border)] rounded-xl py-3 pl-4 pr-12 text-sm text-[var(--cx-text)] placeholder-[var(--cx-text-muted)] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-primary-400 hover:bg-primary-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
