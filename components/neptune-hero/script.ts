// High-level script for the Neptune chat animation.
// Non-dev osoba može editati SAMO ovo + constants.ts

import type { StepId, FileSnippet } from "./types";
import { CHAT_MESSAGES, STATUS_MESSAGES } from "./constants";

export type ScriptEvent =
  // Messages
  | { type: "userInputAndMessage"; step: StepId; text: string; durationMs?: number }
  | { type: "userMessage"; step: StepId; text: string; durationMs?: number }
  | { type: "agentMessage"; step: StepId; text: string; durationMs?: number }
  | { type: "status"; step: StepId; label: string; durationMs?: number }
  // Blocks
  | {
      type: "commandBlock";
      step: StepId;
      id: string;
      snippet: FileSnippet;
      question: string;
      choices: string[];
      selectedIndex: number;
      approved: boolean;
      durationMs?: number;
    }
  | {
      type: "updateCommandBlock";
      step: StepId;
      id: string;
      approved?: boolean;
      pulse?: boolean;
      durationMs?: number;
    }
  | {
      type: "fileBlock";
      step: StepId;
      id: string;
      snippet: FileSnippet;
      primaryActionLabel: string;
      secondaryActionLabel: string;
      showActions: boolean;
      approved: boolean;
      durationMs?: number;
    }
  | {
      type: "updateFileBlock";
      step: StepId;
      id: string;
      showActions?: boolean;
      approved?: boolean;
      pulse?: boolean;
      durationMs?: number;
    }
  | {
      type: "cliBlock";
      step: StepId;
      id: string;
      snippet: FileSnippet;
      durationMs?: number;
    }
  | {
      type: "logsBlock";
      step: StepId;
      id: string;
      text: string;
      title: string;
      durationMs?: number;
    };

// Helper function to create FileSnippet objects
const createSnippet = (
  filename: string,
  language: "json" | "bash" | "text",
  code: string
) => ({ filename, language, code });

//---- MODIFY THESE EVENTS TO CHANGE THE FLOW ----//

export const SCRIPT: ScriptEvent[] = [


  // 1) User types and sends request
  {
    type: "userInputAndMessage",
    step: "describe",
    text: CHAT_MESSAGES.USER_REQUEST,
  },


  // 2) Neptune greeting
  {
    type: "agentMessage",
    step: "describe",
    text: CHAT_MESSAGES.AGENT_GREETING,
    durationMs: 1800,
  },

  // 3) Status "planning..."
  {
    type: "status",
    step: "describe",
    label: STATUS_MESSAGES.PLANNING_NEXT_STEPS,
    durationMs: 3000,
  },

  // 4) Neptune explains plan
  {
    type: "agentMessage",
    step: "describe",
    text: CHAT_MESSAGES.AGENT_PLAN,
    durationMs: 1800,
  },

  // ========== GENERATE SPEC FLOW ==========

  // Status: generating command
  {
    type: "status",
    step: "review",
    label: "Generating command…",
    durationMs: 3000,
  },

  // Command block appears (pending)
  {
    type: "commandBlock",
    step: "review",
    id: "generate-spec-cmd",
    snippet: createSnippet(
      "neptune generate spec",
      "bash",
      `cd /Users/johndoe/my-neptune-project && \\
neptune generate spec --output json --wd /Users/johndoe/my-neptune-project`
    ),
    question: "Run this command",
    choices: ["Cancel", "Run"],
    selectedIndex: 1,
    approved: false,
    durationMs: 600,
  },

  // Wait for user approval
  {
    type: "updateCommandBlock",
    step: "review",
    id: "generate-spec-cmd",
    durationMs: 2500,
  },

  // Command approved
  {
    type: "updateCommandBlock",
    step: "review",
    id: "generate-spec-cmd",
    approved: true,
    pulse: false,
    durationMs: 600,
  },

  // Status: analysing project
  {
    type: "status",
    step: "review",
    label: STATUS_MESSAGES.ANALYSING_PROJECT,
    durationMs: 1000,
  },

  // Status: generating spec
  {
    type: "status",
    step: "review",
    label: STATUS_MESSAGES.GENERATING_SPEC,
    durationMs: 1000,
  },

  // Success message
  {
    type: "agentMessage",
    step: "review",
    text: CHAT_MESSAGES.GENERATE_SUCCESS,
    durationMs: 1000,
  },

  // CLI response block
  {
    type: "cliBlock",
    step: "review",
    id: "generate-spec-cli",
    snippet: createSnippet(
      "CLI response",
      "json",
      `{
  "ok": true,
  "spec_path": "/Users/johndoe/my-neptune-project/neptune.json",
  "messages": [
    "Created or updated neptune.json at /Users/johndoe/my-neptune-project/neptune.json"
  ]
}`
    ),
    durationMs: 2000,
  },

  // Status: generating neptune.json
  {
    type: "status",
    step: "review",
    label: "Generating neptune.json…",
    durationMs: 1500,
  },

  // ========== CONFIG REVIEW FLOW ==========

  // Message about neptune.json creation
  {
    type: "agentMessage",
    step: "review",
    text: CHAT_MESSAGES.JSON_CREATED,
    durationMs: 2000,
  },

  // File block appears (with actions)
  {
    type: "fileBlock",
    step: "review",
    id: "neptune-json",
    snippet: createSnippet(
      "neptune.json",
      "json",
      `{
  "kind": "Backend",
  "name": "my-neptune-project",
  "resources": []
}`
    ),
    primaryActionLabel: "Approve",
    secondaryActionLabel: "Decline",
    showActions: true,
    approved: false,
    durationMs: 2000,
  },

  // File approved
  {
    type: "updateFileBlock",
    step: "review",
    id: "neptune-json",
    approved: true,
    pulse: false,
    durationMs: 300,
  },

  // Hide actions
  {
    type: "updateFileBlock",
    step: "review",
    id: "neptune-json",
    showActions: false,
    durationMs: 400,
  },

  // ========== DEPLOY FLOW ==========

  // Status: generating deploy command
  {
    type: "status",
    step: "deploy",
    label: STATUS_MESSAGES.GENERATING_DEPLOY_CMD,
    durationMs: 1500,
  },

  // Deploy command block (pending)
  {
    type: "commandBlock",
    step: "deploy",
    id: "deploy-cmd",
    snippet: createSnippet(
      "neptune deploy",
      "bash",
      `neptune deploy --wd . --output json`
    ),
    question: "Run this command",
    choices: ["Cancel", "Run"],
    selectedIndex: 1,
    approved: false,
    durationMs: 2000,
  },

  // Command approved
  {
    type: "updateCommandBlock",
    step: "deploy",
    id: "deploy-cmd",
    approved: true,
    pulse: false,
    durationMs: 600,
  },

  // Status: deploying
  {
    type: "status",
    step: "deploy",
    label: STATUS_MESSAGES.DEPLOYING_TO_NEPTUNE,
    durationMs: 1000,
  },

  // Status: generating logs
  {
    type: "status",
    step: "deploy",
    label: STATUS_MESSAGES.GENERATING_LOGS,
    durationMs: 1000,
  },

  // Deploy final CLI response
  {
    type: "cliBlock",
    step: "deploy",
    id: "deploy-cli",
    snippet: createSnippet(
      "CLI response",
      "json",
      `{
  "ok": true,
  "project": "my-neptune-project",
  "condition": {
    "resources": "Available",
    "workload": "Running",
    "project": "Created"
  },
  "url": "https://my-neptune-project-j8h3j3q9-2oqmso473a-nw.a.run.app",
  "env": {},
  "next_action_command": "neptune status"
}`
    ),
    durationMs: 500,
  },

  // Deployment logs block
  {
    type: "logsBlock",
    step: "deploy",
    id: "deploy-logs",
    title: "Deployment logs",
    text: `╔══════════════════════════════ Nixpacks v1.41.0 ══════════════════════════════╗
║ setup      │ python3, gcc                                                    ║
║ install    │ python -m venv /opt/venv && pip install -r requirements.txt     ║
║ start      │ hypercorn main:app --bind 0.0.0.0:\${PORT:-8080}                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
# Building image with Docker...

[1/6] FROM nixpacks base image
[2/6] WORKDIR /app
[3/6] COPY project files
[4/6] Install Python dependencies from requirements.txt
      → fastapi, hypercorn, pydantic, starlette, etc.
[5/6] Configure virtual environment
[6/6] Finalize image and metadata

Image built successfully (tag: fastapi:latest)

Pushing image to Neptune registry...
✓ Pushed europe-west2-docker.pkg.dev/.../my-neptune-project-test-fastapi:f9b640d43665

Waiting for deployment to become ready...
✓ Resources: Available
✓ Workload: Running
✓ Project: Created

{
  "ok": true,
  "project": "my-neptune-project-test-fastapi",
  "build": {
    "image": "europe-west2-docker.pkg.dev/.../my-neptune-project-test-fastapi:f9b640d43665"
  },
  "deployment": {
    "deployment_id": "proj-01kazvjwd5w2s5tp52148nw65s"
  },
  "final_condition": {
    "resources": "Available",
    "workload": "Running",
    "project": "Created"
  },
  "final_url": "https://my-neptune-project-j8h3j3q9-2oqmso473a-nw.a.run.app"
}`,
    durationMs: 3500,
  },

  // Final success message
  {
    type: "agentMessage",
    step: "deploy",
    text: CHAT_MESSAGES.DEPLOYMENT_SUCCESS,
    durationMs: 3500,
  },
];