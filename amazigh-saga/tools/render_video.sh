#!/usr/bin/env bash
# Renders the portrait gameplay video from the real Godot game.
#
#   1. Imports the project (fonts, icon, class cache).
#   2. Runs the game in Godot's Movie Maker mode at a fixed 30 FPS in a
#      720x1280 window, so the game itself picks its portrait layout. The demo
#      pilot plays the fight by pressing the normal input actions.
#   3. Encodes the PNG frames + WAV audio Godot wrote into H.264/AAC MP4.
#
# Usage: tools/render_video.sh [path/to/godot]
# Env:   FRAMES_DIR (default: output/frames), OUT (default: output/amazigh_saga_combat_720x1280.mp4)
#        SEED (default 33), HP_SCALE (default 0.45)
# On a machine without a display, the script uses xvfb-run automatically.
set -euo pipefail

GODOT="${1:-${GODOT:-godot}}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRAMES_DIR="${FRAMES_DIR:-$PROJECT_DIR/output/frames}"
OUT="${OUT:-$PROJECT_DIR/output/amazigh_saga_combat_720x1280.mp4}"
SEED="${SEED:-33}"
HP_SCALE="${HP_SCALE:-0.45}"

echo "== Godot: $("$GODOT" --version)"
echo "== Importing project"
"$GODOT" --headless --path "$PROJECT_DIR" --import >/dev/null 2>&1 || true

rm -rf "$FRAMES_DIR"
mkdir -p "$FRAMES_DIR" "$(dirname "$OUT")"

RUN=()
if [ -z "${DISPLAY:-}" ] && command -v xvfb-run >/dev/null; then
	RUN=(xvfb-run -a -s "-screen 0 1280x1400x24")
fi

echo "== Rendering gameplay with Movie Maker (720x1280 @ 30 FPS)"
"${RUN[@]}" "$GODOT" --path "$PROJECT_DIR" --rendering-driver opengl3 \
	--resolution 720x1280 --fixed-fps 30 --write-movie "$FRAMES_DIR/frame.png" \
	-- --demo --seed="$SEED" --hp-scale="$HP_SCALE" --quit-after-end=1.2 --log

echo "== Encoding $(ls "$FRAMES_DIR"/frame*.png | wc -l) frames to H.264"
ffmpeg -v error -y -framerate 30 -i "$FRAMES_DIR/frame%08d.png" -i "$FRAMES_DIR/frame.wav" \
	-map 0:v:0 -map 1:a:0 -c:v libx264 -profile:v high -preset slow -crf 17 -pix_fmt yuv420p \
	-r 30 -c:a aac -b:a 160k -ar 48000 -shortest -movflags +faststart "$OUT"

echo "== Result"
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,profile,width,height,r_frame_rate,nb_frames,pix_fmt \
	-show_entries format=duration,format_name -of default=noprint_wrappers=1 "$OUT"
