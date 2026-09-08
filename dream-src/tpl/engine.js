/* ============================================================================
   ENGINE - the audio clock drives a world that changes state, not an editor.
   ========================================================================== */
const au=document.getElementById('au'), sub=document.getElementById('sub'),
      stageEl=document.getElementById('stage'), glc=document.getElementById('gl');
function fit(){ let w=innerWidth,h=w*9/16;
  if(h>innerHeight){h=innerHeight;w=h*16/9;}
  stageEl.style.width=w+'px'; stageEl.style.height=h+'px';
  const W=Math.min(1920,Math.round(w*(window.__RENDER?1:1)));
  renderer.setSize(Math.round(w),Math.round(h),false);
  camera.aspect=16/9; camera.updateProjectionMatrix();
  document.getElementById('rot').classList.toggle('on',innerHeight>innerWidth*1.06); }
addEventListener('resize',fit); addEventListener('orientationchange',fit); fit();

const WA=D.warp.a, WV=D.warp.v;
function warp(at){ if(at<=WA[0])return WV[0]+(at-WA[0]);
  for(let i=0;i<WA.length-1;i++){ if(at<=WA[i+1]){ const f=(at-WA[i])/(WA[i+1]-WA[i]);
    return WV[i]+(WV[i+1]-WV[i])*f; } }
  return WV[WV.length-1]+(at-WA[WA.length-1]); }

/* ---- the world's mood, lerped between acts. no jumps. ---- */
const skyC=new THREE.Color(), fogC=new THREE.Color(), tmpA=new THREE.Color(), tmpB=new THREE.Color();
function actState(vt){
  let i=0; for(let k=0;k<D.shots.length;k++) if(vt>=D.shots[k].vt) i=k;
  const a=D.shots[i].act;
  const A=D.acts[a-1];
  /* blend toward the next act across the last 6s of this one */
  let B=A, m=0;
  const nxt=D.shots.find(s=>s.act===a+1);
  if(nxt){ const d=nxt.vt-vt; if(d<6){ B=D.acts[a]; m=1-Math.max(0,d)/6; } }
  tmpA.set(A.sky); tmpB.set(B.sky); skyC.copy(tmpA).lerp(tmpB,m);
  tmpA.set(A.fog); tmpB.set(B.fog); fogC.copy(tmpA).lerp(tmpB,m);
  return {warm:A.warm+(B.warm-A.warm)*m, dens:A.dens+(B.dens-A.dens)*m, act:a};
}
let subI=-1;
function setSub(vt){
  let k=-1;
  for(let i=0;i<D.lines.length;i++){ const l=D.lines[i];
    if(vt>=l.vt-0.06 && vt<=l.vt+l.d+0.32){k=i;break;} }
  if(k===subI)return; subI=k;
  if(k<0){ sub.textContent=''; sub.classList.remove('on'); return; }
  sub.textContent=D.lines[k].text; sub.classList.add('on');
}

let last=-1, camLift=0;
function renderAt(at){
  const vt=warp(at);
  let dt=(last<0)?0.033:Math.max(0,Math.min(0.25,at-last)); last=at;
  const st=actState(vt);
  scene.background=skyC; scene.fog.color=fogC;
  scene.fog.near=140+st.warm*40; scene.fog.far=FOGFAR;
  bMat.emissiveIntensity=0.25+st.warm*1.15;
  hemi.intensity=0.30+(1-st.warm)*0.75;
  sun.intensity=0.18+(1-st.warm)*0.85;
  sun.color.setHSL(0.09,0.55,0.55+(1-st.warm)*0.25);
  amb.intensity=0.35+(1-st.warm)*0.35;

  /* act 9 turns the lamps off for good; act 8 dims them */
  const dark = st.act===9 && vt > D.shots.find(s=>s.act===9).vt+9;
  const fade = dark?0:1;
  updateSignals(vt,dark,fade);
  updateCars(dt,vt,dark,Math.min(1,st.dens/2.0));
  updatePeds(vt, st.act===6?Math.min(1,(vt-D.shots.find(s=>s.act===6).vt)/26):(st.act>=7?0.45:0.16));

  const c=cameraAt(vt);
  if(!overRoad(c.p.x,c.p.z)){
    const need=roofNear(c.p.x,c.p.z)+14;
    if(c.p.y<need) c.p.y=need;
  }
  camLift += ((c.p.y)-camLift)*Math.min(1,dt*5.5);
  camera.position.set(c.p.x, (last<0?c.p.y:camLift), c.p.z);
  camera.lookAt(c.l);
  if(Math.abs(camera.fov-c.fov)>0.01){ camera.fov=c.fov; camera.updateProjectionMatrix(); }
  setSub(vt);
  renderer.render(scene,camera);
}
function frame(){ renderAt(au.currentTime||0);
  const pr=(au.currentTime||0)/(au.duration||D.dur);
  fillEl.style.width=(pr*100)+'%';
  requestAnimationFrame(frame); }

const bar=document.getElementById('bar'), track=bar.querySelector('.track');
const fillEl=bar.querySelector('.fill');
D.acts.forEach(a=>{ const sc=D.shots.find(s=>s.act===a.id);
  const d=document.createElement('div'); d.className='tick';
  d.style.left=(sc.t/D.dur*100)+'%'; track.appendChild(d); });
function seek(ev){ const r=track.getBoundingClientRect();
  au.currentTime=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width))*(au.duration||D.dur); last=-1; }
let drag=false;
bar.addEventListener('pointerdown',e=>{drag=true;bar.classList.add('drag');bar.setPointerCapture(e.pointerId);seek(e)});
bar.addEventListener('pointermove',e=>{if(drag)seek(e)});
bar.addEventListener('pointerup',()=>{drag=false;bar.classList.remove('drag')});
const gate=document.getElementById('gate');
gate.addEventListener('click',()=>{au.play().then(()=>gate.classList.add('off')).catch(()=>{})});
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault(); if(au.paused){au.play();gate.classList.add('off');}else au.pause();}
  if(e.code==='ArrowRight'){au.currentTime=Math.min(D.dur,au.currentTime+5);last=-1;}
  if(e.code==='ArrowLeft'){au.currentTime=Math.max(0,au.currentTime-5);last=-1;}
});
/* offline renderer hook: step the world to an exact time and draw one frame */
window.__seek=function(t,dt){ last=t-(dt||1/24); renderAt(t); };

/* ---- offline compositor: GL + vignette + subtitle, straight to a JPEG ---- */
let _cc=null,_cx=null;
window.__frame=function(t,dt,q){       /* render AND read in ONE task: the buffer is still alive */
  window.__seek(t,dt); return window.__grab(q);
};
window.__grab=function(q){
  const gl=document.getElementById('gl');
  const W=gl.width, H=gl.height;
  if(!_cc){ _cc=document.createElement('canvas'); _cc.width=W; _cc.height=H; _cx=_cc.getContext('2d'); }
  if(_cc.width!==W||_cc.height!==H){ _cc.width=W; _cc.height=H; }
  _cx.drawImage(gl,0,0,W,H);
  /* vignette, matching the CSS overlay */
  const g=_cx.createRadialGradient(W*0.5,H*0.46,Math.min(W,H)*0.30,W*0.5,H*0.46,Math.max(W,H)*0.72);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.55)');
  _cx.fillStyle=g; _cx.fillRect(0,0,W,H);
  /* subtitle */
  const txt=sub.textContent;
  if(txt && sub.classList.contains('on')){
    const fs=Math.round(H*0.0345);
    _cx.font='600 '+fs+'px Archivo, Arial, sans-serif';
    _cx.textAlign='center'; _cx.textBaseline='alphabetic';
    const maxW=W*0.84, words=txt.split(' '); const lines=[]; let cur='';
    for(const w of words){ const t=cur?cur+' '+w:w;
      if(_cx.measureText(t).width>maxW && cur){ lines.push(cur); cur=w; } else cur=t; }
    if(cur) lines.push(cur);
    const lh=fs*1.34, base=H*0.915-(lines.length-1)*lh;
    _cx.shadowColor='rgba(0,0,0,0.95)'; _cx.shadowBlur=Math.round(fs*0.42); _cx.shadowOffsetY=2;
    _cx.fillStyle='#F6F9FD';
    lines.forEach((ln,i)=>_cx.fillText(ln,W/2,base+i*lh));
    _cx.shadowBlur=0; _cx.shadowOffsetY=0;
  }
  return _cc.toDataURL('image/jpeg', q||0.9);
};

renderAt(0); requestAnimationFrame(frame);
