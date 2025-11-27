// Type definitions for Neptune Hero animation

export type StepId = "describe" | "review" | "deploy";
export type Sender = "user" | "neptune";

/* ---------- Chat / cards / snippets types ---------- */

export interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
  typingDurationMs?: number;
}

export interface FileSnippet {
  filename: string;
  language: "json" | "bash" | "text";
  code: string;
}

export interface ChoicePrompt {
  question: string;
  choices: string[];
  selectedIndex: number;
  approved?: boolean;
}

export interface AnimationState {
  step: StepId;
  durationMs: number;

  chat: ChatMessage[];

  statusLabel?: string;
  logs: string[];

  configSnippet?: FileSnippet;
  configSnippetPulsing?: boolean;
  configSnippetShowActions?: boolean;
  configSnippetApproved?: boolean;
  generateSpecCliResponse?: FileSnippet;
  commandChoice?: ChoicePrompt;
  commandSnippet?: FileSnippet;
  commandPulsing?: boolean;
  deployLogsText?: string;
  deployFinalCliResponse?: FileSnippet;

  inputText: string;
  typingDurationMs?: number;
}

/* ---------- Steps meta ---------- */

export interface StepMeta {
  id: StepId;
  label: string;
  description: string;
}

