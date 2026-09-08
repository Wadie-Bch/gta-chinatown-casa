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

function bg(g,A){
  E(g,'rect',{x:PL,y:PT,width:PR-PL,height:PB-PT,fill:'url(#'+A.sky+')'});
  /* atmospheric haze sitting on the ground so shadow reads as depth, not as void */
  E(g,'ellipse',{cx:0,cy:HZ-120,rx:(PR-PL)*.60,ry:1150,fill:'url(#'+A.glow+')',opacity:.24});
}
function glow(g,A,x,y,r,op){ r*=1.18;
  E(g,'circle',{cx:x,cy:y,r:r,fill:'url(#'+A.glow+')',opacity:op==null?.88:op});
}
function shaft(g,A,x,tw,bw,y0,y1,op){
  y0=y0==null?PT:y0; y1=y1==null?HZ+120:y1;
  E(g,'path',{d:`M${x-tw} ${y0}L${x+tw} ${y0}L${x+bw} ${y1}L${x-bw} ${y1}Z`,
    fill:'url(#'+A.shaft+')',opacity:op==null?.62:op,filter:'url(#soft)'});
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
function fig(g,x,fy,h,pose,tone,op){
  h*=FS;
  if(CA){          /* backlight the figure so the silhouette separates. never outline it. */
    E(g,'ellipse',{cx:x,cy:fy-h*.46,rx:h*.44,ry:h*.60,
      fill:'url(#'+CA.glow+')',opacity:.34});
  }
  return figBody(g,x,fy,h,pose,tone,op,1);
}
function figBody(g,x,fy,h,pose,tone,op,gw){
  const k=E(g,'g',{fill:'none',stroke:tone||BLK,'stroke-linecap':'round',
    'stroke-linejoin':'round',opacity:op==null?1:op});
  gw=gw||1;
  const hd=h*.070*gw, sh=fy-h*.80, hip=fy-h*.47;
  const tw=h*.155*gw, lw=h*.105*gw, aw=h*.062*gw;
  E(k,'circle',{cx:x,cy:fy-h*.915,r:hd,fill:tone||BLK,stroke:'none'});
  E(k,'line',{x1:x,y1:fy-h*.845,x2:x,y2:hip,'stroke-width':tw});   /* torso */
  let lf=[[x-h*.055,fy],[x+h*.055,fy]], ar=[[x-h*.10,fy-h*.50],[x+h*.10,fy-h*.50]];
  if(pose==='walk'){ lf=[[x-h*.17,fy],[x+h*.15,fy]]; ar=[[x+h*.14,fy-h*.55],[x-h*.13,fy-h*.52]]; }
  else if(pose==='up'){ ar=[[x-h*.12,fy-h*.46],[x+h*.12,fy-h*.46]]; }
  else if(pose==='reach'){ ar=[[x-h*.09,fy-h*.50],[x+h*.20,fy-h*1.02]]; }
  else if(pose==='work'){ ar=[[x-h*.20,fy-h*.60],[x+h*.20,fy-h*.60]]; }
  else if(pose==='fold'){ ar=[[x-h*.13,fy-h*.60],[x+h*.13,fy-h*.60]]; }
  else if(pose==='sit'){ lf=[[x+h*.20,fy],[x+h*.20,fy]]; }
  else if(pose==='kneel'){ lf=[[x-h*.16,fy],[x+h*.18,fy]]; }
  E(k,'line',{x1:x,y1:hip,x2:lf[0][0],y2:lf[0][1],'stroke-width':lw});
  E(k,'line',{x1:x,y1:hip,x2:lf[1][0],y2:lf[1][1],'stroke-width':lw});
  E(k,'line',{x1:x,y1:sh,x2:ar[0][0],y2:ar[0][1],'stroke-width':aw});
  E(k,'line',{x1:x,y1:sh,x2:ar[1][0],y2:ar[1][1],'stroke-width':aw});
  return k;
}
function figrow(g,x0,x1,fy,h,n,tone,oneAt,accent){
  h*=FS;
  const out=[];
  for(let i=0;i<n;i++){
    const t=n<2?.5:i/(n-1), x=x0+(x1-x0)*t;
    const dep=rr(.82,1.06), yy=fy+rr(-24,24);
    const lit=(oneAt!=null&&i===oneAt);
    out.push(fig(g,x,yy,h*dep/FS,lit?'reach':(i%3===0?'walk':'stand'),lit?accent:tone,lit?1:rr(.72,1)));
  }
  return out;
}
/* ---- the system's object: a sheet of paper ---- */
function sheet(g,x,y,w,rot,op,tone){
  const h=w*1.414;
  const k=E(g,'g',{transform:`translate(${x} ${y}) rotate(${rot||0})`,opacity:op==null?1:op});
  E(k,'rect',{x:-w/2,y:-h/2,width:w,height:h,fill:tone||'#E8EEF6'});
  E(k,'rect',{x:-w/2,y:-h/2,width:w,height:h,fill:'none',stroke:'#04070C','stroke-opacity':.25,'stroke-width':2});
  return k;
}
function dots(g,n,x0,x1,y0,y1,A,rmax){
  const k=G(g);
  for(let i=0;i<n;i++)E(k,'circle',{cx:rr(x0,x1),cy:rr(y0,y1),r:rr(2.4,rmax||9),
    fill:A.hex,opacity:rr(.10,.5)});
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
    out.push(E(g,'rect',{x:x+i*cw+cw*.07,y:y+j*ch+ch*.09,width:cw*.86,height:ch*.82,
      fill:on?A.hex:BLK2,opacity:on?rr(.30,.72):1,stroke:A.hex,
      'stroke-opacity':on?.5:.20,'stroke-width':2.2}));
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
  sheet(g,0,HZ+40,900,1.5,1);
  for(const s of[-1,1]){E(g,'path',{d:`M${s*760} ${PB}L${s*640} ${HZ+180}L${s*430} ${HZ+60}L${s*250} ${HZ+110}L${s*300} ${PB}Z`,fill:BLK});}
  dots(g,34,-800,800,-900,HZ-40,A,11);};
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
  for(let i=0;i<3;i++)sheet(g,-1180,HZ+250-i*22,420,rr(-4,4),1);
  for(let i=0;i<26;i++)sheet(g,rr(620,1700),HZ+250-i*17,rr(360,470),rr(-16,16),.9);
  for(const s of[-1,1])E(g,'path',{d:`M${s*430} ${PB}L${s*360} ${HZ+120}L${s*140} ${HZ+30}L${s*70} ${PB}Z`,fill:BLK});};
P.corridor=(g,A)=>{bg(g,A);glow(g,A,0,-120,700,.75);floorPlane(g,A,HZ+300,BLK);
  for(let i=0;i<9;i++){const k=Math.pow(.70,i),w=2500*k,h=1900*k;
    E(g,'rect',{x:-w/2,y:-60-h/2,width:w,height:h,fill:'none',stroke:A.hex,
      'stroke-opacity':.10+.30*k,'stroke-width':3.4});
    if(i<7){mass(g,-w/2-70*k,-60-h*.30,66*k,h*.62,BLK2);mass(g,w/2+4*k,-60-h*.30,66*k,h*.62,BLK2);}}
  fig(g,-330,HZ+300,520,'walk',BLK);};
P.erase=(g,A)=>{bg(g,A);shaft(g,A,-620,180,1100,PT,HZ+240,.5);floorPlane(g,A,HZ+240,BLK);
  mass(g,-260,HZ-140,1600,290,BLK);mass(g,-200,HZ+150,120,300,BLK);mass(g,1160,HZ+150,120,300,BLK);
  fig(g,-560,HZ+240,600,'work',BLK);
  dots(g,64,-460,1500,-1100,HZ-100,A,14);};
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
P.civic=(g,A)=>{bg(g,A);glow(g,A,-1300,-620,1100,.75);
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
  for(let i=0;i<3;i++){const k=1-i*.2;mass(g,-1700*k,-700*k,900*k,1100*k,BLK2,.5-i*.13);}
  tbl(g,A,120,HZ+260,3000);sheet(g,120,HZ+130,620,2,1);
  mass(g,1350,-460,1000,1300,BLK2,.6);};
P.audit=(g,A)=>{bg(g,A);glow(g,A,0,-420,1000,.7);floorPlane(g,A,HZ+320,BLK);
  fig(g,-420,HZ+320,700,'reach',BLK2);fig(g,380,HZ+320,700,'reach',BLK2);
  fig(g,1420,HZ+320,660,'walk',BLK);
  E(g,'ellipse',{cx:-20,cy:HZ+330,rx:1000,ry:130,fill:'none',stroke:A.hex,'stroke-opacity':.30,'stroke-width':3.1});};
P.queue=(g,A)=>{bg(g,A);glow(g,A,1500,-260,1300,.85);floorPlane(g,A,HZ+380,BLK);
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
  E(g,'path',{d:`M-260 420Q400 300 900 620T2400 700L2400 ${PB}L-260 ${PB}Z`,fill:'#DCE6F2',opacity:.9});
  E(g,'path',{d:`M-260 420Q400 300 900 620T2400 700`,fill:'none',stroke:'#04070C','stroke-opacity':.4,'stroke-width':4.4});
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
  for(let i=0;i<54;i++)sheet(g,rr(PL+200,PR-200),rr(HZ-330,HZ+230),rr(280,400),rr(-26,26),rr(.55,1));};
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
  sheet(g,-260,HZ+140,560,-3,1);
  fig(g,900,HZ+300,540,'stand',BLK);
  E(g,'path',{d:`M-540 ${HZ+300}L1700 ${HZ+430}L2100 ${HZ+300}Z`,fill:'#000',opacity:.5});};
P.bench=(g,A)=>{bg(g,A);glow(g,A,1400,-360,1100,.8);tbl(g,A,0,HZ+280,4200);
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
P.sunrise=(g,A)=>{bg(g,A);
  E(g,'rect',{x:600,y:-1060,width:1500,height:1800,fill:'url(#'+A.shaft+')',opacity:.95});
  E(g,'rect',{x:600,y:-1060,width:1500,height:1800,fill:'none',stroke:A.hex,'stroke-opacity':.6,'stroke-width':4.4});
  E(g,'line',{x1:1350,y1:-1060,x2:1350,y2:740,stroke:A.hex,'stroke-opacity':.4,'stroke-width':3.1});
  glow(g,A,1350,-160,1200,.7);
  E(g,'path',{d:`M600 ${HZ+440}L2100 ${HZ+440}L2700 ${PB}L200 ${PB}Z`,fill:A.hex,opacity:.13});
  tbl(g,A,-1000,HZ+330,1500);
  for(const x of[-1560,-440])E(g,'path',{d:`M${x} ${HZ+330}L${x} ${HZ-90}L${x+180} ${HZ-90}`,
    stroke:BLK,'stroke-width':26,fill:'none'});
  floorPlane(g,A,HZ+440,BLK);};
P.tools=(g,A)=>{bg(g,A);shaft(g,A,-1500,400,1500,PT,HZ+300,.55);tbl(g,A,0,HZ+300,4000);
  fig(g,-1100,HZ+300,640,'work',BLK);fig(g,1100,HZ+300,640,'work',BLK);
  for(let i=0;i<7;i++)E(g,'line',{x1:-560+i*180,y1:HZ+230,x2:-500+i*180,y2:HZ+40,
    stroke:BLK,'stroke-width':22,'stroke-linecap':'round'});
  E(g,'rect',{x:-260,y:HZ+130,width:640,height:130,fill:BLK});};
P.dateline=(g,A)=>{bg(g,A);glow(g,A,0,-260,1900,.55);tbl(g,A,0,HZ+330,4600);
  const p=rule(g,A,PL+200,HZ+180,PR-200,HZ+180,.85,13);
  for(let i=0;i<6;i++){const x=-1400+i*560;
    E(g,'rect',{x:x-90,y:HZ+40,width:180,height:140,fill:BLK});
    E(g,'circle',{cx:x,cy:HZ-30,r:74,fill:BLK});}
  dots(g,54,PL+200,PR-200,HZ-40,HZ+220,A,12);};
P.blind_door=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#080D15');
  doorway(g,A,-120,HZ+400,1300,2000,.9);
  tbl(g,A,-120,HZ+230,760);E(g,'rect',{x:-330,y:HZ+80,width:420,height:150,fill:BLK});
  fig(g,420,HZ+400,560,'stand',BLK,.85);floorPlane(g,A,HZ+400,BLK);};
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
  fig(g,-900,HZ+380,900,'reach',BLK);
  sheet(g,-160,-160,520,-4,1);
  for(let i=0;i<5;i++){const x=700+i*430;mass(g,x,HZ+120-rr(0,180),240,320,BLK2,.8);}
  tbl(g,A,1400,HZ+380,2200);};
P.putdown=(g,A)=>{bg(g,A);glow(g,A,200,HZ-260,2100,1);tbl(g,A,0,HZ+300,5400);
  E(g,'ellipse',{cx:200,cy:HZ+280,rx:2200,ry:520,fill:'url(#'+A.glow+')',opacity:.95});
  sheet(g,160,HZ-60,1500,2,1);
  E(g,'path',{d:`M-2400 ${PB}L-1900 ${HZ-40}L-1050 ${HZ-320}L-380 ${HZ-90}L-700 ${PB}Z`,fill:BLK});
  dots(g,46,-500,1500,-800,HZ+120,A,17);};
P.outro=(g,A)=>{bg(g,A);mass(g,PL,PT,PR-PL,PB-PT,'#070B12');
  doorway(g,A,0,HZ+460,1180,2100,1);glow(g,A,0,-360,1500,.95);
  floorPlane(g,A,HZ+460,BLK);};
