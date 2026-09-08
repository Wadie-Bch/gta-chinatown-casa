"""Offline master render: step the world frame by frame, pipe straight into ffmpeg."""
import subprocess, sys, time, json
from playwright.sync_api import sync_playwright
EXE="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
URL="file:///home/user/gta-chinatown-casa/dream-a-city-with-no-flashing-light.html?render=1"
OUT="/home/user/gta-chinatown-casa/dream-a-city-with-no-flashing-light.mp4"
FPS=24; W,H=1280,720
D=json.load(open('/tmp/claude-0/-home-user-gta-chinatown-casa/d9981806-2c28-5d6f-8115-4bc05425382c/scratchpad/city/timings.json'))
DUR=D['dur']; NF=int(DUR*FPS)
ff=subprocess.Popen(["ffmpeg","-y","-v","error",
    "-f","image2pipe","-vcodec","mjpeg","-r",str(FPS),"-i","-",
    "-i","/tmp/claude-0/-home-user-gta-chinatown-casa/d9981806-2c28-5d6f-8115-4bc05425382c/scratchpad/city/narration.mp3",
    "-c:v","libx264","-preset","medium","-crf","20","-pix_fmt","yuv420p",
    "-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",OUT],
    stdin=subprocess.PIPE)
t0=time.time()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=EXE,args=['--autoplay-policy=no-user-gesture-required',
        '--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader',
        '--hide-scrollbars','--mute-audio'])
    pg=b.new_page(viewport={'width':W,'height':H})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)[:160]))
    pg.goto(URL); pg.wait_for_timeout(5000)
    pg.evaluate("()=>{document.getElementById('gate').classList.add('off');"
                "document.getElementById('bar').style.display='none';}")
    pg.evaluate("()=>document.fonts.ready")
    import base64 as _b
    for i in range(NF):
        t=i/FPS
        d=pg.evaluate("a=>window.__frame(a[0],a[1],0.9)",[t,1.0/FPS])
        ff.stdin.write(_b.b64decode(d.split(',',1)[1]))
        if i%240==0:
            el=time.time()-t0; rate=(i+1)/max(el,1e-9)
            print(f"  {i}/{NF}  {100*i/NF:5.1f}%  {rate:.1f} fps  eta {(NF-i)/max(rate,1e-9)/60:.1f} min",flush=True)
    b.close()
    print("page errors:",errs[:3] or "none")
ff.stdin.close(); ff.wait()
import os
print(f"DONE {OUT}  {os.path.getsize(OUT)/1e6:.1f} MB  in {(time.time()-t0)/60:.1f} min")
