#!/bin/bash
# Load complete spec-kit context for new conversations

echo "🔄 Loading Spec-Kit Context..."

# Ensure we're on the right branch
git checkout 001-streamlit-to-react 2>/dev/null || echo "Already on feature branch"

# Update agent context
echo "📊 Updating agent context..."
.specify/scripts/bash/update-agent-context.sh > /dev/null 2>&1

# Check prerequisites 
echo "✅ Checking prerequisites..."
PREREQS=$(.specify/scripts/bash/check-prerequisites.sh --json --include-tasks)
echo "$PREREQS"

# Show current feature info
echo ""
echo "🎯 Current Feature: 001-streamlit-to-react"
echo "📂 Feature Directory: specs/001-streamlit-to-react/"
echo ""

# Show available context files
echo "📋 Available Context:"
echo "- Agent Context: CLAUDE.md (auto-generated)"  
echo "- Implementation Plan: specs/001-streamlit-to-react/plan.md"
echo "- Current Tasks: specs/001-streamlit-to-react/tasks.md"
echo "- API Contracts: specs/001-streamlit-to-react/contracts/"
echo "- Data Model: specs/001-streamlit-to-react/data-model.md"
echo ""

# Show task status
echo "📈 Task Status:"
cd /Users/Brent.Schneeman/projects/tworavens/hex && ./scripts/task-status.sh

echo ""
echo "✅ Context loaded! Share CLAUDE.md with new conversation for agent grounding."