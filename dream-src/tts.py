# -*- coding: utf-8 -*-
"""Synthesise every narration line separately -> exact per-line timings."""
import json, os, wave, numpy as np
from piper import PiperVoice, SynthesisConfig
from script import SHOTS, ACTS

MODEL = "../models/en_US-norman-medium.onnx"
SR    = 22050
OUT   = "lines"
os.makedirs(OUT, exist_ok=True)

# authored gaps, in RAW (pre-fingerprint) seconds
G_LINE, G_SHOT, G_ACT, LEAD, TAIL = 0.17, 0.40, 1.90, 1.35, 2.80

voice = PiperVoice.load(MODEL)
cfg = SynthesisConfig(length_scale=1.0, noise_scale=0.60, noise_w_scale=0.75,
                      normalize_audio=True, volume=1.0)

def synth(text, path):
    with wave.open(path, "wb") as w:
        voice.synthesize_wav(text, w, syn_config=cfg)
    with wave.open(path, "rb") as w:
        n, sr = w.getnframes(), w.getframerate()
        a = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768.0
    return a, sr

# trim leading/trailing near-silence so gaps are ours, not the model's
def trim(a, thr=0.006, pad=0.045):
    if a.size == 0: return a
    e = np.abs(a); w = int(0.008 * SR)
    k = np.convolve(e, np.ones(w) / w, mode="same")
    idx = np.where(k > thr)[0]
    if idx.size == 0: return a
    p = int(pad * SR)
    return a[max(0, idx[0] - p): min(a.size, idx[-1] + p)]

pieces, lines_meta, shots_meta = [], [], []
t = LEAD
pieces.append(("sil", LEAD))
prev_act = None
li = 0
for si, s in enumerate(SHOTS):
    if prev_act is not None:
        gap = G_ACT if s["act"] != prev_act else G_SHOT
        pieces.append(("sil", gap)); t += gap
    prev_act = s["act"]
    shot_start = t
    for j, text in enumerate(s["lines"]):
        if j > 0:
            pieces.append(("sil", G_LINE)); t += G_LINE
        p = f"{OUT}/l{li:03d}.wav"
        a, sr = synth(text, p)
        assert sr == SR, sr
        a = trim(a)
        d = a.size / SR
        pieces.append(("aud", a))
        lines_meta.append(dict(i=li, shot=si, act=s["act"], text=text, t=round(t, 4), d=round(d, 4)))
        t += d; li += 1
        print(f"\r line {li:3d}/80  t={t:7.2f}s", end="", flush=True)
    shots_meta.append(dict(i=si, act=s["act"], t=round(shot_start, 4), d=round(t - shot_start, 4)))
pieces.append(("sil", TAIL)); t += TAIL

# render narration bed
buf = np.zeros(int(t * SR) + SR, dtype=np.float32)
cur = 0
for kind, v in pieces:
    if kind == "sil":
        cur += int(v * SR)
    else:
        buf[cur:cur + v.size] += v; cur += v.size
buf = buf[:int(t * SR) + 1]
np.save("narration_raw.npy", buf)
json.dump(dict(raw_dur=t, sr=SR, lines=lines_meta, shots=shots_meta),
          open("timings_raw.json", "w"), indent=1)
print(f"\nRAW narration: {t:.2f}s  ({t/60:.2f} min) -> after +6% pace ~{t*0.9431:.1f}s ({t*0.9431/60:.2f} min)")
