// Constants for Neptune hero animation
// Centralized user-facing text and configuration

/* ---------- CHAT MESSAGES ---------- */

export const CHAT_MESSAGES = {
  USER_REQUEST: "deploy this project to Neptune",
  AGENT_GREETING: "Great — let's deploy your project to Neptune 🚀",
  AGENT_PLAN:
    "Here's what I'll do:\n1. Analyse your codebase (neptune generate spec).\n2. Generate your neptune.json infrastructure spec.\n3. Build and deploy your app, then provide the live URL (neptune deploy).",
  GENERATE_SUCCESS: "Neptune generate has completed successfully.",
  JSON_CREATED:
    "Neptune.json has been created. ✅\nReview the generated spec to ensure it matches your project's requirements.\nApprove to continue to deployment.",
  DEPLOYMENT_SUCCESS:
    "Your deployment is live on Neptune! 🎉\nURL: https://my-neptune-project.neptune.run\nLet me know if you'd like to make more changes, redeploy, or clean up the project.",
} as const;

/* ---------- STATUS MESSAGES ---------- */

export const STATUS_MESSAGES = {
  PLANNING_NEXT_STEPS: "Planning next steps",
  ANALYSING_PROJECT: "Analysing project",
  GENERATING_SPEC: "Generating spec",
  PLANNING: "Working on your plan",
  GENERATING_DEPLOY_CMD: "Generating command",
  DEPLOYING_TO_NEPTUNE: "Deploying *my-neptune-project* to Neptune",
  GENERATING_LOGS: "Generating logs",
} as const;

/* ---------- SNIPPET TITLES ---------- */

export const SNIPPET_TITLES = {
  GENERATE_SPEC_COMMAND: "neptune generate spec",
  CLI_RESPONSE: "CLI response",
  NEPTUNE_JSON: "neptune.json",
  DEPLOY_COMMAND: "neptune deploy",
} as const;

/* ---------- ACTION LABELS ---------- */

export const ACTION_LABELS = {
  APPROVE: "Approve",
  DECLINE: "Decline",
  CANCEL: "Cancel",
  RUN: "Run",
  SKIP: "Skip",
} as const;

/* ---------- BLOCK TITLES ---------- */

export const BLOCK_TITLES = {
  RUN_COMMAND: "Run this command",
  DEPLOYMENT_LOGS: "Deployment logs",
} as const;

/* ---------- PLACEHOLDER TEXT ---------- */

export const PLACEHOLDER_TEXT = {
  INPUT: "Describe what you want to deploy…",
} as const;

/* ---------- COMMANDS ---------- */

export const COMMANDS = {
  GENERATE_SPEC: `cd /Users/johndoe/my-neptune-project && \\
neptune generate spec --output json --wd /Users/johndoe/my-neptune-project`,
  DEPLOY: `neptune deploy --wd . --output json`,
} as const;

/* ---------- SNIPPETS CONTENT ---------- */

export const SNIPPETS_CONTENT = {
  GENERATE_SPEC_CLI_RESPONSE: `{
  "ok": true,
  "spec_path": "/Users/johndoe/my-neptune-project/neptune.json",
  "messages": [
    "Created or updated neptune.json at /Users/johndoe/my-neptune-project/neptune.json"
  ]
}`,
  NEPTUNE_JSON_CONFIG: `{
  "kind": "Backend",
  "name": "my-neptune-project",
  "resources": []
}`,
  DEPLOY_FINAL_CLI_RESPONSE: `{
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
}`,
} as const;

/* ---------- DEPLOY LOGS ---------- */

export const DEPLOY_LOGS = `╔══════════════════════════════ Nixpacks v1.41.0 ══════════════════════════════╗
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
}`;
