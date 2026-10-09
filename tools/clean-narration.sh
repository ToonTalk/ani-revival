#!/bin/bash
# Clean the narration of "Cinderella 1978" (Ken's 16mm film, as transferred to MP4) and put
# it back on the film. Writes reports/film/narration/:
#   narration-clean.m4a / .wav         the cleaned soundtrack (medium denoising)
#   narration-gentle.wav, -strong.wav  less and more denoising, to compare by ear
#   cinderella-1978-clean-sound.mp4    the film with the cleaned soundtrack (video untouched)
# What is wrong with the soundtrack (measured with numpy and spectrograms, 9 October 2026):
#   - mains hum at 60.25 Hz and its harmonics (120.5, 180.75, 241, 482 Hz)
#   - a whistle near 1,636 Hz that wanders about +-10 Hz with the film's speed, and its echo
#     near 3,275 Hz
#   - a broad band of noise near 700-950 Hz that waxes and wanes
#   - a clatter at 2-3.5 kHz pulsing 23.94 times a second, the film's frame rate (projector
#     or sprocket holes)
#   - except 111.5-117.5 s, a splice from a much quieter recording; the narration ends near
#     100 s and the titles (about 120-156 s) carry only the noise.
# Notches take out the hum and the whistle; then tools/denoise_narration.py, a Wiener filter
# that follows the quietest level in each band over the last 2 seconds, takes out the rest.
# On the whole soundtrack the speech band's loud moments stand this far above its quiet ones
# (90th over 10th percentile of 50 ms frames, 250-2000 Hz):
#   original 4.6 dB; notches only 5.0; gentle 9.2; clean 12.5; strong 16.4
# and the 2.5-3.8 kHz noise falls 9, 13 and 18 dB. The stronger settings also thin the
# voice a little (its loud moments lose 5 to 7 dB before the loudness is evened out again),
# so choose by ear. ffmpeg's own afftdn, tried first, reached only 8 dB at its strongest.
# Usage: bash tools/clean-narration.sh [film.mp4]   (needs Python with numpy)
set -e
FFMPEG="${FFMPEG:-/c/Program Files/CEWE Creator/CEWE Creator/ffmpeg.exe}"
PYTHON="${PYTHON:-python}"
FILM="${1:-G:/My Drive/Old films, videos, and animations/Cinderella 1978.mp4}"
OUT=reports/film/narration
HERE="$(dirname "$0")"
mkdir -p "$OUT"
TONES="highpass=f=75:poles=2,bandreject=f=60.25:width_type=h:w=4,bandreject=f=120.5:width_type=h:w=4,bandreject=f=180.75:width_type=h:w=4,bandreject=f=241:width_type=h:w=4,bandreject=f=482:width_type=h:w=4,equalizer=f=1636:t=h:w=44:g=-28,equalizer=f=3275:t=h:w=70:g=-14"
# the voice's s and sh sounds reach about 4.5 kHz; above 5.5 kHz there is only noise
END="lowpass=f=5500:poles=2,loudnorm=I=-18:LRA=9:TP=-1.5"
"$FFMPEG" -hide_banner -loglevel error -y -i "$FILM" -vn -ac 1 -ar 44100 -c:a pcm_s16le "$OUT/narration-original.wav"
"$FFMPEG" -hide_banner -loglevel error -y -i "$OUT/narration-original.wav" -af "$TONES" -c:a pcm_s16le "$OUT/narration-notched.wav"
denoise() { # $1 = how far a band may be turned down, in dB; $2 = output file
  "$PYTHON" -I "$HERE/denoise_narration.py" "$OUT/narration-notched.wav" "$OUT/narration-wiener.wav" "$1" 2.0
  "$FFMPEG" -hide_banner -loglevel error -y -i "$OUT/narration-wiener.wav" -af "$END" -ar 44100 -c:a pcm_s16le "$2"
}
denoise 10 "$OUT/narration-gentle.wav"
denoise 15 "$OUT/narration-clean.wav"
denoise 20 "$OUT/narration-strong.wav"
rm -f "$OUT/narration-notched.wav" "$OUT/narration-wiener.wav"
"$FFMPEG" -hide_banner -loglevel error -y -i "$OUT/narration-clean.wav" -c:a aac -b:a 128k "$OUT/narration-clean.m4a"
"$FFMPEG" -hide_banner -loglevel error -y -i "$FILM" -i "$OUT/narration-clean.wav" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 160k -shortest "$OUT/cinderella-1978-clean-sound.mp4"
ls -la "$OUT"
