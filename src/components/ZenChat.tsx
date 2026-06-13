"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { sendChatMessage } from "@/lib/api";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ZenChatProps {
  exam: string;
}

const starterPrompts = [
  "I'm feeling extremely overwhelmed by my syllabus.",
  "My mock test scores are making me doubt myself.",
  "I can't sleep because of exam thoughts.",
  "My parents are keeping high expectations of me.",
] as const;

function ZenChat({ exam }: ZenChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: `Hello! I'm **Asha**, your mental wellness companion. I know that preparing for high-stakes milestones like the **${exam}** can feel incredibly heavy, stressful, and sometimes lonely. 

I am here to listen without judgment. You can talk to me about self-doubt, family expectations, burnout, or anything else. How are you holding up today?`,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    try {
      const data = await sendChatMessage(newMessages, exam);
      setMessages((prev) => [...prev, { role: "model", content: data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "I'm having a slight trouble connecting to my servers right now, but please take a slow breath. Remember that your score does not define your worth. I'm right here if you want to write again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, exam, loading]);

  const formatMessage = useCallback((content: string) => {
    return content.split("\n").map((line, idx) => {
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const isListItem = line.trim().startsWith("*");
      if (isListItem) {
        formattedLine = line.trim().substring(1).trim();
      }
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(formattedLine)) !== null) {
        if (match.index > lastIndex) {
          elements.push(formattedLine.substring(lastIndex, match.index));
        }
        elements.push(<strong key={match.index} style={{ color: "var(--secondary)" }}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < formattedLine.length) {
        elements.push(formattedLine.substring(lastIndex));
      }
      if (isListItem) {
        return (
          <li key={idx} style={{ marginLeft: "20px", marginBottom: "6px", listStyleType: "disc" }}>
            {elements.length > 0 ? elements : formattedLine}
          </li>
        );
      }
      return (
        <p key={idx} style={{ marginBottom: line.trim() ? "10px" : "16px", minHeight: "1px" }}>
          {elements.length > 0 ? elements : formattedLine}
        </p>
      );
    });
  }, []);

  return (
    <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "550px", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px", marginBottom: "16px" }}>
        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "radial-gradient(circle, var(--accent) 0%, var(--primary) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 0 10px var(--primary-glow)" }}>
          👩‍⚕️
        </div>
        <div>
          <h3 style={{ fontSize: "16px" }}>Asha</h3>
          <span style={{ fontSize: "11px", color: "var(--stress-low)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "6px", height: "6px", background: "var(--stress-low)", borderRadius: "50%" }} /> Always Available Companion
          </span>
        </div>
      </div>

      <div ref={chatLogRef} role="log" aria-label="Chat messages" aria-live="polite" style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column" }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role === "user" ? "message-user" : "message-bot"}`}>
            <div className="chat-bubble">
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message message-bot" role="status" aria-label="Asha is typing a response">
            <div className="chat-bubble" style={{ display: "flex", gap: "6px", padding: "12px 16px" }}>
              <span className="dot-blink" style={{ width: "8px", height: "8px", background: "var(--text-muted)", borderRadius: "50%" }} />
              <span className="dot-blink" style={{ width: "8px", height: "8px", background: "var(--text-muted)", borderRadius: "50%", animationDelay: "0.2s" }} />
              <span className="dot-blink" style={{ width: "8px", height: "8px", background: "var(--text-muted)", borderRadius: "50%", animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && !loading && (
        <div style={{ margin: "12px 0 6px 0" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Common student situations:</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {starterPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="starter-btn"
                aria-label={`Send: ${p}`}
                style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "16px", padding: "6px 12px", fontSize: "12px",
                  color: "var(--text-secondary)", cursor: "pointer", transition: "var(--transition-smooth)"
                }}
              >
                💬 {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px", marginTop: "12px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          className="glass-input"
          placeholder="Share your concerns with Asha..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              handleSend(inputValue);
            }
          }}
          disabled={loading}
          aria-label="Type your message"
          style={{ fontSize: "14px", padding: "12px 14px" }}
        />
        <button
          className="premium-btn"
          onClick={() => handleSend(inputValue)}
          disabled={loading || !inputValue.trim()}
          aria-label="Send message"
          style={{ padding: "0 20px", borderRadius: "12px" }}
        >
          Send
        </button>
      </div>

      <style jsx global>{`
        @keyframes dotBlink {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .dot-blink { animation: dotBlink 1s infinite ease-in-out; }
        .starter-btn:hover {
          background: rgba(138, 153, 230, 0.08) !important;
          border-color: rgba(138, 153, 230, 0.2) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}

export default memo(ZenChat);
