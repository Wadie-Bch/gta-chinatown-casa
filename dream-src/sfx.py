# -*- coding: utf-8 -*-
"""Fingerprint the voice, synthesise SFX + per-chapter drone bed, mix, encode."""
import json, subprocess, numpy as np, wave, os
from script import SHOTS, ACTS

SR = 22050
raw = np.load("narration_raw.npy")
T   = json.load(open("timings_raw.json"))

def wav_write(path, a, sr=SR):
    a = np.clip(a, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((a * 32767).astype("<i2").tobytes())

wav_write("narration_raw.wav", raw)

# ---------------------------------------------------------------- 1. VOICE FINGERPRINT
# pitch -6% (asetrate 0.94) / net pace +6% (atempo 1.128) / EQ / comp / limit
CHAIN = ("asetrate=22050*0.94,aresample=22050,atempo=1.128,"
         "equalizer=f=110:width_type=q:w=0.9:g=3.6,"
         "equalizer=f=320:width_type=q:w=1.1:g=-3.1,"
         "equalizer=f=2700:width_type=q:w=0.8:g=3.4,"
         "acompressor=threshold=-18dB:ratio=3:attack=8:release=180:makeup=2,"
         "alimiter=limit=0.94")
subprocess.run(["ffmpeg","-y","-v","error","-i","narration_raw.wav","-af",CHAIN,
                "-ar",str(SR),"-ac","1","narration_fp.wav"], check=True)

with wave.open("narration_fp.wav","rb") as w:
    vo = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32)/32768.0
K = (vo.size/SR) / (raw.size/SR)                     # measured time factor (self-correcting)
DUR = vo.size/SR
print(f"fingerprint: raw {raw.size/SR:.2f}s -> {DUR:.2f}s  factor={K:.5f}")

# scale every authored time into FINAL audio time
for l in T["lines"]: l["t"]=round(l["t"]*K,4); l["d"]=round(l["d"]*K,4)
for s in T["shots"]: s["t"]=round(s["t"]*K,4); s["d"]=round(s["d"]*K,4)

# ---------------------------------------------------------------- 2. SFX GENERATORS
rng = np.random.default_rng(20260908)
def env(n, a, d, p=1.0):
    e = np.ones(n); ai=max(1,int(a*SR)); di=max(1,int(d*SR))
    e[:ai] = np.linspace(0,1,ai)**0.6
    e[-di:] = np.linspace(1,0,di)**p
    return e
def whoosh(dur=0.85, f0=380, f1=1500):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    nz = rng.normal(0,1,n)
    # sweeping one-pole band emphasis
    cut = np.linspace(f0,f1,n)/ (SR/2)
    y = np.zeros(n); z=0.0
    for i in range(n):
        a = min(0.98, cut[i]*1.6); z += a*(nz[i]-z); y[i]=nz[i]-z
    return y*env(n,0.22*dur,0.62*dur,1.7)*0.5
def thud(dur=0.55, f=62):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    fr = f*np.exp(-t*4.5)+26
    ph = 2*np.pi*np.cumsum(fr)/SR
    return (np.sin(ph)*np.exp(-t*6.0))*0.85
def pop(dur=0.13, f=520):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    return np.sin(2*np.pi*f*t*np.exp(-t*7))*np.exp(-t*26)*0.5
def chime(dur=1.9, f=784):
    n=int(dur*SR); t=np.linspace(0,dur,n); y=np.zeros(n)
    for k,g in ((1,1.0),(2.01,0.42),(3.03,0.2),(4.98,0.1)):
        y += g*np.sin(2*np.pi*f*k*t)*np.exp(-t*(1.6+k*0.7))
    return y*0.32
def riser(dur=1.7):
    n=int(dur*SR); t=np.linspace(0,dur,n)
    f = 110*np.exp(t/dur*1.9)
    ph = 2*np.pi*np.cumsum(f)/SR
    nz = rng.normal(0,1,n)*np.linspace(0,1,n)**2.4*0.32
    return (np.sin(ph)*0.30 + nz)*(np.linspace(0,1,n)**2.0)*0.75
def tick(dur=0.06):
    n=int(dur*SR); return rng.normal(0,1,n)*np.exp(-np.linspace(0,dur,n)*90)*0.30

# ---------------------------------------------------------------- 3. DRONE BED (per chapter)
# each act: root, partials, noise wash amount -> matches its emotional grade
DRONE = {1:(49.0,(1,2,3.02),0.22), 2:(55.0,(1,2,2.99),0.16), 3:(43.7,(1,1.5,2),0.30),
         4:(65.4,(1,2,3),0.10),    5:(58.3,(1,2.02,3),0.20), 6:(41.2,(1,1.49,2.01),0.40),
         7:(36.7,(1,2,4.03),0.46), 8:(48.9,(1,2,3),0.18),    9:(73.4,(1,2,3,4),0.08)}
bed = np.zeros(vo.size+SR, dtype=np.float32)
act_bounds=[]
for a in range(1,10):
    ss=[s for s in T["shots"] if s["act"]==a]
    t0=ss[0]["t"]-1.5; t1=ss[-1]["t"]+ss[-1]["d"]+1.2
    act_bounds.append((a,max(0.0,t0),t1))
for a,t0,t1 in act_bounds:
    root,parts,nz_amt = DRONE[a]
    i0,i1 = int(max(0,t0)*SR), min(bed.size,int(t1*SR))
    n=i1-i0
    if n<=0: continue
    t=np.linspace(0,n/SR,n)
    y=np.zeros(n)
    for j,p in enumerate(parts):
        lfo = 1+0.004*np.sin(2*np.pi*(0.055+0.017*j)*t+j)
        y += (0.55/(j+1))*np.sin(2*np.pi*root*p*t*lfo)
    nz = rng.normal(0,1,n)
    z=0.0; lp=np.zeros(n)
    for i in range(0,n,1):                      # cheap one-pole LP on the wash
        z += 0.0035*(nz[i]-z); lp[i]=z
    y = y*0.55 + lp*nz_amt*26.0
    f=int(1.4*SR); f=min(f,n//2)
    e=np.ones(n); e[:f]=np.linspace(0,1,f)**1.5; e[-f:]=np.linspace(1,0,f)**1.5
    bed[i0:i1] += (y*e).astype(np.float32)
bed = bed[:vo.size]*0.085

# ---------------------------------------------------------------- 4. PLACE HITS
sfxbuf = np.zeros(vo.size+2*SR, dtype=np.float32)
def put(sig, t, g=1.0):
    i=int(t*SR)
    if i<0: return
    j=min(sfxbuf.size, i+sig.size)
    sfxbuf[i:j] += (sig[:j-i]*g).astype(np.float32)

MOVING = ("slow push-in","slow dolly left","slow dolly right","one smooth crane down")
prev_act=None
for si,(s,m) in enumerate(zip(SHOTS, T["shots"])):
    t = m["t"]
    new_act = s["act"]!=prev_act; prev_act=s["act"]
    if new_act:
        put(riser(1.7), t-1.75, 0.60)          # riser into the chapter card
        put(thud(0.75,52), t-0.09, 0.85)
        put(chime(1.9, 660 if s["act"]%2 else 784), t+0.06, 0.42)
    else:
        # hit lands on the camera move
        if s["move"] in MOVING: put(whoosh(0.80, 300, 1400), t-0.52, 0.30)
        else:                   put(thud(0.5, 58), t-0.06, 0.34)
        if si%3==0: put(pop(), t+0.02, 0.22)
    if s.get("cap"): put(tick(), t+0.55, 0.9); put(tick(), t+0.62, 0.55)

sfxbuf = sfxbuf[:vo.size]

# ---------------------------------------------------------------- 5. MIX + MASTER
mix = vo*1.0 + sfxbuf*0.42 + bed
peak=np.max(np.abs(mix)); print("pre-master peak", round(float(peak),3))
wav_write("mix.wav", mix/max(1.0,peak/0.98))
subprocess.run(["ffmpeg","-y","-v","error","-i","mix.wav",
                "-af","alimiter=limit=0.96,loudnorm=I=-15:TP=-1.2:LRA=11",
                "-c:a","libmp3lame","-b:a","88k","-ac","1","-ar","22050","narration.mp3"], check=True)
sz=os.path.getsize("narration.mp3")
d=float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","narration.mp3"],
        capture_output=True,text=True).stdout.strip())
T["dur"]=round(d,3); T["voice"]={"model":"en_US-norman-medium","dataset":"LibriVox","license":"public domain",
                                 "training":"from scratch, 1200 epochs","chain":CHAIN}
json.dump(T, open("timings.json","w"), indent=1)
print(f"MP3 {sz/1e6:.2f} MB  dur {d:.2f}s ({d/60:.2f} min)  b64~{sz*4/3/1e6:.2f} MB")
