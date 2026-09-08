/* ============================================================================
   PREVIS PLATE COMPOSITOR
   The image layer is photoreal AI footage. Until that footage exists, each shot
   slot renders a previs plate: a photographic composition in the style bible's
   terms - deep blue-black shadow, one dominant accent, strong key, heavy
   negative space, top third kept clear for the composited band typography.
   ========================================================================== */
const NS='http://www.w3.org/2000/svg';
function E(p,t,a){const e=document.createElementNS(NS,t);if(a)for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function G(p,tr){return E(p,'g',tr?{transform:tr}:null)}

/* plate-local frame: 4960 x 2790, origin at plate centre */
const PL=-2800,PR=2800,PT=-1575,PB=1575,HZ=760,ANC=420;
const FS=2.05;   /* figures must fill the frame, not float in it */
const SEED=987654321;
let _s=SEED; function rnd(){_s^=_s<<13;_s^=_s>>>17;_s^=_s<<5;return((_s>>>0)/4294967296)}
function rr(a,b){return a+(b-a)*rnd()}
function reseed(n){_s=(SEED^(n*2654435761))>>>0;rnd();rnd()}

/* ---- tonal masses: everything is silhouette against light ---- */
const BLK='#04070C', BLK2='#080D15', BLK3='#0D1420';
let CA=null;   /* dominant accent of the scene being drawn */
let CG='';     /* dream-grammar move of the shot being drawn */
let AN=[];     /* per-shot animation registry, ticked off the audio clock */
function an(el,f){AN.push({el:el,f:f});return el}
const TAU=6.28318;

function bg(g,A){
  E(g,'rect',{x:PL,y:PT,width:PR-PL,height:PB-PT,fill:'url(#'+A.sky+')'});
  /* atmospheric haze sitting on the ground so shadow reads as depth, not as void */
  E(g,'ellipse',{cx:0,cy:HZ-120,rx:(PR-PL)*.60,ry:1150,fill:'url(#'+A.glow+')',opacity:.24});
}
function glow(g,A,x,y,r,op){ r*=1.18;
  const o=op==null?.88:op, ph=rnd()*TAU;
  const e=E(g,'circle',{cx:x,cy:y,r:r,fill:'url(#'+A.glow+')',opacity:o});
  an(e,(p,t)=>e.setAttribute('opacity',(o*(.87+.13*Math.sin(t*.52+ph))).toFixed(3)));
  return e;
}
function shaft(g,A,x,tw,bw,y0,y1,op){
  y0=y0==null?PT:y0; y1=y1==null?HZ+120:y1;
  E(g,'path',{d:`M${x-tw} ${y0}L${x+tw} ${y0}L${x+bw} ${y1}L${x-bw} ${y1}Z`,
    fill:'url(#'+A.shaft+')',opacity:op==null?.62:op,filter:'url(#soft)'});
  const o=op==null?.62:op, ph=rnd()*TAU, sf=g.lastChild;
  an(sf,(p,t)=>{sf.setAttribute('opacity',(o*(.88+.12*Math.sin(t*.37+ph))).toFixed(3));
    sf.setAttribute('transform','translate('+(Math.sin(t*.23+ph)*26).toFixed(1)+' 0)');});
}
function floorPlane(g,A,y,tone){
  y=y==null?HZ:y; y=Math.min(y,PB-40);
  E(g,'rect',{x:PL,y:y,width:PR-PL,height:PB-y,fill:tone||BLK});
  E(g,'line',{x1:PL,y1:y,x2:PR,y2:y,stroke:A.hex,'stroke-opacity':.30,'stroke-width':3});
}
function mass(g,x,y,w,h,tone,op){
  if(w<=0||h<=0)return;
  E(g,'rect',{x:x,y:y,width:w,height:h,fill:tone||BLK,opacity:op==null?1:op});
}
function rule(g,A,x1,y1,x2,y2,op,w){
  const p=E(g,'line',{x1:x1,y1:y1,x2:x2,y2:y2,stroke:A.hex,'stroke-opacity':op==null?.5:op,
    'stroke-width':w||3.1,'stroke-linecap':'round'});
  p.setAttribute('pathLength','100'); return p;
}

/* ---- the figure. silhouette, posed, never a mascot ---- */
function fig(g,x,fy,h,pose,tone,op,phase,mode){
  h*=FS;
  if(CA){          /* backlight the figure so the silhouette separates. never outline it. */
    const bl=E(g,'ellipse',{cx:x,cy:fy-h*.46,rx:h*.44,ry:h*.60,
      fill:'url(#'+CA.glow+')',opacity:.34});
    const bp=rnd()*TAU;
    an(bl,(p,t)=>bl.setAttribute('opacity',(.30+.08*Math.sin(t*.9+bp)).toFixed(3)));
  }
  const b=figBody(g,x,fy,h,pose,tone,op,1);
  if(mode!=='freeze') animFig(b,x,fy,h,pose,phase==null?rnd()*TAU:phase);
  return b.g;
}
/* weight shifts, breath, and a real stride - nobody in frame is ever a statue */
function animFig(b,x,fy,h,pose,ph){
  const walk=(pose==='walk');
  const legs=(pose==='walk'||pose==='stand');
  const arms=(pose==='walk'||pose==='stand'||pose==='up'||pose==='fold');
  const sp=walk?2.30:0.76, amp=walk?1:0.17;
  const l0=x-h*.055, l1=x+h*.055;
  an(b.g,(p,t)=>{
    const w=t*sp+ph;
    if(legs){ const d=Math.sin(w)*h*0.150*amp;
      b.L[0].setAttribute('x2',(l0+d).toFixed(1));
      b.L[1].setAttribute('x2',(l1-d).toFixed(1)); }
    if(arms){ const d=Math.sin(w+Math.PI)*h*0.080*amp;
      b.A[0].setAttribute('x2',(b.a0+d).toFixed(1));
      b.A[1].setAttribute('x2',(b.a1-d).toFixed(1)); }
    const bob=Math.sin(w*2)*h*(walk?0.011:0.0032)+Math.sin(t*1.1+ph)*h*0.0022;
    b.g.setAttribute('transform','translate(0 '+bob.toFixed(2)+')');
  });
}
function figBody(g,x,fy,h,pose,tone,op,gw){
  const k=E(g,'g',{fill:'none',stroke:tone||BLK,'stroke-linecap':'round',
    'stroke-linejoin':'round',opacity:op==null?1:op});
  gw=gw||1;
  const hd=h*.070*gw, sh=fy-h*.80, hip=fy-h*.47;
  const tw=h*.155*gw, lw=h*.105*gw, aw=h*.062*gw;
  E(k,'circle',{cx:x,cy:fy-h*.915,r:hd,fill:tone||BLK,stroke:'none'});
  E(k,'line',{x1:x,y1:fy-h*.845,x2:x,y2:hip,'stroke-width':tw});
  let lf=[[x-h*.055,fy],[x+h*.055,fy]], ar=[[x-h*.10,fy-h*.50],[x+h*.10,fy-h*.50]];
  if(pose==='walk'){ lf=[[x-h*.17,fy],[x+h*.15,fy]]; ar=[[x+h*.14,fy-h*.55],[x-h*.13,fy-h*.52]]; }
  else if(pose==='up'){ ar=[[x-h*.12,fy-h*.46],[x+h*.12,fy-h*.46]]; }
  else if(pose==='reach'){ ar=[[x-h*.09,fy-h*.50],[x+h*.20,fy-h*1.02]]; }
  else if(pose==='work'){ ar=[[x-h*.20,fy-h*.60],[x+h*.20,fy-h*.60]]; }
  else if(pose==='fold'){ ar=[[x-h*.13,fy-h*.60],[x+h*.13,fy-h*.60]]; }
  else if(pose==='sit'){ lf=[[x+h*.20,fy],[x+h*.20,fy]]; }
  else if(pose==='kneel'){ lf=[[x-h*.16,fy],[x+h*.18,fy]]; }
  const L=[E(k,'line',{x1:x,y1:hip,x2:lf[0][0],y2:lf[0][1],'stroke-width':lw}),
           E(k,'line',{x1:x,y1:hip,x2:lf[1][0],y2:lf[1][1],'stroke-width':lw})];
  const A=[E(k,'line',{x1:x,y1:sh,x2:ar[0][0],y2:ar[0][1],'stroke-width':aw}),
           E(k,'line',{x1:x,y1:sh,x2:ar[1][0],y2:ar[1][1],'stroke-width':aw})];
  return {g:k,L:L,A:A,a0:ar[0][0],a1:ar[1][0]};
}
function figrow(g,x0,x1,fy,h,n,tone,oneAt,accent){
  h*=FS;
  const sync=(CG==='The Slow Crowd'), freeze=(CG==='The Freeze');
  const base=rnd()*TAU, out=[];
  for(let i=0;i<n;i++){
    const t=n<2?.5:i/(n-1), x=x0+(x1-x0)*t;
    const dep=rr(.82,1.06), yy=fy+rr(-24,24);
    const lit=(oneAt!=null&&i===oneAt);
    const ph=sync?base:base+i*1.37;                 /* unison, or a crowd of individuals */
    const md=(freeze&&!lit)?'freeze':null;          /* everyone stops. one person doesn't. */
    out.push(fig(g,x,yy,h*dep/FS,lit?'reach':(i%3===0?'walk':'stand'),
      lit?accent:tone,lit?1:rr(.72,1),ph,md));
  }
  return out;
}
/* ---- the system's object: a sheet of paper ---- */
function sheet(g,x,y,w,rot,op,tone){
  const h=w*1.414;
  const k=E(g,'g',{transform:`translate(${x} ${y}) rotate(${rot||0})`,opacity:op==null?1:op});
  const r0=rot||0, ph=rnd()*TAU;
  an(k,(p,t)=>k.setAttribute('transform','translate('+x+' '+(y+Math.sin(t*.62+ph)*w*.011).toFixed(1)+
    ') rotate('+(r0+Math.sin(t*.44+ph)*1.15).toFixed(2)+')'));
  E(k,'rect',{x:-w/2,y:-h/2,width:w,height:h,fill:tone||'#E8EEF6'});
  E(k,'rect',{x:-w/2,y:-h/2,width:w,height:h,fill:'none',stroke:'#04070C','stroke-opacity':.25,'stroke-width':2});
  return k;
}
function dots(g,n,x0,x1,y0,y1,A,rmax){
  const k=G(g);
  for(let i=0;i<n;i++){
    const cx=rr(x0,x1), o=rr(.10,.5), sp=rr(.010,.032), off=rnd(), dx=rr(-40,40);
    const c=E(k,'circle',{cx:cx,cy:rr(y0,y1),r:rr(2.4,rmax||9),fill:A.hex,opacity:o});
    an(c,(p,t)=>{ const u=1-((off+t*sp)%1);
      c.setAttribute('cy',(y0+u*(y1-y0)).toFixed(1));
      c.setAttribute('cx',(cx+Math.sin(t*.5+off*TAU)*dx).toFixed(1));
      c.setAttribute('opacity',(o*Math.sin(u*Math.PI)).toFixed(3)); });
  }
  return k;
}
function tbl(g,A,x,y,w){          /* a table edge, lit from above */
  y=Math.min(y,PB-60);
  mass(g,x-w/2,y,w,26,BLK3); rule(g,A,x-w/2,y,x+w/2,y,.55,3.4);
  mass(g,x-w/2,y+26,w,Math.max(0,PB-y),BLK);
}
function grid(g,A,x,y,w,h,c,r,lit){
  const cw=w/c, ch=h/r, out=[];
  for(let j=0;j<r;j++)for(let i=0;i<c;i++){
    const on=lit&&rnd()<lit;
    const e=E(g,'rect',{x:x+i*cw+cw*.07,y:y+j*ch+ch*.09,width:cw*.86,height:ch*.82,
      fill:on?A.hex:BLK2,opacity:on?rr(.30,.72):1,stroke:A.hex,
      'stroke-opacity':on?.5:.20,'stroke-width':2.2});
    if(on){ const sp=rr(.55,1.5), off=rnd()*9, hi=rr(.42,.78);
      an(e,(p,t)=>e.setAttribute('opacity', (Math.floor(t*sp+off)%4===0?.10:hi).toFixed(2))); }
    else if(lit){ const sp=rr(.2,.5), off=rnd()*11;
      an(e,(p,t)=>e.setAttribute('fill', Math.floor(t*sp+off)%9===0?A.hex:BLK2)); }
    out.push(e);
  }
  return out;
}
function doorway(g,A,x,y,w,h,op){
  mass(g,x-w/2,y-h,w,h,'#000',1);
  E(g,'rect',{x:x-w/2,y:y-h,width:w,height:h,fill:'url(#'+A.shaft+')',opacity:op==null?.9:op});
  E(g,'rect',{x:x-w/2,y:y-h,width:w,height:h,fill:'none',stroke:A.hex,'stroke-opacity':.55,'stroke-width':4.4});
}
/* falling objects; ticked every frame so the plate is never dead */
function faller(g,A,n,up,coin){
  const k=G(g), items=[];
  for(let i=0;i<n;i++){
    let e;
    if(coin){ e=E(k,'circle',{cx:0,cy:0,r:rr(38,76),fill:A.hex,opacity:rr(.55,1)}); }
    else { const w=rr(74,172); e=E(k,'rect',{x:-w/2,y:-w*.7,width:w,height:w*1.414,
            fill:'#DCE6F2',opacity:rr(.28,.9)}); }
    items.push({e:e,x:rr(PL,PR),ph:rnd(),sp:rr(.055,.135),rot:rr(-70,70),rs:rr(-26,26)});
  }
  return {g:k,tick:function(vt){
    for(const it of items){
      let p=(it.ph+vt*it.sp)%1; if(up)p=1-p;
      const y=PT-160+p*(PB-PT+320);
      it.e.setAttribute('transform',`translate(${it.x} ${y}) rotate(${it.rot+vt*it.rs})`);
    }
  }};
}

/* ---- DREAM GRAMMAR, executed. these are moves, not labels. ---- */
function grp(g){ return E(g,'g',null); }
/* The Swap: one thing becomes another, without a cut */
function swapAt(A,B,at){
  at=at==null?.30:at;
  const W=.44;                     /* the change takes almost half the shot - a morph, not a cut */
  const pre=e=>{e.style.transformBox='fill-box';e.style.transformOrigin='center';};
  A.forEach(pre); B.forEach(pre);
  an(A[0]||B[0],(p)=>{ if(p<.04)return;
    const u=Math.max(0,Math.min(1,(p-at)/W)), e2=u*u*(3-2*u);
    for(const e of A){ e.style.opacity=(1-e2).toFixed(3);
      e.style.transform='scale('+(1-.09*e2).toFixed(4)+') translateY('+(-14*e2).toFixed(1)+'px)'; }
    for(const e of B){ e.style.opacity=e2.toFixed(3);
      e.style.transform='scale('+(.90+.10*e2).toFixed(4)+') translateY('+(16*(1-e2)).toFixed(1)+'px)'; }});
  for(const e of B) e.style.opacity=0;
}
/* Soft Erasure: things dissolve into paper, dust or light */
function erode(g,els,x0,x1,y0,y1,at){
  at=at==null?.14:at;
  const ds=[];
  for(let i=0;i<58;i++){ const cx=rr(x0,x1), cy=rr(y0,y1);
    ds.push({c:E(g,'circle',{cx:cx,cy:cy,r:rr(5,17),fill:'#DCE6F4',opacity:0}),
             cx:cx,cy:cy,sp:rr(.1,.35),dx:rr(-190,190)}); }
  an(els[0]||ds[0].c,(p,t)=>{
    const u=Math.max(0,Math.min(1,(p-at)/(1-at-.04)));
    for(const e of els) e.style.opacity=(1-u*.95).toFixed(3);
    for(const d of ds){
      d.c.setAttribute('cy',(d.cy-u*(500+d.sp*1400)).toFixed(1));
      d.c.setAttribute('cx',(d.cx+d.dx*u+Math.sin(t*.8+d.cx*.01)*26).toFixed(1));
      d.c.setAttribute('opacity',(Math.sin(u*Math.PI)*.6).toFixed(3)); }});
}
/* Folded Space: the same room, again, and again */
function fold(els,cx,cy,period){
  period=period||5.2;
  els.forEach((e,i)=>{ const ph=i/els.length;
    an(e,(p,t)=>{ const u=(t/period+ph)%1, sc=.5+u*1.15;
      e.setAttribute('transform','translate('+(cx*(1-sc)).toFixed(1)+' '+(cy*(1-sc)).toFixed(1)+
        ') scale('+sc.toFixed(3)+')');
      e.style.opacity=(Math.sin(u*Math.PI)*.98).toFixed(3); }); });
}
/* The Repeat: the same action, looping, one detail changed */
function loopEls(els,dx,dy,period){
  period=period||3.4;
  els.forEach((e,i)=>{ const ph=i/Math.max(1,els.length);
    an(e,(p,t)=>{ const u=(t/period+ph)%1;
      e.setAttribute('transform','translate('+(dx*u).toFixed(1)+' '+(dy*u).toFixed(1)+')');
      e.style.opacity=Math.min(1,Math.sin(u*Math.PI)*2.1).toFixed(3); }); });
}
/* Time Slip: a whole day of light in one shot */
function timeSlip(g,A,y0,y1){
  const sun=E(g,'ellipse',{cx:PL,cy:y0,rx:1500,ry:1100,fill:'url(#'+A.glow+')',opacity:.9});
  const sh=E(g,'rect',{x:PL,y:y1,width:PR-PL,height:PB-y1,fill:'#04070C',opacity:.55});
  an(sun,(p,t)=>{ const u=(t*.085)%1;
    sun.setAttribute('cx',(PL+(PR-PL)*u).toFixed(0));
    sun.setAttribute('cy',(y0+Math.sin(u*Math.PI)*-620).toFixed(0));
    sh.setAttribute('opacity',(.62-Math.sin(u*Math.PI)*.42).toFixed(3)); });
}

/* ==========================================================================
   OBJECT LIBRARY - the things this episode is actually about.
   Documents carry text. Money looks like money. Nothing is a blank rectangle.
   ========================================================================== */
const PAPER='#EDF1F6', INKD='#16232F', INKM='#46596B';

function textLines(g,x,y,w,n,gap,col,op,seedw){
  for(let i=0;i<n;i++)
    E(g,'rect',{x:x,y:y+i*gap,width:w*(seedw?rr(.42,1):1),height:gap*.30,
      fill:col||INKM,opacity:op==null?.8:op});
}
/* a document: header, rule, two columns of set text, signature block */
function doc(g,x,y,w,rot,op){
  const h=w*1.414, k=E(g,'g',{transform:`translate(${x} ${y}) rotate(${rot||0})`,opacity:op==null?1:op});
  E(k,'rect',{x:-w/2,y:-h/2,width:w,height:h,fill:PAPER});
  E(k,'rect',{x:-w/2,y:-h/2,width:w,height:h,fill:'none',stroke:'#04070C','stroke-opacity':.32,'stroke-width':2.4});
  const m=w*.11, iw=w-2*m, tx=-w/2+m, ty=-h/2+m;
  E(k,'rect',{x:tx,y:ty,width:iw*.46,height:h*.040,fill:INKD});
  E(k,'rect',{x:tx,y:ty+h*.058,width:iw*.26,height:h*.020,fill:INKM,opacity:.8});
  E(k,'line',{x1:tx,y1:ty+h*.098,x2:tx+iw,y2:ty+h*.098,stroke:INKD,'stroke-width':w*.010});
  textLines(k,tx,ty+h*.135,iw*.62,7,h*.036,INKM,.72,1);
  textLines(k,tx,ty+h*.420,iw*.62,6,h*.036,INKM,.72,1);
  textLines(k,tx+iw*.70,ty+h*.135,iw*.30,4,h*.036,INKM,.5,1);
  E(k,'line',{x1:tx,y1:ty+h*.700,x2:tx+iw,y2:ty+h*.700,stroke:INKD,'stroke-opacity':.5,'stroke-width':w*.006});
  textLines(k,tx,ty+h*.735,iw*.55,4,h*.036,INKM,.66,1);
  E(k,'rect',{x:tx,y:ty+h*.900,width:iw*.34,height:h*.026,fill:INKD,opacity:.85});
  const ph=rnd()*TAU, r0=rot||0;
  an(k,(p,t)=>k.setAttribute('transform','translate('+x+' '+(y+Math.sin(t*.6+ph)*w*.010).toFixed(1)+
    ') rotate('+(r0+Math.sin(t*.43+ph)*1.1).toFixed(2)+')'));
  return k;
}
/* a banknote: portrait oval, guilloche, corner denominations */
function note(g,x,y,w,rot,op){
  const h=w*.455, k=E(g,'g',{transform:`translate(${x} ${y}) rotate(${rot||0})`,opacity:op==null?1:op});
  E(k,'rect',{x:-w/2,y:-h/2,width:w,height:h,rx:h*.03,fill:'#DFE7DC'});
  E(k,'rect',{x:-w/2+w*.02,y:-h/2+h*.05,width:w-w*.04,height:h-h*.10,fill:'none',
    stroke:'#4A6A55','stroke-opacity':.55,'stroke-width':w*.006});
  E(k,'ellipse',{cx:-w*.26,cy:0,rx:w*.13,ry:h*.32,fill:'#9DB0A2',opacity:.75});
  E(k,'circle',{cx:-w*.26,cy:-h*.06,r:h*.11,fill:'#5E7466',opacity:.85});
  E(k,'path',{d:`M${-w*.26-h*.15} ${h*.20}Q${-w*.26} ${h*.02} ${-w*.26+h*.15} ${h*.20}Z`,fill:'#5E7466',opacity:.85});
  for(let i=0;i<7;i++)E(k,'ellipse',{cx:w*.16,cy:0,rx:w*.10+i*w*.018,ry:h*.12+i*h*.045,
    fill:'none',stroke:'#4A6A55','stroke-opacity':.30,'stroke-width':w*.004});
  for(const sx of[-1,1])for(const sy of[-1,1])
    E(k,'rect',{x:sx*w*.42-(sx>0?w*.06:0),y:sy*h*.34-(sy>0?h*.07:0),width:w*.06,height:h*.07,fill:'#3E5A48'});
  textLines(k,w*.02,h*.24,w*.30,2,h*.075,'#4A6A55',.6);
  const ph=rnd()*TAU, r0=rot||0;
  an(k,(p,t)=>k.setAttribute('transform','translate('+x+' '+(y+Math.sin(t*.7+ph)*w*.012).toFixed(1)+
    ') rotate('+(r0+Math.sin(t*.5+ph)*1.4).toFixed(2)+')'));
  return k;
}
function card(g,x,y,w,rot,A,op){
  const h=w*.63, k=E(g,'g',{transform:`translate(${x} ${y}) rotate(${rot||0})`,opacity:op==null?1:op});
  E(k,'rect',{x:-w/2,y:-h/2,width:w,height:h,rx:h*.09,fill:'#20303F'});
  E(k,'rect',{x:-w*.36,y:-h*.10,width:w*.17,height:h*.20,rx:h*.02,fill:A?A.hex:'#C9A94E'});
  textLines(k,-w*.36,h*.16,w*.44,2,h*.13,'#7C93A6',.75);
  return k;
}
function coin(g,x,y,r,A){
  const k=E(g,'g',null);
  E(k,'circle',{cx:x,cy:y,r:r,fill:A.hex,opacity:.92});
  E(k,'circle',{cx:x,cy:y,r:r*.72,fill:'none',stroke:'#04070C','stroke-opacity':.30,'stroke-width':r*.10});
  return k;
}
function phone(g,x,y,w,A,lit){
  const h=w*2.05, k=E(g,'g',null);
  E(k,'rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:w*.11,fill:'#080D14'});
  E(k,'rect',{x:x-w/2,y:y-h/2,width:w,height:h,rx:w*.11,fill:'none',stroke:A.hex,'stroke-opacity':.55,'stroke-width':w*.03});
  if(lit!==false){
    const sc=E(k,'rect',{x:x-w*.42,y:y-h*.44,width:w*.84,height:h*.88,rx:w*.05,fill:A.hex,opacity:.30});
    textLines(k,x-w*.30,y-h*.30,w*.58,6,h*.075,A.hex,.55);
    E(k,'rect',{x:x-w*.30,y:y+h*.24,width:w*.60,height:h*.09,rx:w*.04,fill:A.hex,opacity:.75});
    const ph=rnd()*TAU;
    an(sc,(p,t)=>sc.setAttribute('opacity',(.24+.12*Math.sin(t*1.4+ph)).toFixed(3)));
  }
  return k;
}
/* woven cloth: weave, folds, sheen. the ground every pocket sits on. */
function fabric(g,A,x0,x1,y0,y1,tone){
  const k=E(g,'g',null);
  E(k,'rect',{x:x0,y:y0,width:x1-x0,height:y1-y0,fill:tone||'#1B2733'});
  for(let i=0;i<((x1-x0)/34|0);i++)
    E(k,'line',{x1:x0+i*34,y1:y0,x2:x0+i*34-90,y2:y1,stroke:'#0D1620','stroke-opacity':.42,'stroke-width':11});
  for(let i=0;i<((y1-y0)/40|0);i++)
    E(k,'line',{x1:x0,y1:y0+i*40,x2:x1,y2:y0+i*40,stroke:'#26374a','stroke-opacity':.20,'stroke-width':7});
  for(let i=0;i<6;i++){const fx=x0+(x1-x0)*rr(.05,.95), fw=rr(180,460);
    E(k,'rect',{x:fx,y:y0,width:fw,height:y1-y0,fill:'#0B131C',opacity:rr(.14,.34)});
    E(k,'rect',{x:fx+fw,y:y0,width:fw*.5,height:y1-y0,fill:A.hex,opacity:rr(.03,.09)});}
  return k;
}
/* a pocket: hemmed mouth, two stitch rows, and real depth behind the opening */
function pocketShape(g,x,y,w,h,A,dark){
  const k=E(g,'g',null), hem=Math.max(14,h*.075);
  E(k,'path',{d:`M${x-w/2-w*.05} ${y-hem*1.4}L${x+w/2+w*.05} ${y-hem*1.4}`+
    `L${x+w/2+w*.02} ${y+h*1.06}Q${x} ${y+h*1.22} ${x-w/2-w*.02} ${y+h*1.06}Z`,
    fill:'#151F2B'});
  /* the mouth: dark, with a lit lip and a gradient interior */
  E(k,'path',{d:`M${x-w/2} ${y}L${x+w/2} ${y}L${x+w/2-w*.05} ${y+h}Q${x} ${y+h*1.13} ${x-w/2+w*.05} ${y+h}Z`,
    fill:dark===false?'#0D141D':'#010305'});
  E(k,'ellipse',{cx:x,cy:y+h*.96,rx:w*.40,ry:h*.16,fill:A.hex,opacity:.10});
  E(k,'ellipse',{cx:x,cy:y+hem*.5,rx:w*.5,ry:hem*.9,fill:'#000'});
  E(k,'path',{d:`M${x-w/2} ${y}L${x+w/2} ${y}`,stroke:A.hex,'stroke-opacity':.9,
    'stroke-width':Math.max(6,hem*.55)});
  E(k,'path',{d:`M${x-w/2} ${y-hem*1.15}L${x+w/2} ${y-hem*1.15}`,stroke:'#2E4256','stroke-opacity':.9,
    'stroke-width':Math.max(5,hem*.5)});
  for(const dy of [-hem*1.9,-hem*.35]){
    E(k,'path',{d:`M${x-w/2+w*.03} ${y+dy}L${x+w/2-w*.03} ${y+dy}`,stroke:A.hex,'stroke-opacity':.42,
      'stroke-width':Math.max(3,hem*.22),'stroke-dasharray':(w*.035)+' '+(w*.030)});}
  return k;
}
function handShape(g,x,y,s,dir,tone){       /* a reaching hand, from frame edge */
  const d=dir||1;
  return E(g,'path',{fill:tone||BLK,d:
    `M${x+d*s*2.2} ${y+s*1.5}L${x+d*s*1.5} ${y+s*.25}L${x+d*s*.62} ${y-s*.12}`+
    `L${x-d*s*.18} ${y-s*.42}L${x-d*s*.34} ${y-s*.10}L${x+d*s*.10} ${y+s*.10}`+
    `L${x-d*s*.10} ${y+s*.40}L${x+d*s*.55} ${y+s*.52}L${x+d*s*1.15} ${y+s*1.6}Z`});
}
function padlock(g,x,y,s,tone){
  const k=E(g,'g',null);
  E(k,'path',{d:`M${x-s*.5} ${y}A${s*.5} ${s*.62} 0 0 1 ${x+s*.5} ${y}`,fill:'none',
    stroke:tone||BLK,'stroke-width':s*.24});
  E(k,'rect',{x:x-s*.78,y:y,width:s*1.56,height:s*1.20,rx:s*.14,fill:tone||BLK});
  return k;
}
function zipper(g,x0,x1,y,A,closed){
  const k=E(g,'g',null), n=26;
  for(let i=0;i<n;i++){const x=x0+(x1-x0)*i/n, o=(i%2?1:-1)*14;
    E(k,'rect',{x:x,y:y+o,width:(x1-x0)/n*.62,height:26,rx:6,fill:A.hex,opacity:.8});}
  return k;
}
/* ---- graphs. composited in post, like the headlines. ---- */
function chartFrame(g,A,x,y,w,h,rows){
  E(g,'rect',{x:x-w*.06,y:y-h-h*.28,width:w*1.12,height:h*1.52,fill:'#050A11',opacity:.72});
  E(g,'line',{x1:x,y1:y,x2:x+w,y2:y,stroke:A.hex,'stroke-opacity':.8,'stroke-width':5});
  E(g,'line',{x1:x,y1:y,x2:x,y2:y-h,stroke:A.hex,'stroke-opacity':.8,'stroke-width':5});
  for(let i=1;i<=(rows||3);i++)
    E(g,'line',{x1:x,y1:y-h*i/(rows||3),x2:x+w,y2:y-h*i/(rows||3),
      stroke:A.hex,'stroke-opacity':.16,'stroke-width':2.4});
}
function barChart(g,A,x,y,w,h,vals,hot){
  chartFrame(g,A,x,y,w,h,3);
  const bw=w/vals.length;
  vals.forEach((v,i)=>{
    const b=E(g,'rect',{x:x+i*bw+bw*.18,y:y,width:bw*.64,height:1,
      fill:(hot!=null&&i===hot)?A.hex:'#3E5972',opacity:(hot!=null&&i===hot)?.95:.62});
    an(b,(p)=>{ const u=Math.max(0,Math.min(1,(p-.10-i*.05)/.42)), e=u*u*(3-2*u);
      b.setAttribute('height',Math.max(1,h*v*e).toFixed(1));
      b.setAttribute('y',(y-h*v*e).toFixed(1)); });
  });
}
function lineChart(g,A,x,y,w,h,pts,fill){
  chartFrame(g,A,x,y,w,h,3);
  let d='', dd='';
  pts.forEach((v,i)=>{const px=x+w*i/(pts.length-1), py=y-h*v;
    d+=(i?'L':'M')+px.toFixed(1)+' '+py.toFixed(1); });
  dd=d+`L${(x+w).toFixed(1)} ${y}L${x} ${y}Z`;
  if(fill!==false)E(g,'path',{d:dd,fill:A.hex,opacity:.16});
  const ln=E(g,'path',{d:d,fill:'none',stroke:A.hex,'stroke-width':8,'stroke-linejoin':'round',
    'stroke-linecap':'round'});
  ln.setAttribute('pathLength','100'); ln.setAttribute('stroke-dasharray','100');
  an(ln,(p)=>ln.setAttribute('stroke-dashoffset',(100*(1-Math.max(0,Math.min(1,(p-.12)/.5)))).toFixed(1)));
}

/* ==========================================================================
   PLATES - "A Pocket With No Thief"
   ========================================================================== */
const P={};
/* ---------------- ACT 1 ---------------- */
P.pocket_void=(g,A)=>{bg(g,A);glow(g,A,-1250,HZ-360,1500,.9);floorPlane(g,A,HZ+430,BLK);
  E(g,'line',{x1:-2150,y1:PT,x2:-2150,y2:HZ+430,stroke:BLK,'stroke-width':34});
  glow(g,A,-2150,-980,420,1);
  fig(g,-1150,HZ+430,760,'stand',BLK);
  pocketShape(g,700,-380,1900,1500,A);
  E(g,'ellipse',{cx:700,cy:-380,rx:1150,ry:190,fill:'url(#'+A.glow+')',opacity:.7});};
P.hands_in=(g,A)=>{bg(g,A);glow(g,A,300,HZ-560,1900,.95);
  fabric(g,A,PL,PR,-620,PB);
  pocketShape(g,-200,120,1800,1150,A);
  const hs=[]; for(let i=0;i<4;i++)hs.push(handShape(g,-200,560,430,1,BLK));
  hs.forEach((e,i)=>{const ph=i/hs.length;
    an(e,(p,t)=>{const u=(t/2.9+ph)%1;
      e.setAttribute('transform','translate('+(1900*(1-Math.sin(u*Math.PI))).toFixed(0)+' 0)');
      e.style.opacity=Math.min(1,Math.sin(u*Math.PI)*2.2);});});};
P.garment_slip=(g,A)=>{bg(g,A);timeSlip(g,A,-300,HZ+400);floorPlane(g,A,HZ+400,BLK);
  glow(g,A,0,HZ-400,2000,.9);
  const styles=[]; for(let i=0;i<4;i++){const s=E(g,'g',null);
    E(s,'path',{d:`M-620 ${HZ+400}L${-700-i*60} ${-620-i*90}L${-160+i*40} ${-790}L${420+i*50} ${-620-i*90}L${560+i*70} ${HZ+400}Z`,fill:BLK});
    styles.push(s);}
  swapAt([styles[0],styles[1]],[styles[2],styles[3]],.34);
  pocketShape(g,120,180,760,540,A,false);};
P.rain_valuables=(g,A)=>{bg(g,A);glow(g,A,0,HZ-200,2000,.85);floorPlane(g,A,HZ+430,BLK);
  figrow(g,PL+200,PR-200,HZ+430,430,9,BLK,null,A.hex);
  const k=G(g), items=[];
  for(let i=0;i<34;i++){
    const kind=i%3, e=E(k,'g',null);
    if(kind===0)coin(e,0,0,rr(34,58),A);
    else if(kind===1)note(e,0,0,rr(200,330),rr(-30,30));
    else card(e,0,0,rr(170,240),rr(-25,25),A);
    items.push({e:e,x:rr(PL,PR),ph:rnd(),sp:rr(.05,.11),rs:rr(-30,30)});}
  return {tick:(t)=>{for(const it of items){const u=1-((it.ph+t*it.sp)%1);
    it.e.setAttribute('transform',`translate(${it.x} ${PT-200+u*(PB-PT+400)}) rotate(${t*it.rs})`);}}};};
/* ---------------- ACT 2 ---------------- */
P.safe_to_cloth=(g,A)=>{bg(g,A);shaft(g,A,-1000,320,1300,PT,HZ+330,.5);floorPlane(g,A,HZ+330,BLK);
  const sf=E(g,'g',null);
  mass(sf,-780,-760,1560,1560,'#0E1822');E(sf,'rect',{x:-780,y:-760,width:1560,height:1560,fill:'none',stroke:A.hex,'stroke-opacity':.6,'stroke-width':9});
  E(sf,'circle',{cx:260,cy:20,r:210,fill:'none',stroke:A.hex,'stroke-opacity':.7,'stroke-width':26});
  E(sf,'circle',{cx:260,cy:20,r:76,fill:A.hex,opacity:.65});
  const cl=E(g,'g',null);
  E(cl,'path',{d:'M-660 -700Q0 -820 660 -700L560 760Q0 900 -560 760Z',fill:'#1B2733'});
  E(cl,'path',{d:'M-660 -700Q0 -820 660 -700',fill:'none',stroke:A.hex,'stroke-opacity':.7,'stroke-width':10});
  swapAt([sf],[cl],.32);};
P.seam_section=(g,A)=>{bg(g,A);glow(g,A,0,HZ-500,2200,.9);
  mass(g,PL,-980,PR-PL,700,'#182531');mass(g,PL,320,PR-PL,700,'#141F2A');
  for(let i=0;i<40;i++){E(g,'line',{x1:PL+i*140,y1:-980,x2:PL+i*140,y2:-280,stroke:'#0A121B','stroke-width':22});
    E(g,'line',{x1:PL+i*140,y1:320,x2:PL+i*140,y2:1020,stroke:'#0A121B','stroke-width':22});}
  E(g,'line',{x1:PL,y1:-280,x2:PR,y2:-280,stroke:A.hex,'stroke-opacity':.7,'stroke-width':7});
  E(g,'line',{x1:PL,y1:320,x2:PR,y2:320,stroke:A.hex,'stroke-opacity':.7,'stroke-width':7});
  for(let i=0;i<24;i++)E(g,'line',{x1:PL+120+i*240,y1:300,x2:PL+200+i*240,y2:340,stroke:A.hex,'stroke-opacity':.55,'stroke-width':9});
  dots(g,40,PL,PR,-260,300,A,12);};
P.bubbles=(g,A)=>{bg(g,A);glow(g,A,600,HZ-560,1700,.8);floorPlane(g,A,HZ+430,BLK);
  const fs=figrow(g,PL+150,PR-150,HZ+430,450,13,BLK,null,A.hex);
  for(let i=0;i<13;i++){const x=PL+150+(PR-300)*i/12, ph=rnd()*TAU;
    const c=E(g,'ellipse',{cx:x,cy:HZ-40,rx:330,ry:520,fill:'none',stroke:A.hex,'stroke-opacity':.22,'stroke-width':4.4});
    an(c,(p,t)=>c.setAttribute('stroke-opacity',(.13+.13*Math.sin(t*.8+ph)).toFixed(3)));}};
P.coat_dissolve=(g,A)=>{bg(g,A);shaft(g,A,-200,300,1500,PT,HZ+420,.6);floorPlane(g,A,HZ+420,BLK);
  const coat=E(g,'g',null);
  E(coat,'path',{d:'M-820 -900L-980 900L-560 980L-460 300L460 300L560 980L980 900L820 -900Q0 -1040 -820 -900Z',fill:'#111C26'});
  E(coat,'path',{d:'M-820 -900Q0 -1040 820 -900',fill:'none',stroke:A.hex,'stroke-opacity':.55,'stroke-width':8});
  const held=E(g,'g',null);
  note(held,-300,180,420,-8); coin(held,180,300,70,A); card(held,420,90,340,10,A);
  erode(g,[coat],-900,900,-900,900,.20);};
/* ---------------- ACT 3 ---------------- */
P.freeze_street=(g,A)=>{bg(g,A);glow(g,A,-400,HZ-460,1800,.8);floorPlane(g,A,HZ+430,'#0C141D');
  figrow(g,PL,PR,HZ+430,470,15,BLK,7,A.hex);
  E(g,'path',{d:`M-560 ${HZ+120}L-420 ${HZ+120}L-400 ${HZ+330}L-580 ${HZ+330}Z`,fill:BLK});};
P.pat_loop=(g,A)=>{bg(g,A);glow(g,A,200,HZ-480,1900,.95);
  fabric(g,A,PL,PR,-780,PB);
  pocketShape(g,-300,60,1500,1000,A);
  const hd=handShape(g,-300,420,480,1,BLK);
  an(hd,(p,t)=>{const u=(t*1.15)%1, s=Math.sin(u*Math.PI);
    hd.setAttribute('transform','translate('+(1500*(1-s)).toFixed(0)+' '+(-120*s).toFixed(0)+')');});};
P.vault_vs_thread=(g,A)=>{bg(g,A);glow(g,A,-1100,HZ-360,1600,.85);floorPlane(g,A,HZ+400,BLK);
  mass(g,-2500,-1150,1900,2300,'#0D1620');
  E(g,'circle',{cx:-1550,cy:-20,r:520,fill:'none',stroke:A.hex,'stroke-opacity':.6,'stroke-width':38});
  E(g,'circle',{cx:-1550,cy:-20,r:170,fill:A.hex,opacity:.6});
  E(g,'line',{x1:700,y1:HZ+400,x2:700,y2:-260,stroke:BLK,'stroke-width':26});
  E(g,'line',{x1:2300,y1:HZ+400,x2:2300,y2:-260,stroke:BLK,'stroke-width':26});
  const th=E(g,'line',{x1:700,y1:-200,x2:2300,y2:-200,stroke:A.hex,'stroke-opacity':.95,'stroke-width':7});
  an(th,(p,t)=>th.setAttribute('y2',(-200+Math.sin(t*1.1)*26).toFixed(1)));
  figrow(g,900,2100,HZ+400,430,3,BLK,null,A.hex);};
P.four_seconds=(g,A)=>{bg(g,A);glow(g,A,0,HZ-400,1900,.85);floorPlane(g,A,HZ+430,BLK);
  const pairs=[];
  for(let i=0;i<4;i++){const x=PL+700+i*1400, k=E(g,'g',null);
    fig(k,x-190,HZ+430,700,'walk',BLK); fig(k,x+190,HZ+430,700,'walk',BLK);
    handShape(k,x+40,HZ-60,300,1,BLK); pairs.push(k);}
  pairs.forEach((e,i)=>{const ph=i/4;
    an(e,(p,t)=>{const u=(t/3.2+ph)%1; e.style.opacity=Math.min(1,Math.sin(u*Math.PI)*2.4);});});};
P.attention_chart=(g,A)=>{bg(g,A);glow(g,A,0,HZ-300,1500,.7);floorPlane(g,A,HZ+430,BLK);
  grid(g,A,PL+200,-1150,PR-PL-400,1200,9,3,.7);
  fig(g,-300,HZ+430,700,'sit',BLK);
  barChart(g,A,-1900,HZ+340,3800,1000,[.22,.31,.46,.95,.28],3);};
/* ---------------- ACT 4 ---------------- */
P.tailor=(g,A)=>{bg(g,A);timeSlip(g,A,-320,HZ+320);tbl(g,A,0,HZ+320,5200);
  const cl=E(g,'path',{d:'M-1500 -120Q0 -420 1500 -120L1400 640L-1400 640Z',fill:'#1A2632'});
  E(g,'line',{x1:-700,y1:200,x2:700,y2:200,stroke:A.hex,'stroke-opacity':.75,'stroke-width':9,'stroke-dasharray':'70 50'});
  for(const s of[-1,1])handShape(g,s*1200,120,420,-s,BLK);
  dots(g,34,-1400,1400,-300,600,A,11);};
P.two_seams=(g,A)=>{bg(g,A);glow(g,A,-700,HZ-520,1900,.95);tbl(g,A,0,HZ+380,5200);
  fabric(g,A,PL,PR,-300,HZ+380);
  const nd=E(g,'line',{x1:-400,y1:-500,x2:-260,y2:60,stroke:A.hex,'stroke-opacity':.95,'stroke-width':13});
  an(nd,(p,t)=>{const u=(t*1.8)%1;nd.setAttribute('transform','translate(0 '+(Math.sin(u*TAU)*230).toFixed(0)+')');});
  for(let i=0;i<16;i++)E(g,'line',{x1:-1800+i*230,y1:120,x2:-1700+i*230,y2:160,stroke:A.hex,'stroke-opacity':.6,'stroke-width':9});
  for(let i=0;i<14;i++)E(g,'path',{d:`M${900+i*22} ${HZ+300-i*46}q380 -40 760 0l0 44q-380 40 -760 0Z`,fill:'#16212D',opacity:.9});};
P.dead_devices=(g,A)=>{bg(g,A);grid(g,A,PL+150,-1200,2400,2400,4,4,0);
  glow(g,A,1300,HZ-460,1500,1);
  E(g,'path',{d:'M700 -1000L560 900L980 980L1080 300L1900 300L2000 980L2420 900L2280 -1000Q1490 -1150 700 -1000Z',fill:'#1D2A36'});
  E(g,'path',{d:'M700 -1000Q1490 -1150 2280 -1000',fill:'none',stroke:A.hex,'stroke-opacity':.7,'stroke-width':9});
  pocketShape(g,1400,120,620,440,A,false);
  floorPlane(g,A,HZ+500,BLK);};
P.unison_reach=(g,A)=>{bg(g,A);timeSlip(g,A,-260,HZ+400);floorPlane(g,A,HZ+400,BLK);
  figrow(g,PL-100,PR+100,HZ+400,470,14,BLK,null,A.hex);
  E(g,'line',{x1:PL,y1:HZ-140,x2:PR,y2:HZ-140,stroke:A.hex,'stroke-opacity':.4,'stroke-width':7});};
P.every_hand=(g,A)=>{bg(g,A);glow(g,A,0,HZ-600,2200,.95);
  fabric(g,A,PL,PR,-760,PB);
  for(let i=0;i<4;i++)for(let j=0;j<2;j++){
    const x=PL+800+i*1400, y=-40+j*860;
    pocketShape(g,x,y,700,470,A);
    const hd=handShape(g,x,y+280,300,(i%2?1:-1),BLK), ph=(i+j*4)/8;
    an(hd,(p,t)=>{const u=(t/2.6+ph)%1,s=Math.sin(u*Math.PI);
      hd.setAttribute('transform','translate('+((i%2?900:-900)*(1-s)).toFixed(0)+' 0)');});}};
P.reach_bars=(g,A)=>{bg(g,A);glow(g,A,0,HZ-300,2200,.8);floorPlane(g,A,HZ+480,BLK);
  for(let r=0;r<3;r++)for(let i=0;i<14;i++){
    const x=PL+200+i*400+r*90, y=HZ+300-r*230;
    mass(g,x,y-150,230,150,'#0F1924');
    E(g,'circle',{cx:x+115,cy:y-70,r:26,fill:A.hex,opacity:.85-r*.2});}
  barChart(g,A,-1900,HZ+250,3800,1050,[.96,.94,.97,.92,.95],null);};
/* ---------------- ACT 5 ---------------- */
P.hand_swap=(g,A)=>{bg(g,A);glow(g,A,-500,HZ-520,1900,.95);
  fabric(g,A,PL,PR,-720,PB);
  pocketShape(g,-200,20,1700,1100,A);
  const h1=E(g,'g',null),h2=E(g,'g',null);
  handShape(h1,-200,460,520,1,BLK); handShape(h2,-200,460,520,-1,'#0B131C');
  swapAt([h1],[h2],.34);};
P.three_hands=(g,A)=>{bg(g,A);glow(g,A,0,HZ-520,2300,.9);
  fabric(g,A,PL,PR,-700,PB);
  for(let i=0;i<3;i++){const x=PL+1000+i*1500;
    pocketShape(g,x,60,1000,700,A);
    const hd=handShape(g,x,420,380,1,BLK);
    an(hd,(p,t)=>{const u=(t/2.2)%1,s=Math.sin(u*Math.PI);
      hd.setAttribute('transform','translate('+(1100*(1-s)).toFixed(0)+' 0)');});}};
P.reader_corridor=(g,A)=>{bg(g,A);glow(g,A,700,-60,900,.9);floorPlane(g,A,HZ+400,BLK);
  for(let i=0;i<8;i++){const k=Math.pow(.72,i),w=3000*k,h=2200*k,x=-1400+1500*(1-k);
    E(g,'rect',{x:x-w/2,y:-140-h/2,width:w,height:h,fill:'none',stroke:A.hex,'stroke-opacity':.12+.32*k,'stroke-width':4.4});
    E(g,'rect',{x:x+w/2-120*k,y:-260*k,width:70*k,height:150*k,fill:A.hex,opacity:.5+.4*k});}
  pocketShape(g,1750,-120,620,460,A);};
P.auth_chart=(g,A)=>{bg(g,A);shaft(g,A,900,260,1500,PT,HZ+430,.75);floorPlane(g,A,HZ+430,BLK);
  mass(g,-2600,-1200,2300,2400,'#0C151F');
  E(g,'rect',{x:-2600,y:-1200,width:2300,height:2400,fill:'none',stroke:A.hex,'stroke-opacity':.45,'stroke-width':9});
  pocketShape(g,1000,180,900,620,A);
  barChart(g,A,-2300,HZ+300,2000,1000,[1.0,0.0],1);};
/* ---------------- ACT 6 ---------------- */
P.note_dissolve=(g,A)=>{bg(g,A);glow(g,A,200,HZ-360,1700,.95);floorPlane(g,A,HZ+300,'#151A20');
  const nt=E(g,'g',null); note(nt,0,HZ-100,1500,-6);
  erode(g,[nt],-700,700,HZ-400,HZ+180,.18);
  for(let i=0;i<80;i++){const x=rr(PL,PR),y=rr(PT,PB-100);
    E(g,'line',{x1:x,y1:y,x2:x-24,y2:y+120,stroke:'#BFD6EA','stroke-opacity':rr(.08,.3),'stroke-width':2.4});}};
P.note_transfer=(g,A)=>{bg(g,A);glow(g,A,0,HZ-500,2100,1);
  mass(g,PL,PT,PR-PL,PB-PT,'#0A121A');
  fabric(g,A,PL,PR,HZ+40,PB,'#111B25');
  handShape(g,-2300,320,620,1,BLK); handShape(g,2300,320,620,-1,BLK);
  const n1=E(g,'g',null), n2=E(g,'g',null);
  note(n1,-900,180,1150,-7); note(n2,900,180,1150,5);
  swapAt([n1],[n2],.30);};
P.drain=(g,A)=>{bg(g,A);glow(g,A,-900,HZ-300,1700,.9);floorPlane(g,A,HZ+120,'#1A1309');
  E(g,'ellipse',{cx:400,cy:HZ+560,rx:1500,ry:520,fill:'#000'});
  E(g,'ellipse',{cx:400,cy:HZ+560,rx:1500,ry:520,fill:'none',stroke:A.hex,'stroke-opacity':.7,'stroke-width':8});
  const k=G(g), items=[];
  for(let i=0;i<26;i++){const e=E(k,'g',null);
    if(i%3===0)coin(e,0,0,rr(30,52),A); else if(i%3===1)card(e,0,0,rr(160,230),rr(-20,20),A);
    else doc(e,0,0,rr(190,260),rr(-24,24));
    items.push({e:e,ph:rnd(),sp:rr(.10,.20),x:rr(-500,1300)});}
  return {tick:(t)=>{for(const it of items){const u=(it.ph+t*it.sp)%1;
    it.e.setAttribute('transform',`translate(${it.x+ (400-it.x)*u} ${PT-100+u*(HZ+660-PT+100)}) scale(${(1-u*.72).toFixed(3)})`);
    it.e.style.opacity=(1-u*u).toFixed(3);}}};};
P.recovery_chart=(g,A)=>{bg(g,A);glow(g,A,-1600,HZ-300,1800,.95);floorPlane(g,A,HZ+80,'#241609');
  const d=`M-1000 ${HZ+220}L2500 ${HZ+120}L2800 ${PB}L-1800 ${PB}Z`;
  E(g,'path',{d:d,fill:'#000'});E(g,'path',{d:d,fill:'none',stroke:A.hex,'stroke-opacity':.8,'stroke-width':7});
  fig(g,-1900,HZ+220,900,'stand',BLK);
  barChart(g,A,-400,HZ-140,2900,900,[.97,.03],1);};
P.still_hands=(g,A)=>{bg(g,A);glow(g,A,0,HZ-620,2200,.9);floorPlane(g,A,HZ+430,'#0B1119');
  figrow(g,PL-60,PR+60,HZ+430,480,15,'#02040A',null,A.hex);
  for(let i=0;i<110;i++){const x=rr(PL,PR),y=rr(PT,PB-100);
    E(g,'line',{x1:x,y1:y,x2:x-24,y2:y+118,stroke:A.hex,'stroke-opacity':rr(.08,.3),'stroke-width':2.4});}};
/* ---------------- ACT 7 ---------------- */
P.pile_to_phone=(g,A)=>{bg(g,A);glow(g,A,0,HZ-360,1700,.75);tbl(g,A,0,HZ+380,5200);
  const pile=E(g,'g',null);
  for(let i=0;i<9;i++)coin(pile,rr(-900,900),HZ+180-rr(0,180),rr(40,72),A);
  for(let i=0;i<5;i++)note(pile,rr(-800,800),HZ-60-i*60,rr(600,820),rr(-24,24));
  for(let i=0;i<4;i++)card(pile,rr(-700,700),HZ+60,rr(340,430),rr(-20,20),A);
  const ph=E(g,'g',null); phone(ph,0,-60,700,A,true);
  swapAt([pile],[ph],.32);};
P.phone_pocket=(g,A)=>{bg(g,A);glow(g,A,0,HZ-500,1900,.7);floorPlane(g,A,HZ+520,BLK);
  mass(g,-1150,-1500,2300,3000,'#070C13');
  E(g,'rect',{x:-1150,y:-1500,width:2300,height:3000,rx:90,fill:'none',stroke:A.hex,'stroke-opacity':.75,'stroke-width':13});
  pocketShape(g,0,180,1300,780,A);
  dots(g,30,-1000,1000,-1200,100,A,12);};
P.watching=(g,A)=>{bg(g,A);glow(g,A,-800,HZ-400,1500,.7);floorPlane(g,A,HZ+430,BLK);
  figrow(g,PL,PR,HZ+430,450,13,'#03060C',null,A.hex);
  phone(g,-1100,HZ-200,520,A,true);
  glow(g,A,-1100,HZ-200,700,.95);
  for(const s of[-1,1]){const e=E(g,'ellipse',{cx:1500+s*150,cy:-320,rx:100,ry:46,fill:A.hex,opacity:.9});
    an(e,(p,t)=>e.setAttribute('ry',(Math.abs(Math.sin(t*.7))>.06?46:5)));}};
P.unlock_loop=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#05090F');
  for(const s of[-1,1])handShape(g,s*2500,700,760,-s,'#0A121A');
  const scr=[]; for(let i=0;i<3;i++){const k=E(g,'g',null); phone(k,0,80,900+i*260,A,true); scr.push(k);}
  fold(scr,0,80,4.6);
  glow(g,A,0,80,1500,.6);};
P.lock_to_hand=(g,A)=>{bg(g,A);glow(g,A,-400,HZ-420,1700,.9);tbl(g,A,0,HZ+400,5000);
  const lk=E(g,'g',null); padlock(lk,0,-260,900,BLK);
  const hd=E(g,'g',null); handShape(hd,-300,120,780,1,BLK);
  swapAt([lk],[hd],.34);};
/* ---------------- ACT 8 ---------------- */
P.verdict_coat=(g,A)=>{bg(g,A);shaft(g,A,60,260,1600,PT,HZ+420,.95);floorPlane(g,A,HZ+420,BLK);
  E(g,'ellipse',{cx:60,cy:HZ+420,rx:1700,ry:360,fill:'url(#'+A.glow+')',opacity:1});
  E(g,'path',{d:'M-700 -940L-840 780L-460 850L-380 240L380 240L460 850L840 780L700 -940Q0 -1070 -700 -940Z',fill:BLK});
  pocketShape(g,-330,140,520,360,A,false);pocketShape(g,330,140,520,360,A,false);
  dots(g,50,-800,900,-1100,HZ+320,A,13);};
P.lock_to_paper=(g,A)=>{bg(g,A);glow(g,A,-700,HZ-400,1600,.9);tbl(g,A,0,HZ+380,5000);
  const lk=E(g,'g',null); padlock(lk,-200,-160,820,BLK);
  const pa=E(g,'g',null); doc(pa,-200,60,760,4);
  swapAt([lk],[pa],.34);};
P.fastenings=(g,A)=>{bg(g,A);glow(g,A,0,HZ-480,2300,.95);
  fabric(g,A,PL,PR,-700,PB);
  const zs=[];
  for(let i=0;i<5;i++){const x=PL+700+i*1100, k=E(g,'g',null);
    zipper(k,x-420,x+420,120,A); 
    for(let j=0;j<i;j++)E(k,'circle',{cx:x-300+j*150,cy:420,r:52,fill:'none',stroke:A.hex,'stroke-opacity':.7,'stroke-width':16});
    zs.push(k);}
  zs.forEach((e,i)=>{const ph=i/5; an(e,(p,t)=>{const u=(t/3.6+ph)%1;
    e.style.opacity=Math.min(1,Math.sin(u*Math.PI)*2.3);});});};
P.wrong_target=(g,A)=>{bg(g,A);glow(g,A,-1100,HZ-420,2000,1);floorPlane(g,A,HZ+430,BLK);
  mass(g,-2600,-1000,3000,2100,'#16222E');
  for(let i=0;i<9;i++)E(g,'line',{x1:-2600,y1:-950+i*230,x2:-2600+3000,y2:-950+i*230,
    stroke:'#0A121B','stroke-width':22});
  E(g,'rect',{x:-2600,y:-1000,width:3000,height:2100,fill:'none',stroke:A.hex,'stroke-opacity':.7,'stroke-width':14});
  mass(g,-2400,-840,2700,1800,'#000');
  E(g,'ellipse',{cx:-1050,cy:900,rx:1500,ry:190,fill:'url(#'+A.glow+')',opacity:.5});
  for(let i=0;i<5;i++)E(g,'circle',{cx:-2450+i*40,cy:-500+i*300,r:44,fill:A.hex,opacity:.5});
  handShape(g,2300,120,700,-1,BLK); coin(g,1750,120,150,A);
  glow(g,A,1750,120,600,.9);};
P.all_unlocked=(g,A)=>{bg(g,A);glow(g,A,0,HZ-620,2400,1);floorPlane(g,A,HZ+430,BLK);
  const n=17;
  figrow(g,PL-60,PR+60,HZ+430,480,n,'#02040A',null,A.hex);
  for(let i=0;i<n;i++){const x=PL-60+(PR-PL+120)*i/(n-1), ph=i*.4;
    const e=E(g,'ellipse',{cx:x,cy:HZ+130,rx:74,ry:104,fill:A.hex,opacity:.7});
    an(e,(p,t)=>e.setAttribute('opacity',(.45+.4*Math.sin(t*1.1+ph)).toFixed(3)));}};
/* ---------------- ACT 9 ---------------- */
P.v2_bench=(g,A)=>{bg(g,A);timeSlip(g,A,-220,HZ+340);tbl(g,A,0,HZ+340,5400);
  const its=[];
  for(let i=0;i<4;i++){const x=-1650+i*1100, k=E(g,'g',null);
    if(i===0)card(k,x,120,540,0,A); else if(i===1)coin(k,x,120,150,A);
    else if(i===2)padlock(k,x,-20,340,BLK); else doc(k,x,60,420,0);
    its.push(k);}
  its.forEach((e,i)=>{an(e,(p)=>{const u=Math.max(0,Math.min(1,(p-.18-i*.13)/.3));
    e.style.opacity=u.toFixed(3);});});};
P.pointer=(g,A)=>{bg(g,A);glow(g,A,-900,HZ-440,1900,.95);
  mass(g,PL,PT,PR-PL,PB-PT,'#0C141D');
  fabric(g,A,PL,PR,HZ-140,PB,'#141E29');
  mass(g,1500,-700,1500,1900,'#0A121A');
  E(g,'rect',{x:1500,y:-700,width:1500,height:1900,fill:'none',stroke:A.hex,'stroke-opacity':.55,'stroke-width':10});
  E(g,'circle',{cx:2250,cy:250,r:230,fill:'none',stroke:A.hex,'stroke-opacity':.65,'stroke-width':26});
  handShape(g,-2400,420,760,1,BLK);
  const bd=E(g,'g',null);
  for(let i=0;i<6;i++)note(bd,-800,180-i*44,1000,rr(-5,5));
  const cd=E(g,'g',null); card(cd,-800,140,900,-3,A);
  swapAt([bd],[cd],.32);};
P.body_bound=(g,A)=>{bg(g,A);glow(g,A,0,HZ-400,1800,.75);floorPlane(g,A,HZ+430,BLK);
  fig(g,-700,HZ+430,1250,'walk',BLK);
  const e=E(g,'circle',{cx:-460,cy:HZ-120,r:130,fill:A.hex,opacity:.9});
  an(e,(p,t)=>e.setAttribute('opacity',(.45+.45*Math.abs(Math.sin(t*1.15))).toFixed(3)));
  const lift=E(g,'g',null); coin(lift,1600,-160,140,A);
  an(lift,(p,t)=>lift.setAttribute('opacity',Math.max(0,.9-((t*.5)%1)*1.6).toFixed(3)));
  handShape(g,2500,-100,520,-1,BLK);};
P.duress=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#0B131B');
  doorway(g,A,1400,HZ+430,1300,2000,.85);
  const many=E(g,'g',null);
  for(let i=0;i<9;i++)note(many,1400+rr(-260,260),HZ+40-i*52,620,rr(-14,14));
  glow(g,A,-1000,HZ-300,1400,.95);
  mass(g,-1900,-120,1700,900,'#131E29');
  E(g,'rect',{x:-1900,y:-120,width:1700,height:900,fill:'none',stroke:A.hex,'stroke-opacity':.6,'stroke-width':9});
  note(g,-1050,300,700,-5); coin(g,-1600,420,80,A);
  handShape(g,-2600,300,520,1,BLK);
  floorPlane(g,A,HZ+430,BLK);};
P.delay_chart=(g,A)=>{bg(g,A);timeSlip(g,A,-260,HZ+380);
  handShape(g,-2400,220,640,1,BLK); handShape(g,2400,220,640,-1,BLK);
  const c=E(g,'g',null); coin(c,0,220,150,A);
  an(c,(p)=>c.setAttribute('transform','translate('+(-900+1800*p*.55).toFixed(0)+' 0)'));
  lineChart(g,A,-1800,HZ+300,3600,900,[0,.06,.13,.22,.34,.5,.72,1.0]);};
P.runner_empty=(g,A)=>{bg(g,A);glow(g,A,900,HZ-460,1800,.95);floorPlane(g,A,HZ+430,BLK);
  fig(g,-500,HZ+430,1300,'walk',BLK);
  const bun=E(g,'g',null);
  for(let i=0;i<5;i++)note(bun,-200,HZ-140-i*40,560,rr(-16,16));
  coin(bun,-40,HZ-60,72,A);
  erode(g,[bun],-500,300,HZ-380,HZ+40,.22);
  for(let i=0;i<12;i++)E(g,'line',{x1:-1400-i*80,y1:HZ-260+i*46,x2:-800-i*80,y2:HZ-260+i*46,
    stroke:A.hex,'stroke-opacity':rr(.15,.5),'stroke-width':7});};
P.receipt=(g,A)=>{bg(g,A);glow(g,A,300,HZ-460,1900,1);
  mass(g,PL,PT,PR-PL,PB-PT,'#0B131C');
  fabric(g,A,PL,PR,HZ-60,PB,'#131D28');
  handShape(g,-2200,520,900,1,BLK);
  const nt=E(g,'g',null); note(nt,-200,60,1300,-5);
  const rc=E(g,'g',null); doc(rc,-200,-40,620,3);
  swapAt([nt],[rc],.30);};
P.empty_jacket=(g,A)=>{bg(g,A);glow(g,A,0,HZ-200,2400,1);floorPlane(g,A,HZ+200,'#3A2C14');
  E(g,'path',{d:`M-1500 ${HZ+560}L-1750 ${HZ+180}L-900 ${HZ-140}L0 ${HZ-200}L900 ${HZ-140}L1750 ${HZ+180}L1500 ${HZ+560}Z`,fill:BLK});
  for(const s of[-1,1]){const k=E(g,'g',null);
    E(k,'path',{d:`M${s*760-190} ${HZ+120}L${s*760+190} ${HZ+120}L${s*760+150} ${HZ+430}L${s*760-150} ${HZ+430}Z`,fill:'#22303E'});
    E(k,'line',{x1:s*760-190,y1:HZ+120,x2:s*760+190,y2:HZ+120,stroke:A.hex,'stroke-opacity':.8,'stroke-width':9});}
  dots(g,30,-1400,1400,HZ-400,HZ+300,A,12);};
P.outro=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#070B12');
  const ds=[]; for(let i=0;i<3;i++){const d=E(g,'g',null);
    doorway(d,A,0,HZ+460,1260,2200,1); ds.push(d);}
  fold(ds,0,HZ+460,7.0);
  const fl=E(g,'circle',{cx:0,cy:-260,r:1700,fill:'url(#'+A.glow+')',opacity:.5});
  an(fl,(p,t)=>{fl.setAttribute('opacity',(.45+p*.55).toFixed(3));fl.setAttribute('r',(1500+p*2400).toFixed(0));});
  floorPlane(g,A,HZ+460,BLK);};
