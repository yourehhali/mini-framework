#!/bin/bash

echo "🚀 Starting Git Date Trick Setup..."

# 1. Create ~/bin directory
BIN_DIR="$HOME/bin"
mkdir -p "$BIN_DIR"
echo "✅ Created $BIN_DIR"

# 2. Write the main logic script
SCRIPT_PATH="$BIN_DIR/set_commit_date.sh"
cat << 'EOF' > "$SCRIPT_PATH"
#!/bin/bash

# Configuration
START_DATE="2024-11-13 09:00:00"
STORE_DIR="$HOME/.git_fake_commit_dates"

# Ensure inside git repo
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$REPO_ROOT" ]; then
    echo "echo '❌ Error: Not inside a git repository.'"
    exit 1
fi

REPO_NAME=$(basename "$REPO_ROOT")
DATE_FILE="$STORE_DIR/$REPO_NAME.date"

mkdir -p "$STORE_DIR"

# --- SMART DATE LOGIC ---

# 1. Get the actual last commit date from git (if any)
GIT_LAST_COMMIT_TS=$(git log -1 --format=%ct 2>/dev/null)

# 2. Get our stored date (if any)
if [ -f "$DATE_FILE" ]; then
    STORED_TS=$(cat "$DATE_FILE")
else
    STORED_TS=0
fi

# 3. Determine the base timestamp
# If we have a real git commit that is NEWER than our stored date, 
# we must start from there to keep history linear.
if [ -n "$GIT_LAST_COMMIT_TS" ] && [ "$GIT_LAST_COMMIT_TS" -gt "$STORED_TS" ]; then
    LAST_TS=$GIT_LAST_COMMIT_TS
elif [ "$STORED_TS" -gt 0 ]; then
    LAST_TS=$STORED_TS
else
    # Fallback to start date if nothing exists
    # Try macOS date first, then linux date
    if date -j -f "%Y-%m-%d %H:%M:%S" "$START_DATE" +%s >/dev/null 2>&1; then
        LAST_TS=$(date -j -f "%Y-%m-%d %H:%M:%S" "$START_DATE" +%s)
    else
        LAST_TS=$(date -d "$START_DATE" +%s)
    fi
fi

# Random increment: 12h (43200s) to 36h (129600s)
MIN=43200
MAX=129600
RANDOM_INCREMENT=$((MIN + RANDOM % (MAX - MIN)))
NEW_TS=$((LAST_TS + RANDOM_INCREMENT))

# Format new date
if date -r "$NEW_TS" "+%Y-%m-%d %H:%M:%S" >/dev/null 2>&1; then
    NEW_DATE=$(date -r "$NEW_TS" "+%Y-%m-%d %H:%M:%S")
    PRETTY_DATE=$(date -r "$NEW_TS" "+%d %b %Y %H:%M")
else
    NEW_DATE=$(date -d "@$NEW_TS" "+%Y-%m-%d %H:%M:%S")
    PRETTY_DATE=$(date -d "@$NEW_TS" "+%d %b %Y %H:%M")
fi

# Save state
echo "$NEW_TS" > "$DATE_FILE"

# Output export commands
echo "export GIT_AUTHOR_DATE=\"$NEW_DATE\""
echo "export GIT_COMMITTER_DATE=\"$NEW_DATE\""
echo "echo \"📅 Date set to: $PRETTY_DATE\""
EOF

chmod +x "$SCRIPT_PATH"
echo "✅ Installed smart script to $SCRIPT_PATH"

# 3. Configure Shell (.zshrc)
ZSHRC="$HOME/.zshrc"
# Only backup if we haven't already today to avoid clutter
if [ ! -f "$ZSHRC.backup" ]; then
    cp "$ZSHRC" "$ZSHRC.backup"
    echo "✅ Backed up .zshrc"
fi

# Check if already configured
if grep -q "alias set-date" "$ZSHRC"; then
    echo "ℹ️  Alias 'set-date' already exists in .zshrc"
else
    echo "" >> "$ZSHRC"
    echo "# --- Git Fake Date Setup ---" >> "$ZSHRC"
    if ! grep -q "$HOME/bin" "$ZSHRC"; then
        echo 'export PATH="$HOME/bin:$PATH"' >> "$ZSHRC"
    fi
    echo 'alias set-date='\''eval "$(set_commit_date.sh)"'\''' >> "$ZSHRC"
    echo "✅ Added alias 'set-date' to $ZSHRC"
fi

echo ""
echo "🎉 Setup complete!"
echo "👉 To start using it right now, run:"
echo "   source ~/.zshrc"