#!/bin/bash
# ==============================================================================
# Context Bootstrapping Script for the Hex Tile Layouts Project
# ==============================================================================
# This script concatenates all essential project files into a single text stream.
# Use it to bootstrap a new conversation with an AI assistant by providing the
# core context (goals, generator logic, UI, and docs) in one paste.
#
# Usage:
#   ./files_to_stdout.sh | pbcopy
#   # or
#   ./files_to_stdout.sh > context_bundle.txt
#
# Edit the FILES array as you add/remove modules or pages.
# ==============================================================================

set -euo pipefail

# Define the list of essential files to include for context
FILES=(
  "README.md"
  "requirements.txt"
  "streamlit_app.py"
  "app/__init__.py"
  "app/hex_tile_layouts_core.py"
  "app/tabs/about.py"
  "app/tabs/generator.py"
  "app/tabs/ui.py"
  "files_to_stdout.sh"
)

# Loop through each file and print its contents with a clear header
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "===== FILE: $file ====="
    cat "$file"
    echo -e "\n"
  else
    echo "===== WARNING: File not found: $file ====="
    echo -e "\n"
  fi
done
