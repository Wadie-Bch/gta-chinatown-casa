/* ============================================================================
   SCENE ENGINE - fixed frame, audio clock is master.
   Scenes cross-dissolve in place. The camera never travels.
   ========================================================================== */
const svg=document.getElementById('svg'), au=document.getElementById('au');
const layer=document.getElementById('scenes'), bgA=document.getElementById('bgA'),
      bgB=document.getElementById('bgB'), amb=document.getElementById('amb');
const stageEl=document.getElementById('stage');
function fit(){ let w=innerWidth, h=w*9/16;
  if(h>innerHeight){h=innerHeight; w=h*16/9;}
  stageEl.style.width=w+'px'; stageEl.style.height=h+'px';
  document.getElementById('rot').classList.toggle('on', innerHeight>innerWidth*1.06); }
addEventListener('resize',fit); addEventListener('orientationchange',fit); fit();

/* ---- typography bands, in screen space ---- */
const HEAD=232, SUBY=318, CAPY=1000, BIGY=580;
function txt(g,x,y,s,cls,size,fill,op,anchor){
  const e=E(g,'text',{x:x,y:y,'text-anchor':anchor||'middle','class':cls});
  e.textContent=s; e.style.fontSize=size+'px'; e.style.fill=fill;
  if(op!=null)e.style.opacity=op; return e;
}
function fitSize(s,base,maxw){ const est=s.length*base*0.50; return est>maxw? base*maxw/est : base; }
function fmt(v){
  if(v>=1e9) return (v/1e9).toFixed(v%1e9?1:0)+' BILLION';
  if(v>=1e6) return (v/1e6).toFixed(0)+' MILLION';
  return String(Math.round(v));
}
/* a number that counts up - the classic explainer beat */
function counter(g,v,unit,label,A){
  const n=txt(g,960,412,'0','big',200,A);
  an(p=>{ const u=eio(cl((p-.10)/.55,0,1));
    n.textContent=fmt(v*u)+(unit&&v<1e6?unit:''); n.style.opacity=cl(p/.10,0,1); });
  const l=txt(g,960,500,label,'lbl',40,PAL.dim); fadeIn(l,.42,.5);
  return n;
}

/* ---- build every scene once, hidden ---- */
const SC=[];
D.scenes.forEach((s,i)=>{
  const A=PAL[D.acts[s.act-1].key];
  const g=E(layer,'g',{opacity:0}); g.style.display='none';
  g.style.transformBox='view-box'; g.style.transformOrigin='960px 540px';
  AN=[]; reseed(i*17+3);
  S[s.scene.k](g,A);
  /* --- composited type, animated in --- */
  if(s.head){ riseIn(txt(g,960,HEAD,s.head,'h1',fitSize(s.head,112,1660),PAL.ink),.10,.6,44);
              if(s.sub) riseIn(txt(g,960,SUBY,s.sub,'h2',44,A),.24,.55,34); }
  if(s.big){  const t=txt(g,960,BIGY,s.big,'big',fitSize(s.big,160,1720),PAL.ink);
              pop(t,.12,.6); }
  if(s.cap){  riseIn(txt(g,960,CAPY,s.cap,'cp',48,A),.34,.55,30); }
  if(s.stat){ counter(g,s.stat.v,s.stat.unit,s.stat.label,A); }
  SC.push({g:g,an:AN,s:s,on:false});
});
AN=[];

/* ---- ambient: slow drifting motes so the frame breathes ---- */
const MOTE=[];
for(let i=0;i<64;i++){ const c=C(amb,0,0,rr(2,6),'#EAF2FA',rr(.05,.20));
  MOTE.push({e:c,x:rnd()*W,y:rnd()*H,sx:rr(-5,5),sy:rr(-9,-2)}); }

/* ---- time warp: audio time -> authored scene time ---- */
const WA=D.warp.a, WV=D.warp.v;
function warp(at){ if(at<=WA[0])return WV[0]+(at-WA[0]);
  for(let i=0;i<WA.length-1;i++){ if(at<=WA[i+1]){ const f=(at-WA[i])/(WA[i+1]-WA[i]);
    return WV[i]+(WV[i+1]-WV[i])*f; } }
  return WV[WV.length-1]+(at-WA[WA.length-1]); }

/* ---- background: one flat colour per act, cross-faded ---- */
let curAct=-1, bgTop=bgA, bgBot=bgB;
function setAct(a){ if(a===curAct)return;
  const c=D.acts[a-1].bg;
  bgBot.setAttribute('fill',bgTop.getAttribute('fill')||c);
  bgTop.setAttribute('fill',c); bgTop.style.opacity=0;
  const t0=performance.now();
  const step=()=>{ const u=cl((performance.now()-t0)/520,0,1);
    bgTop.style.opacity=u; if(u<1)requestAnimationFrame(step); };
  step(); curAct=a;
}

/* ---- the loop ---- */
const XF=0.55;                                  /* dissolve length, seconds */
function frame(){
  const at=au.currentTime||0, vt=warp(at);
  let cur=0;
  for(let i=0;i<SC.length;i++){ if(vt>=SC[i].s.vt) cur=i; }
  setAct(SC[cur].s.act);

  for(let i=0;i<SC.length;i++){
    const S2=SC[i], near=Math.abs(i-cur)<=1;
    let o=0;
    if(i===cur){ const inU=cl((vt-S2.s.vt)/XF,0,1); o=inU; }
    else if(i===cur+1){ o=0; }
    else if(i===cur-1){ o=1-cl((vt-SC[cur].s.vt)/XF,0,1); }
    if(o<=.004){ if(S2.on){S2.g.style.display='none';S2.on=false;} continue; }
    if(!S2.on){ S2.g.style.display=''; S2.on=true; }
    S2.g.style.opacity=o.toFixed(3);
    const sc = i===cur ? (0.965+0.035*eio(cl((vt-S2.s.vt)/XF,0,1)))
                       : (1-0.045*(1-o));
    S2.g.style.transform='scale('+sc.toFixed(4)+')';
    const p=cl((vt-S2.s.vt)/S2.s.dur,0,1);
    for(const f of S2.an) f(p,vt);
  }

  for(const m of MOTE){ m.x+=m.sx*.016; m.y+=m.sy*.016;
    if(m.y<-8){m.y=H+8;m.x=Math.random()*W;} if(m.x<-8)m.x=W+8; if(m.x>W+8)m.x=-8;
    m.e.setAttribute('cx',m.x.toFixed(1)); m.e.setAttribute('cy',m.y.toFixed(1)); }

  const pr=at/(au.duration||D.dur);
  fillEl.style.width=(pr*100)+'%'; headEl.style.left=(pr*100)+'%';
  requestAnimationFrame(frame);
}

/* ---- chrome: gate, scrubber, keys ---- */
const bar=document.getElementById('bar'), track=bar.querySelector('.track');
const fillEl=bar.querySelector('.fill'), headEl=bar.querySelector('.head');
D.acts.forEach(a=>{ const sc=D.scenes.find(s=>s.act===a.id);
  const d=document.createElement('div'); d.className='tick';
  d.style.left=(sc.t/D.dur*100)+'%'; track.appendChild(d); });
function seek(ev){ const r=track.getBoundingClientRect();
  au.currentTime=cl((ev.clientX-r.left)/r.width,0,1)*(au.duration||D.dur); }
let drag=false;
bar.addEventListener('pointerdown',e=>{drag=true;bar.classList.add('drag');bar.setPointerCapture(e.pointerId);seek(e)});
bar.addEventListener('pointermove',e=>{if(drag)seek(e)});
bar.addEventListener('pointerup',()=>{drag=false;bar.classList.remove('drag')});
const gate=document.getElementById('gate');
gate.addEventListener('click',()=>{au.play().then(()=>gate.classList.add('off')).catch(()=>{})});
addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault(); if(au.paused){au.play();gate.classList.add('off');}else au.pause();}
  if(e.code==='ArrowRight')au.currentTime=Math.min(D.dur,au.currentTime+5);
  if(e.code==='ArrowLeft') au.currentTime=Math.max(0,au.currentTime-5);
});
requestAnimationFrame(frame);
