#!/bin/bash
# Script to mark a task as complete in tasks.md and commit the change

set -e

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if task ID is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide a task ID${NC}"
    echo -e "${YELLOW}Usage: $0 <task_id> [optional_description]${NC}"
    echo -e "${YELLOW}Example: $0 T025 'Completed image upload endpoint'${NC}"
    exit 1
fi

TASK_ID="$1"
DESCRIPTION="${2:-$TASK_ID implementation}"
TASKS_FILE="specs/001-streamlit-to-react/tasks.md"

# Check if tasks file exists
if [ ! -f "$TASKS_FILE" ]; then
    echo -e "${RED}Error: tasks.md file not found at $TASKS_FILE${NC}"
    exit 1
fi

# Check if task exists in file
if ! grep -q "^- \[ \] $TASK_ID" "$TASKS_FILE"; then
    echo -e "${RED}Error: Task $TASK_ID not found or already completed in $TASKS_FILE${NC}"
    echo -e "${BLUE}Available incomplete tasks:${NC}"
    grep "^- \[ \]" "$TASKS_FILE" | head -5
    exit 1
fi

echo -e "${BLUE}Marking task $TASK_ID as complete...${NC}"

# Create backup
cp "$TASKS_FILE" "$TASKS_FILE.backup"

# Mark task as complete
sed -i.tmp "s/^- \[ \] $TASK_ID/- [x] $TASK_ID/g" "$TASKS_FILE"
sed -i.tmp "s/^- \[x\] $TASK_ID \(.*\)/- [x] $TASK_ID \1 ✅/g" "$TASKS_FILE"

# Remove temporary file
rm "$TASKS_FILE.tmp"

# Show the change
echo -e "${GREEN}Task marked as complete:${NC}"
grep "$TASK_ID" "$TASKS_FILE" | head -1

# Add and commit the change
git add "$TASKS_FILE"
git commit -m "task: Complete $TASK_ID - $DESCRIPTION

✅ Marked $TASK_ID as complete in tasks.md
$(grep "$TASK_ID" "$TASKS_FILE" | head -1 | sed 's/^- \[x\]/- /')"

echo -e "${GREEN}✅ Task $TASK_ID completed and committed!${NC}"

# Show next tasks
echo -e "\n${BLUE}Next available tasks:${NC}"
grep "^- \[ \]" "$TASKS_FILE" | head -3

# Clean up backup
rm "$TASKS_FILE.backup"