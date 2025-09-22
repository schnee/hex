# Task Management Scripts

This directory contains automation scripts for managing project tasks.

## Scripts

### `complete-task.sh`
Mark a task as complete in tasks.md and automatically commit the change.

**Usage:**
```bash
./scripts/complete-task.sh T025 "Completed image upload endpoint"
```

**Features:**
- ✅ Validates task exists and is incomplete
- 📝 Updates tasks.md with checkmark and emoji
- 📤 Automatically commits the change with descriptive message
- 📋 Shows next available tasks after completion
- 🛡️ Error handling with helpful messages

### `task-status.sh` 
Display current project task completion status.

**Usage:**
```bash
./scripts/task-status.sh
```

**Features:**
- 📊 Progress percentage and visual progress bar
- ✅ Recently completed tasks
- 📋 Next 5 available tasks
- ⚡ Parallel tasks that can be worked on simultaneously
- 🎨 Color-coded output for easy reading

## Warp Integration

These scripts are integrated with Warp commands for quick access:

- `/done T025` - Complete a task (uses complete-task.sh)
- `/task-status` - Show status (uses task-status.sh) 
- `/complete T025` - Claude-assisted task completion

## Task File Location

Scripts operate on: `specs/001-streamlit-to-react/tasks.md`

## Requirements

- Bash shell
- Git (for committing changes)
- tasks.md file in the expected location