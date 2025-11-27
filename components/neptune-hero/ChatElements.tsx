"use client";

import { useEffect, useState } from "react";
import {
  FileBlock,
  CliBlock,
  CommandBlock,
  DeployLogsBlock,
} from "./ChatCodeBlocks";

import type { AnimationState, ChatItem } from "./types";
import { PLACEHOLDER_TEXT } from "./constants";

/* ---------- Message text with line-by-line animation ---------- */

interface MessageTextProps {
  text: string;
  isUser: boolean;
  itemId: string;
}

function MessageText({ text, isUser, itemId }: MessageTextProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = text.split("\n");
  const hasMultipleLines = lines.length > 1;
  const shouldAnimateLines = !isUser && hasMultipleLines;

  useEffect(() => {
    if (!shouldAnimateLines) {
      setVisibleLines(lines.length);
      return;
    }

    // Start with 0 lines visible
    setVisibleLines(0);

    // Show lines one by one with a delay
    const timers: number[] = [];
    lines.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setVisibleLines(index + 1);
      }, index * 150); // 150ms between each line
      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, text, shouldAnimateLines]);

  if (!shouldAnimateLines) {
    return <>{text}</>;
  }

  return (
    <>
      {lines.map((line, index) => (
        <span
          key={index}
          style={{
            opacity: index < visibleLines ? 1 : 0,
            transition: "opacity 200ms ease-in",
            display: index === 0 ? "inline" : "block",
          }}
        >
          {line}
        </span>
      ))}
    </>
  );
}

interface ChatElementsProps {
  state: AnimationState;
}

export function ChatElements({ state }: ChatElementsProps) {
  const placeholderText = PLACEHOLDER_TEXT.INPUT;

  const isUserTypingSource = !!state.inputText && state.inputText.length > 0;

  const [typedInput, setTypedInput] = useState("");

  useEffect(() => {
    const target = state.inputText || "";

    if (!target.length) {
      setTypedInput("");
      return;
    }

    let i = 0;
    const TOTAL_DURATION = state.typingDurationMs ?? 400;
    const intervalMs = Math.max(TOTAL_DURATION / target.length, 10);

    const interval = window.setInterval(() => {
      i++;
      setTypedInput(target.slice(0, i));

      if (i >= target.length) {
        window.clearInterval(interval);
      }
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [state.inputText, state.typingDurationMs]);

  const isUserTyping = isUserTypingSource;
  const displayText = isUserTyping ? typedInput : placeholderText;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 24,
          borderRadius: 16,
          background: "#060A0F",
          border: "1px solid #273443",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily:
            '"Switzer Variable", system-ui, -apple-system, sans-serif',
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#415266",
            borderBottom: "1px solid #111827",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "999px",
                backgroundColor: "#111827",
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "999px",
                backgroundColor: "#111827",
              }}
            />
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "999px",
                backgroundColor: "#111827",
              }}
            />
          </div>
          <span>Agent</span>
          <span />
        </div>

        {/* MAIN CONTENT */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 12,
            overflow: "hidden",
            padding: "20px",
          }}
        >
          {state.items.map((item, idx) => {
            const isLast = idx === state.items.length - 1;

            return (
              <div
                key={item.id}
                className={"chat-item" + (isLast ? " chat-item--enter" : "")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {renderChatItem(item)}
              </div>
            );
          })}
        </div>

        {/* INPUT BAR */}
        <div
          style={{
            padding: "16px",
          }}
        >
          <div
            style={{
              borderRadius: 8,
              border: "1px solid #273443",
              background: "#10161D",
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#6B7280",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                gap: 2,
              }}
            >
              {!isUserTyping && (
                <>
                  <span className="typing-caret" />
                  <span
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    {displayText}
                  </span>
                </>
              )}

              {isUserTyping && (
                <>
                  <span
                    style={{
                      color: "#f0f0f0",
                    }}
                  >
                    {displayText}
                  </span>
                  <span className="typing-caret" />
                </>
              )}
            </div>

            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "999px",
                border: "1px solid rgb(51, 70, 91)",
                display: "flex",
                color: "#b1bdc8",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
              }}
            >
              ↑
            </div>
          </div>
        </div>
      </div>

      {/* GLOBAL STYLES: shiny text */}
      <style jsx global>{`
        .shiny-text {
          background: linear-gradient(
            90deg,
            #10161D 0%,
            #415266 30%,
            
            #FFFFFF 50%,
            #9CA3AF 70%,
           
            #10161D 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3.5s linear infinite;
          will-change: background-position;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
      `}</style>

      {/* LOCAL STYLES: entrance anim + caret */}
      <style jsx>{`
        .chat-item {
          transform: translateY(0);
          opacity: 1;
        }

        @keyframes chat-fade-up {
          from {
            transform: translateY(8px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .chat-item--enter {
          animation: chat-fade-up 260ms ease-out;
        }

        .typing-caret {
          display: inline-block;
          width: 1px;
          height: 1em;
          background: #ffffff;
          animation: caret-blink 1.3s ease-in-out infinite;
        }

        @keyframes caret-blink {
          0%,
          40% {
            opacity: 1;
          }
          60% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes neptune-pulse-border {
          0% {
            border-color: #273443;
            box-shadow: 0 0 0 0 rgba(43, 101, 236, 0);
          }
          50% {
            border-color: #384A60;
            box-shadow: 0 0 0 3px rgba(51, 79, 112, 0.45);
          }
          100% {
            border-color: #273443;
            box-shadow: 0 0 0 0 rgba(43, 101, 236, 0);
          }
        }

        .shiny-text {
          color: red;
          font-weight: bold;
        }
      `}</style>
    </>
  );
}

/* ---------- Render individual chat items ---------- */

function renderChatItem(item: ChatItem): React.ReactNode {
  switch (item.type) {
    case "message": {
      const isUser = item.sender === "user";
      return (
        <div
          style={{
            display: "flex",
            justifyContent: isUser ? "flex-end" : "flex-start",
          }}
        >
          <div
            style={{
              maxWidth: "100%",
              padding: isUser ? "8px 12px" : undefined,
              borderRadius: 8,
              background: isUser ? "#10161D" : "none",
              color: "#f0f0f0",
              fontSize: 13,
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}
          >
            <MessageText text={item.text} isUser={isUser} itemId={item.id} />
          </div>
        </div>
      );
    }

    case "status": {
      return (
        <div
          style={{
            width: "100%",
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minHeight: 0,
          }}
        >
          <div
            className="shiny-text"
            style={{
              fontSize: 13,
              lineHeight: "150%",
            }}
          >
            {item.label}
          </div>
        </div>
      );
    }

    case "commandBlock": {
      return (
        <div
          style={{
            width: "100%",
            alignSelf: "stretch",
            marginTop: 8,
          }}
        >
          <CommandBlock
            choice={{
              question: item.question,
              choices: item.choices,
              selectedIndex: item.selectedIndex,
              approved: item.approved,
            }}
            snippet={item.snippet}
            pulse={item.pulse}
          />
        </div>
      );
    }

    case "fileBlock": {
      return (
        <div
          style={{
            width: "100%",
            alignSelf: "stretch",
            marginTop: 8,
          }}
        >
          <FileBlock
            label={item.snippet.filename}
            code={item.snippet.code}
            primaryActionLabel={item.primaryActionLabel}
            secondaryActionLabel={item.secondaryActionLabel}
            showActions={item.showActions}
            approved={item.approved}
            pulse={item.pulse}
          />
        </div>
      );
    }

    case "cliBlock": {
      return (
        <div
          style={{
            width: "100%",
            alignSelf: "stretch",
            marginTop: 8,
          }}
        >
          <CliBlock label={item.snippet.filename} code={item.snippet.code} />
        </div>
      );
    }

    case "logsBlock": {
      return (
        <div
          style={{
            width: "100%",
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginTop: 8,
          }}
        >
          <DeployLogsBlock logs={item.text} />
        </div>
      );
    }

    default:
      return null;
  }
}
