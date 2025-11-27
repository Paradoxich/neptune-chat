// Animation logic for Neptune hero
// Timeline-based state management and animation hook

import { useEffect, useRef, useState } from "react";
import type {
  StepId,
  Sender,
  FileSnippet,
  ChoicePrompt,
  AnimationState,
  StepMeta,
} from "./types";
import {
  CHAT_MESSAGES,
  STATUS_MESSAGES,
  SNIPPET_TITLES,
  ACTION_LABELS,
  BLOCK_TITLES,
  STEP_META,
  COMMANDS,
  SNIPPETS_CONTENT,
  DEPLOY_LOGS as DEPLOY_LOGS_CONTENT,
} from "./constants";

export const STEPS: StepMeta[] = [
  {
    id: "describe",
    label: STEP_META.DESCRIBE_LABEL,
    description: STEP_META.DESCRIBE_DESCRIPTION,
  },
  {
    id: "review",
    label: STEP_META.REVIEW_LABEL,
    description: STEP_META.REVIEW_DESCRIPTION,
  },
  {
    id: "deploy",
    label: STEP_META.DEPLOY_LABEL,
    description: STEP_META.DEPLOY_DESCRIPTION,
  },
];

/* ---------- Timeline data ---------- */

const fullUserRequest = CHAT_MESSAGES.USER_REQUEST;

// Log markers for status transitions
const ANALYZE_START = "ANALYZE_START";
const ANALYZE_GENERATING_SPEC = "ANALYZE_GENERATING_SPEC";
const GENERATING_NEPTUNE_JSON = "GENERATING_NEPTUNE_JSON";
const DEPLOY_GENERATING_CMD = "DEPLOY_GENERATING_CMD";
const DEPLOY_RUNNING = "DEPLOY_RUNNING";
const DEPLOY_LOGS = "DEPLOY_LOGS";

const generateSpecCommand: FileSnippet = {
  filename: SNIPPET_TITLES.GENERATE_SPEC_COMMAND,
  language: "bash",
  code: COMMANDS.GENERATE_SPEC,
};

const generateSpecCliResponse: FileSnippet = {
  filename: SNIPPET_TITLES.CLI_RESPONSE,
  language: "json",
  code: SNIPPETS_CONTENT.GENERATE_SPEC_CLI_RESPONSE,
};

const configSnippet: FileSnippet = {
  filename: SNIPPET_TITLES.NEPTUNE_JSON,
  language: "json",
  code: SNIPPETS_CONTENT.NEPTUNE_JSON_CONFIG,
};

const deployCommand: FileSnippet = {
  filename: SNIPPET_TITLES.DEPLOY_COMMAND,
  language: "bash",
  code: COMMANDS.DEPLOY,
};

const deployLogsText = DEPLOY_LOGS_CONTENT;

const deployFinalCliResponse: FileSnippet = {
  filename: SNIPPET_TITLES.CLI_RESPONSE,
  language: "json",
  code: SNIPPETS_CONTENT.DEPLOY_FINAL_CLI_RESPONSE,
};

const commandChoicePending: ChoicePrompt = {
  question: BLOCK_TITLES.RUN_COMMAND,
  choices: [ACTION_LABELS.CANCEL, ACTION_LABELS.RUN],
  selectedIndex: 1,
  approved: false,
};

const commandChoiceApproved: ChoicePrompt = {
  ...commandChoicePending,
  approved: true,
};

/* ---------- Timeline events ---------- */

interface TimelineEventBase {
  step: StepId;
  durationMs: number;
}

type TimelineEvent =
  | (TimelineEventBase & {
      type: "addMessage";
      id: string;
      sender: Sender;
      text: string;
      typingDurationMs?: number;
    })
  | (TimelineEventBase & {
      type: "setStatus";
      statusLabel?: string;
    })
  | (TimelineEventBase & {
      type: "appendLogs";
      lines: string[];
    })
  | (TimelineEventBase & {
      type: "setLogs";
      logs: string[];
    })
  | (TimelineEventBase & {
      type: "setConfigSnippet";
      snippet?: FileSnippet;
    })
  | (TimelineEventBase & {
      type: "setConfigSnippetActions";
      showActions?: boolean;
      approved?: boolean;
    })
  | (TimelineEventBase & {
      type: "setCommandChoice";
      choice?: ChoicePrompt;
    })
  | (TimelineEventBase & {
      type: "setCommandSnippet";
      snippet?: FileSnippet;
    })
  | (TimelineEventBase & {
      type: "setGenerateSpecCliResponse";
      snippet?: FileSnippet;
    })
  | (TimelineEventBase & {
      type: "setDeployLogsText";
      text?: string;
    })
  | (TimelineEventBase & {
      type: "setDeployFinalCliResponse";
      snippet?: FileSnippet;
    })
  | (TimelineEventBase & {
      type: "setInputText";
      text: string;
      typingDurationMs?: number;
    })
  | (TimelineEventBase & {
      type: "clearInput";
    });

const TIMELINE: TimelineEvent[] = [
  /* --- STEP 1: USER STARTS DEPLOYMENT --- */
  
  /* User starts typing "deploy this project to Neptune" in the input field */
  {
    type: "setInputText",
    text: fullUserRequest,
    typingDurationMs: 1200,
    step: "describe",
    durationMs: 1600,
  },
  
  /* Input field clears after user "presses enter" */
  {
    type: "clearInput",
    step: "describe",
    durationMs: 300,
  },
  
  /* The moment when the typed text becomes a visible chat message bubble! */
  {
    type: "addMessage",
    id: "user-request",
    sender: "user",
    text: fullUserRequest,
    step: "describe",
    durationMs: 800,
  },
  
  /* Neptune responds with a friendly greeting to acknowledge the request */
  {
    type: "addMessage",
    id: "neptune-greeting",
    sender: "neptune",
    text: CHAT_MESSAGES.AGENT_GREETING,
    typingDurationMs: 600,
    step: "describe",
    durationMs: 1200,
  },
  
  /* Shows "Planning next steps" status while Neptune thinks */
  {
    type: "setStatus",
    statusLabel: STATUS_MESSAGES.PLANNING_NEXT_STEPS,
    step: "describe",
    durationMs: 1000,
  },
  
  /* Clear the planning status before showing the plan */
  {
    type: "setStatus",
    statusLabel: undefined,
    step: "describe",
    durationMs: 400,
  },
  
  /* Neptune presents the 3-step plan for deploying the project */
  {
    type: "addMessage",
    id: "neptune-plan",
    sender: "neptune",
    text: CHAT_MESSAGES.AGENT_PLAN,
    typingDurationMs: 1600,
    step: "describe",
    durationMs: 2000,
  },

  /* --- STEP 2: ANALYSE CODEBASE & GENERATE SPEC --- */
  
  /* Clear status message from previous step */
  {
    type: "setStatus",
    statusLabel: undefined,
    step: "review",
    durationMs: 0,
  },
  
  /* Reset logs array to start fresh for this step */
  {
    type: "setLogs",
    logs: [],
    step: "review",
    durationMs: 0,
  },
  
  /* Add empty message that will show the generate command card */
  {
    type: "addMessage",
    id: "neptune-generate-command",
    sender: "neptune",
    text: "",
    step: "review",
    durationMs: 100,
  },
  
  /* Show "Generating command..." status while Neptune prepares the command */
  {
    type: "setStatus",
    statusLabel: "Generating command…",
    step: "review",
    durationMs: 800,
  },
  
  /* Clear the status before showing the command block */
  {
    type: "setStatus",
    statusLabel: undefined,
    step: "review",
    durationMs: 200,
  },
  
  /* Show the "neptune generate spec" command block with code */
  {
    type: "setCommandSnippet",
    snippet: generateSpecCommand,
    step: "review",
    durationMs: 600,
  },
  
  /* Command card shows Skip/Run buttons, waiting for approval */
  {
    type: "setCommandChoice",
    choice: commandChoicePending,
    step: "review",
    durationMs: 2500,
  },
  
  /* User "approves" and Run button is clicked - command executes */
  {
    type: "setCommandChoice",
    choice: commandChoiceApproved,
    step: "review",
    durationMs: 600,
  },
  
  /* Add empty message to anchor the analyze status below the command */
  {
    type: "addMessage",
    id: "neptune-analyzing",
    sender: "neptune",
    text: "",
    step: "review",
    durationMs: 100,
  },
  
  /* Status shows "Analysing project..." as Neptune scans the codebase */
  {
    type: "appendLogs",
    lines: [ANALYZE_START],
    step: "review",
    durationMs: 1000,
  },
  
  /* Status updates to "Generating spec..." as Neptune creates the config */
  {
    type: "appendLogs",
    lines: [ANALYZE_GENERATING_SPEC],
    step: "review",
    durationMs: 1000,
  },
  
  /* Clear the analyze status before showing success message */
  {
    type: "setLogs",
    logs: [],
    step: "review",
    durationMs: 200,
  },
  
  /* Neptune announces successful completion of spec generation */
  {
    type: "addMessage",
    id: "neptune-generate-success",
    sender: "neptune",
    text: CHAT_MESSAGES.GENERATE_SUCCESS,
    typingDurationMs: 600,
    step: "review",
    durationMs: 1000,
  },
  
  /* Shows CLI response confirming neptune.json was created */
  {
    type: "setGenerateSpecCliResponse",
    snippet: generateSpecCliResponse,
    step: "review",
    durationMs: 2000,
  },
  
  /* Add empty message to anchor neptune.json generation status */
  {
    type: "addMessage",
    id: "neptune-generating-json",
    sender: "neptune",
    text: "",
    step: "review",
    durationMs: 100,
  },
  
  /* Status shows "Generating neptune.json..." */
  {
    type: "appendLogs",
    lines: [GENERATING_NEPTUNE_JSON],
    step: "review",
    durationMs: 800,
  },
  
  /* Clear the status before showing the created message */
  {
    type: "setLogs",
    logs: [],
    step: "review",
    durationMs: 200,
  },
  
  /* Neptune asks user to review the generated config file */
  {
    type: "addMessage",
    id: "neptune-json-created",
    sender: "neptune",
    text: CHAT_MESSAGES.JSON_CREATED,
    typingDurationMs: 1400,
    step: "review",
    durationMs: 2000,
  },
  
  /* Display the neptune.json config file contents in a card */
  {
    type: "setConfigSnippet",
    snippet: configSnippet,
    step: "review",
    durationMs: 0,
  },
  
  /* Config card shows Approve/Decline buttons for user review */
  {
    type: "setConfigSnippetActions",
    showActions: true,
    approved: false,
    step: "review",
    durationMs: 2000,
  },
  
  /* User clicks Approve - config is accepted and ready for deployment */
  // Approve the config (button animation plays here for 200ms)
  {
    type: "setConfigSnippetActions",
    showActions: true, // Keep buttons visible during animation
    approved: true,
    step: "review",
    durationMs: 300, // Time for animation to play
  },
  // Hide buttons after animation completes
  {
    type: "setConfigSnippetActions",
    showActions: false,
    approved: true,
    step: "review",
    durationMs: 400,
  },

  /* --- STEP 3: BUILD & DEPLOY --- */
  
  /* Clear status message from previous step */
  {
    type: "setStatus",
    statusLabel: undefined,
    step: "deploy",
    durationMs: 0,
  },
  
  /* Reset logs array to start fresh for deployment */
  {
    type: "setLogs",
    logs: [],
    step: "deploy",
    durationMs: 0,
  },
  
  /* Add empty message to anchor the deploy preparation status */
  {
    type: "addMessage",
    id: "neptune-deploy-prep",
    sender: "neptune",
    text: "",
    step: "deploy",
    durationMs: 100,
  },
  
  /* Status shows "Generating command..." before showing the command */
  {
    type: "appendLogs",
    lines: [DEPLOY_GENERATING_CMD],
    step: "deploy",
    durationMs: 800,
  },
  
  /* Clear the status before showing command */
  {
    type: "setLogs",
    logs: [],
    step: "deploy",
    durationMs: 200,
  },
  
  /* Add empty message that will show the deploy command card */
  {
    type: "addMessage",
    id: "neptune-deploy-command",
    sender: "neptune",
    text: "",
    step: "deploy",
    durationMs: 0,
  },
  
  /* Show the "neptune deploy" command block with code */
  {
    type: "setCommandSnippet",
    snippet: deployCommand,
    step: "deploy",
    durationMs: 0,
  },
  
  /* Deploy command card shows Skip/Run buttons, waiting for approval */
  {
    type: "setCommandChoice",
    choice: commandChoicePending,
    step: "deploy",
    durationMs: 2000,
  },
  
  /* User "approves" and Run button is clicked - deployment begins! */
  {
    type: "setCommandChoice",
    choice: commandChoiceApproved,
    step: "deploy",
    durationMs: 600,
  },
  
  /* Add empty message to anchor deployment progress statuses below the command */
  {
    type: "addMessage",
    id: "neptune-deploying",
    sender: "neptune",
    text: "",
    step: "deploy",
    durationMs: 100,
  },
  
  /* Status shows "Deploying *my-neptune-project* to Neptune..." */
  {
    type: "appendLogs",
    lines: [DEPLOY_RUNNING],
    step: "deploy",
    durationMs: 1000,
  },
  
  /* Status updates to "Generating logs..." as deployment progresses */
  {
    type: "appendLogs",
    lines: [DEPLOY_LOGS],
    step: "deploy",
    durationMs: 1000,
  },
  
  /* Clear the deployment status before showing results */
  {
    type: "setLogs",
    logs: [],
    step: "deploy",
    durationMs: 200,
  },
  
  /* Show final CLI response with deployment URL and success status */
  {
    type: "setDeployFinalCliResponse",
    snippet: deployFinalCliResponse,
    step: "deploy",
    durationMs: 500,
  },
  
  /* Add empty message that will show the CLI response block */
  {
    type: "addMessage",
    id: "neptune-deploy-cli-response",
    sender: "neptune",
    text: "",
    step: "deploy",
    durationMs: 100,
  },
  
  /* Store the full deployment logs text (build, push, deploy steps) */
  {
    type: "setDeployLogsText",
    text: deployLogsText,
    step: "deploy",
    durationMs: 600,
  },
  
  /* Add empty message that will show the deployment logs block */
  {
    type: "addMessage",
    id: "neptune-deploy-logs",
    sender: "neptune",
    text: "",
    step: "deploy",
    durationMs: 3500,
  },
  
  /* 🎉 Neptune celebrates successful deployment with live URL! */
  {
    type: "addMessage",
    id: "neptune-done",
    sender: "neptune",
    text: CHAT_MESSAGES.DEPLOYMENT_SUCCESS,
    typingDurationMs: 1200,
    step: "deploy",
    durationMs: 3500,
  },
];


/* ---------- Helpers ---------- */

const INITIAL_STATE: AnimationState = {
  step: TIMELINE[0].step,
  durationMs: TIMELINE[0].durationMs,
  chat: [],
  logs: [],
  inputText: "",
  configSnippetPulsing: false,
  commandPulsing: false,
};

function applyEvent(
  prev: AnimationState,
  event: TimelineEvent
): AnimationState {
  const next: AnimationState = {
    ...prev,
    step: event.step,
    durationMs: event.durationMs,
  };

  switch (event.type) {
    case "addMessage":
      return {
        ...next,
        chat: [
          ...next.chat,
          { 
            id: event.id, 
            sender: event.sender, 
            text: event.text,
            typingDurationMs: event.typingDurationMs,
          },
        ],
      };
    case "setStatus":
      return { ...next, statusLabel: event.statusLabel };
    case "appendLogs":
      return { ...next, logs: [...next.logs, ...event.lines] };
    case "setLogs":
      return { ...next, logs: [...event.logs] };
    case "setConfigSnippet":
      return {
        ...next,
        configSnippet: event.snippet,
        configSnippetPulsing: !!event.snippet,
      };
    case "setConfigSnippetActions":
      return {
        ...next,
        configSnippetShowActions: event.showActions ?? false,
        configSnippetApproved: event.approved ?? false,
        ...(event.approved ? { configSnippetPulsing: false } : {}),
      };
    case "setCommandChoice":
      return {
        ...next,
        commandChoice: event.choice,
        ...(event.choice?.approved ? { commandPulsing: false } : {}),
      };
    case "setCommandSnippet":
      return {
        ...next,
        commandSnippet: event.snippet,
        commandPulsing: !!event.snippet,
      };
    case "setGenerateSpecCliResponse":
      return {
        ...next,
        generateSpecCliResponse: event.snippet,
      };
    case "setDeployLogsText":
      return {
        ...next,
        deployLogsText: event.text,
      };
    case "setDeployFinalCliResponse":
      return {
        ...next,
        deployFinalCliResponse: event.snippet,
      };
    case "setInputText":
      return { 
        ...next, 
        inputText: event.text,
        typingDurationMs: event.typingDurationMs,
      };
    case "clearInput":
      return { ...next, inputText: "" };
    default:
      return next;
  }
}

function buildStateUpTo(index: number): AnimationState {
  if (index < 0) return INITIAL_STATE;
  let state = INITIAL_STATE;
  for (let i = 0; i <= index && i < TIMELINE.length; i++) {
    state = applyEvent(state, TIMELINE[i]);
  }
  return state;
}

function getFirstIndexForStep(step: StepId): number {
  const idx = TIMELINE.findIndex((ev) => ev.step === step);
  return idx === -1 ? 0 : idx;
}

/* ---------- Hook API ---------- */

export interface UseNeptuneHeroMachineOptions {
  autoplay?: boolean;
  loop?: boolean;
  autoplayDelayMs?: number;
}

export interface UseNeptuneHeroMachineResult {
  state: AnimationState;
  step: StepMeta;
  index: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  goToStep: (step: StepId) => void;
  reset: () => void;
}

export function useNeptuneHeroMachine(
  options: UseNeptuneHeroMachineOptions = {}
): UseNeptuneHeroMachineResult {
  const { autoplay = true, loop = true, autoplayDelayMs = 0 } = options;

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const timeoutRef = useRef<number | null>(null);
  const firstRunRef = useRef(true);

  const clearTimer = () => {
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const scheduleNext = () => {
    clearTimer();
    if (!isPlaying) return;

    const currentEvent = TIMELINE[index];

    const delay =
      firstRunRef.current && autoplayDelayMs > 0
        ? autoplayDelayMs
        : currentEvent.durationMs;

    timeoutRef.current = window.setTimeout(() => {
      firstRunRef.current = false;

      const isLast = index >= TIMELINE.length - 1;

      if (isLast) {
        if (loop) {
          setIndex(0);
          firstRunRef.current = true;
        } else {
          setIsPlaying(false);
        }
      } else {
        setIndex((prev) => Math.min(prev + 1, TIMELINE.length - 1));
      }
    }, delay);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isPlaying) {
      scheduleNext();
    }
    return clearTimer;
  }, [index, isPlaying]);

  const play = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      firstRunRef.current = false;
    }
  };

  const pause = () => {
    setIsPlaying(false);
    clearTimer();
  };

  const goToStep = (stepId: StepId) => {
    const idx = getFirstIndexForStep(stepId);
    setIndex(idx);
    firstRunRef.current = false;
  };

  const reset = () => {
    setIndex(0);
    firstRunRef.current = true;
  };

  const state = buildStateUpTo(index);
  const stepMeta = STEPS.find((s) => s.id === state.step) ?? STEPS[0];

  return { state, step: stepMeta, index, isPlaying, play, pause, goToStep, reset };
}