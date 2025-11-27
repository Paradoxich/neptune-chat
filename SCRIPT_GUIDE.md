# Neptune Chat Animation Script Guide

This guide explains how to edit the animation script for non-developers. 

## What You Need to Edit

**Required:**
- `components/neptune-hero/script.ts` - The animation script (this is where you define the conversation flow)

**Optional (recommended for organization):**
- `components/neptune-hero/constants.ts` - Text content and messages (keeps your text organized and reusable)

You can put all text directly in `script.ts` if you prefer, or use `constants.ts` to keep things cleaner and avoid repeating text.

## Quick Start

Open `components/neptune-hero/script.ts` and you'll see the `SCRIPT` array. This is where you define what happens in the animation.

## Available Event Types

### 1. User Input and Message
Shows user typing in the input field, then displays the message:

```typescript
{
  type: "userInputAndMessage",
  step: "describe",  // or "review" or "deploy"
  text: "deploy this project to Neptune",
  durationMs: 1600,  // optional, how long to show (default: 1000ms)
}
```

### 2. User Message (Simple)
Shows a user message immediately without typing animation:

```typescript
{
  type: "userMessage",
  step: "describe",
  text: "Make it faster",
  durationMs: 1000,
}
```

### 3. Agent Message
Shows Neptune's response with typing animation:

```typescript
{
  type: "agentMessage",
  step: "describe",
  text: "Great — let's deploy your project to Neptune 🚀",
  durationMs: 1800,
}
```

### 4. Status Message (Temporary)
Shows a temporary status that auto-disappears:

```typescript
{
  type: "status",
  step: "review",
  label: "Analysing project",
  durationMs: 1000,
}
```

### 5. Command Block
Shows a command with Run/Cancel buttons:

```typescript
{
  type: "commandBlock",
  step: "review",
  id: "my-command",  // unique ID for this block
  snippet: createSnippet(
    "neptune generate spec",  // title
    "bash",                   // language
    "neptune generate spec --output json"  // code
  ),
  question: "Run this command",
  choices: ["Cancel", "Run"],
  selectedIndex: 1,  // which button is selected (0 = Cancel, 1 = Run)
  approved: false,   // starts as pending
  durationMs: 600,
}
```

### 6. Update Command Block
Updates an existing command block (e.g., to mark it approved):

```typescript
{
  type: "updateCommandBlock",
  step: "review",
  id: "my-command",  // must match the ID from commandBlock
  approved: true,    // mark as approved
  pulse: false,      // remove pulsing animation
  durationMs: 600,
}
```

### 7. File Block
Shows a file with optional Approve/Decline actions:

```typescript
{
  type: "fileBlock",
  step: "review",
  id: "config-file",
  snippet: createSnippet(
    "neptune.json",
    "json",
    '{"kind": "Backend", "name": "my-project"}'
  ),
  primaryActionLabel: "Approve",
  secondaryActionLabel: "Decline",
  showActions: true,   // show the action buttons
  approved: false,     // starts as pending
  durationMs: 2000,
}
```

### 8. Update File Block
Updates an existing file block:

```typescript
{
  type: "updateFileBlock",
  step: "review",
  id: "config-file",
  approved: true,      // mark as approved
  showActions: false,  // hide the action buttons
  pulse: false,        // remove pulsing
  durationMs: 300,
}
```

### 9. CLI Block
Shows a CLI response (like JSON output):

```typescript
{
  type: "cliBlock",
  step: "review",
  id: "cli-response",
  snippet: createSnippet(
    "CLI response",
    "json",
    '{"ok": true, "message": "Success"}'
  ),
  durationMs: 2000,
}
```

### 10. Logs Block
Shows deployment logs or output:

```typescript
{
  type: "logsBlock",
  step: "deploy",
  id: "deploy-logs",
  title: "Deployment logs",
  text: `Building image...
Pushing to registry...
Deployment complete!`,
  durationMs: 3500,
}
```

## Example: Simple Conversation

Here's a complete example showing a simple conversation:

```typescript
export const SCRIPT: ScriptEvent[] = [
  // User asks a question
  {
    type: "userInputAndMessage",
    step: "describe",
    text: "deploy my app",
  },

  // Neptune responds
  {
    type: "agentMessage",
    step: "describe",
    text: "I'll help you deploy your app!",
  },

  // Status while working
  {
    type: "status",
    step: "review",
    label: "Analyzing your project",
  },

  // Show a command
  {
    type: "commandBlock",
    step: "review",
    id: "deploy-cmd",
    snippet: createSnippet("neptune deploy", "bash", "neptune deploy"),
    question: "Run this command",
    choices: ["Cancel", "Run"],
    selectedIndex: 1,
    approved: false,
  },

  // Approve it
  {
    type: "updateCommandBlock",
    step: "review",
    id: "deploy-cmd",
    approved: true,
  },

  // Show success
  {
    type: "agentMessage",
    step: "deploy",
    text: "Deployment complete! 🎉",
  },
];
```

## Tips

1. **Block IDs**: Each block needs a unique ID. Use descriptive names like `"generate-spec-cmd"` or `"config-file"`.

2. **Duration**: The `durationMs` controls how long to wait before the next event. Typical values:
   - Messages: 1000-2000ms
   - Status: 800-1000ms
   - Command blocks: 600-2500ms
   - Logs: 3000-4000ms

3. **Step Property**: Every event requires a `step` property (`"describe"`, `"review"`, or `"deploy"`). While this property is technically required by TypeScript, it doesn't currently control how the animation renders—each item displays based on its own properties regardless of the step value. However, keeping meaningful step values is valuable for two reasons: it makes your script easier to read and understand at a glance, and it provides flexibility for future features like step indicators, progress bars, step-specific styling, or navigation controls. Think of it as organizing your conversation into logical phases:
   - `"describe"` - Initial conversation
   - `"review"` - Reviewing/generating files
   - `"deploy"` - Deployment process

4. **Updates**: To animate state changes (pending → approved), create the block first, then update it:
   ```typescript
   // First: create block as pending
   { type: "commandBlock", id: "cmd", approved: false, ... }
   
   // Later: update to approved
   { type: "updateCommandBlock", id: "cmd", approved: true }
   ```

5. **Text Content**: Edit messages in `constants.ts` instead of hardcoding them in the script. This makes it easier to maintain consistent text.

## Editing Constants

Open `components/neptune-hero/constants.ts` to edit:

- `CHAT_MESSAGES` - Agent and user messages
- `STATUS_MESSAGES` - Status labels
- `COMMANDS` - Command snippets
- `SNIPPETS_CONTENT` - File content and CLI responses

Example:

```typescript
export const CHAT_MESSAGES = {
  USER_REQUEST: "deploy this project",
  AGENT_GREETING: "Let's deploy your project!",
  // ... add your own messages
}
```

Then use them in the script:

```typescript
{
  type: "agentMessage",
  step: "describe",
  text: CHAT_MESSAGES.AGENT_GREETING,
}
```

## Testing Your Changes

1. Save your changes to `script.ts`
2. The browser will automatically refresh
3. Watch the animation play
4. Adjust durations and text as needed

That's it! You can now create any conversation flow you want without touching the animation or rendering code.

