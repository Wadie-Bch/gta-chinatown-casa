/* ============================================================================
   DREAM ENGINE - noisy edit.
   No titles, no cards, no captions. Subtitles only, and they live in the DOM.
   The picture is cut hard and often, and the whole frame is dirty on purpose.
   ========================================================================== */
const svg=document.getElementById('svg'), au=document.getElementById('au');
const layer=document.getElementById('scenes'), bgA=document.getElementById('bgA'),
      bgB=document.getElementById('bgB'), amb=document.getElementById('amb'),
      grainR=document.getElementById('grainR'), scanR=document.getElementById('scanR'),
      flashR=document.getElementById('flashR'), invR=document.getElementById('invR'),
      grainP=document.getElementById('grainP'), scanP=document.getElementById('scanP'),
      rgbA=document.getElementById('rgbA'), rgbB=document.getElementById('rgbB'),
      sub=document.getElementById('sub');
const stageEl=document.getElementById('stage');
function fit(){ let w=innerWidth,h=w*9/16;
  if(h>innerHeight){h=innerHeight;w=h*16/9;}
  stageEl.style.width=w+'px'; stageEl.style.height=h+'px';
  document.getElementById('rot').classList.toggle('on',innerHeight>innerWidth*1.06); }
addEventListener('resize',fit); addEventListener('orientationchange',fit); fit();

/* ---- build every scene, no type anywhere in the picture ---- */
const SC=[];
D.scenes.forEach((s,i)=>{
  const A=PAL[D.acts[s.act-1].key];
  const outer=E(layer,'g',{opacity:0}); outer.style.display='none';
  const inner=E(outer,'g',null);
  AN=[]; reseed(i*17+3);
  S[s.scene.k](inner,A);
  SC.push({o:outer,g:inner,an:AN,s:s,on:false});
});
AN=[];
/* where the picture actually lives - ignoring backdrops, grounds and glows,
   which span the canvas and would drag every framing back to dead centre */
SC.forEach(S2=>{
  S2.o.style.display='';
  const CA2=W*H; let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,hit=0;
  S2.g.querySelectorAll('rect,circle,ellipse,path,image,text').forEach(el=>{
    let b; try{ b=el.getBBox(); }catch(e){ return; }
    if(!b || b.width<8 || b.height<8) return;
    if(b.width*b.height > CA2*0.34) return;              /* a backdrop, not a subject */
    if(b.width>W*0.92 || b.height>H*0.92) return;
    const f=(el.getAttribute('fill')||'')+(el.style.fill||'');
    if(f.indexOf('url(#rg')===0) return;                  /* soft glow, not an object */
    x0=Math.min(x0,b.x); y0=Math.min(y0,b.y);
    x1=Math.max(x1,b.x+b.width); y1=Math.max(y1,b.y+b.height); hit++;
  });
  S2.o.style.display='none';
  if(!hit){ S2.bb={cx:W/2,cy:H/2,w:W*.6,h:H*.6}; return; }
  x0=Math.max(0,x0); y0=Math.max(0,y0); x1=Math.min(W,x1); y1=Math.min(H,y1);
  S2.bb={cx:(x0+x1)/2, cy:(y0+y1)/2,
         w:Math.max(200,x1-x0), h:Math.max(200,y1-y0)};
});

/* ---- THE EDIT ------------------------------------------------------------
   Cuts land on every spoken line, plus intermediate beats, so the picture is
   never allowed to settle. Each cut re-frames the same scene: punch in, shift,
   tilt, sometimes mirror. That is the noise.                                */
let _e=99991; const er=()=>{_e^=_e<<13;_e^=_e>>>17;_e^=_e<<5;return((_e>>>0)/4294967296)};
const erange=(a,b)=>a+(b-a)*er();
const CUTS=[];
(function buildEdit(){
  D.scenes.forEach((s,i)=>{
    const t0=s.vt, t1=s.vt+s.dur;
    const beats=[t0];
    D.lines.forEach(l=>{ if(l.scene===i && l.vt>t0+.30 && l.vt<t1-.30) beats.push(l.vt); });
    /* fill the gaps once - iterate a snapshot, or it subdivides forever */
    const base=beats.slice(), add=[];
    for(let k=0;k<base.length;k++){
      const nx=(k+1<base.length?base[k+1]:t1), gap=nx-base[k];
      const extra=Math.max(0,Math.round(gap/erange(.66,1.02))-1);
      for(let j=1;j<=extra;j++) add.push(base[k]+gap*j/(extra+1));
    }
    beats.push(...add);
    beats.sort((a,b)=>a-b);
    beats.forEach((t,k)=>{
      const z=k===0?erange(1.00,1.10):erange(1.05,1.42);
      const bb=SC[i].bb, hw=960/z, hh=540/z;
      let tx=bb.cx+erange(-1,1)*Math.min(bb.w*0.22,240);
      let ty=bb.cy+erange(-1,1)*Math.min(bb.h*0.18,130);
      tx=cl(tx,Math.max(hw,bb.cx-bb.w*.5),Math.min(W-hw,bb.cx+bb.w*.5));
      ty=cl(ty,Math.max(hh,bb.cy-bb.h*.5),Math.min(H-hh,bb.cy+bb.h*.5));
      tx=cl(tx,hw,W-hw); ty=cl(ty,hh,H-hh);     /* never frame off the canvas */
      CUTS.push({t:t, i:i, z:z, tx:tx, ty:ty,
        r:erange(-3.0,3.0), f:er()<.14?-1:1,
        hard:er()<.82, hit:er()<.34});          /* hit = a bigger glitch burst */
    });
  });
  CUTS.sort((a,b)=>a.t-b.t);
})();
function frameOf(c,age){
  const z=c.z*(1+age*0.020);                     /* every shot creeps. nothing is locked off. */
  return `translate(960 540) scale(${(z*c.f).toFixed(4)} ${z.toFixed(4)}) `+
         `rotate(${c.r.toFixed(2)}) translate(${(-c.tx).toFixed(1)} ${(-c.ty).toFixed(1)})`;
}

/* ---- subtitles: the only text in the whole film ---- */
let subI=-1;
function setSub(vt){
  let k=-1;
  for(let i=0;i<D.lines.length;i++){ const l=D.lines[i];
    if(vt>=l.vt-0.06 && vt<=l.vt+l.d+0.30){k=i;break;} }
  if(k===subI)return; subI=k;
  if(k<0){ sub.textContent=''; sub.classList.remove('on'); return; }
  sub.textContent=D.lines[k].text; sub.classList.add('on');
}

/* ---- background + ambience ---- */
let curAct=-1;
function setAct(a){ if(a===curAct)return; curAct=a;
  bgB.setAttribute('fill',bgA.getAttribute('fill'));
  bgA.setAttribute('fill',D.acts[a-1].bg); bgA.style.opacity=0;
  const t0=performance.now();
  (function st(){ const u=cl((performance.now()-t0)/420,0,1);
    bgA.style.opacity=u; if(u<1)requestAnimationFrame(st); })();
}
const MOTE=[];
for(let i=0;i<70;i++){ const c=C(amb,0,0,rr(2,7),'#EAF2FA',rr(.04,.18));
  MOTE.push({e:c,x:rnd()*W,y:rnd()*H,sx:rr(-6,6),sy:rr(-11,-2)}); }

/* ---- time warp ---- */
const WA=D.warp.a, WV=D.warp.v;
function warp(at){ if(at<=WA[0])return WV[0]+(at-WA[0]);
  for(let i=0;i<WA.length-1;i++){ if(at<=WA[i+1]){ const f=(at-WA[i])/(WA[i+1]-WA[i]);
    return WV[i]+(WV[i+1]-WV[i])*f; } }
  return WV[WV.length-1]+(at-WA[WA.length-1]); }

/* ---- the loop ---- */
let ci=0, prevCut=null, prevAt=-9;
function frame(){
  const at=au.currentTime||0, vt=warp(at);
  while(ci<CUTS.length-1 && vt>=CUTS[ci+1].t) { if(ci!==0)prevCut=CUTS[ci], prevAt=CUTS[ci+1].t; ci++; }
  while(ci>0 && vt<CUTS[ci].t) { ci--; prevCut=null; }
  const c=CUTS[ci], age=vt-c.t;
  setAct(SC[c.i].s.act); setSub(vt);

  /* the live shot */
  for(let i=0;i<SC.length;i++){
    const S2=SC[i], isCur=(i===c.i), isGhost=(prevCut && i===prevCut.i && vt-prevAt<0.34 && !isCur);
    if(!isCur && !isGhost){ if(S2.on){S2.o.style.display='none';S2.on=false;} continue; }
    if(!S2.on){ S2.o.style.display=''; S2.on=true; }
    if(isCur){
      const fin = c.hard ? 1 : cl(age/0.13,0,1);
      S2.o.style.opacity=fin; S2.o.setAttribute('transform',frameOf(c,age));
    } else {                                   /* dream trail: the last shot lingers */
      const u=cl((vt-prevAt)/0.34,0,1);
      S2.o.style.opacity=(0.34*(1-u)).toFixed(3);
      S2.o.setAttribute('transform',frameOf(prevCut,(prevAt-prevCut.t)+u*0.5));
    }
    const p=cl((vt-S2.s.vt)/S2.s.dur,0,1);
    for(const f of S2.an) f(p,vt);
  }

  /* ---- dirt. grain, scanlines, split, flicker, the occasional stab ---- */
  const since=age, burst=Math.exp(-since*13)*(c.hit?1:0.45);
  grainP.setAttribute('patternTransform',`translate(${(Math.random()*320).toFixed(0)} ${(Math.random()*320).toFixed(0)})`);
  grainR.setAttribute('opacity',(0.20+0.30*burst+Math.random()*0.05).toFixed(3));
  scanP.setAttribute('patternTransform',`translate(0 ${((vt*38)%6).toFixed(2)})`);
  const split=(0.6+22*burst);
  rgbA.setAttribute('dx',(-split).toFixed(2)); rgbB.setAttribute('dx',split.toFixed(2));
  rgbA.setAttribute('dy',(erange(-1,1)*split*0.22).toFixed(2));
  layer.setAttribute('filter', burst>0.04?'url(#rgb)':'');
  flashR.setAttribute('opacity',(burst>0.62? (burst-0.62)*0.52 : 0).toFixed(3));
  invR.setAttribute('opacity',(c.hit && since<0.032)?0.55:0);
  /* exposure never sits still */
  layer.style.opacity=(0.93+0.07*Math.sin(vt*23.7)+0.02*Math.random()).toFixed(3);

  for(const m of MOTE){ m.x+=m.sx*.016; m.y+=m.sy*.016;
    if(m.y<-8){m.y=H+8;m.x=Math.random()*W;} if(m.x<-8)m.x=W+8; if(m.x>W+8)m.x=-8;
    m.e.setAttribute('cx',m.x.toFixed(1)); m.e.setAttribute('cy',m.y.toFixed(1)); }

  const pr=at/(au.duration||D.dur);
  fillEl.style.width=(pr*100)+'%'; headEl.style.left=(pr*100)+'%';
  requestAnimationFrame(frame);
}

/* ---- chrome ---- */
const bar=document.getElementById('bar'), track=bar.querySelector('.track');
const fillEl=bar.querySelector('.fill'), headEl=bar.querySelector('.head');
D.acts.forEach(a=>{ const sc=D.scenes.find(s=>s.act===a.id);
  const d=document.createElement('div'); d.className='tick';
  d.style.left=(sc.t/D.dur*100)+'%'; track.appendChild(d); });
function seek(ev){ const r=track.getBoundingClientRect();
  au.currentTime=cl((ev.clientX-r.left)/r.width,0,1)*(au.duration||D.dur);
  ci=0; prevCut=null; }
let drag=false;
bar.addEventListener('pointerdown',e=>{drag=true;bar.classList.add('drag');bar.setPointerCapture(e.pointerId);seek(e)});
bar.addEventListener('pointermove',e=>{if(drag)seek(e)});
bar.addEventListener('pointerup',()=>{drag=false;bar.classList.remove('drag')});
const gate=document.getElementById('gate');
gate.addEventListener('click',()=>{au.play().then(()=>gate.classList.add('off')).catch(()=>{})});
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault(); if(au.paused){au.play();gate.classList.add('off');}else au.pause();}
  if(e.code==='ArrowRight'){au.currentTime=Math.min(D.dur,au.currentTime+5);ci=0;prevCut=null;}
  if(e.code==='ArrowLeft'){au.currentTime=Math.max(0,au.currentTime-5);ci=0;prevCut=null;}
});
requestAnimationFrame(frame);
