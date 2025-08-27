#!/usr/bin/env bash
set -euo pipefail

OUT_DIR=${1:-demo}
mkdir -p "$OUT_DIR"

echo "Recording Playwright run with video..."
PW_VIDEO=on pnpm test:e2e || true

VIDEO=$(ls -1 test-results/**/video.webm 2>/dev/null | head -n1 || true)
if [ -z "$VIDEO" ]; then
  echo "No video found in test-results."
  exit 1
fi

echo "Converting $VIDEO to $OUT_DIR/demo.gif"
ffmpeg -y -i "$VIDEO" -vf fps=12,scale=1280:-1:flags=lanczos -loop 0 "$OUT_DIR/demo.gif"
echo "GIF written to $OUT_DIR/demo.gif"

