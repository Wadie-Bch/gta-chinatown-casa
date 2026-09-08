# -*- coding: utf-8 -*-
import json, base64, os, hashlib
from script import SCENES, ACTS, PAL, TITLE, CHANNEL

T=json.load(open("timings.json")); DUR=T["dur"]
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
D=dict(title=TITLE, channel=CHANNEL, dur=round(DUR,3), acts=ACTS, scenes=scenes,
       warp=dict(a=[round(x,4) for x in WA], v=[round(x,4) for x in WV]), voice=T["voice"])

css=open("tpl/style.css").read()
fb=json.load(open("fonts_b64.json"))
css=css.replace("__OSWALD__",fb["Oswald"]).replace("__ARCHIVO__",fb["Archivo"])
b64=base64.b64encode(open("narration.mp3","rb").read()).decode()

HTML=f"""<title>A Bin With No Away</title>
<style>{css}</style>
<div id="wrap"><div id="stage">
<svg id="svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
  <defs id="defs"></defs>
  <rect id="bgB" x="0" y="0" width="1920" height="1080" fill="{ACTS[0]['bg']}"/>
  <rect id="bgA" x="0" y="0" width="1920" height="1080" fill="{ACTS[0]['bg']}"/>
  <g id="scenes"></g>
  <g id="amb"></g>
</svg>
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
<script>{open('tpl/kg.js').read()}</script>
<script>{open('tpl/scenes.js').read()}</script>
<script>{open('tpl/engine.js').read()}</script>
"""
out="/home/user/gta-chinatown-casa/dream-a-bin-with-no-away.html"
open(out,"w").write(HTML)
print(f"WROTE {out}  {os.path.getsize(out)/1e6:.2f} MB  scenes={len(scenes)} dur={DUR:.1f}s")
