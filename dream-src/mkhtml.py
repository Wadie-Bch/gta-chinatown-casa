# -*- coding: utf-8 -*-
import json, base64, os, hashlib
from script import SCENES, ACTS, PAL, TITLE, CHANNEL

T=json.load(open("timings.json",encoding="utf-8")); DUR=T["dur"]
acts_audio=[[s for s in T["shots"] if s["act"]==a][0]["t"] for a in range(1,10)]
WA=[0.0]+acts_audio[1:]+[DUR]
WV=[0.0]+[round(t*4)/4 for t in acts_audio[1:]]+[round(DUR*4)/4]
def warp(at):
    if at<=WA[0]: return WV[0]+(at-WA[0])
    for i in range(len(WA)-1):
        if at<=WA[i+1]:
            f=(at-WA[i])/(WA[i+1]-WA[i]); return WV[i]+(WV[i+1]-WV[i])*f
    return WV[-1]+(at-WA[-1])

scenes=[]
for i,(s,m) in enumerate(zip(SCENES,T["shots"])):
    scenes.append(dict(act=s["act"], scene=s["scene"], lines=s["lines"],
        head=s["head"], sub=s["sub"], cap=s["cap"], big=s["big"], stat=s["stat"],
        t=round(m["t"],3), dur=round(m["d"],3), vt=round(warp(m["t"]),3)))
lines=[dict(text=l["text"], scene=l["shot"], t=round(l["t"],3), d=round(l["d"],3),
            vt=round(warp(l["t"]),3)) for l in T["lines"]]
D=dict(title=TITLE, channel=CHANNEL, dur=round(DUR,3), acts=ACTS, scenes=scenes, lines=lines,
       warp=dict(a=[round(x,4) for x in WA], v=[round(x,4) for x in WV]), voice=T["voice"])

css=open("tpl/style.css",encoding="utf-8").read()
fb=json.load(open("fonts_b64.json",encoding="utf-8"))
css=css.replace("__OSWALD__",fb["Oswald"]).replace("__ARCHIVO__",fb["Archivo"])
b64=base64.b64encode(open("narration.mp3","rb").read()).decode()
grain=open("grain.b64").read()

HTML=f"""<title>A Bin With No Away</title>
<style>{css}</style>
<div id="wrap"><div id="stage">
<svg id="svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
  <defs id="defs">
    <pattern id="grainP" width="320" height="320" patternUnits="userSpaceOnUse">
      <image href="data:image/png;base64,{grain}" width="320" height="320"/></pattern>
    <pattern id="scanP" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="6" height="3" fill="#000"/></pattern>
    <radialGradient id="vigG"><stop offset="52%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity=".60"/></radialGradient>
    <filter id="rgb" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
      <feOffset id="rgbA" in="SourceGraphic" dx="0" dy="0" result="ro"/>
      <feColorMatrix in="ro" type="matrix" result="rc"
        values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
      <feOffset id="rgbB" in="SourceGraphic" dx="0" dy="0" result="bo"/>
      <feColorMatrix in="bo" type="matrix" result="bc"
        values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
      <feColorMatrix in="SourceGraphic" type="matrix" result="gc"
        values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"/>
      <feBlend in="rc" in2="gc" mode="screen" result="rg"/>
      <feBlend in="rg" in2="bc" mode="screen"/>
    </filter>
  </defs>
  <rect id="bgB" x="0" y="0" width="1920" height="1080" fill="{ACTS[0]['bg']}"/>
  <rect id="bgA" x="0" y="0" width="1920" height="1080" fill="{ACTS[0]['bg']}"/>
  <g id="scenes"></g>
  <g id="amb"></g>
  <rect id="invR" x="0" y="0" width="1920" height="1080" fill="#fff" opacity="0"
        style="mix-blend-mode:difference;pointer-events:none"/>
  <rect id="grainR" x="0" y="0" width="1920" height="1080" fill="url(#grainP)" opacity=".24"
        style="mix-blend-mode:overlay;pointer-events:none"/>
  <rect id="scanR" x="0" y="0" width="1920" height="1080" fill="url(#scanP)" opacity=".10"
        style="mix-blend-mode:multiply;pointer-events:none"/>
  <rect x="0" y="0" width="1920" height="1080" fill="url(#vigG)" style="pointer-events:none"/>
  <rect id="flashR" x="0" y="0" width="1920" height="1080" fill="#EAF2FA" opacity="0"
        style="mix-blend-mode:screen;pointer-events:none"/>
</svg>
<div id="sub"></div>
<div id="bar"><div class="track"><div class="fill"></div><div class="head"></div></div></div>
<div id="gate"><div class="gin">
  <div class="gk">Dream · episode 11</div>
  <div class="gt">A Bin With<br>No Away</div>
  <div class="gs">the system that ends your relationship with an object</div>
  <div class="gb"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>play</div>
  <div class="gmeta">{len(scenes)} scenes · {int(DUR//60)}m {int(DUR%60):02d}s</div>
</div></div>
</div></div>
<div id="rot"><div><div class="r1">rotate your device</div>
  <div class="r2">This episode is framed 16:9.</div></div></div>
<audio id="au" preload="auto" src="data:audio/mpeg;base64,{b64}"></audio>
<script>const PAL={json.dumps(PAL)};const D={json.dumps(D,separators=(',',':'))};</script>
<script>{open('tpl/kg.js',encoding='utf-8').read()}</script>
<script>{open('tpl/scenes.js',encoding='utf-8').read()}</script>
<script>{open('tpl/engine.js',encoding='utf-8').read()}</script>
"""
out="/home/user/gta-chinatown-casa/dream-a-bin-with-no-away.html"
open(out,"w",encoding="utf-8").write(HTML)
print(f"WROTE {out}  {os.path.getsize(out)/1e6:.2f} MB  scenes={len(scenes)} dur={DUR:.1f}s")
