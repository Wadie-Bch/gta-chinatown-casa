#!/usr/bin/env python3
"""Generate narration segments with edge-tts and emit an exact timing manifest.

- one mp3 per script segment (paragraph sized, natural prosody)
- caches on a hash of (text, voice, rate, pitch, volume) so unchanged segments are skipped
- keeps edge-tts WordBoundary metadata so the film can cut on real word timings
  instead of splitting the audio evenly
- durations come from parsing the mp3 frame headers (exact), cross-checked with ffmpeg
"""
import asyncio, hashlib, json, os, struct, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EPISODE = os.path.join(ROOT, "episode", "dollar_survive_episode.json")
OUTDIR = os.path.join(ROOT, "audio", "narration")
MANIFEST = os.path.join(OUTDIR, "manifest.json")
FFMPEG = os.environ.get("FFMPEG_BIN", "/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux")


def trust_local_ca():
    """Some sandboxes / corporate networks re-terminate TLS. edge-tts pins certifi's
    bundle in a module level SSL context, so add the local CA to it when one exists.
    Verification stays ON; we only widen the trust store. No-op on a normal machine."""
    import ssl
    extra = os.environ.get("EXTRA_CA_BUNDLE") or os.environ.get("SSL_CERT_FILE")
    for cand in (extra, "/root/.ccr/ca-bundle.crt"):
        if cand and os.path.exists(cand):
            import edge_tts.communicate as _c
            import edge_tts.voices as _v
            for mod in (_c, _v):
                ctx = getattr(mod, "_SSL_CTX", None)
                if isinstance(ctx, ssl.SSLContext):
                    ctx.load_verify_locations(cafile=cand)
            print(f"  (added CA bundle {cand} to edge-tts trust store)")
            return

BITRATES_V1L3 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,None]
BITRATES_V2L3 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,None]
SRATES = {0:(44100,22050,11025),1:(48000,24000,12000),2:(32000,16000,8000)}


def mp3_duration(path):
    """Exact duration by walking MPEG audio frame headers. No external deps."""
    data = open(path, "rb").read()
    i = 0
    n = len(data)
    # skip ID3v2 if present
    if data[:3] == b"ID3":
        size = 0
        for b in data[6:10]:
            size = (size << 7) | (b & 0x7F)
        i = 10 + size
    total = 0.0
    frames = 0
    while i + 4 <= n:
        if data[i] != 0xFF or (data[i+1] & 0xE0) != 0xE0:
            i += 1
            continue
        h = struct.unpack(">I", data[i:i+4])[0]
        ver = (h >> 19) & 0x3      # 3=MPEG1, 2=MPEG2, 0=MPEG2.5
        layer = (h >> 17) & 0x3    # 1 = Layer III
        bri = (h >> 12) & 0xF
        sri = (h >> 10) & 0x3
        pad = (h >> 9) & 0x1
        if layer != 1 or ver == 1 or bri in (0, 15) or sri == 3:
            i += 1
            continue
        bitrate = (BITRATES_V1L3 if ver == 3 else BITRATES_V2L3)[bri] * 1000
        srate = SRATES[sri][0 if ver == 3 else (1 if ver == 2 else 2)]
        spf = 1152 if ver == 3 else 576
        flen = int((spf // 8) * bitrate / srate) + pad
        if flen <= 4:
            i += 1
            continue
        total += spf / srate
        frames += 1
        i += flen
    return total, frames


def ffmpeg_duration(path):
    if not os.path.exists(FFMPEG):
        return None
    try:
        r = subprocess.run([FFMPEG, "-hide_banner", "-i", path, "-f", "null", "-"],
                           capture_output=True, text=True, timeout=60)
        for line in reversed(r.stderr.splitlines()):
            if "time=" in line:
                t = line.split("time=")[1].split()[0]
                hh, mm, ss = t.split(":")
                return int(hh) * 3600 + int(mm) * 60 + float(ss)
    except Exception:
        return None
    return None


async def synth(text, voice, rate, pitch, mp3_path):
    import edge_tts
    comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch,
                                boundary="WordBoundary")
    words = []
    audio = bytearray()
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
        elif chunk["type"] in ("WordBoundary", "SentenceBoundary"):
            # edge-tts reports 100-nanosecond ticks
            words.append({
                "w": chunk["text"],
                "t": round(chunk["offset"] / 1e7, 4),
                "d": round(chunk["duration"] / 1e7, 4),
            })
    if not audio:
        raise RuntimeError("edge-tts returned no audio")
    with open(mp3_path, "wb") as f:
        f.write(audio)
    return words


async def main():
    trust_local_ca()
    ep = json.load(open(EPISODE))
    voice = ep.get("voice", "en-US-BrianNeural")
    rate = ep.get("rate", "+0%")
    pitch = ep.get("pitch", "+0Hz")
    os.makedirs(OUTDIR, exist_ok=True)

    old = {}
    if os.path.exists(MANIFEST):
        try:
            old = {s["id"]: s for s in json.load(open(MANIFEST))["segments"]}
        except Exception:
            old = {}

    out, made, cached = [], 0, 0
    for seg in ep["segments"]:
        sid = seg["id"]
        key = hashlib.sha1(f"{seg['text']}|{voice}|{rate}|{pitch}|v4".encode()).hexdigest()[:16]
        mp3 = os.path.join(OUTDIR, f"{sid}.mp3")
        prev = old.get(sid)
        if prev and prev.get("hash") == key and os.path.exists(mp3):
            out.append(prev)
            cached += 1
            print(f"  cached {sid}  {prev['dur']:.2f}s")
            continue
        words = None
        for attempt in range(4):
            try:
                words = await synth(seg["text"], voice, rate, pitch, mp3)
                break
            except Exception as e:
                wait = 2 ** attempt
                print(f"  {sid} attempt {attempt+1} failed: {e} -> retry in {wait}s", file=sys.stderr)
                await asyncio.sleep(wait)
        if words is None:
            print(f"FATAL: could not synthesize {sid}", file=sys.stderr)
            sys.exit(2)
        dur, frames = mp3_duration(mp3)
        ff = ffmpeg_duration(mp3)
        if ff and abs(ff - dur) > 0.15:
            print(f"  ! {sid} duration mismatch parser={dur:.2f} ffmpeg={ff:.2f}; using ffmpeg")
            dur = ff
        out.append({
            "id": sid, "chapter": seg["chapter"], "file": f"{sid}.mp3",
            "hash": key, "dur": round(dur, 3), "frames": frames,
            "pauseAfter": seg.get("pauseAfter", 0), "text": seg["text"], "words": words,
        })
        made += 1
        print(f"  built  {sid}  {dur:.2f}s  {len(words)} words  ({os.path.getsize(mp3)//1024} KB)")

    speech = sum(s["dur"] for s in out)
    pauses = sum(s["pauseAfter"] for s in out)
    total = ep.get("leadIn", 0) + speech + pauses + ep.get("tailOut", 0)
    words_total = sum(len(s["text"].split()) for s in out)
    manifest = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "voice": voice, "rate": rate, "pitch": pitch,
        "leadIn": ep.get("leadIn", 0), "tailOut": ep.get("tailOut", 0),
        "speechDuration": round(speech, 3),
        "totalDuration": round(total, 3),
        "wpm": round(words_total / (speech / 60), 1),
        "segments": out,
    }
    json.dump(manifest, open(MANIFEST, "w"), indent=1)
    print(f"\n{made} generated, {cached} cached")
    print(f"speech {speech:.1f}s + pauses {pauses:.1f}s + lead/tail -> total {total:.1f}s ({total/60:.2f} min)")
    print(f"pace: {manifest['wpm']} wpm")

if __name__ == "__main__":
    asyncio.run(main())
