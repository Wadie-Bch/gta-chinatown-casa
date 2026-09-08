# -*- coding: utf-8 -*-
import json, base64, os
from script import SHOTS, ACTS, TITLE, CHANNEL
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
shots=[dict(act=s["act"], m=s["shot"]["m"], t=round(m["t"],3), dur=round(m["d"],3),
            vt=round(warp(m["t"]),3)) for s,m in zip(SHOTS,T["shots"])]
lines=[dict(text=l["text"], t=round(l["t"],3), d=round(l["d"],3), vt=round(warp(l["t"]),3))
       for l in T["lines"]]
D=dict(title=TITLE, dur=round(DUR,3), acts=ACTS, shots=shots, lines=lines,
       warp=dict(a=[round(x,4) for x in WA], v=[round(x,4) for x in WV]), voice=T["voice"])
css=open("tpl/style.css",encoding="utf-8").read()
fb=json.load(open("fonts_b64.json",encoding="utf-8"))
css=css.replace("__OSWALD__",fb["Oswald"]).replace("__ARCHIVO__",fb["Archivo"])
b64=base64.b64encode(open("narration.mp3","rb").read()).decode()
three=open("three.min.js",encoding="utf-8").read()
HTML=f"""<title>A City With No Flashing Light</title>
<style>{css}</style>
<div id="wrap"><div id="stage">
  <canvas id="gl"></canvas>
  <div id="vig"></div>
  <div id="sub"></div>
  <div id="bar"><div class="track"><div class="fill"></div></div></div>
  <div id="gate"><div class="gin">
    <div class="gk">Dream · episode 12</div>
    <div class="gt">A City With<br>No Flashing Light</div>
    <div class="gs">one continuous flight · no cuts</div>
    <div class="gb"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>play</div>
    <div class="gmeta">{int(DUR//60)}m {int(DUR%60):02d}s · headphones recommended</div>
  </div></div>
</div></div>
<div id="rot"><div><div class="r1">rotate your device</div>
  <div class="r2">This episode is framed 16:9.</div></div></div>
<audio id="au" preload="auto" src="data:audio/mpeg;base64,{b64}"></audio>
<script>{three}</script>
<script>const D={json.dumps(D,separators=(',',':'))};</script>
<script>{open('tpl/world.js',encoding='utf-8').read()}</script>
<script>{open('tpl/cam.js',encoding='utf-8').read()}</script>
<script>{open('tpl/engine.js',encoding='utf-8').read()}</script>
"""
out="/home/user/gta-chinatown-casa/dream-a-city-with-no-flashing-light.html"
open(out,"w",encoding="utf-8").write(HTML)
print(f"WROTE {out}  {os.path.getsize(out)/1e6:.2f} MB  shots={len(shots)} dur={DUR:.1f}s")
