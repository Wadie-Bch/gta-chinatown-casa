# -*- coding: utf-8 -*-
import json, base64, os, math, hashlib
from script import SHOTS, ACTS, ACCENTS, TITLE, CHANNEL, STYLE_BIBLE, NEGATIVE, TAIL, prompt_for

T = json.load(open("timings.json")); DUR = T["dur"]

# ---------------- TIME WARP anchors: audio time -> authored visual time ------
acts_audio = [ [s for s in T["shots"] if s["act"]==a][0]["t"] for a in range(1,10) ]
WA = [0.0] + acts_audio[1:] + [DUR]
WV = [0.0] + [round(t*4)/4 for t in acts_audio[1:]] + [round(DUR*4)/4]
def warp(at):
    if at <= WA[0]: return WV[0]+(at-WA[0])
    for i in range(len(WA)-1):
        if at <= WA[i+1]:
            f=(at-WA[i])/(WA[i+1]-WA[i]); return WV[i]+(WV[i+1]-WV[i])*f
    return WV[-1]+(at-WA[-1])

def h(s, n):   # deterministic jitter, never random at build time
    return int(hashlib.md5((s+str(n)).encode()).hexdigest()[:8],16)/0xFFFFFFFF

ZFILL = 1920/5600.0                       # plate exactly fills the 16:9 frame
Z = {"locked-off hold":0.374,"slow push-in":0.392,"slow dolly left":0.364,
     "slow dolly right":0.364,"one smooth crane down":0.358}
CX= {"slow dolly left":-260,"slow dolly right":260}

shots=[]
for i,(s,m) in enumerate(zip(SHOTS,T["shots"])):
    a=ACTS[s["act"]-1]; j=h(s["plate"]["k"],i)
    if s["head"]:  z,cx,rot = ZFILL, 0, 0.0
    elif s["cap"]: z,cx,rot = ZFILL+0.006, CX.get(s["move"],0)*0.35, (j-0.5)*0.9
    else:          z,cx,rot = Z[s["move"]]+0.022*(j-0.5), CX.get(s["move"],0), (j-0.5)*1.9
    shots.append(dict(
        act=s["act"], accent=a["accent"], plate=s["plate"], grammar=s["grammar"],
        move=s["move"], lines=s["lines"], head=s["head"], sub=s["sub"], cap=s["cap"],
        t=round(m["t"],3), dur=round(m["d"],3), vt=round(warp(m["t"]),3),
        z=round(z,4), cx=round(cx,1), rot=round(rot,3),
        prompt=prompt_for(s)))

acc={k:dict(name=v[0],hex=v[1],hex2=v[2],sky="sky_"+k,glow="glw_"+k,shaft="shf_"+k)
     for k,v in ACCENTS.items()}
D=dict(title=TITLE,channel=CHANNEL,dur=round(DUR,3),acts=ACTS,shots=shots,acc=acc,
       warp=dict(a=[round(x,4) for x in WA],v=[round(x,4) for x in WV]),
       bible=STYLE_BIBLE,neg=NEGATIVE,voice=T["voice"])

# ---------------- SVG defs -------------------------------------------------
DARK={"gold":("#2A2415","#4E3C17"),"teal":("#0E232C","#0F3948"),"sodium":("#2B1B11","#4E2A15")}
defs=[]
for k,v in acc.items():
    d1,d2=DARK[k]
    defs.append(f'<linearGradient id="{v["sky"]}" x1="0" y1="0" x2="0" y2="1">'
      f'<stop offset="0%" stop-color="#04070C"/><stop offset="40%" stop-color="#0A1220"/>'
      f'<stop offset="76%" stop-color="{d1}"/><stop offset="100%" stop-color="{d2}"/></linearGradient>')
    defs.append(f'<radialGradient id="{v["glow"]}"><stop offset="0%" stop-color="{v["hex"]}" stop-opacity=".55"/>'
      f'<stop offset="46%" stop-color="{v["hex2"]}" stop-opacity=".20"/>'
      f'<stop offset="100%" stop-color="{v["hex2"]}" stop-opacity="0"/></radialGradient>')
    defs.append(f'<linearGradient id="{v["shaft"]}" x1="0" y1="0" x2="0" y2="1">'
      f'<stop offset="0%" stop-color="{v["hex"]}" stop-opacity=".58"/>'
      f'<stop offset="55%" stop-color="{v["hex"]}" stop-opacity=".22"/>'
      f'<stop offset="100%" stop-color="{v["hex2"]}" stop-opacity=".03"/></linearGradient>')
defs.append('<linearGradient id="scrimT" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0%" stop-color="#04070C" stop-opacity=".88"/>'
            '<stop offset="58%" stop-color="#04070C" stop-opacity=".60"/>'
            '<stop offset="100%" stop-color="#04070C" stop-opacity="0"/></linearGradient>')
defs.append('<linearGradient id="scrimB" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0%" stop-color="#04070C" stop-opacity="0"/>'
            '<stop offset="46%" stop-color="#04070C" stop-opacity=".52"/>'
            '<stop offset="100%" stop-color="#04070C" stop-opacity=".74"/></linearGradient>')
defs.append('<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0%" stop-color="#04070C" stop-opacity="0"/>'
            '<stop offset="100%" stop-color="#04070C" stop-opacity=".92"/></linearGradient>')
defs.append('<filter id="soft" x="-40%" y="-40%" width="180%" height="180%">'
            '<feGaussianBlur stdDeviation="34"/></filter>')
defs.append('<filter id="soft0" x="-20%" y="-20%" width="140%" height="140%">'
            '<feGaussianBlur stdDeviation="5"/></filter>')
defs.append('<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" '
            'stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>')

css=open("tpl/style.css").read()
fb=json.load(open("fonts_b64.json"))
css=css.replace("__OSWALD__",fb["Oswald"]).replace("__ARCHIVO__",fb["Archivo"])
b64=base64.b64encode(open("narration.mp3","rb").read()).decode()

HTML=f"""<title>A Job With No CV</title>
<style>{css}</style>
<div id="wrap"><div id="stage">
<svg id="svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
  <defs id="defs">{''.join(defs)}</defs>
  <rect id="backdrop" x="0" y="0" width="1920" height="1080" fill="url(#sky_sodium)"/>
  <g id="weave"><g id="world"></g></g>
  <g id="dustL" opacity=".85"></g>
  <rect x="0" y="0" width="1920" height="1080" filter="url(#grain)" opacity=".13"
        style="mix-blend-mode:overlay;pointer-events:none"/>
</svg>
<div id="tag">{CHANNEL}<i>one system that quietly runs earth</i></div>
<div id="hud"><span id="hudT">00:00 / 00:00</span><b id="hudAct">&nbsp;</b></div>
<div id="vig"></div>
<button id="sbtn">shot sheet</button>
<div id="bar"><div class="track"><div class="fill"></div><div class="head"></div></div></div>
<div id="gate"><div class="gin">
  <div class="gk">Dream · episode 09</div>
  <div class="gt">A Job With<br>No CV</div>
  <div class="gs">the one page that decides who gets to work</div>
  <div class="gb"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>play</div>
  <div class="gmeta">{len(shots)} shots · {int(DUR//60)}m {int(DUR%60):02d}s · headphones recommended</div>
</div></div>
</div></div>
<div id="rot"><div><svg viewBox="0 0 48 48"><rect x="7" y="15" width="34" height="22" rx="3"/>
  <path d="M18 9l4-4 4 4"/></svg>
  <div class="r1">rotate your device</div>
  <div class="r2">This episode is framed 16:9. Portrait would crop the headlines out of the frame.</div>
</div></div>
<div id="sheet"></div>
<audio id="au" preload="auto" src="data:audio/mpeg;base64,{b64}"></audio>
<script>const D={json.dumps(D,separators=(',',':'))};</script>
<script>{open('tpl/plates.js').read()}</script>
<script>{open('tpl/engine.js').read()}</script>
"""
out="/home/user/gta-chinatown-casa/dream-a-job-with-no-cv.html"
open(out,"w").write(HTML)
print(f"WROTE {out}  {os.path.getsize(out)/1e6:.2f} MB   shots={len(shots)} dur={DUR:.1f}s")
print("warp anchors:", [f"{a:.2f}->{v:.2f}" for a,v in zip(WA,WV)])
