// Animation logic for Neptune hero
// Timeline-based state management and animation hook

import { useEffect, useRef, useState } from "react";
import type { 
  StepId, 
  AnimationState, 
  ChatItem,
  CommandBlockItem,
  FileBlockItem 
} from "./types";
import { SCRIPT, ScriptEvent } from "./script";

/* ---------- Timeline events ---------- */

interface TimelineEventBase {
  step: StepId;
  durationMs: number;
}

type TimelineEvent =
  | (TimelineEventBase & {
      type: "addItem";
      item: ChatItem;
    })
  | (TimelineEventBase & {
      type: "updateItem";
      id: string;
      updates: Partial<ChatItem>;
    })
  | (TimelineEventBase & {
      type: "removeItem";
      id: string;
    })
  | (TimelineEventBase & {
      type: "setInputText";
      text: string;
      typingDurationMs?: number;
    })
  | (TimelineEventBase & {
      type: "clearInput";
    });

/* ---------- Build TIMELINE from high-level SCRIPT ---------- */

let autoIdCounter = 0;

function buildTimelineFromScript(script: ScriptEvent[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const push = (ev: TimelineEvent) => events.push(ev);

  for (const s of script) {
    const baseDuration = s.durationMs ?? 1000;

    switch (s.type) {
      case "userInputAndMessage": {
        // 1) user types in input
        push({
          type: "setInputText",
          text: s.text,
          typingDurationMs: 1200,
          step: s.step,
          durationMs: 1600,
        });

        // 2) input clears (enter)
        push({
          type: "clearInput",
          step: s.step,
          durationMs: 300,
        });

        // 3) visible user message
        push({
          type: "addItem",
          item: {
            type: "message",
            id: `user-msg-${autoIdCounter++}`,
            sender: "user",
            text: s.text,
          },
          step: s.step,
          durationMs: 800,
        });
        break;
      }

      case "userMessage": {
        push({
          type: "addItem",
          item: {
            type: "message",
            id: `user-msg-${autoIdCounter++}`,
            sender: "user",
            text: s.text,
          },
          step: s.step,
          durationMs: baseDuration,
        });
        break;
      }

      case "agentMessage": {
        push({
          type: "addItem",
          item: {
            type: "message",
            id: `agent-msg-${autoIdCounter++}`,
            sender: "neptune",
            text: s.text,
            typingDurationMs: 1000,
          },
          step: s.step,
          durationMs: baseDuration,
        });
        break;
      }

      case "status": {
        const statusId = `status-${autoIdCounter++}`;
        // Show status
        push({
          type: "addItem",
          item: {
            type: "status",
            id: statusId,
            label: s.label,
          },
          step: s.step,
          durationMs: baseDuration,
        });
        // Auto-clear status after duration
        push({
          type: "removeItem",
          id: statusId,
          step: s.step,
          durationMs: 400,
        });
        break;
      }

      case "commandBlock": {
        push({
          type: "addItem",
          item: {
            type: "commandBlock",
            id: s.id,
            snippet: s.snippet,
            question: s.question,
            choices: s.choices,
            selectedIndex: s.selectedIndex,
            approved: s.approved,
            pulse: true,
          },
          step: s.step,
          durationMs: baseDuration,
        });
        break;
      }

      case "updateCommandBlock": {
        const updates: Partial<ChatItem> = { type: "commandBlock" };
        if (s.approved !== undefined)
          (updates as Partial<CommandBlockItem>).approved = s.approved;
        if (s.pulse !== undefined) 
          (updates as Partial<CommandBlockItem>).pulse = s.pulse;

        push({
          type: "updateItem",
          id: s.id,
          updates,
          step: s.step,
          durationMs: baseDuration,
        });
        break;
      }

      case "fileBlock": {
        push({
          type: "addItem",
          item: {
            type: "fileBlock",
            id: s.id,
            snippet: s.snippet,
            primaryActionLabel: s.primaryActionLabel,
            secondaryActionLabel: s.secondaryActionLabel,
            showActions: s.showActions,
            approved: s.approved,
            pulse: true,
          },
          step: s.step,
          durationMs: baseDuration,
        });
        break;
      }

      case "updateFileBlock": {
        const updates: Partial<ChatItem> = { type: "fileBlock" };
        if (s.showActions !== undefined)
          (updates as Partial<FileBlockItem>).showActions = s.showActions;
        if (s.approved !== undefined)
          (updates as Partial<FileBlockItem>).approved = s.approved;
        if (s.pulse !== undefined) 
          (updates as Partial<FileBlockItem>).pulse = s.pulse;

        push({
          type: "updateItem",
          id: s.id,
          updates,
          step: s.step,
          durationMs: baseDuration,
        });
        break;
      }

      case "cliBlock": {
        push({
          type: "addItem",
          item: {
            type: "cliBlock",
            id: s.id,
            snippet: s.snippet,
          },
          step: s.step,
          durationMs: baseDuration,
        });
        break;
      }

      case "logsBlock": {
        push({
          type: "addItem",
          item: {
            type: "logsBlock",
            id: s.id,
            text: s.text,
            title: s.title,
          },
          step: s.step,
          durationMs: baseDuration,
        });
        break;
      }
    }
  }

  return events;
}

const TIMELINE: TimelineEvent[] = buildTimelineFromScript(SCRIPT);

/* ---------- Helpers ---------- */

const INITIAL_STATE: AnimationState = {
  step: TIMELINE[0].step,
  durationMs: TIMELINE[0].durationMs,
  items: [],
  inputText: "",
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
    case "addItem":
      return {
        ...next,
        items: [...next.items, event.item],
      };

    case "updateItem": {
      return {
        ...next,
        items: next.items.map((item) =>
          item.id === event.id
            ? ({ ...item, ...event.updates } as ChatItem)
            : item
        ),
      };
    }

    case "removeItem":
      return {
        ...next,
        items: next.items.filter((item) => item.id !== event.id),
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

/* ---------- Hook API ---------- */

export interface UseNeptuneHeroMachineOptions {
  autoplay?: boolean;
  loop?: boolean;
  autoplayDelayMs?: number;
}

export interface UseNeptuneHeroMachineResult {
  state: AnimationState;
  index: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
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

  useEffect(() => {
    if (isPlaying) {
      scheduleNext();
    }
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const reset = () => {
    setIndex(0);
    firstRunRef.current = true;
  };

  const state = buildStateUpTo(index);

  return { state, index, isPlaying, play, pause, reset };
}
