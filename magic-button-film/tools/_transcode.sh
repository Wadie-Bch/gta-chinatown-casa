#!/bin/bash
set -e
S=/tmp/claude-0/-home-user-gta-chinatown-casa/1d365fc6-c319-529a-842f-29b164bb8181/scratchpad
RAW="$S/full_capture_raw.mp4"
OUT="$S/magic_button_film.mp4"
ffmpeg -y -i "$RAW" \
  -vf "scale=1600:900:flags=lanczos,fps=30" -vsync cfr \
  -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart \
  "$OUT"
echo "--- ffprobe ---"
ffprobe -hide_banner -v error -show_entries format=duration,size,bit_rate -show_entries stream=codec_type,codec_name,width,height,avg_frame_rate -of default=noprint_wrappers=1 "$OUT"
ls -la "$OUT"
