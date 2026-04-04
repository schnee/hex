#!/bin/bash
# Script to show current task completion status

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

TASKS_FILE="specs/001-streamlit-to-react/tasks.md"

# Check if tasks file exists
if [ ! -f "$TASKS_FILE" ]; then
    echo -e "${RED}Error: tasks.md file not found at $TASKS_FILE${NC}"
    exit 1
fi

# Calculate completion stats
TOTAL_TASKS=$(grep -c "^- \[.\] T[0-9]" "$TASKS_FILE")
COMPLETED_TASKS=$(grep -c "^- \[x\] T[0-9]" "$TASKS_FILE")
REMAINING_TASKS=$((TOTAL_TASKS - COMPLETED_TASKS))

if [ "$TOTAL_TASKS" -gt 0 ]; then
    COMPLETION_PERCENT=$((COMPLETED_TASKS * 100 / TOTAL_TASKS))
else
    COMPLETION_PERCENT=0
fi

echo -e "${BLUE}📊 Project Task Status${NC}"
echo -e "${BLUE}=====================${NC}"
echo -e "Total Tasks: $TOTAL_TASKS"
echo -e "Completed: ${GREEN}$COMPLETED_TASKS${NC}"
echo -e "Remaining: ${YELLOW}$REMAINING_TASKS${NC}"
echo -e "Progress: ${GREEN}$COMPLETION_PERCENT%${NC}"

# Show progress bar
PROGRESS_WIDTH=20
FILLED=$((COMPLETION_PERCENT * PROGRESS_WIDTH / 100))
printf "Progress: ["
for ((i=0; i<FILLED; i++)); do printf "█"; done
for ((i=FILLED; i<PROGRESS_WIDTH; i++)); do printf "░"; done
printf "] %d%%\n" "$COMPLETION_PERCENT"

# Show recently completed tasks
echo -e "\n${GREEN}✅ Recently Completed:${NC}"
grep "^- \[x\] T[0-9]" "$TASKS_FILE" | tail -5 | sed 's/✅//' | while read line; do
    echo -e "${GREEN}  $line${NC}"
done

# Show next available tasks
echo -e "\n${YELLOW}📋 Next Available Tasks:${NC}"
grep "^- \[ \] T[0-9]" "$TASKS_FILE" | head -5 | while read line; do
    echo -e "${YELLOW}  $line${NC}"
done

# Show parallel tasks
echo -e "\n${BLUE}⚡ Parallel Tasks Available:${NC}"
grep "^- \[ \].*\[P\]" "$TASKS_FILE" | head -3 | while read line; do
    echo -e "${BLUE}  $line${NC}"
done

echo -e "\n${BLUE}Usage:${NC}"
echo -e "  ./scripts/complete-task.sh T### [description]  - Mark task complete"
echo -e "  ./scripts/task-status.sh                      - Show this status"