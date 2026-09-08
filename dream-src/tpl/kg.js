/* ============================================================================
   FLAT-VECTOR MOTION GRAPHICS CORE
   Fixed 1920x1080 frame. Shapes are filled, never stroked-lines-pretending.
   Limbs are capsules rotated about real joints, so a figure never falls apart.
   ========================================================================== */
const NS='http://www.w3.org/2000/svg';
function E(p,t,a){const e=document.createElementNS(NS,t);if(a)for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function G(p,tr){return E(p,'g',tr?{transform:tr}:null)}
const TAU=6.283185307;
let _s=12345; function rnd(){_s^=_s<<13;_s^=_s>>>17;_s^=_s<<5;return((_s>>>0)/4294967296)}
function rr(a,b){return a+(b-a)*rnd()}
function reseed(n){_s=(0x9E3779B9^(n*2654435761))>>>0;rnd();rnd();rnd()}

function shade(hex,f){                    /* darker back limbs = readable depth */
  const n=parseInt(hex.slice(1),16);
  let r=(n>>16)&255,g2=(n>>8)&255,b=n&255;
  r=Math.round(r*(1+f)); g2=Math.round(g2*(1+f)); b=Math.round(b*(1+f));
  const cl2=v=>v<0?0:v>255?255:v;
  return '#'+((1<<24)+(cl2(r)<<16)+(cl2(g2)<<8)+cl2(b)).toString(16).slice(1);
}
let AN=[];                       /* per-scene animators: f(p, t) */
function an(f){AN.push(f)}
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const eio=t=>t<0?0:t>1?1:(t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2);
const back=t=>{t=cl(t,0,1);const c=1.70158+1;return 1+c*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2)};

/* ---- entrances. everything arrives, nothing is just suddenly there. ----
   Animations ALWAYS drive a fresh wrapper: a CSS transform silently overrides
   the SVG transform attribute that positions the object, which teleports it. */
function wrap(el){
  const w=document.createElementNS(NS,'g');
  el.parentNode.insertBefore(w,el); w.appendChild(el); return w;
}
function pop(el,t0,d){
  d=d||.5; const w=wrap(el);
  w.style.transformBox='fill-box'; w.style.transformOrigin='center';
  an(p=>{const u=back((p-t0)/d);
    w.style.opacity=cl((p-t0)/(d*.4),0,1); w.style.transform='scale('+u.toFixed(4)+')';});
  return el;
}
function fadeIn(el,t0,d){ d=d||.5;
  an(p=>el.style.opacity=cl((p-t0)/d,0,1)); return el; }
function riseIn(el,t0,d,dist){ d=d||.6; dist=dist==null?54:dist; const w=wrap(el);
  an(p=>{const u=ease((p-t0)/d); w.style.opacity=u;
    w.setAttribute('transform','translate(0 '+((1-u)*dist).toFixed(1)+')');}); return el; }
function drawOn(el,t0,d){ d=d||.8; el.setAttribute('pathLength','100');
  el.setAttribute('stroke-dasharray','100');
  an(p=>el.setAttribute('stroke-dashoffset',(100*(1-ease((p-t0)/d))).toFixed(2))); return el; }
function spin(el,cx,cy,sp){ const w=wrap(el);
  an((p,t)=>w.setAttribute('transform',`rotate(${(t*sp*57.3).toFixed(2)} ${cx} ${cy})`)); return el; }
function bob(el,amp,sp,ph){ ph=ph||rnd()*TAU; const w=wrap(el);
  an((p,t)=>w.setAttribute('transform','translate(0 '+(Math.sin(t*sp+ph)*amp).toFixed(2)+')')); return el; }
function slideBy(el,f){ const w=wrap(el); an((p,t)=>w.setAttribute('transform',f(p,t))); return el; }
function pulse(el,lo,hi,sp){ const ph=rnd()*TAU;
  an((p,t)=>el.setAttribute('opacity',(lo+(hi-lo)*(.5+.5*Math.sin(t*sp+ph))).toFixed(3))); return el; }

/* ---- shape primitives ---- */
const C=(g,x,y,r,f,o)=>E(g,'circle',{cx:x,cy:y,r:r,fill:f,opacity:o==null?1:o});
const R=(g,x,y,w,h,rx,f,o)=>E(g,'rect',{x:x,y:y,width:w,height:h,rx:rx||0,fill:f,opacity:o==null?1:o});
const PATH=(g,d,f,o)=>E(g,'path',{d:d,fill:f,opacity:o==null?1:o});
const STROKE=(g,d,c,w,o)=>E(g,'path',{d:d,fill:'none',stroke:c,'stroke-width':w,
  'stroke-linecap':'round','stroke-linejoin':'round',opacity:o==null?1:o});
/* a capsule hanging from its own origin - the unit every limb is made of */
function capsule(g,w,len,f){ return R(g,-w/2,-w/2,w,len+w,w/2,f); }
function glowAt(g,x,y,r,c,o){
  const id='rg'+(glowAt.n=(glowAt.n||0)+1);
  const d=E(document.getElementById('defs'),'radialGradient',{id:id});
  E(d,'stop',{offset:'0%','stop-color':c,'stop-opacity':(o==null?.5:o)});
  E(d,'stop',{offset:'100%','stop-color':c,'stop-opacity':'0'});
  return C(g,x,y,r,'url(#'+id+')');
}

/* ==========================================================================
   PEOPLE - built from joints, so they read at any size and never break
   ========================================================================== */
function person(g,o){
  const x=o.x, y=o.y, h=o.h, c=o.c||'#7E9AC0', c2=o.c2||shade(c,-0.26);
  const k=G(g,`translate(${x} ${y})`);
  const hr=h*.105, shY=-h*.745, hipY=-h*.435;
  const armL=h*.30, armW=h*.058, legL=h*.435, legW=h*.076;
  /* back limbs first so the body overlaps them - proper depth */
  const aB=G(k,`translate(${ h*.10} ${shY})`), lB=G(k,`translate(${ h*.052} ${hipY})`);
  capsule(aB,armW,armL,c2); capsule(lB,legW,legL,c2);
  /* torso: a tapered rounded body, not a rectangle */
  PATH(k,`M${-h*.125} ${shY+h*.03}Q${-h*.135} ${hipY-h*.02} ${-h*.098} ${hipY+h*.02}`+
        `L${ h*.098} ${hipY+h*.02}Q${ h*.135} ${hipY-h*.02} ${ h*.125} ${shY+h*.03}`+
        `Q${0} ${shY-h*.055} ${-h*.125} ${shY+h*.03}Z`, c);
  C(k,0,shY-h*.075,hr*.42,c);                          /* neck */
  C(k,0,-h*.885,hr,c);                                  /* head */
  const aF=G(k,`translate(${-h*.10} ${shY})`), lF=G(k,`translate(${-h*.052} ${hipY})`);
  capsule(aF,armW,armL,c); capsule(lF,legW,legL,c);
  const ph=o.phase==null?rnd()*TAU:o.phase;
  const walk=o.walk!==false, sp=walk?(o.sp||3.0):1.0, amp=walk?1:.14;
  if(o.frozen){ aF.setAttribute('transform',`translate(${-h*.10} ${shY}) rotate(9)`);
                lF.setAttribute('transform',`translate(${-h*.052} ${hipY}) rotate(-7)`);
                lB.setAttribute('transform',`translate(${ h*.052} ${hipY}) rotate(7)`); }
  else an((p,t)=>{ const w=t*sp+ph, s=Math.sin(w), s2=Math.sin(w+Math.PI);
    lF.setAttribute('transform',`translate(${-h*.052} ${hipY}) rotate(${(s*26*amp).toFixed(2)})`);
    lB.setAttribute('transform',`translate(${ h*.052} ${hipY}) rotate(${(s2*26*amp).toFixed(2)})`);
    aF.setAttribute('transform',`translate(${-h*.10} ${shY}) rotate(${(s2*20*amp).toFixed(2)})`);
    aB.setAttribute('transform',`translate(${ h*.10} ${shY}) rotate(${(s*20*amp).toFixed(2)})`);
    k.setAttribute('transform',`translate(${x} ${(y+Math.abs(Math.cos(w))*h*(walk?.016:.005)).toFixed(2)})`);});
  return {g:k, armF:aF, armB:aB, legF:lF, legB:lB};
}
function crowd(g,x0,x1,y,h,n,c,opts){
  opts=opts||{}; const out=[];
  for(let i=0;i<n;i++){ const t=n<2?.5:i/(n-1);
    out.push(person(g,{x:x0+(x1-x0)*t, y:y+ (opts.jitter?rr(-8,8):0), h:h*(opts.jitter?rr(.92,1.08):1),
      c:opts.c||c, c2:opts.c2, walk:opts.walk!==false,
      phase:opts.sync?0:(opts.phase!=null?opts.phase:i*1.1),
      frozen:opts.frozen&&i!==opts.hot, sp:opts.sp}));}
  return out;
}

/* ==========================================================================
   OBJECT LIBRARY - the things this episode is about
   ========================================================================== */
function bin(g,x,y,s,c,open){
  const k=G(g,`translate(${x} ${y})`), w=s, h=s*1.15;
  PATH(k,`M${-w*.42} 0L${w*.42} 0L${w*.34} ${h}Q0 ${h*1.08} ${-w*.34} ${h}Z`,c);
  for(let i=-2;i<=2;i++)R(k,i*w*.14-w*.018,h*.14,w*.036,h*.72,w*.018,'#0E1626',.22);
  const lid=G(k,`translate(0 ${-h*.02})`);
  R(lid,-w*.50,-h*.13,w,h*.13,h*.06,c);
  R(lid,-w*.10,-h*.20,w*.20,h*.08,h*.04,c);
  if(open)lid.setAttribute('transform',`translate(${-w*.30} ${-h*.10}) rotate(-24)`);
  return {g:k,lid:lid};
}
function bag(g,x,y,s,c){ const k=G(g,`translate(${x} ${y})`);
  PATH(k,`M${-s*.34} ${-s*.30}Q${-s*.50} ${s*.42} ${-s*.30} ${s*.50}L${s*.30} ${s*.50}`+
        `Q${s*.50} ${s*.42} ${s*.34} ${-s*.30}Q${s*.10} ${-s*.46} 0 ${-s*.30}Q${-s*.10} ${-s*.46} ${-s*.34} ${-s*.30}Z`,c);
  return k; }
function bottle(g,x,y,s,c){ const k=G(g,`translate(${x} ${y})`);
  R(k,-s*.11,-s*.62,s*.22,s*.20,s*.05,c);
  PATH(k,`M${-s*.11} ${-s*.44}Q${-s*.26} ${-s*.30} ${-s*.26} ${-s*.06}L${-s*.26} ${s*.44}`+
        `Q${-s*.26} ${s*.56} ${-s*.14} ${s*.56}L${s*.14} ${s*.56}Q${s*.26} ${s*.56} ${s*.26} ${s*.44}`+
        `L${s*.26} ${-s*.06}Q${s*.26} ${-s*.30} ${s*.11} ${-s*.44}Z`,c);
  R(k,-s*.13,-s*.66,s*.26,s*.10,s*.03,'#0E1626',.35); return k; }
function canObj(g,x,y,s,c){ const k=G(g,`translate(${x} ${y})`);
  R(k,-s*.20,-s*.40,s*.40,s*.80,s*.07,c);
  E(k,'ellipse',{cx:0,cy:-s*.40,rx:s*.20,ry:s*.06,fill:'#0E1626',opacity:.30}); return k; }
function boxObj(g,x,y,s,c){ const k=G(g,`translate(${x} ${y})`);
  R(k,-s*.36,-s*.30,s*.72,s*.62,s*.04,c);
  R(k,-s*.36,-s*.30,s*.72,s*.10,s*.03,'#0E1626',.22);
  R(k,-s*.03,-s*.30,s*.06,s*.62,0,'#0E1626',.20); return k; }
function wrapper(g,x,y,s,c){ const k=G(g,`translate(${x} ${y})`);
  PATH(k,`M${-s*.44} ${-s*.14}L${-s*.24} ${-s*.24}L${s*.24} ${-s*.20}L${s*.44} ${-s*.12}`+
        `L${s*.30} ${s*.06}L${s*.42} ${s*.20}L${-s*.28} ${s*.22}L${-s*.40} ${s*.04}Z`,c); return k; }
function truck(g,x,y,s,c,c2){ const k=G(g,`translate(${x} ${y})`);
  R(k,-s*.62,-s*.44,s*.86,s*.56,s*.05,c);
  PATH(k,`M${s*.24} ${-s*.30}L${s*.52} ${-s*.30}L${s*.66} ${-s*.02}L${s*.66} ${s*.12}L${s*.24} ${s*.12}Z`,c2||c);
  R(k,s*.28,-s*.24,s*.20,s*.16,s*.03,'#0E1626',.4);
  C(k,-s*.34,s*.16,s*.13,'#1B2637'); C(k,-s*.34,s*.16,s*.06,'#0E1626');
  C(k,s*.44,s*.16,s*.13,'#1B2637');  C(k,s*.44,s*.16,s*.06,'#0E1626');
  return k; }
function factory(g,x,y,s,c){ const k=G(g,`translate(${x} ${y})`);
  R(k,-s*.60,-s*.20,s*1.20,s*.62,s*.03,c);
  for(let i=0;i<3;i++)PATH(k,`M${-s*.60+i*s*.40} ${-s*.20}L${-s*.60+i*s*.40} ${-s*.44}L${-s*.32+i*s*.40} ${-s*.20}Z`,c);
  R(k,s*.24,-s*.86,s*.20,s*.68,s*.03,c);
  return k; }
function house(g,x,y,s,c){ const k=G(g,`translate(${x} ${y})`);
  R(k,-s*.34,-s*.20,s*.68,s*.52,s*.03,c);
  PATH(k,`M${-s*.44} ${-s*.20}L0 ${-s*.56}L${s*.44} ${-s*.20}Z`,c); return k; }
function ship(g,x,y,s,c,c2){ const k=G(g,`translate(${x} ${y})`);
  PATH(k,`M${-s*.70} 0L${s*.70} 0L${s*.54} ${s*.24}L${-s*.54} ${s*.24}Z`,c);
  for(let i=0;i<5;i++)R(k,-s*.52+i*s*.22,-s*.22,s*.18,s*.22,s*.02,c2||c);
  for(let i=0;i<3;i++)R(k,-s*.40+i*s*.22,-s*.40,s*.18,s*.18,s*.02,c2||c);
  return k; }
function earthObj(g,x,y,r,c,c2){ const k=G(g,`translate(${x} ${y})`);
  C(k,0,0,r,c);
  PATH(k,`M${-r*.55} ${-r*.30}q${r*.25} ${-r*.22} ${r*.50} ${-r*.02}q${r*.20} ${r*.18} ${-r*.05} ${r*.30}q${-r*.30} ${r*.12} ${-r*.45} ${-r*.28}Z`,c2);
  PATH(k,`M${ r*.05} ${ r*.22}q${r*.28} ${-r*.16} ${r*.46} ${ r*.06}q${-r*.10} ${r*.30} ${-r*.42} ${r*.26}q${-r*.18} ${-r*.16} ${-r*.04} ${-r*.32}Z`,c2);
  PATH(k,`M${-r*.66} ${ r*.28}q${r*.22} ${-r*.10} ${r*.30} ${ r*.14}q${-r*.14} ${r*.20} ${-r*.34} ${r*.10}Z`,c2);
  return k; }
function fish(g,x,y,s,c){ const k=G(g,`translate(${x} ${y})`);
  E(k,'ellipse',{cx:0,cy:0,rx:s*.42,ry:s*.24,fill:c});
  PATH(k,`M${-s*.38} 0L${-s*.66} ${-s*.22}L${-s*.62} 0L${-s*.66} ${s*.22}Z`,c);
  C(k,s*.22,-s*.05,s*.05,'#0E1626'); return k; }
function cloudObj(g,x,y,s,c,o){ const k=G(g,`translate(${x} ${y})`);
  C(k,-s*.28,0,s*.26,c,o); C(k,0,-s*.10,s*.34,c,o); C(k,s*.30,0,s*.24,c,o);
  R(k,-s*.30,-s*.02,s*.62,s*.26,s*.13,c,o); return k; }
/* the recycling loop - the single most important object in this episode */
function recycleLoop(g,x,y,r,c,broken){
  const k=G(g,`translate(${x} ${y})`), arms=[];
  for(let i=0;i<3;i++){
    const a=G(k,`rotate(${i*120})`);
    const d=`M${-r*.42} ${-r*.62}L${r*.20} ${-r*.62}L${r*.20} ${-r*.86}L${r*.62} ${-r*.44}`+
            `L${r*.20} ${-r*.02}L${r*.20} ${-r*.26}L${-r*.42} ${-r*.26}Z`;
    const p=PATH(a,d,c);
    if(broken&&i===2){p.setAttribute('opacity','.18');}
    arms.push(p);
  }
  return {g:k,arms:arms};
}
/* ==========================================================================
   DATA - charts and counters, composited like titles
   ========================================================================== */
function bars(g,x,y,w,h,vals,cols,t0){
  const bw=w/vals.length;
  E(g,'line',{x1:x,y1:y,x2:x+w,y2:y,stroke:'#31435C','stroke-width':5});
  vals.forEach((v,i)=>{
    const b=R(g,x+i*bw+bw*.16,y,bw*.68,1,10,cols[i%cols.length]);
    an(p=>{const u=eio(((p-(t0||.1)-i*.06))/.55), hh=Math.max(2,h*v*u);
      b.setAttribute('height',hh.toFixed(1)); b.setAttribute('y',(y-hh).toFixed(1));});
  });
}
function donut(g,x,y,r,segs,t0){
  let a0=-Math.PI/2;
  segs.forEach((s,i)=>{
    const a1=a0+s.v*TAU, r2=r*.58, A0=a0, A1=a1;
    const p=E(g,'path',{fill:s.c});
    an(pr=>{const u=eio((pr-(t0||.12)-i*.07)/.6), e=A0+(A1-A0)*u;
      const lg=(e-A0)>Math.PI?1:0;
      p.setAttribute('d',`M${x+Math.cos(A0)*r} ${y+Math.sin(A0)*r}`+
        `A${r} ${r} 0 ${lg} 1 ${x+Math.cos(e)*r} ${y+Math.sin(e)*r}`+
        `L${x+Math.cos(e)*r2} ${y+Math.sin(e)*r2}`+
        `A${r2} ${r2} 0 ${lg} 0 ${x+Math.cos(A0)*r2} ${y+Math.sin(A0)*r2}Z`);});
    a0=a1;
  });
}
function curve(g,x,y,w,h,pts,c,t0){
  let d='';
  pts.forEach((v,i)=>{d+=(i?'L':'M')+(x+w*i/(pts.length-1)).toFixed(1)+' '+(y-h*v).toFixed(1);});
  E(g,'line',{x1:x,y1:y,x2:x+w,y2:y,stroke:'#31435C','stroke-width':5});
  const fillP=E(g,'path',{d:d+`L${x+w} ${y}L${x} ${y}Z`,fill:c,opacity:.16});
  fadeIn(fillP,(t0||.15)+.3,.5);
  drawOn(STROKE(g,d,c,11),t0||.15,.9);
}
