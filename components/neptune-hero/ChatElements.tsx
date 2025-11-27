"use client";

import { useEffect, useState } from "react";
import {
  FileBlock,
  CliBlock,
  CommandBlock,
  DeployLogsBlock,
} from "./ChatCodeBlocks";

import type { AnimationState, StepId, ChatMessage } from "./types";
import { STATUS_MESSAGES, PLACEHOLDER_TEXT, ACTION_LABELS } from "./constants";

/* ---------- Message text with line-by-line animation ---------- */

interface MessageTextProps {
  message: ChatMessage;
  isUser: boolean;
}

function MessageText({ message, isUser }: MessageTextProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = message.text.split("\n");
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
  }, [message.id, message.text, shouldAnimateLines]);

  if (!shouldAnimateLines) {
    return <>{message.text}</>;
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

/* Determines which message should show the logs/thinking block */
function getLogsAnchorIdForStep(step: StepId, logs: string[]): string | null {
  switch (step) {
    case "describe":
      return "neptune-greeting";
    case "review":
      // Show neptune.json generation status below CLI response
      if (logs.includes("GENERATING_NEPTUNE_JSON")) {
        return "neptune-generating-json";
      }
      // Show analyze statuses below command
      return "neptune-analyzing";
    case "deploy":
      // Show deployment progress statuses below command after approval
      if (logs.includes("DEPLOY_RUNNING") || logs.includes("DEPLOY_LOGS")) {
        return "neptune-deploying";
      }
      // Show preparation statuses above command before approval
      return "neptune-deploy-prep";
    default:
      return null;
  }
}

/* ---------- ANALYZE thinking status ---------- */
function getAnalyzeStatus(
  logs: string[],
  fallbackStatus?: string
): { main: string; sub?: string } | null {
  if (!logs.length) {
    if (!fallbackStatus) return null;
    return { main: fallbackStatus };
  }

  const last = logs[logs.length - 1];

  if (last === "ANALYZE_START") {
    return { main: STATUS_MESSAGES.ANALYSING_PROJECT };
  }

  if (last === "ANALYZE_GENERATING_SPEC") {
    return { main: STATUS_MESSAGES.GENERATING_SPEC };
  }

  if (last === "GENERATING_NEPTUNE_JSON") {
    return { main: "Generating neptune.json…" };
  }

  return fallbackStatus ? { main: fallbackStatus } : null;
}

/* ---------- DEPLOY status ---------- */
function getDeployStatus(
  logs: string[],
  fallbackStatus?: string
): { main: string; sub?: string } | null {
  if (!logs.length) {
    if (!fallbackStatus) return null;
    return { main: fallbackStatus };
  }

  const last = logs[logs.length - 1];

  if (last === "DEPLOY_GENERATING_CMD") {
    return { main: STATUS_MESSAGES.GENERATING_DEPLOY_CMD };
  }

  if (last === "DEPLOY_RUNNING") {
    return { main: STATUS_MESSAGES.DEPLOYING_TO_NEPTUNE };
  }

  if (last === "DEPLOY_LOGS") {
    return { main: STATUS_MESSAGES.GENERATING_LOGS };
  }

  return fallbackStatus ? { main: fallbackStatus } : null;
}

export function ChatElements({ state }: ChatElementsProps) {
  const logsAnchorId = getLogsAnchorIdForStep(state.step, state.logs);

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

  const isDeployStep = state.step === "deploy";

  const analyzeStatus =
    state.step === "review"
      ? getAnalyzeStatus(state.logs, state.statusLabel)
      : null;

  const deployStatus =
    state.step === "deploy"
      ? getDeployStatus(state.logs, state.statusLabel)
      : null;

  const hasFinalDeployMessage = state.chat.some(
    (m) => m.id === "neptune-done"
  );

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
          {state.chat.map((msg, idx) => {
            const isUser = msg.sender === "user";
            const isLast = idx === state.chat.length - 1;

            const showGenerateCommand =
              msg.id === "neptune-generate-command" &&
              state.commandChoice != null &&
              state.commandSnippet != null;

            const showGenerateCliResponse =
              msg.id === "neptune-generate-success" &&
              state.generateSpecCliResponse != null;

            const showConfigSnippet =
              msg.id === "neptune-json-created" &&
              state.configSnippet != null;

            const showDeployCommand =
              msg.id === "neptune-deploy-command" &&
              state.commandChoice != null &&
              state.commandSnippet != null;

            const showStatusMessage =
              !!state.statusLabel &&
              ((state.step === "describe" && msg.id === "neptune-greeting") ||
               (state.step === "review" && msg.id === "neptune-generate-command") ||
               (isDeployStep && msg.id === "neptune-deploy-prep"));

            const showLogsAnalyze =
              state.step === "review" &&
              !!analyzeStatus?.main &&
              !!logsAnchorId &&
              msg.id === logsAnchorId;

            const showDeployThinking =
              isDeployStep &&
              !!logsAnchorId &&
              msg.id === logsAnchorId &&
              !!deployStatus?.main &&
              !hasFinalDeployMessage;

            const showDeployLogs =
              msg.id === "neptune-deploy-logs" &&
              state.deployLogsText != null;

            const showDeployCliResponse =
              msg.id === "neptune-deploy-cli-response" &&
              state.deployFinalCliResponse != null;

            return (
              <div
                key={msg.id}
                className={
                  "chat-message" + (isLast ? " chat-message--enter" : "")
                }
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                {/* Text message */}
                {msg.text && (
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
                      <MessageText message={msg} isUser={isUser} />
                    </div>
                  </div>
                )}

                {/* Status message with shiny animation */}
                {showStatusMessage && state.statusLabel && (
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
                        color: "#B1BDC8",
                      }}
                    >
                      {state.statusLabel}
                    </div>
                  </div>
                )}

                {/* ANALYZE: shiny status cycling (no log box) */}
                {showLogsAnalyze && (
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
                    {analyzeStatus?.main && (
                      <div
                        className="shiny-text"
                        style={{
                          fontSize: 13,
                          lineHeight: "150%",
                          color: "#B1BDC8",
                        }}
                      >
                        {analyzeStatus.main}
                      </div>
                    )}
                    {analyzeStatus?.sub && (
                      <div
                        style={{
                          fontSize: 12,
                          lineHeight: "150%",
                          color: "#6B7280",
                        }}
                      >
                        {analyzeStatus.sub}
                      </div>
                    )}
                  </div>
                )}

                {/* REVIEW: Generate spec command block */}
                {showGenerateCommand &&
                  state.commandChoice &&
                  state.commandSnippet && (
                    <div
                      style={{
                        width: "100%",
                        alignSelf: "stretch",
                        marginTop: 8,
                      }}
                    >
                      <CommandBlock
                        choice={state.commandChoice}
                        snippet={state.commandSnippet}
                        pulse={state.commandPulsing}
                      />
                    </div>
                  )}

                {/* REVIEW: Generate spec CLI response */}
                {showGenerateCliResponse && state.generateSpecCliResponse && (
                  <div
                    style={{
                      width: "100%",
                      alignSelf: "stretch",
                      marginTop: 8,
                    }}
                  >
                    <CliBlock
                      label={state.generateSpecCliResponse.filename}
                      code={state.generateSpecCliResponse.code}
                    />
                  </div>
                )}

                {/* REVIEW: neptune.json card with approve/decline actions */}
                {showConfigSnippet && state.configSnippet && (
                  <div
                    style={{
                      width: "100%",
                      alignSelf: "stretch",
                      marginTop: 8,
                    }}
                  >
                    <FileBlock
                      label={state.configSnippet.filename}
                      code={state.configSnippet.code}
                      primaryActionLabel={ACTION_LABELS.APPROVE}
                      secondaryActionLabel={ACTION_LABELS.DECLINE}
                      showActions={state.configSnippetShowActions ?? false}
                      approved={state.configSnippetApproved ?? false}
                      pulse={state.configSnippetPulsing}
                    />
                  </div>
                )}

                {/* DEPLOY: command card */}
                {showDeployCommand &&
                  state.commandChoice &&
                  state.commandSnippet && (
                    <div
                      style={{
                        width: "100%",
                        alignSelf: "stretch",
                      }}
                    >
                      <CommandBlock
                        choice={state.commandChoice}
                        snippet={state.commandSnippet}
                        pulse={state.commandPulsing}
                      />
                  </div>
                )}

                {/* DEPLOY: shiny thinking status (no CLI log box) */}
                {showDeployThinking && (
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
                        color: "#B1BDC8",
                      }}
                    >
                      {deployStatus!.main}
                    </div>
                  </div>
                )}

                {/* DEPLOY: deploy logs block */}
                {showDeployLogs && state.deployLogsText && (
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
                    <DeployLogsBlock logs={state.deployLogsText} />
                  </div>
                )}

                {/* DEPLOY: final CLI response */}
                {showDeployCliResponse && state.deployFinalCliResponse && (
                  <div
                    style={{
                      width: "100%",
                      alignSelf: "stretch",
                      marginTop: 8,
                    }}
                  >
                    <CliBlock
                      label={state.deployFinalCliResponse.filename}
                      code={state.deployFinalCliResponse.code}
                    />
                  </div>
                )}
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

      {/* LOCAL STYLES: entrance anim + caret + shiny text */}
      <style jsx>{`
        .chat-message {
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

        .chat-message--enter {
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
          position: relative;
          display: inline-block;
          background-image: linear-gradient(120deg, #10161D, #b1bdc8, #10161D);
          background-size: 200% auto;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shiny-text-slide 1.7s linear infinite;
        }

        @keyframes shiny-text-slide {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: 0% 0;
          }
        }
      `}</style>
    </>
  );
}
