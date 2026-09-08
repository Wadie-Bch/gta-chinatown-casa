/* ============================================================================
   DREAM - render engine.  audio.currentTime is the master clock for everything.
   ========================================================================== */
const svg=document.getElementById('svg'), au=document.getElementById('au');
const world=document.getElementById('world'), weave=document.getElementById('weave');
const dustL=document.getElementById('dustL');

/* ---------- 16:9 lock ---------- */
const stageEl=document.getElementById('stage');
function fit(){
  let w=window.innerWidth, h=w*9/16;
  if(h>window.innerHeight){ h=window.innerHeight; w=h*16/9; }
  stageEl.style.width=w+'px'; stageEl.style.height=h+'px';
  document.getElementById('rot').classList.toggle('on',
    window.innerHeight>window.innerWidth*1.06);
}
addEventListener('resize',fit); addEventListener('orientationchange',fit); fit();

/* ---------- LAYOUT SYSTEM (non-negotiable) ------------------------------
   Chapters are ROWS. Stages within a chapter are SGAP apart, serpentine, so
   every act change is a pure vertical move. Content may only sit on a band. */
const SGAP=5600, ROWGAP=3150;   /* == FW, FH : the frames tile. no void between them. */
const DECOR=-2900, HEAD=-1780, SUB=-1540, ART=-380, CAP=520, LAND=1950;
/* the composited frame: 16:9, HEAD+SUB land in its empty top third */
const FCY=-800;                       /* the plate is centred on the shot framing point */
const FW=5600, FH=3150, FT=FCY-FH/2, FB=FCY+FH/2;

const POS=[];                                     /* stage origin per shot */
(function(){ let x=0,dir=1,i=0;
  for(let a=1;a<=D.acts.length;a++){
    const n=D.shots.filter(s=>s.act===a).length;
    for(let k=0;k<n;k++,i++) POS[i]={x:x+dir*k*SGAP, y:(a-1)*ROWGAP};
    x+=dir*(n-1)*SGAP; dir=-dir;
  }})();

/* ---------- band helpers. nothing is ever hand-placed. ---------- */
function scrim(g,top,h,grad){          /* broadcast title-safe gradient - never a visible shape */
  E(g,'rect',{x:-FW/2,y:top,width:FW,height:h,fill:'url(#'+grad+')'});
}
function txt(g,y,s,cls,size,fill,op){
  const e=E(g,'text',{x:0,y:y,'text-anchor':'middle','class':cls});
  e.textContent=s;
  e.style.fontSize=size+'px';            /* style, not attribute - class wins otherwise */
  e.style.fill=fill; e.style.opacity=(op==null?1:op);
  return e;
}
const H1=(g,s,c)=>txt(g,HEAD,s,'h1',s.length>21?232:300,c,1);
const H2=(g,s,c)=>txt(g,SUB ,s,'h2',92,c,.72);
const CP=(g,s,c)=>txt(g,CAP ,s,'cp',86,c,.95);
const SL=(g,s,c,i)=>txt(g,LAND+i*104,s,'sl',54,c,.5);
function COL(n,i,span){ const w=FW*.86, c=-w/2+w/n*(i+.5*(span||1)); return c; }

/* ---------- build the world ---------- */
const SH=[];
D.shots.forEach((s,i)=>{
  const A=D.acc[s.accent], p=POS[i];
  const g=E(world,'g',{transform:`translate(${p.x} ${p.y})`});
  const reg=[];
  const RK=Math.max(.42,Math.min(1,s.dur/2.4));   /* short shots snap in */

  /* -- ART band: the footage plate. subject anchored at ART, top third clear -- */
  const clip='cl'+i;
  const cp=E(document.getElementById('defs'),'clipPath',{id:clip});
  E(cp,'rect',{x:-FW/2,y:FT,width:FW,height:FH,rx:6});
  const plateG=E(g,'g',{'clip-path':'url(#'+clip+')'});
  const inner=G(plateG,`translate(0 ${FCY})`);
  reseed(i+7); CA=A; CG=s.grammar; AN=[];
  const r=P[s.plate.k](inner,A,s.plate);
  const anims=AN; AN=[];
  /* atmosphere: one dominant accent washing the frame, then crushed blacks */
  E(inner,'ellipse',{cx:0,cy:HZ-300,rx:FW*.55,ry:1050,fill:'url(#'+A.glow+')',opacity:.15});
  E(inner,'rect',{x:PL,y:PB-760,width:PR-PL,height:760,fill:'url(#fade)',opacity:.62});
  /* the subject anchor line is ART: everything below the empty top third */
  const ticks=[]; if(r&&r.tick)ticks.push(r.tick);
  /* stagger the plate's own masses so the shot assembles rather than cuts in */

  /* -- typography, composited in post, band-locked -- */
  if(s.head||s.sub) scrim(plateG,FT,1420,'scrimT');
  if(s.cap)          scrim(plateG,CAP-330,FB-CAP+330,'scrimB');
  if(s.head){ pushReg(reg,RK,{el:H1(g,s.head,'#F2F7FD'),k:'rise',t0:.18,d:.66});
              if(s.sub) pushReg(reg,RK,{el:H2(g,s.sub,A.hex),k:'rise',t0:.36,d:.62}); }
  if(s.cap){  pushReg(reg,RK,{el:CP(g,s.cap,A.hex),k:'rise',t0:.52,d:.58}); }

  SH.push({g:g,p:p,reg:reg,ticks:ticks,anims:anims,shot:s,st:-1});
});

/* ---------- REG kinds ---------- */
function pushReg(reg,RK,o){ o.t0*=RK; o.d*=RK; reg.push(o); return o.el; }
function applyReg(r,u){                       /* u = 0..1 eased progress */
  const e=r.el;
  if(r.k==='fade'){ e.style.opacity=u; }
  else if(r.k==='pop'){ e.style.opacity=u; e.style.transform='scale('+(0.972+0.028*u)+')';
                        e.style.transformOrigin='0px '+FCY+'px'; }
  else if(r.k==='rise'){ e.style.opacity=u; e.style.transform='translateY('+((1-u)*42)+'px)'; }
  else if(r.k==='wipe'){ e.style.transform='scaleX('+u+')'; }
  else if(r.k==='draw'){ e.setAttribute('stroke-dasharray','100');
                         e.setAttribute('stroke-dashoffset',(1-u)*100); }
}
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const eio =t=>t<0?0:t>1?1:(t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2);

/* ---------- TIME WARP: real audio time -> authored visual time ---------- */
const WA=D.warp.a, WV=D.warp.v;
function warp(at){
  if(at<=WA[0])return WV[0]+(at-WA[0]);
  for(let i=0;i<WA.length-1;i++){
    if(at<=WA[i+1]){ const f=(at-WA[i])/(WA[i+1]-WA[i]);
      return WV[i]+(WV[i+1]-WV[i])*f; } }
  return WV[WV.length-1]+(at-WA[WA.length-1]);
}

/* ---------- CAMERA: keyframes, then HOLD-THEN-CROSS ---------- */
const CROSS=0.80;
/* the shot's own move, executed across its whole duration */
function driftOf(s){
  switch(s.move){
    case 'slow push-in':          return {dx:0,   dy:-40, dz:1.115};
    case 'slow dolly left':       return {dx:-760,dy:0,   dz:1.018};
    case 'slow dolly right':      return {dx: 760,dy:0,   dz:1.018};
    case 'one smooth crane down': return {dx:0,   dy: 640,dz:1.030};
    default:                      return {dx:0,   dy:-18, dz:1.042};  /* locked-off still breathes */
  }
}
let KF=D.shots.map((s,i)=>({t:s.vt, x:POS[i].x+s.cx, y:POS[i].y-800, z:s.z, r:s.rot, i:i, k:'in'}));
(function driftThenCross(){        /* move slowly through the shot, then cross with intent */
  const out=[];
  for(let i=0;i<KF.length;i++){
    out.push(KF[i]);
    if(i<KF.length-1){
      const gap=KF[i+1].t-KF[i].t;
      const c=Math.min(CROSS, gap*0.34);
      const d=driftOf(D.shots[i]);
      out.push({t:KF[i+1].t-c, i:i, k:'drift',
        x:KF[i].x+d.dx, y:KF[i].y+d.dy, z:KF[i].z*d.dz, r:KF[i].r+(D.shots[i].rot>0?0.5:-0.5)});
    }
  }
  KF=out;
})();
function camAt(vt){
  let i=0; while(i<KF.length-1 && vt>=KF[i+1].t) i++;
  const a=KF[i], b=KF[Math.min(i+1,KF.length-1)];
  if(a===b||b.t<=a.t) return {x:a.x,y:a.y,z:a.z,r:a.r,seg:a.i,e:1};
  const u=(vt-a.t)/(b.t-a.t);
  /* a drift is near-linear so it reads as a moving camera; a cross eases in and out */
  const e = b.k==='drift' ? (u<0?0:u>1?1:u*u*(3-2*u)*0.35+u*0.65) : eio(u);
  let x=a.x+(b.x-a.x)*e, y=a.y+(b.y-a.y)*e, z=a.z+(b.z-a.z)*e, r=a.r+(b.r-a.r)*e;
  /* transit pull-back, derived from the cull rule itself so both stages stay lit */

  return {x:x,y:y,z:z,r:r,seg:a.i,e:e};
}

/* ---------- screen-space dust: the frame is never empty ---------- */
const DUST=[];
for(let i=0;i<110;i++){
  const e=E(dustL,'circle',{cx:0,cy:0,r:(Math.random()*2.6+0.7).toFixed(2),fill:'#EAF2FA'});
  DUST.push({e:e,x:Math.random()*1920,y:Math.random()*1080,
    sx:(Math.random()-.5)*7,sy:(Math.random()*-6-1.4),
    o:Math.random()*.34+.05,ph:Math.random()*6.28});
}

/* ---------- act backdrop cross-fade ---------- */
const back=document.getElementById('backdrop');
let curAct=-1;
function setAct(a){
  if(a===curAct)return; curAct=a;
  back.setAttribute('fill','url(#'+D.acc[D.acts[a-1].accent].sky+')');
}

/* ---------- scrubber ---------- */
const bar=document.getElementById('bar'), fill=bar.querySelector('.fill'),
      head=bar.querySelector('.head'), track=bar.querySelector('.track');
D.acts.forEach((a,k)=>{
  const t=D.shots.find(s=>s.act===k+1).t, p=t/D.dur*100;
  E2(track,'div','tick',p); const l=E2(track,'div','lbl',p); l.textContent=a.head;
});
function E2(p,t,c,pct){const e=document.createElement(t);e.className=c;e.style.left=pct+'%';p.appendChild(e);return e;}
function seek(ev){
  const r=track.getBoundingClientRect();
  const p=Math.max(0,Math.min(1,(ev.clientX-r.left)/r.width));
  au.currentTime=p*(au.duration||D.dur);
}
let drag=false;
bar.addEventListener('pointerdown',e=>{drag=true;bar.classList.add('drag');bar.setPointerCapture(e.pointerId);seek(e)});
bar.addEventListener('pointermove',e=>{if(drag)seek(e)});
bar.addEventListener('pointerup',e=>{drag=false;bar.classList.remove('drag')});

/* ---------- play gate ---------- */
const gate=document.getElementById('gate');
gate.addEventListener('click',()=>{au.play().then(()=>gate.classList.add('off')).catch(()=>{})});
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault(); if(au.paused){au.play();gate.classList.add('off')}else au.pause();}
  if(e.code==='ArrowRight')au.currentTime=Math.min(D.dur,au.currentTime+5);
  if(e.code==='ArrowLeft') au.currentTime=Math.max(0,au.currentTime-5);
});
const tc=t=>{t=Math.max(0,t|0);return String(t/60|0).padStart(2,'0')+':'+String(t%60).padStart(2,'0')};

/* ---------- MAIN LOOP: driven by the audio clock, nothing else ---------- */
let lastSeg=-1;
function frame(){
  const at=au.currentTime||0, vt=warp(at);
  const c=camAt(vt);

  /* world transform */
  world.setAttribute('transform',
    `translate(960 540) scale(${c.z.toFixed(5)}) rotate(${c.r.toFixed(3)}) translate(${-c.x} ${-c.y})`);
  /* subtle gate weave, screen space */
  const gw=Math.sin(vt*2.7)*0.9+Math.sin(vt*6.13)*0.45, gh=Math.cos(vt*3.1)*0.8;
  weave.setAttribute('transform',`translate(${gw.toFixed(2)} ${gh.toFixed(2)})`);

  const hw=960/c.z, hh=540/c.z;
  const idx=Math.max(0,Math.min(SH.length-1,c.seg));
  if(SH[idx]) setAct(SH[idx].shot.act);

  for(let i=0;i<SH.length;i++){
    const S=SH[i], near=Math.abs(i-idx)<=3;
    /* frame-relative cull. never a hand-picked constant. */
    const dx=Math.abs(S.p.x-c.x), dy=Math.abs(S.p.y+FCY-c.y);
    const a=(dx<hw+FW*.5+40 && dy<hh+FH*.5+40)?1:0;
    if(a<=0.002){ if(S.st!==0){S.g.style.display='none';S.st=0;} continue; }
    if(S.st===0){S.g.style.display='';}
    S.st=1; S.g.style.opacity=a;

    if(near){
      const lt=vt-S.shot.vt;
      for(const r of S.reg) applyReg(r, ease((lt-r.t0)/r.d));
      for(const t of S.ticks) t(vt);
      const pr=Math.max(0,Math.min(1,lt/S.shot.dur));
      for(const q of S.anims) q.f(pr,vt);
      S.fin=false;
    } else if(!S.fin){
      for(const r of S.reg) applyReg(r,1); S.fin=true;
    }
  }

  /* dust */
  for(const d of DUST){
    d.x+=d.sx*.016; d.y+=d.sy*.016;
    if(d.y<-10){d.y=1090;d.x=Math.random()*1920} if(d.x<-10)d.x=1930; if(d.x>1930)d.x=-10;
    d.e.setAttribute('cx',d.x.toFixed(1)); d.e.setAttribute('cy',d.y.toFixed(1));
    d.e.setAttribute('opacity',(d.o*(0.55+0.45*Math.sin(vt*1.7+d.ph))).toFixed(3));
  }

  /* chrome */
  const p=at/(au.duration||D.dur);
  fill.style.width=(p*100)+'%'; head.style.left=(p*100)+'%';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- shot sheet ---------- */
(function sheet(){
  const S=document.getElementById('sheet');
  let h='<div class="cls" id="scls">close</div><h1>'+D.title+' — shot sheet</h1>'+
   '<p class="lede">'+D.shots.length+' shots · '+D.acts.length+' acts · '+
   Math.floor(D.dur/60)+'m'+String(Math.round(D.dur%60)).padStart(2,'0')+'s. '+
   'Every prompt below is prefixed with the style bible and suffixed with the negative set and the '+
   'no-text clause. The top third of every frame is left empty because all headlines, chapter cards and '+
   'captions are composited in post on the band layout, never generated.</p>'+
   '<div class="bible"><b>style bible — prefix every prompt</b>'+D.bible+'</div>'+
   '<div class="bible neg"><b>negative — every prompt</b>'+D.neg+'</div>'+
   '<button class="cp2" id="cpall">copy all prompts</button>';
  D.acts.forEach((a,k)=>{
    h+='<div class="act">Act '+(k+1)+' — '+a.head+'<span>'+a.sub+' · '+a.grade+' · '+
       D.acc[a.accent].name+'</span></div>';
    D.shots.forEach((s,i)=>{ if(s.act!==k+1)return;
      h+='<div class="shot"><div class="sh"><span class="no">SHOT '+String(i+1).padStart(2,'0')+
      '</span><span class="gr">'+s.grammar+'</span>'+
      '<span class="kv">dur <b>'+s.dur.toFixed(1)+'s</b></span>'+
      '<span class="kv">camera <b>'+s.move+'</b></span>'+
      '<span class="kv">light <b>'+D.acc[s.accent].name+'</b></span>'+
      '<span class="kv">in <b>'+tc(s.t)+'</b></span></div>'+
      '<p class="nar">'+s.lines.join(' ')+'</p><pre class="pr">'+s.prompt+'</pre></div>';
    });
  });
  S.innerHTML=h;
  document.getElementById('sbtn').onclick=()=>{S.classList.add('on');au.pause()};
  document.getElementById('scls').onclick=()=>S.classList.remove('on');
  document.getElementById('cpall').onclick=e=>{
    const all=D.shots.map((s,i)=>'### SHOT '+(i+1)+'  ['+s.grammar+' · '+s.move+' · '+
      s.dur.toFixed(1)+'s]\nLINE: '+s.lines.join(' ')+'\n'+s.prompt).join('\n\n');
    navigator.clipboard.writeText(all).then(()=>{e.target.textContent='copied '+D.shots.length+' prompts'})
      .catch(()=>{e.target.textContent='select the text below to copy'});
  };
})();
