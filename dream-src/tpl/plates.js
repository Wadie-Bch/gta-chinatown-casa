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
   PLATES - one per shot key. Each depicts what the line actually says.
   ========================================================================== */
const P={};
/* ACT 1 */
P.monument=(g,A)=>{bg(g,A);glow(g,A,0,120,1500,.62);floorPlane(g,A,HZ+150,BLK);
  mass(g,-1900,HZ+150,3800,60,'#0A1119',.6);
  const s=sheet(g,60,-190,1180,-2.2,1);s.setAttribute('filter','url(#soft0)');
  E(g,'line',{x1:-1520,y1:PT,x2:-1520,y2:HZ+150,stroke:BLK,'stroke-width':26});
  glow(g,A,-1520,-820,300,.9);
  fig(g,140,HZ+150,300,'up',BLK);
  mass(g,-560,HZ+210,1240,300,A.hex,.07);};
P.hands=(g,A)=>{bg(g,A);glow(g,A,0,-880,900,.7);tbl(g,A,0,HZ+320,4600);
  const sh=sheet(g,0,HZ-60,1500,1.5,1);
  const ink=E(g,'g',null);
  for(let i=0;i<9;i++)E(ink,'rect',{x:-560,y:HZ-700+i*150,width:rr(500,1120),height:34,fill:'#0A1119'});
  for(const s of[-1,1]){const hd=E(g,'path',{d:`M${s*1180} ${PB}L${s*980} ${HZ+240}L${s*640} ${HZ+60}L${s*360} ${HZ+140}L${s*440} ${PB}Z`,fill:BLK});
    an(hd,(p,t)=>hd.setAttribute('transform','translate('+(Math.sin(t*.55+s)*46).toFixed(1)+' 0)'));}
  erode(g,[ink],-560,560,HZ-700,HZ+560,.16);};
P.crowd=(g,A,c)=>{bg(g,A);glow(g,A,c.one?520:0,-380,1200,.5);floorPlane(g,A,HZ+120,BLK);
  const n=c.n||14;
  figrow(g,PL+240,PR-240,HZ+430,470,Math.ceil(n/2),BLK,null,A.hex);
  figrow(g,PL+430,PR-120,HZ+120,360,Math.floor(n/2),BLK2,c.one?1:null,A.hex);};
P.rain=(g,A,c)=>{bg(g,A);glow(g,A,0,-700,1300,.6);floorPlane(g,A,HZ+330,BLK);
  const f=faller(g,A,c.n||70,c.up,c.coin);
  fig(g,-60,HZ+330,330,'stand',BLK);
  return f;};
/* ACT 2 */
P.swap=(g,A)=>{bg(g,A);shaft(g,A,-980,300,900,PT,HZ+200,.42);floorPlane(g,A,HZ+200,BLK);
  fig(g,-620,HZ+200,700,'stand',BLK,.28);
  sheet(g,340,-40,760,4,1);
  E(g,'path',{d:`M${-560} ${HZ+200}L${1180} ${HZ+430}L${1560} ${HZ+200}Z`,fill:BLK,opacity:.75});};
P.press=(g,A)=>{bg(g,A);glow(g,A,0,-400,1200,.4);floorPlane(g,A,HZ+300,BLK);
  mass(g,-1400,PT+60,2800,760,BLK2);rule(g,A,-1400,PT+820,1400,PT+820,.6,5);
  for(let i=0;i<7;i++)E(g,'line',{x1:-1200+i*400,y1:PT+820,x2:-1200+i*400,y2:HZ-140,stroke:BLK,'stroke-width':30});
  E(g,'path',{d:`M-1250 ${HZ+300}L-820 ${HZ-120}L900 ${HZ-160}L1300 ${HZ+300}Z`,fill:BLK});
  sheet(g,60,HZ+230,520,0,1);dots(g,26,-1300,1300,-500,HZ,A,8);};
P.sort=(g,A)=>{bg(g,A);shaft(g,A,0,220,1500,PT,HZ+260,.46);tbl(g,A,0,HZ+260,4400);
  for(let i=0;i<3;i++)sheet(g,-1500,HZ+250-i*30,520,rr(-4,4),1);
  for(let i=0;i<26;i++)sheet(g,rr(900,2100),HZ+250-i*20,rr(430,540),rr(-16,16),.9);
  const fly=[]; for(let i=0;i<6;i++)fly.push(sheet(g,0,HZ-260,430,0,1));
  loopEls(fly,1500,540,2.6);
  for(const s of[-1,1]){const hd=E(g,'path',{d:`M${s*620} ${PB}L${s*520} ${HZ+160}L${s*210} ${HZ+40}L${s*110} ${PB}Z`,fill:BLK});
    an(hd,(p,t)=>hd.setAttribute('transform','translate(0 '+(Math.sin(t*2.4+(s>0?0:3.14))*90).toFixed(1)+')'));}};
P.corridor=(g,A)=>{bg(g,A);glow(g,A,0,-120,700,.75);floorPlane(g,A,HZ+300,BLK);
  for(let i=0;i<9;i++){const k=Math.pow(.70,i),w=2500*k,h=1900*k;
    E(g,'rect',{x:-w/2,y:-60-h/2,width:w,height:h,fill:'none',stroke:A.hex,
      'stroke-opacity':.10+.30*k,'stroke-width':3.4});
    if(i<7){mass(g,-w/2-70*k,-60-h*.30,66*k,h*.62,BLK2);mass(g,w/2+4*k,-60-h*.30,66*k,h*.62,BLK2);}}
  fig(g,-330,HZ+300,520,'walk',BLK);};
P.erase=(g,A)=>{bg(g,A);shaft(g,A,-620,180,1100,PT,HZ+240,.5);floorPlane(g,A,HZ+240,BLK);
  const pia=E(g,'g',null);
  mass(pia,-260,HZ-140,1600,290,BLK);mass(pia,-200,HZ+150,120,300,BLK);mass(pia,1160,HZ+150,120,300,BLK);
  const pl=E(g,'g',null); fig(pl,-560,HZ+240,760,'work',BLK);
  erode(g,[pia,pl],-560,1500,HZ-500,HZ+300,.20);};
/* ACT 3 */
P.slot=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#0A1018');
  E(g,'rect',{x:-460,y:-180,width:920,height:120,fill:'url(#'+A.shaft+')'});
  E(g,'rect',{x:-460,y:-180,width:920,height:120,fill:'none',stroke:A.hex,'stroke-opacity':.7,'stroke-width':4.4});
  glow(g,A,0,-120,620,.5);
  fig(g,-980,HZ+420,660,'reach',BLK);floorPlane(g,A,HZ+420,BLK);};
P.funnel=(g,A)=>{bg(g,A);glow(g,A,0,-900,1300,.5);
  E(g,'path',{d:`M-2100 ${PT+120}L2100 ${PT+120}L340 ${HZ+120}L-340 ${HZ+120}Z`,fill:BLK2});
  E(g,'path',{d:`M-2100 ${PT+120}L2100 ${PT+120}L340 ${HZ+120}L-340 ${HZ+120}Z`,fill:'none',
    stroke:A.hex,'stroke-opacity':.55,'stroke-width':5});
  mass(g,-120,HZ+120,240,PB-HZ-120,BLK);
  for(let i=0;i<20;i++)sheet(g,rr(-1900,1900),rr(PT+60,PT+520),rr(90,190),rr(-40,40),rr(.3,.8));
  for(let i=0;i<5;i++)sheet(g,rr(-70,70),HZ+260+i*180,90,rr(-10,10),.85);
  floorPlane(g,A,PB-60,BLK);};
P.belt=(g,A)=>{bg(g,A);glow(g,A,300,-260,800,.55);
  mass(g,PL,HZ+140,PR-PL,120,BLK2);rule(g,A,PL,HZ+140,PR,HZ+140,.6,4);
  for(let i=0;i<12;i++)sheet(g,PL+240+i*420,HZ+40,230,0,.92);
  E(g,'path',{d:`M420 ${PT+80}L620 ${PT+80}L560 ${HZ-40}L400 ${HZ-40}Z`,fill:BLK});
  mass(g,330,HZ-70,340,90,BLK);
  mass(g,PL,PB-260,PR-PL,260,BLK);};
P.cabinets=(g,A)=>{bg(g,A);glow(g,A,0,-500,1400,.35);
  grid(g,A,PL+80,-360,PR-PL-160,1500,10,5,.13);floorPlane(g,A,PB-160,BLK);
  dots(g,40,PL,PR,-800,PB-200,A,7);};
P.stack=(g,A)=>{bg(g,A);shaft(g,A,180,140,760,PT,HZ+300,.55);tbl(g,A,-100,HZ+300,3200);
  for(let i=0;i<34;i++)sheet(g,190+rr(-40,40),HZ+270-i*74,600,rr(-5,5),1);
  fig(g,-1080,HZ+300,600,'sit',BLK);};
P.two_piles=(g,A)=>{bg(g,A);shaft(g,A,0,200,1600,PT,HZ+280,.5);tbl(g,A,0,HZ+280,4600);
  for(let i=0;i<3;i++)sheet(g,-1280,HZ+268-i*24,520,rr(-3,3),1);
  for(let i=0;i<40;i++)sheet(g,rr(700,1900),HZ+268-i*26,rr(430,540),rr(-22,22),.92);
  for(const s of[-1,1])E(g,'path',{d:`M${s*500} ${PB}L${s*420} ${HZ+140}L${s*170} ${HZ+40}L${s*90} ${PB}Z`,fill:BLK});};
/* ACT 4 */
P.civic=(g,A)=>{bg(g,A);timeSlip(g,A,-360,HZ+540);
  mass(g,-1500,-820,3000,1500,BLK2);
  for(let i=0;i<9;i++)mass(g,-1360+i*320,-700,120,1100,BLK);
  E(g,'path',{d:`M-1700 -820L0 -1240L1700 -820Z`,fill:BLK2});
  for(let i=0;i<5;i++)mass(g,-1900+i*0,HZ+180+i*70,3800,70,BLK,1-i*.12);
  floorPlane(g,A,HZ+540,BLK);
  E(g,'path',{d:`M-1500 ${HZ+540}L900 ${HZ+540}L1900 ${PB}L-1500 ${PB}Z`,fill:'#000',opacity:.5});
  figrow(g,-900,1200,HZ+540,300,5,BLK,null,A.hex);};
P.handshake=(g,A)=>{bg(g,A);glow(g,A,-760,-320,900,.8);floorPlane(g,A,HZ+340,BLK);
  for(let i=0;i<4;i++){const o=.16+i*.26,dx=i*54;
    fig(g,-360+dx,HZ+340,620,'reach',BLK,o);fig(g,320+dx,HZ+340,620,'reach',BLK,o);}
  mass(g,1500,-520,900,1300,BLK2);};
P.door=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#080D15');
  for(let i=3;i>=0;i--){const k=Math.pow(.74,i);doorway(g,A,120*i,HZ+320,760*k,1500*k,.72-i*.14);}
  fig(g,-960,HZ+320,640,'walk',BLK);floorPlane(g,A,HZ+320,BLK);};
P.paper_room=(g,A)=>{bg(g,A);shaft(g,A,-700,240,1200,PT,HZ+260,.42);
  const rmA=E(g,'g',null), rmB=E(g,'g',null);
  for(let i=0;i<3;i++){const k=1-i*.2;mass(rmA,-2000*k,-700*k,1000*k,1300*k,BLK2,.55-i*.13);}
  mass(rmA,1500,-560,1200,1500,BLK2,.6);
  for(let i=0;i<5;i++)mass(rmB,-2200+i*900,-880+rr(0,300),300,1500,BLK2,.6);
  E(rmB,'path',{d:`M-2400 -900L0 -1350L2400 -900Z`,fill:BLK2,opacity:.6});
  swapAt([rmA],[rmB],.46);
  tbl(g,A,120,HZ+260,3200);sheet(g,120,HZ+60,860,2,1);};
P.audit=(g,A)=>{bg(g,A);glow(g,A,0,-420,1000,.7);floorPlane(g,A,HZ+320,BLK);
  fig(g,-420,HZ+320,700,'reach',BLK2);fig(g,380,HZ+320,700,'reach',BLK2);
  fig(g,1420,HZ+320,660,'walk',BLK);
  E(g,'ellipse',{cx:-20,cy:HZ+330,rx:1000,ry:130,fill:'none',stroke:A.hex,'stroke-opacity':.30,'stroke-width':3.1});};
P.queue=(g,A)=>{bg(g,A);timeSlip(g,A,-260,HZ+380);floorPlane(g,A,HZ+380,BLK);
  mass(g,PL,-960,2100,1700,BLK2);mass(g,860,-560,300,1300,BLK);
  figrow(g,-1900,1250,HZ+380,420,13,BLK,null,A.hex);
  E(g,'path',{d:`M-2480 ${HZ+380}L2480 ${HZ+380}L2480 ${PB}L-2480 ${PB}Z`,fill:'#000',opacity:.35});};
/* ACT 5 */
P.crack=(g,A)=>{bg(g,A);shaft(g,A,760,160,900,PT,HZ+240,.45);tbl(g,A,0,HZ+240,4400);
  const s=sheet(g,0,HZ+30,1500,0,1);
  E(s,'path',{d:'M20 -1060L-70 -520L110 -60L-40 400L60 1060',stroke:'#04070C','stroke-width':26,fill:'none','stroke-linejoin':'round'});
  dots(g,30,-260,260,-500,HZ+200,A,8);};
P.weld_swap=(g,A)=>{bg(g,A);glow(g,A,-760,-120,760,.9);floorPlane(g,A,HZ+300,BLK);
  fig(g,-760,HZ+300,700,'work',BLK);
  for(let i=0;i<26;i++)E(g,'line',{x1:-560,y1:-140,x2:-560+rr(-330,330),y2:-140+rr(60,560),
    stroke:A.hex,'stroke-opacity':rr(.2,.85),'stroke-width':rr(2,5)});
  mass(g,700,-800,1700,1400,BLK2,.55);fig(g,1420,HZ+300,660,'sit',BLK,.8);
  tbl(g,A,1420,HZ+120,900);};
P.two_rooms=(g,A)=>{bg(g,A);
  mass(g,PL+120,-820,2140,1900,'#060A11');mass(g,180,-820,2180,1900,BLK2);
  E(g,'rect',{x:180,y:-820,width:2180,height:1900,fill:'url(#'+A.shaft+')',opacity:.45});
  E(g,'rect',{x:PL+120,y:-820,width:2140,height:1900,fill:'none',stroke:A.hex,'stroke-opacity':.22,'stroke-width':3.4});
  E(g,'rect',{x:180,y:-820,width:2180,height:1900,fill:'none',stroke:A.hex,'stroke-opacity':.6,'stroke-width':4.4});
  fig(g,-1400,HZ+560,600,'work',BLK,.4);fig(g,1270,HZ+560,600,'reach',BLK);
  floorPlane(g,A,PB-140,BLK);};
P.table=(g,A)=>{bg(g,A);shaft(g,A,-560,200,1100,PT,HZ+300,.5);tbl(g,A,-300,HZ+300,3400);
  fig(g,-820,HZ+300,660,'reach',BLK);fig(g,120,HZ+300,660,'stand',BLK,.34);
  fig(g,1300,HZ+300,620,'sit',BLK2);fig(g,1800,HZ+300,620,'sit',BLK2);};
/* ACT 6 */
P.void=(g,A)=>{bg(g,A);glow(g,A,-900,HZ-200,1900,1);
  E(g,'rect',{x:PL,y:HZ+40,width:PR-PL,height:PB-HZ-40,fill:A.hex,opacity:.20});
  floorPlane(g,A,HZ+40,'#241609');
  E(g,'ellipse',{cx:-500,cy:HZ+340,rx:2600,ry:620,fill:'url(#'+A.glow+')',opacity:.85});
  const d=`M-560 ${HZ+240}L2300 ${HZ+140}L2800 ${PB}L-1500 ${PB}Z`;
  E(g,'path',{d:d,fill:'#000'});
  E(g,'path',{d:d,fill:'none',stroke:A.hex,'stroke-opacity':.8,'stroke-width':7});
  fig(g,-1500,HZ+240,900,'stand',BLK);
  mass(g,PL,PT,PR-PL,700,'#05080E',.55);};
P.line_walk=(g,A)=>{bg(g,A);glow(g,A,900,-560,1000,.8);floorPlane(g,A,HZ+400,'#0A1119');
  figrow(g,PL-100,PR+100,HZ+400,430,16,BLK,null,A.hex);
  for(let i=0;i<120;i++){const x=rr(PL,PR),y=rr(PT,PB-100);
    E(g,'line',{x1:x,y1:y,x2:x-26,y2:y+120,stroke:'#BFD6EA','stroke-opacity':rr(.08,.3),'stroke-width':2.4});}};
P.kneel=(g,A)=>{bg(g,A);glow(g,A,-260,-320,860,.9);floorPlane(g,A,HZ+400,'#0A1119');
  figrow(g,PL,PR,HZ+400,430,13,'#02040A',null,A.hex);
  fig(g,-260,HZ+400,470,'kneel',BLK);
  E(g,'circle',{cx:-160,cy:HZ+170,r:60,fill:BLK});
  for(let i=0;i<90;i++){const x=rr(PL,PR),y=rr(PT,PB-100);
    E(g,'line',{x1:x,y1:y,x2:x-22,y2:y+110,stroke:'#BFD6EA','stroke-opacity':rr(.06,.24),'stroke-width':2.2});}};
P.bed=(g,A)=>{bg(g,A);
  mass(g,PL,PT,PR-PL,PB-PT,'#070B12');
  E(g,'rect',{x:700,y:-1180,width:1700,height:2000,fill:'url(#'+A.shaft+')',opacity:1});
  E(g,'rect',{x:700,y:-1180,width:1700,height:2000,fill:'none',stroke:A.hex,'stroke-opacity':.7,'stroke-width':6.4});
  E(g,'line',{x1:1550,y1:-1180,x2:1550,y2:820,stroke:A.hex,'stroke-opacity':.45,'stroke-width':4.4});
  glow(g,A,1550,-180,1500,.85);
  mass(g,-2300,HZ+300,2300,340,BLK);mass(g,-2300,HZ+150,280,490,BLK);
  fig(g,-900,HZ+300,780,'sit',BLK);
  for(let i=0;i<46;i++){const x=rr(710,2390),y=rr(-1170,800);
    E(g,'line',{x1:x,y1:y,x2:x-20,y2:y+130,stroke:'#CFE2F2','stroke-opacity':rr(.16,.5),'stroke-width':3.4});}
  floorPlane(g,A,HZ+640,BLK);};
P.hole=(g,A)=>{bg(g,A);glow(g,A,0,-260,1300,.5);
  const s=sheet(g,0,120,2600,0,1);
  E(s,'rect',{x:-620,y:-780,width:1240,height:1560,fill:'#010205'});
  E(s,'rect',{x:-620,y:-780,width:1240,height:1560,fill:'none',stroke:A.hex,'stroke-opacity':.55,'stroke-width':6.4});
  fig(g,0,560,180,'walk',A.hex,.5);};
P.three_rooms=(g,A)=>{bg(g,A);
  for(let i=0;i<3;i++){const x=PL+300+i*1560;
    mass(g,x,-760,1360,1780,BLK2);
    E(g,'rect',{x:x,y:-760,width:1360,height:1780,fill:'url(#'+A.shaft+')',opacity:.30-i*.08});
    E(g,'rect',{x:x,y:-760,width:1360,height:1780,fill:'none',stroke:A.hex,'stroke-opacity':.42,'stroke-width':3.4});
    if(i===0){mass(g,x+200,HZ+430,900,180,BLK);fig(g,x+960,HZ+610,480,'kneel',BLK);}
    if(i===1){fig(g,x+660,HZ+610,520,'work',BLK);mass(g,x+250,HZ+480,520,130,BLK,.8);}
    if(i===2){fig(g,x+680,HZ+610,540,'stand',BLK);}}
  floorPlane(g,A,PB-100,BLK);};
P.still_crowd=(g,A)=>{bg(g,A);glow(g,A,0,-620,1700,.8);floorPlane(g,A,HZ+430,'#080D15');
  figrow(g,PL-60,PR+60,HZ+430,470,17,'#02040A',null,A.hex);
  figrow(g,PL+300,PR-300,HZ+160,350,11,'#010307',null,A.hex);
  for(let i=0;i<110;i++){const x=rr(PL,PR),y=rr(PT,PB-100);
    E(g,'line',{x1:x,y1:y,x2:x-24,y2:y+118,stroke:A.hex,'stroke-opacity':rr(.08,.3),'stroke-width':2.4});}};
/* ACT 7 */
P.screens=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#04070C');
  grid(g,A,PL+100,-780,PR-PL-200,1860,7,4,.72);glow(g,A,0,0,1500,.35);
  floorPlane(g,A,PB-90,BLK);};
P.printer=(g,A)=>{bg(g,A);glow(g,A,-900,-260,760,.8);
  mass(g,-1500,-320,1500,700,BLK2);rule(g,A,-1500,-320,0,-320,.6,4.4);
  mass(g,-1240,380,980,120,BLK);
  E(g,'path',{d:`M-260 620Q400 500 900 820T2400 900L2400 ${PB}L-260 ${PB}Z`,fill:'#DCE6F2',opacity:.9});
  const out=[]; for(let i=0;i<9;i++)out.push(sheet(g,-160,300,470,rr(-8,8),1));
  loopEls(out,2500,360,1.5);
  floorPlane(g,A,PB-80,BLK);};
P.servers=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#05080E');
  grid(g,A,PL+140,PT+120,PR-PL-280,2100,12,9,.30);
  E(g,'path',{d:`M${PL} ${HZ+560}L${PR} ${HZ+420}L${PR} ${PB}L${PL} ${PB}Z`,fill:'#D6E2F0',opacity:.88});
  for(let i=0;i<26;i++)sheet(g,rr(PL,PR),rr(HZ+330,HZ+560),rr(90,170),rr(-30,30),.7);};
P.loop_rooms=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#04070C');
  mass(g,PL+180,-780,1700,1860,'#080D15');mass(g,600,-780,1700,1860,'#080D15');
  doorway(g,A,240,HZ+520,660,1320,.85);
  for(const x of[-1700,1720]){mass(g,x-380,-460,760,1120,BLK2);
    E(g,'rect',{x:x-290,y:-360,width:580,height:470,fill:A.hex,opacity:.85});
    glow(g,A,x,-120,900,.8);}
  E(g,'path',{d:'M-1330 460Q0 900 1350 460',fill:'none',stroke:'#DCE6F2','stroke-opacity':.85,'stroke-width':26});
  floorPlane(g,A,HZ+520,BLK);};
P.dust=(g,A)=>{bg(g,A);shaft(g,A,-200,300,1700,PT,HZ+420,.4);
  E(g,'path',{d:`M${PL} ${HZ+480}Q0 ${HZ+300} ${PR} ${HZ+470}L${PR} ${PB}L${PL} ${PB}Z`,fill:'#C8D6E6',opacity:.62});
  dots(g,150,PL,PR,PT,HZ+430,A,17);
  dots(g,80,PL,PR,-300,HZ+400,{hex:'#9FB4C8'},13);};
P.copies=(g,A)=>{bg(g,A);shaft(g,A,0,180,1500,PT,HZ+250,.5);tbl(g,A,0,HZ+250,4600);
  const cp=[]; for(let i=0;i<54;i++)cp.push(sheet(g,rr(PL+200,PR-200),rr(HZ-330,HZ+230),rr(300,420),rr(-26,26),1));
  cp.forEach((e,i)=>{const th=i/cp.length*.85;
    an(e,(p)=>e.style.opacity=p<th?0:Math.min(1,(p-th)*14).toFixed(3));});};
/* ACT 8 */
P.chair=(g,A)=>{bg(g,A);floorPlane(g,A,HZ+400,BLK);shaft(g,A,60,260,1700,PT,HZ+400,.95);
  E(g,'ellipse',{cx:60,cy:HZ+400,rx:1750,ry:380,fill:'url(#'+A.glow+')',opacity:1});
  const c=G(g,`translate(60 ${HZ+400})`);
  const d='M-330 0L-330 -660M330 0L330 -660M-330 -660L330 -660M-330 -660L-330 -1400M-330 -1400L-70 -1400';
  E(c,'path',{d:d,stroke:A.hex,'stroke-width':84,fill:'none','stroke-linecap':'round',
    opacity:.45,filter:'url(#soft0)'});
  E(c,'path',{d:d,stroke:BLK,'stroke-width':56,fill:'none','stroke-linecap':'round'});
  dots(g,54,-900,1100,-1200,HZ+340,A,13);};
P.photo=(g,A)=>{bg(g,A);glow(g,A,-980,-460,1000,.75);tbl(g,A,200,HZ+300,3600);
  const ph=E(g,'g',null); sheet(ph,-260,HZ-40,900,-3,1);
  const pr=E(g,'g',null); fig(pr,-260,HZ+280,900,'stand',BLK);
  swapAt([ph],[pr],.40);
  fig(g,1500,HZ+300,660,'up',BLK);};
P.bench=(g,A)=>{bg(g,A);timeSlip(g,A,-360,HZ+280);tbl(g,A,0,HZ+280,4200);
  for(let i=0;i<7;i++)E(g,'line',{x1:PL+200,y1:HZ+180-i*130,x2:PR-200,y2:HZ+150-i*130,
    stroke:A.hex,'stroke-opacity':.30-i*.03,'stroke-width':3.1});
  mass(g,-360,HZ-70,720,350,BLK);E(g,'circle',{cx:0,cy:HZ-130,r:190,fill:BLK});
  fig(g,-1600,HZ+280,560,'work',BLK,.55);};
P.weight=(g,A)=>{bg(g,A);glow(g,A,-1500,-760,1200,.7);
  mass(g,-1550,-1180,3100,1900,BLK2);
  for(let i=0;i<11;i++)mass(g,-1440+i*280,-1060,140,1700,BLK);
  E(g,'path',{d:'M-1750 -1180L0 -1520L1750 -1180Z',fill:BLK2});
  sheet(g,0,900,760,0,1);floorPlane(g,A,PB-60,BLK);};
P.defenders=(g,A)=>{bg(g,A);glow(g,A,0,-500,1800,.9);
  grid(g,A,PL+80,-660,PR-PL-160,1200,9,4,.04);
  figrow(g,PL+240,PR-240,HZ+430,700,9,'#010307',null,A.hex);
  floorPlane(g,A,HZ+430,BLK);};
/* ACT 9 */
P.sunrise=(g,A)=>{bg(g,A);timeSlip(g,A,-200,HZ+440);
  E(g,'rect',{x:600,y:-1060,width:1500,height:1800,fill:'url(#'+A.shaft+')',opacity:.95});
  E(g,'rect',{x:600,y:-1060,width:1500,height:1800,fill:'none',stroke:A.hex,'stroke-opacity':.6,'stroke-width':4.4});
  E(g,'line',{x1:1350,y1:-1060,x2:1350,y2:740,stroke:A.hex,'stroke-opacity':.4,'stroke-width':3.1});
  glow(g,A,1350,-160,1200,.7);
  E(g,'path',{d:`M600 ${HZ+440}L2100 ${HZ+440}L2700 ${PB}L200 ${PB}Z`,fill:A.hex,opacity:.13});
  tbl(g,A,-1000,HZ+330,1500);
  for(const x of[-1560,-440])E(g,'path',{d:`M${x} ${HZ+330}L${x} ${HZ-90}L${x+180} ${HZ-90}`,
    stroke:BLK,'stroke-width':26,fill:'none'});
  floorPlane(g,A,HZ+440,BLK);};
P.tools=(g,A)=>{bg(g,A);shaft(g,A,-1500,400,1500,PT,HZ+300,.55);tbl(g,A,0,HZ+300,4200);
  fig(g,-1400,HZ+300,760,'work',BLK);fig(g,1400,HZ+300,760,'work',BLK);
  const pa=E(g,'g',null); sheet(pa,0,HZ-30,760,1,1);
  const tl=E(g,'g',null);
  for(let i=0;i<7;i++)E(tl,'line',{x1:-700+i*230,y1:HZ+240,x2:-620+i*230,y2:HZ-90,
    stroke:BLK,'stroke-width':30,'stroke-linecap':'round'});
  E(tl,'rect',{x:-330,y:HZ+120,width:800,height:150,fill:BLK});
  swapAt([pa],[tl],.42);};
P.dateline=(g,A)=>{bg(g,A);glow(g,A,0,-260,1900,.55);tbl(g,A,0,HZ+330,4600);
  const p=rule(g,A,PL+200,HZ+180,PR-200,HZ+180,.85,13);
  for(let i=0;i<6;i++){const x=-1400+i*560;
    E(g,'rect',{x:x-90,y:HZ+40,width:180,height:140,fill:BLK});
    E(g,'circle',{cx:x,cy:HZ-30,r:74,fill:BLK});}
  dots(g,54,PL+200,PR-200,HZ-40,HZ+220,A,12);};
P.blind_door=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#080D15');
  const ds=[]; for(let i=0;i<3;i++){const d=E(g,'g',null);
    doorway(d,A,-120,HZ+400,1400,2100,.9); ds.push(d);}
  fold(ds,-120,HZ+400,6.0);
  tbl(g,A,-120,HZ+250,900);E(g,'rect',{x:-420,y:HZ+60,width:560,height:190,fill:BLK});
  const pn=E(g,'g',null); fig(pn,620,HZ+400,760,'stand',BLK);
  swapAt([],[pn],.50);
  floorPlane(g,A,HZ+400,BLK);};
P.scales=(g,A)=>{bg(g,A);shaft(g,A,0,240,1600,PT,HZ+400,.5);
  E(g,'line',{x1:0,y1:HZ+400,x2:0,y2:-560,stroke:BLK,'stroke-width':30});
  E(g,'line',{x1:-1500,y1:-420,x2:1500,y2:-700,stroke:BLK,'stroke-width':24});
  for(const[x,y,s] of[[-1500,-420,1],[1500,-700,1]]){
    E(g,'line',{x1:x,y1:y,x2:x,y2:y+230,stroke:BLK,'stroke-width':13});
    E(g,'path',{d:`M${x-380} ${y+230}L${x+380} ${y+230}L${x+280} ${y+400}L${x-280} ${y+400}Z`,fill:BLK});}
  for(let i=0;i<26;i++)sheet(g,rr(-1800,-1200),rr(-560,-240),rr(150,260),rr(-30,30),.85);
  E(g,'circle',{cx:1500,cy:-560,r:120,fill:A.hex,opacity:.95});
  floorPlane(g,A,HZ+400,BLK);};
P.reveal=(g,A)=>{bg(g,A);glow(g,A,1400,-460,1200,.8);floorPlane(g,A,HZ+380,BLK);
  fig(g,-1300,HZ+380,1100,'reach',BLK);
  const ph=E(g,'g',null); sheet(ph,-160,-60,700,-4,1);
  const wk=E(g,'g',null);
  for(let i=0;i<5;i++){const x=500+i*520;mass(wk,x,HZ+40-rr(0,260),330,440,BLK2,.9);
    E(wk,'circle',{cx:x+165,cy:HZ-60,r:90,fill:BLK2,opacity:.9});}
  swapAt([ph],[wk],.44);
  tbl(g,A,1400,HZ+380,2600);};
P.putdown=(g,A)=>{bg(g,A);glow(g,A,200,HZ-260,2100,1);tbl(g,A,0,HZ+300,5400);
  E(g,'ellipse',{cx:200,cy:HZ+280,rx:2200,ry:520,fill:'url(#'+A.glow+')',opacity:.95});
  sheet(g,160,HZ-60,1500,2,1);
  E(g,'path',{d:`M-2400 ${PB}L-1900 ${HZ-40}L-1050 ${HZ-320}L-380 ${HZ-90}L-700 ${PB}Z`,fill:BLK});
  dots(g,46,-500,1500,-800,HZ+120,A,17);};
P.outro=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#070B12');
  const ds=[]; for(let i=0;i<3;i++){const d=E(g,'g',null);
    doorway(d,A,0,HZ+460,1260,2200,1); ds.push(d);}
  fold(ds,0,HZ+460,7.0);
  const fl=E(g,'circle',{cx:0,cy:-260,r:1700,fill:'url(#'+A.glow+')',opacity:.5});
  an(fl,(p,t)=>{fl.setAttribute('opacity',(.45+p*.55).toFixed(3));
    fl.setAttribute('r',(1500+p*2400).toFixed(0));});
  floorPlane(g,A,HZ+460,BLK);};
