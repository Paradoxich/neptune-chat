"use client";

import { useEffect, useState, useRef } from "react";
import type { ChoicePrompt, FileSnippet } from "./types";
import { BLOCK_TITLES, ACTION_LABELS } from "./constants";


/* ---------- FILE BLOCK ---------- */

interface FileBlockProps {
  label: string;
  code: string;

  // Action buttons
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  showActions?: boolean;
  approved?: boolean;
  pulse?: boolean;
}

// Simple file icon SVG
const FileIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: 6, flexShrink: 0 }}
  >
    <path
      d="M3.5 1.75C3.5 1.33579 3.83579 1 4.25 1H8.75L11.5 3.75V12.25C11.5 12.6642 11.1642 13 10.75 13H4.25C3.83579 13 3.5 12.6642 3.5 12.25V1.75Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M8.75 1V3.75H11.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function FileBlock({
  label,
  code,
  primaryActionLabel,
  secondaryActionLabel,
  showActions,
  approved,
  pulse,
}: FileBlockProps) {
  const hasActions =
    !!showActions && !!primaryActionLabel && !!secondaryActionLabel;

  const [justApproved, setJustApproved] = useState(false);
  const [hideButtons, setHideButtons] = useState(false);

  useEffect(() => {
    if (approved && showActions) {
      // Trigger animation
      setJustApproved(true);
      // Hide buttons after animation completes
      const hideTimer = window.setTimeout(() => setHideButtons(true), 300);
      const resetTimer = window.setTimeout(() => setJustApproved(false), 250);
      return () => {
        window.clearTimeout(hideTimer);
        window.clearTimeout(resetTimer);
      };
    }
  }, [approved, showActions]);

  const isApproved = !!approved;
  const showButtons = hasActions && !hideButtons;

  return (
    <div
      style={{
        flex: 0,
        alignSelf: "flex-start",
        maxWidth: "100%",
        borderRadius: 8,
        border: isApproved ? "1px solid #273443" : "1px solid #273443",
        background: isApproved ? "#060A0F" : "#10161D",
        padding: 0,
        fontSize: 12,
        color: isApproved ? "#415266" : "#B1BDC8",
        animation: pulse ? "neptune-pulse-border 2s ease-in-out infinite" : undefined,
        transition: "border 400ms ease-out, background 400ms ease-out, color 400ms ease-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: "8px 8px",
          display: "flex",
          alignItems: "center",
          transition: "color 400ms ease-out",
        }}
      >
        <FileIcon />
        {label}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: "#273443",
        }}
      />

      {/* Code body */}
      <pre
        style={{
          margin: 0,
          padding: "8px 10px",
          fontSize: 11,
          lineHeight: 1.5,
          color: "#B1BDC8",
          whiteSpace: "pre-wrap",
        }}
      >
        {code}
      </pre>

      {/* Action buttons */}
      {showButtons && (
        <div
          style={{
            display: "flex",
            gap: 8,
            margin: 8,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            style={{
              borderRadius: 6,
              padding: "4px 10px",
              background: "transparent",
              fontSize: 11,
              fontWeight: 400,
              color: "#B1BDC8",
              cursor: "default",
            }}
          >
            {secondaryActionLabel}
          </button>
          <button
            type="button"
            className={justApproved ? "button-press" : ""}
            style={{
              borderRadius: 6,
              padding: "4px 10px",
              border: "1px solid rgba(59,130,246,0.7)",
              background: "rgba(37,99,235,0.22)",
              fontSize: 11,
              fontWeight: 500,
              color: "#f0f0f0",
              cursor: "default",
            }}
          >
            {primaryActionLabel}
          </button>
        </div>
      )}

      {/* Button press animation - used by FileBlock and CommandBlock */}
      <style jsx global>{`
        @keyframes button-press {
          0% {
            transform: scale(1);
            opacity: 1;
            filter: brightness(1);
          }
          40% {
            transform: scale(0.88);
            opacity: 0.7;
            filter: brightness(1.3);
          }
          100% {
            transform: scale(1);
            opacity: 1;
            filter: brightness(1);
          }
        }

        .button-press {
          animation: button-press 250ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

/* ---------- CLI BLOCK ---------- */

interface CliBlockProps {
  label: string;
  code: string;
}

export function CliBlock({ label, code }: CliBlockProps) {
  return (
    <div
      style={{
        flex: 0,
        alignSelf: "flex-start",
        maxWidth: "100%",
        borderRadius: 8,
        border: "1px solid #273443",
        background: "#060A0F",
        padding: 0,
        fontSize: 12,
        color: "#415266",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: "8px 8px",
        }}
      >
        {label}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          backgroundColor: "#273443",
        }}
      />

      {/* Code body */}
      <pre
        style={{
          margin: 0,
          padding: "8px 10px",
          fontSize: 11,
          lineHeight: 1.5,
          color: "#B1BDC8",
          whiteSpace: "pre-wrap",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

/* ---- RUN COMMAND BLOCK ---- */

interface CommandBlockProps {
  choice: ChoicePrompt;
  snippet: FileSnippet;
  pulse?: boolean;
}

export function CommandBlock({
  choice,
  snippet,
  pulse,
}: CommandBlockProps) {
  const [justApproved, setJustApproved] = useState(false);
  const [hideButtons, setHideButtons] = useState(false);
  const prevApprovedRef = useRef(false);

  useEffect(() => {
    const wasApproved = prevApprovedRef.current;
    const isApproved = !!choice.approved;
    
    // Reset button visibility when going back to pending
    if (wasApproved && !isApproved) {
      setHideButtons(false);
      setJustApproved(false);
    }
    
    // Only trigger animation when approval changes from false to true
    if (!wasApproved && isApproved) {
      // Trigger animation
      setJustApproved(true);
      // Hide buttons after animation completes
      const hideTimer = window.setTimeout(() => setHideButtons(true), 300);
      const resetTimer = window.setTimeout(() => setJustApproved(false), 250);
      
      prevApprovedRef.current = true;
      
      return () => {
        window.clearTimeout(hideTimer);
        window.clearTimeout(resetTimer);
      };
    }
    
    prevApprovedRef.current = isApproved;
  }, [choice.approved, choice]);

  const isApproved = !!choice.approved;
  const showButtons = !hideButtons;

  return (
    <div
      style={{
        flex: 0,
        alignSelf: "flex-start",
        maxWidth: "100%",
        borderRadius: 8,
        border: isApproved ? "1px solid #273443" : "1px solid #273443",
        background: isApproved ? "#060A0F" : "#10161D",
        padding: 0,
        fontSize: 12,
        color: isApproved ? "#415266" : "#B1BDC8",
        animation: pulse ? "neptune-pulse-border 2s ease-in-out infinite" : undefined,
        transition: "border 400ms ease-out, background 400ms ease-out, color 400ms ease-out",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: "8px 8px",
          transition: "color 400ms ease-out",
        }}
      >
        {BLOCK_TITLES.RUN_COMMAND}
      </div>

      <div
        style={{
          height: 1,
          backgroundColor: "#273443",
        }}
      />

      <pre
        style={{
          margin: 0,
          padding: 8,
          fontSize: 11,
          lineHeight: 1.5,
          color: "#b1bdc8",
          whiteSpace: "pre-wrap",
        }}
      >
        {snippet.code}
      </pre>

      {showButtons && (
        <div
          style={{
            display: "flex",
            gap: 8,
            margin: 8,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            style={{
              borderRadius: 6,
              padding: "4px 10px",
              background: "transparent",
              fontSize: 11,
              fontWeight: 400,
              color: "#B1BDC8",
              cursor: "default",
            }}
          >
            {ACTION_LABELS.SKIP}
          </button>
          <button
            type="button"
            className={justApproved ? "button-press" : ""}
            style={{
              borderRadius: 6,
              padding: "4px 10px",
              border: "1px solid rgba(59,130,246,0.7)",
              background: "rgba(37,99,235,0.22)",
              fontSize: 11,
              fontWeight: 500,
              color: "#f0f0f0",
              cursor: "default",
            }}
          >
            {ACTION_LABELS.RUN}
          </button>
        </div>
      )}

      {hideButtons && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 4,
            margin: "8px 12px 8px 8px",
            paddingTop: 4,
            color: "#415266",
          }}
        >
          <svg
            width="10"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M11.6667 3.5L5.25 9.91667L2.33334 7"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: 11,
              fontWeight: 400,
            }}
          >
            Success
          </span>
        </div>
      )}
    </div>
  );
}

/* ---- DEPLOY LOGS BLOCK ---- */

interface DeployLogsBlockProps {
  logs: string;
}

export function DeployLogsBlock({ logs }: DeployLogsBlockProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const scrollContainerRef = useRef<HTMLPreElement>(null);
  const lines = logs.split("\n");

  useEffect(() => {
    // Reset when logs change
    setVisibleLines(0);

    if (!logs || lines.length === 0) return;

    // Show lines one by one with a delay
    const timers: number[] = [];
    lines.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setVisibleLines(index + 1);
      }, index * 80); // 80ms between each line
      timers.push(timer);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs]);

  // Auto-scroll to bottom as new lines appear
  useEffect(() => {
    if (scrollContainerRef.current && visibleLines > 0) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  const visibleContent = lines.slice(0, visibleLines).join("\n");

  return (
    <div
      style={{
        flex: 0,
        alignSelf: "stretch",
        maxWidth: "100%",
        borderRadius: 8,
        border: "1px solid #273443",
        background: "#060A0F",
        padding: 0,
        fontSize: 12,
        color: "#415266",
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: "8px 8px",
        }}
      >
        {BLOCK_TITLES.DEPLOYMENT_LOGS}
      </div>

      <div
        style={{
          height: 1,
          backgroundColor: "#273443",
        }}
      />

      <pre
        ref={scrollContainerRef}
        className="deploy-logs-scroll"
        style={{
          margin: 2,
          padding: 12,
          fontSize: 11,
          lineHeight: 1.95,
          color: "#415266",
          whiteSpace: "pre-wrap",
          maxHeight: 140,
          overflowY: "auto",
        }}
      >
        {visibleContent}
      </pre>
      <style jsx global>{`
        .deploy-logs-scroll::-webkit-scrollbar {
          display: none;
        }
        .deploy-logs-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
