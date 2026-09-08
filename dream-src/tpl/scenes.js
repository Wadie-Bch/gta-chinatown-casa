/* ============================================================================
   SCENES - each one composed inside the fixed 1920x1080 frame.
   Nothing slides in from a neighbouring picture; things arrive and act.
   ========================================================================== */
const W=1920, H=1080, CX=960, GY=840;      /* ground line */
const S={};
const P=PAL;
function ground(g,c){ R(g,0,GY,W,H-GY,0,c||'#0B1220',.55);
  E(g,'line',{x1:0,y1:GY,x2:W,y2:GY,stroke:'#31435C','stroke-width':5,opacity:.6}); }
function tag(g,x,y,s,c){ const t=E(g,'text',{x:x,y:y,'text-anchor':'middle','class':'lbl'});
  t.textContent=s; t.style.fontSize='34px'; t.style.fill=c||P.dim; return t; }

/* ---------------- ACT 1 ---------------- */
S.title_bin=(g,A)=>{ glowAt(g,CX,700,520,A,.30);
  const b=bin(g,CX,560,300,A,false); pop(b.g,.05,.7);
  bob(b.lid,7,1.6);
  const objs=[];
  for(let i=0;i<7;i++){ const k=G(g,null), x=CX+rr(-560,560);
    if(i%4===0)bottle(k,x,0,120,P.sky); else if(i%4===1)canObj(k,x,0,120,P.red);
    else if(i%4===2)wrapper(k,x,0,150,P.yellow); else bag(k,x,0,140,P.mint);
    objs.push({k:k,ph:rnd()});}
  an((p,t)=>objs.forEach((o,i)=>{const u=(o.ph+t*.16)%1;
    o.k.setAttribute('transform',`translate(0 ${(120+u*640).toFixed(0)}) rotate(${(t*22+i*50).toFixed(0)} ${CX} 0)`);
    o.k.style.opacity=Math.sin(u*Math.PI)*.5;}));
  ground(g); };
S.drop_in=(g,A)=>{ ground(g);
  const b=bin(g,1280,600,340,A,true); pop(b.g,.02,.5);
  const pr=person(g,{x:520,y:GY,h:400,c:'#6C89B4',walk:false});
  pop(pr.g,.08,.5);
  const items=[[P.sky,'bottle'],[P.yellow,'wrapper'],[P.red,'can'],[P.mint,'bag']];
  items.forEach((it,i)=>{ const k=G(g,null);
    if(it[1]==='bottle')bottle(k,0,0,120,it[0]); else if(it[1]==='wrapper')wrapper(k,0,0,150,it[0]);
    else if(it[1]==='can')canObj(k,0,0,120,it[0]); else bag(k,0,0,140,it[0]);
    an(p=>{ const t0=.10+i*.20, u=cl((p-t0)/.34,0,1), e=eio(u);
      const x=640+(1280-640)*e, y=GY-260-Math.sin(e*Math.PI)*280;
      k.setAttribute('transform',`translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(e*260).toFixed(0)})`);
      k.style.opacity=u<=0?0:(u>=1?0:1); });});
};
S.reveal_behind=(g,A)=>{ ground(g);
  const b=bin(g,420,620,280,A,false); pop(b.g,.02,.5);
  const pile=G(g,null);
  for(let i=0;i<46;i++){ const x=rr(760,1860), y=GY-rr(0,300), s=rr(70,150);
    const c=[P.sky,P.yellow,P.red,P.mint,P.orange,P.violet][i%6];
    if(i%5===0)bottle(pile,x,y,s,c); else if(i%5===1)canObj(pile,x,y,s,c);
    else if(i%5===2)wrapper(pile,x,y,s,c); else if(i%5===3)bag(pile,x,y,s,c); else boxObj(pile,x,y,s,c);}
  an(p=>pile.style.opacity=cl((p-.30)/.45,0,1));
};
S.earth_orbit_trash=(g,A)=>{ glowAt(g,CX,540,560,A,.24);
  const e=earthObj(g,CX,540,250,P.blue,P.mint); pop(e,.05,.8);
  const ring=G(g,null);
  for(let i=0;i<26;i++){ const a=i/26*TAU, k=G(ring,null), s=rr(60,110);
    const c=[P.sky,P.yellow,P.red,P.mint,P.orange][i%5];
    if(i%4===0)bottle(k,0,0,s,c); else if(i%4===1)canObj(k,0,0,s,c);
    else if(i%4===2)wrapper(k,0,0,s,c); else bag(k,0,0,s,c);
    an((p,t)=>{const ang=a+t*.32, rr2=400+Math.sin(ang*3)*26;
      k.setAttribute('transform',`translate(${(CX+Math.cos(ang)*rr2).toFixed(1)} ${(540+Math.sin(ang)*rr2*.42).toFixed(1)}) rotate(${(t*40+i*30).toFixed(0)})`);});}
  fadeIn(ring,.3,.7);
};
/* ---------------- ACT 2 ---------------- */
S.ruler=(g,A)=>{ ground(g);
  const pr=person(g,{x:420,y:GY,h:400,c:'#6C89B4',walk:false}); pop(pr.g,.04,.5);
  const b=bin(g,1420,620,280,A,false); pop(b.g,.10,.5);
  const ln=STROKE(g,`M520 660L1300 660`,A,9); drawOn(ln,.24,.7);
  for(const x of[520,1300])drawOn(STROKE(g,`M${x} 610L${x} 710`,A,9),.34,.3);
  fadeIn(tag(g,910,620,'"AWAY"',A),.5,.4);
};
S.conveyor_out=(g,A)=>{ ground(g,'#0A1018');
  R(g,0,700,W,64,20,'#1B2637'); 
  const objs=[];
  for(let i=0;i<9;i++){ const k=G(g,null), c=[P.sky,P.yellow,P.red,P.mint,P.orange][i%5];
    if(i%3===0)bottle(k,0,0,130,c); else if(i%3===1)canObj(k,0,0,130,c); else boxObj(k,0,0,150,c);
    objs.push({k:k,off:i/9});}
  an((p,t)=>objs.forEach(o=>{ const u=(o.off+t*.20)%1;
    o.k.setAttribute('transform',`translate(${(-100+u*2200).toFixed(0)} 630)`);
    o.k.style.opacity=cl(Math.min(u,1-u)*7,0,1);}));
  const pr=person(g,{x:250,y:700,h:320,c:'#6C89B4',walk:false}); pop(pr.g,.05,.5);
  const rl=G(g,null); for(let i=0;i<12;i++)C(rl,60+i*170,782,26,'#243244');
  an((p,t)=>rl.setAttribute('transform',`translate(${((t*60)%170).toFixed(0)} 0)`));
};
S.four_metres=(g,A)=>{ ground(g);
  const pr=person(g,{x:560,y:GY,h:380,c:'#6C89B4',walk:false}); pop(pr.g,.04,.5);
  const b=bin(g,1160,640,260,A,false); pop(b.g,.10,.5);
  const ln=STROKE(g,'M620 720L1080 720',A,8); drawOn(ln,.3,.5);
  const box=G(g,null); R(box,470,300,980,150,18,'#101A2C',.85);
  fadeIn(box,.4,.4);
};
S.handoff=(g,A)=>{ ground(g);
  const a=person(g,{x:420,y:GY,h:380,c:'#6C89B4',walk:false}); pop(a.g,.03,.45);
  const b=person(g,{x:1500,y:GY,h:380,c:'#7E9AC0',walk:false}); pop(b.g,.10,.45);
  const bg1=G(g,null); bag(bg1,0,0,190,P.orange);
  an(p=>{const u=eio(cl((p-.24)/.44,0,1));
    bg1.setAttribute('transform',`translate(${(520+960*u).toFixed(0)} ${(GY-300-Math.sin(u*Math.PI)*160).toFixed(0)}) rotate(${(u*300).toFixed(0)})`);});
  for(let i=0;i<3;i++){const c=person(g,{x:1660+i*130,y:GY,h:360,c:'#7E9AC0',walk:false});
    an(p=>c.g.style.opacity=cl((p-.55)/.3,0,1)*.8);}
};
/* ---------------- ACT 3 ---------------- */
S.machine_build=(g,A)=>{ ground(g);
  const nodes=[[300,P.sky,'house'],[720,A,'truck'],[1160,P.violet,'factory'],[1600,P.red,'bin']];
  nodes.forEach((n,i)=>{ const k=G(g,null);
    if(n[2]==='house')house(k,n[0],GY-110,300,n[1]);
    else if(n[2]==='truck')truck(k,n[0],GY-110,320,n[1],'#6C89B4');
    else if(n[2]==='factory')factory(k,n[0],GY-110,300,n[1]);
    else bin(k,n[0],GY-300,220,n[1],false);
    pop(k,.05+i*.16,.5);
    if(i<3)drawOn(STROKE(g,`M${n[0]+170} ${GY-140}L${nodes[i+1][0]-170} ${GY-140}`,'#5E7BA6',7),.14+i*.16,.3);});
};
S.flow_chain=(g,A)=>{ ground(g);
  const tr=truck(g,420,GY-120,380,A,'#6C89B4'); pop(tr,.03,.5);
  slideBy(tr,(p,t)=>`translate(${(Math.sin(t*.8)*22).toFixed(1)} 0)`);
  const f=factory(g,1080,GY-120,340,P.violet); pop(f,.16,.5);
  const sh=ship(g,1620,GY-120,340,P.blue,'#6C89B4'); pop(sh,.30,.5);
  const sm=G(g,null); for(let i=0;i<5;i++){const c=cloudObj(sm,1080+rr(-40,40),GY-380-i*70,rr(70,110),'#3D5170',.5);}
  an((p,t)=>sm.setAttribute('transform',`translate(0 ${(-((t*30)%120)).toFixed(0)})`));
  fadeIn(sm,.4,.5);
};
S.tonnage=(g,A)=>{ glowAt(g,CX,560,520,A,.20); ground(g);
  const pile=G(g,null);
  for(let i=0;i<120;i++){ const x=rr(120,1800), y=GY-rr(0,420), s=rr(40,96);
    const c=[P.sky,P.yellow,P.red,P.mint,P.orange,P.violet][i%6];
    if(i%5===0)bottle(pile,x,y,s,c); else if(i%5===1)canObj(pile,x,y,s,c);
    else if(i%5===2)wrapper(pile,x,y,s,c); else if(i%5===3)bag(pile,x,y,s,c); else boxObj(pile,x,y,s,c);}
  an(p=>pile.style.opacity=cl(p/.6,0,1));
};
S.split_donut=(g,A)=>{
  donut(g,CX,600,300,[{v:.19,c:P.mint},{v:.31,c:P.orange},{v:.50,c:'#44597A'}],.10);
  const lg=G(g,null);
  [['recycled 19%',P.mint],['burned 31%',P.orange],['buried or lost 50%','#7C90AC']].forEach((l,i)=>{
    const x=340+i*470; C(lg,x,966,20,l[1]);
    const t=E(lg,'text',{x:x+38,y:980,'class':'lbl'}); t.textContent=l[0];
    t.style.fontSize='34px'; t.style.fill=P.ink;});
  fadeIn(lg,.55,.5);
};
S.loop_breaks=(g,A)=>{ glowAt(g,CX,580,420,A,.22);
  const l=recycleLoop(g,CX,580,300,A,true); pop(l.g,.04,.7);
  an((p,t)=>l.g.setAttribute('transform',`translate(${CX} 580) rotate(${(t*14).toFixed(1)})`));
  const brk=STROKE(g,'M1180 760L1380 900',P.red,13); drawOn(brk,.42,.35);
};
/* ---------------- ACT 4 ---------------- */
S.steelman_open=(g,A)=>{ ground(g);
  for(let i=0;i<6;i++)pop(house(g,220+i*300,GY-100,250,i%2?'#6C89B4':'#5B769C'),.03+i*.06,.45);
  const t=truck(g,CX,GY-110,340,A,'#6C89B4'); pop(t,.42,.5);
  slideBy(t,(p,t2)=>`translate(${(Math.sin(t2*.7)*30).toFixed(1)} 0)`);
};
S.old_city=(g,A)=>{ ground(g,'#160F0C');
  for(let i=0;i<7;i++)house(g,180+i*280,GY-90,240,'#5A4A38');
  const junk=G(g,null);
  for(let i=0;i<70;i++){const x=rr(60,1860),y=GY-rr(0,150),s=rr(40,90);
    const c=['#5A4632','#6B5138','#4A3A2A'][i%3];
    if(i%3===0)bag(junk,x,y,s,c); else if(i%3===1)boxObj(junk,x,y,s,c); else wrapper(junk,x,y,s,c);}
  an(p=>junk.style.opacity=cl(p/.5,0,1));
};
S.disease_curve=(g,A)=>{
  curve(g,300,900,1320,380,[.95,.88,.72,.50,.30,.16,.08,.04],P.red,.10);
  fadeIn(tag(g,CX,980,'deaths from waterborne disease',P.dim),.7,.4);
};
S.lives_bar=(g,A)=>{
  bars(g,300,900,1320,380,[.30,.45,.62,.88,1.0],[P.mint,P.mint,P.mint,P.mint,A],.10);
  fadeIn(tag(g,CX,980,'lives saved by municipal collection',P.dim),.7,.4);
};
S.city_runs=(g,A)=>{ ground(g);
  for(let i=0;i<7;i++)house(g,150+i*270,GY-100,240,'#6C89B4');
  const t=truck(g,-200,GY-110,320,A,'#6C89B4');
  slideBy(t,(p,t2)=>`translate(${(((t2*140)%2400)).toFixed(0)} 0)`);
  const sun=C(g,1620,240,120,P.yellow,.9); pulse(sun,.6,1,.8);
};
S.respect=(g,A)=>{ ground(g);
  crowd(g,260,1660,GY,360,7,'#6C89B4',{walk:false,jitter:true});
  const t=truck(g,CX,GY-110,360,A,'#6C89B4'); pop(t,.10,.6);
  glowAt(g,CX,GY-200,420,A,.22);
};
/* ---------------- ACT 5 ---------------- */
S.crack_open=(g,A)=>{ glowAt(g,CX,580,420,A,.20);
  const l=recycleLoop(g,CX,580,300,A,false); pop(l.g,.03,.6);
  an((p,t)=>l.g.setAttribute('transform',`translate(${CX} 580) rotate(${(t*20).toFixed(1)})`));
};
S.loop_fail=(g,A)=>{ glowAt(g,CX,560,420,P.red,.16);
  const l=recycleLoop(g,CX,560,290,A,false);
  an(p=>{ const u=cl((p-.30)/.4,0,1);
    l.arms[2].setAttribute('opacity',(1-u*.86).toFixed(3));
    l.g.setAttribute('transform',`translate(${CX} 560) rotate(${(u*-26).toFixed(1)})`);});
  const q=E(g,'text',{x:CX,y:960,'text-anchor':'middle','class':'lbl'});
  q.textContent='?'; q.style.fontSize='120px'; q.style.fill=P.red; fadeIn(q,.6,.4);
};
S.downcycle=(g,A)=>{ ground(g);
  const cols=[P.sky,'#6FA3C4','#5B7E97','#46606F','#33434C'];
  cols.forEach((c,i)=>{ const k=G(g,null); bottle(k,300+i*330,GY-200,260-i*34,c);
    pop(k,.06+i*.13,.45);
    if(i<4)drawOn(STROKE(g,`M${390+i*330} ${GY-200}L${470+i*330} ${GY-200}`,'#5E7BA6',7),.12+i*.13,.25);});
  fadeIn(tag(g,CX,980,'each pass, worse. then finished.',P.dim),.75,.4);
};
S.slide=(g,A)=>{
  const d='M240 380L1680 880';
  drawOn(STROKE(g,d,A,14),.06,.6);
  const objs=[];
  for(let i=0;i<7;i++){const k=G(g,null);bottle(k,0,0,120,[P.sky,P.mint,P.yellow][i%3]);objs.push({k:k,off:i/7});}
  an((p,t)=>objs.forEach(o=>{const u=(o.off+t*.22)%1;
    o.k.setAttribute('transform',`translate(${(240+1440*u).toFixed(0)} ${(340+500*u).toFixed(0)}) rotate(${(u*300).toFixed(0)})`);
    o.k.style.opacity=cl(Math.min(u,1-u)*6,0,1);}));
  ground(g);
};
S.symbol_lie=(g,A)=>{ glowAt(g,CX,560,380,A,.18);
  const l=recycleLoop(g,CX,560,230,'#4A5F7E',false); pop(l.g,.04,.5);
  const n=E(g,'text',{x:CX,y:600,'text-anchor':'middle','class':'lbl'});
  n.textContent='7'; n.style.fontSize='150px'; n.style.fill=P.ink; pop(n,.30,.5);
};
/* ---------------- ACT 6 ---------------- */
S.cost_open=(g,A)=>{ ground(g);
  const f=factory(g,420,GY-110,360,P.violet); pop(f,.04,.5);
  const b=bin(g,1520,600,280,A,false); pop(b.g,.14,.5);
  drawOn(STROKE(g,`M620 ${GY-200}L1360 ${GY-200}`,'#5E7BA6',8),.24,.5);
};
S.maker_free=(g,A)=>{ ground(g);
  const f=factory(g,CX,GY-110,420,P.violet); pop(f,.03,.6);
  const coins=G(g,null);
  for(let i=0;i<9;i++){const c=C(coins,CX-320+i*80,GY-520,34,P.yellow);}
  an(p=>coins.style.opacity=cl(1-(p-.34)/.34,0,1));
  const x=STROKE(g,`M${CX-90} ${GY-560}L${CX+90} ${GY-420}M${CX+90} ${GY-560}L${CX-90} ${GY-420}`,P.red,15);
  drawOn(x,.52,.35);
};
S.decisions=(g,A)=>{
  const labels=['material','layers','glue','colour','shape'];
  labels.forEach((l,i)=>{ const x=300+i*340, k=G(g,null);
    C(k,x,540,88,i<4?P.violet:A); pop(k,.05+i*.11,.45);
    fadeIn(tag(g,x,720,l,P.dim),.12+i*.11,.35);});
  fadeIn(tag(g,CX,940,'every one of these decides whether it can ever come back',P.ink),.72,.45);
};
S.cost_passes=(g,A)=>{ ground(g);
  const who=[['you',P.sky,360],['your city',A,860],['someone poorer',P.red,1420]];
  who.forEach((w,i)=>{ const pr=person(g,{x:w[2],y:GY,h:400-i*20,c:w[1],walk:false});
    pop(pr.g,.05+i*.16,.5); fadeIn(tag(g,w[2],GY+80,w[0],P.dim),.10+i*.16,.35);});
  const bg1=G(g,null); bag(bg1,0,0,180,P.orange);
  an(p=>{const u=eio(cl((p-.30)/.55,0,1));
    bg1.setAttribute('transform',`translate(${(360+1060*u).toFixed(0)} ${(GY-440-Math.sin(u*Math.PI*2)*70).toFixed(0)}) rotate(${(u*420).toFixed(0)})`);});
};
S.feedback_cut=(g,A)=>{
  const f=factory(g,420,660,320,P.violet); pop(f,.03,.5);
  const b=bin(g,1500,480,260,A,false); pop(b.g,.10,.5);
  const arc1=STROKE(g,'M600 600Q960 300 1400 480',P.mint,10); drawOn(arc1,.20,.4);
  const arc2=STROKE(g,'M1400 700Q960 940 600 760','#5E7BA6',10); drawOn(arc2,.34,.4);
  const x=STROKE(g,'M900 780L1060 900M1060 780L900 900',P.red,15); drawOn(x,.52,.3);
  ground(g);
};
/* ---------------- ACT 7 ---------------- */
S.scale_open=(g,A)=>{ glowAt(g,CX,560,500,A,.20);
  const pile=G(g,null);
  for(let i=0;i<150;i++){ const x=rr(60,1860), y=GY-rr(0,520), s=rr(36,90);
    const c=[P.sky,P.yellow,P.red,P.mint,P.orange,P.violet][i%6];
    if(i%5===0)bottle(pile,x,y,s,c); else if(i%5===1)canObj(pile,x,y,s,c);
    else if(i%5===2)wrapper(pile,x,y,s,c); else if(i%5===3)bag(pile,x,y,s,c); else boxObj(pile,x,y,s,c);}
  an(p=>pile.style.opacity=cl(p/.5,0,1));
  ground(g); };
S.plastic_curve=(g,A)=>{
  curve(g,280,900,1360,380,[.02,.05,.09,.15,.24,.40,.66,1.0],A,.08);
  fadeIn(tag(g,CX,990,'global plastic production',P.dim),.7,.4);
};
S.hiding=(g,A)=>{ ground(g);
  const pile=G(g,null);
  for(let i=0;i<60;i++){const x=rr(200,1720),y=GY-rr(0,220),s=rr(50,110);
    boxObj(pile,x,y,s,[P.sky,P.yellow,P.red][i%3]);}
  const rug=PATH(g,`M120 ${GY-40}Q960 ${GY-420} 1800 ${GY-40}L1800 ${GY}L120 ${GY}Z`,'#2A3A54');
  an(p=>{const u=eio(cl((p-.28)/.45,0,1));
    rug.setAttribute('transform',`translate(0 ${((1-u)*420).toFixed(0)})`);});
};
S.away_ladder=(g,A)=>{
  const steps=[['the edge of town',P.mint],['the sea',P.teal],['the air',P.sky],['the bloodstream',P.red]];
  steps.forEach((s,i)=>{ const y=300+i*180, k=G(g,null);
    R(k,420,y-46,1080,92,46,i===3?P.red:'#2C3E5E'); pop(k,.05+i*.16,.45);
    const t=tag(g,960,y+14,s[0],i===3?'#1A1020':P.ink); t.style.fontSize='46px'; fadeIn(t,.10+i*.16,.3);});
};
S.no_away=(g,A)=>{ glowAt(g,CX,540,540,P.red,.22);
  const e=earthObj(g,CX,540,260,P.blue,P.mint); pop(e,.04,.6);
  const ring=G(g,null);
  for(let i=0;i<30;i++){const a=i/30*TAU,k=G(ring,null),s=rr(50,100);
    bottle(k,0,0,s,[P.red,P.orange,P.yellow][i%3]);
    an((p,t)=>{const ang=a+t*.30;
      k.setAttribute('transform',`translate(${(CX+Math.cos(ang)*330).toFixed(1)} ${(540+Math.sin(ang)*330).toFixed(1)}) rotate(${(t*50).toFixed(0)})`);});}
  fadeIn(ring,.24,.5);
};
/* ---------------- ACT 8 ---------------- */
S.verdict_open=(g,A)=>{ glowAt(g,CX,620,420,A,.24);
  const b=bin(g,CX,480,340,A,false); pop(b.g,.04,.7); bob(b.lid,6,1.3);
  ground(g); };
S.bin_works=(g,A)=>{ ground(g);
  const b=bin(g,CX,520,320,A,true); pop(b.g,.03,.5);
  const tick=STROKE(g,`M${CX-110} 400L${CX-30} 480L${CX+130} 300`,P.mint,18); drawOn(tick,.34,.4);
};
S.two_questions=(g,A)=>{
  const q=[['where does this go?','#44597A',420],['who pays for what this becomes?',A,660]];
  q.forEach((s,i)=>{ const k=R(g,260,s[2]-70,1400,140,70,s[1]); pop(k,.06+i*.22,.5);
    const t=tag(g,960,s[2]+18,s[0],i?'#101A2C':P.ink); t.style.fontSize='54px'; fadeIn(t,.14+i*.22,.35);});
};
S.question_swap=(g,A)=>{ glowAt(g,CX,560,420,A,.2);
  const c=C(g,CX,560,260,A); pop(c,.05,.6);
  const t=E(g,'text',{x:CX,y:600,'text-anchor':'middle','class':'lbl'});
  t.textContent='?'; t.style.fontSize='260px'; t.style.fill='#101A2C'; pop(t,.20,.5);
};
S.years=(g,A)=>{
  bars(g,260,900,1400,380,[.18,.30,.44,.58,.74,.90,1.0],[A,A,A,A,A,A,P.red],.08);
  fadeIn(tag(g,CX,990,'1875 → today',P.dim),.72,.4);
};
/* ---------------- ACT 9 ---------------- */
S.v2_open=(g,A)=>{ glowAt(g,CX,560,460,A,.22);
  const l=recycleLoop(g,CX,560,290,A,false); pop(l.g,.04,.7);
  an((p,t)=>l.g.setAttribute('transform',`translate(${CX} 560) rotate(${(t*26).toFixed(1)})`));
};
S.rule1=(g,A)=>{ ground(g);
  const f=factory(g,480,GY-110,380,P.violet); pop(f,.03,.5);
  const b=bin(g,1460,600,280,A,false); pop(b.g,.12,.5);
  const arc=STROKE(g,`M700 ${GY-260}Q1080 300 1380 520`,A,10); drawOn(arc,.24,.5);
  const co=G(g,null); for(let i=0;i<5;i++)C(co,-40+i*46,0,26,P.yellow);
  an(p=>{const u=eio(cl((p-.34)/.45,0,1));
    co.setAttribute('transform',`translate(${(700+680*u).toFixed(0)} ${(GY-260-Math.sin(u*Math.PI)*300).toFixed(0)})`);
    co.style.opacity=cl(u*4,0,1)*cl((1-u)*4,0,1);});
};
S.rule2=(g,A)=>{
  const bad=G(g,null), good=G(g,null);
  [P.sky,P.orange,P.violet,P.mint].forEach((c,i)=>R(bad,520,380+i*90,880,72,14,c));
  pop(bad,.04,.5);
  R(good,520,380,880,342,20,A); pop(good,.42,.5);
  an(p=>{ bad.style.opacity=cl(1-(p-.40)/.22,0,1); });
  fadeIn(tag(g,CX,840,'four materials → one',P.dim),.62,.4);
};
S.rule3=(g,A)=>{
  const b=R(g,600,340,720,460,28,'#2C3E5E'); pop(b,.04,.5);
  const l=recycleLoop(g,960,470,110,'#59718F',false); fadeIn(l.g,.16,.4);
  const x=STROKE(g,'M880 390L1040 550M1040 390L880 550',P.red,13); drawOn(x,.30,.3);
  const n=E(g,'text',{x:960,y:730,'text-anchor':'middle','class':'lbl'});
  n.textContent='€0.42'; n.style.fontSize='110px'; n.style.fill=A; pop(n,.46,.5);
};
S.rule4=(g,A)=>{ ground(g);
  const ringd=E(g,'circle',{cx:CX,cy:560,r:400,fill:'none',stroke:A,'stroke-width':10,
    'stroke-dasharray':'26 26'}); pop(ringd,.05,.6);
  for(let i=0;i<5;i++)pop(house(g,700+i*130,700,180,'#6C89B4'),.14+i*.07,.4);
  const f=factory(g,CX,470,240,P.violet); pop(f,.42,.5);
  const b=bin(g,1180,430,170,P.mint,false); pop(b.g,.52,.5);
};
S.the_bill=(g,A)=>{
  const p1=R(g,660,300,600,520,20,'#EAF2FA'); pop(p1,.04,.5);
  for(let i=0;i<7;i++)R(g,720,380+i*54,480-(i%3)*90,20,10,'#8FA3BC',.9);
  const t=E(g,'text',{x:960,y:770,'text-anchor':'middle','class':'lbl'});
  t.textContent='€0.42'; t.style.fontSize='96px'; t.style.fill='#16232F'; pop(t,.34,.5);
};
S.loop_closes=(g,A)=>{ glowAt(g,CX,560,460,P.green,.26);
  const l=recycleLoop(g,CX,560,300,P.green,false); pop(l.g,.05,.7);
  an((p,t)=>l.g.setAttribute('transform',`translate(${CX} 560) rotate(${(t*40).toFixed(1)})`));
  const ring=E(g,'circle',{cx:CX,cy:560,r:400,fill:'none',stroke:P.green,'stroke-width':8,opacity:.4});
  an(p=>{const u=cl((p-.4)/.5,0,1); ring.setAttribute('r',(360+u*140).toFixed(0));
    ring.setAttribute('opacity',(.45*(1-u)).toFixed(3));});
};
S.outro=(g,A)=>{ glowAt(g,CX,540,560,P.green,.22);
  const e=earthObj(g,CX,540,270,P.blue,P.mint); pop(e,.04,.7);
  const ring=E(g,'circle',{cx:CX,cy:540,r:360,fill:'none',stroke:P.green,'stroke-width':10});
  drawOn(ring,.24,.8);
};
S.signoff=(g,A)=>{ glowAt(g,CX,540,560,A,.28);
  const c=C(g,CX,540,210,A); pop(c,.05,.7);
  const t=E(g,'text',{x:CX,y:565,'text-anchor':'middle','class':'big'});
  t.textContent='DREAM'; t.style.fontSize='96px'; t.style.fill='#0E1626'; pop(t,.28,.6);
};
