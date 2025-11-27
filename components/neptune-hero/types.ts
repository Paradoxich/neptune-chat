// Type definitions for Neptune Hero animation

export type StepId = "describe" | "review" | "deploy";
export type Sender = "user" | "neptune";

/* ---------- Basic types ---------- */

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

/* ---------- Chat item types ---------- */

export interface ChatMessageItem {
  type: "message";
  id: string;
  sender: Sender;
  text: string;
  typingDurationMs?: number;
}

export interface StatusItem {
  type: "status";
  id: string;
  label: string;
}

export interface CommandBlockItem {
  type: "commandBlock";
  id: string;
  snippet: FileSnippet;
  question: string;
  choices: string[];
  selectedIndex: number;
  approved: boolean;
  pulse?: boolean;
}

export interface FileBlockItem {
  type: "fileBlock";
  id: string;
  snippet: FileSnippet;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  showActions: boolean;
  approved: boolean;
  pulse?: boolean;
}

export interface CliBlockItem {
  type: "cliBlock";
  id: string;
  snippet: FileSnippet;
}

export interface LogsBlockItem {
  type: "logsBlock";
  id: string;
  text: string;
  title: string;
}

export type ChatItem =
  | ChatMessageItem
  | StatusItem
  | CommandBlockItem
  | FileBlockItem
  | CliBlockItem
  | LogsBlockItem;

/* ---------- Animation state ---------- */

export interface AnimationState {
  step: StepId;
  durationMs: number;
  items: ChatItem[];
  inputText: string;
  typingDurationMs?: number;
}
