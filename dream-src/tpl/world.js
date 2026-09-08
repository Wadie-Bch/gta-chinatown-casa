/* ============================================================================
   THE CITY - one continuous 3D world. No cuts, no flashes, no strobe.
   Everything instanced so software rendering can still carry it.
   ========================================================================== */
const N=13;                       /* junctions per side */
const PITCH=84, ROAD=20, BLOCK=PITCH-ROAD;
const SPAN=(N-1)*PITCH, HALF=SPAN/2;
const gx=i=>i*PITCH-HALF;         /* grid index -> world coord */

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(46,16/9,1,2600);
const __RENDER=/[?&]render/.test(location.search);
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gl'),
  antialias:!__RENDER, preserveDrawingBuffer:__RENDER, powerPreference:'high-performance'});
renderer.setPixelRatio(1);
scene.fog=new THREE.Fog(0x0a0f1a,180,1500);
const FOGFAR=__RENDER?1050:1400;

/* ---- lights: soft, directional, never blinking ---- */
const hemi=new THREE.HemisphereLight(0x8fb4e8,0x0a0f18,0.55); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffe4c0,0.55); sun.position.set(-400,520,260); scene.add(sun);
const amb=new THREE.AmbientLight(0x30425e,0.55); scene.add(amb);

/* ---- deterministic noise ---- */
let _r=1337; const rnd=()=>{_r^=_r<<13;_r^=_r>>>17;_r^=_r<<5;return((_r>>>0)/4294967296)};
const rr=(a,b)=>a+(b-a)*rnd();

/* ---- ground: the whole road grid painted once into a texture ---- */
function roadTexture(){
  const S=2048, c=document.createElement('canvas'); c.width=c.height=S;
  const x=c.getContext('2d'), k=S/(SPAN+PITCH), off=(HALF+PITCH/2);
  const W=(v)=>(v+off)*k;
  x.fillStyle='#141a22'; x.fillRect(0,0,S,S);                      /* block interiors */
  for(let i=0;i<N;i++){                                            /* asphalt */
    x.fillStyle='#23282f';
    x.fillRect(0,W(gx(i)-ROAD/2),S,ROAD*k);
    x.fillRect(W(gx(i)-ROAD/2),0,ROAD*k,S);
  }
  for(let i=0;i<N;i++){                                            /* centre dashes */
    x.strokeStyle='#5c6470'; x.lineWidth=Math.max(1,0.9*k); x.setLineDash([7*k,9*k]);
    x.beginPath(); x.moveTo(0,W(gx(i))); x.lineTo(S,W(gx(i))); x.stroke();
    x.beginPath(); x.moveTo(W(gx(i)),0); x.lineTo(W(gx(i)),S); x.stroke();
  }
  x.setLineDash([]);
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){                         /* crossings + stop bars */
    const cx=gx(i), cy=gx(j);
    x.fillStyle='#39414b';
    x.fillRect(W(cx-ROAD/2),W(cy-ROAD/2),ROAD*k,ROAD*k);
    x.fillStyle='#aeb8c4';
    for(let b=0;b<5;b++){
      x.fillRect(W(cx-ROAD/2+1.4+b*3.6),W(cy+ROAD/2+1.2),2.0*k,5.0*k);
      x.fillRect(W(cx-ROAD/2+1.4+b*3.6),W(cy-ROAD/2-6.2),2.0*k,5.0*k);
      x.fillRect(W(cx+ROAD/2+1.2),W(cy-ROAD/2+1.4+b*3.6),5.0*k,2.0*k);
      x.fillRect(W(cx-ROAD/2-6.2),W(cy-ROAD/2+1.4+b*3.6),5.0*k,2.0*k);
    }
  }
  const t=new THREE.CanvasTexture(c);
  t.anisotropy=4; t.minFilter=THREE.LinearMipMapLinearFilter; return t;
}
const groundMat=new THREE.MeshLambertMaterial({map:roadTexture()});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(SPAN+PITCH,SPAN+PITCH),groundMat);
ground.rotation.x=-Math.PI/2; scene.add(ground);

/* ---- windows, drawn once, worn by every building ---- */
function windowTexture(){
  const c=document.createElement('canvas'); c.width=64; c.height=128;
  const x=c.getContext('2d');
  x.fillStyle='#000'; x.fillRect(0,0,64,128);
  for(let j=0;j<16;j++)for(let i=0;i<8;i++){
    if(rnd()<0.34) continue;
    x.fillStyle=rnd()<0.5?'#ffd9a0':'#cfe4ff';
    x.globalAlpha=rr(.45,1); x.fillRect(i*8+2,j*8+2,4,5);
  }
  x.globalAlpha=1;
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
const winTex=windowTexture();

/* ---- buildings ---- */
const bGeo=new THREE.BoxGeometry(1,1,1);
const bMat=new THREE.MeshLambertMaterial({color:0xffffff,map:winTex,emissive:0xffb870,
  emissiveMap:winTex,emissiveIntensity:0.9});
const BN=(N-1)*(N-1)*3;
const bMesh=new THREE.InstancedMesh(bGeo,bMat,BN);
const BH=[];
(function(){
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), sc=new THREE.Vector3(), pos=new THREE.Vector3();
  const col=new THREE.Color(); let n=0;
  for(let i=0;i<N-1;i++)for(let j=0;j<N-1;j++){
    const bx=gx(i)+PITCH/2, bz=gx(j)+PITCH/2;
    const edge=Math.max(Math.abs(bx),Math.abs(bz))/HALF;
    for(let k=0;k<3;k++){
      const w=rr(BLOCK*.28,BLOCK*.44), d=rr(BLOCK*.28,BLOCK*.44);
      const h=Math.max(9, (1-edge)*rr(26,120)*rr(.5,1.25)+rr(6,20));
      pos.set(bx+rr(-BLOCK*.26,BLOCK*.26), h/2, bz+rr(-BLOCK*.26,BLOCK*.26));
      sc.set(w,h,d); m.compose(pos,q,sc); bMesh.setMatrixAt(n,m);
      const g=rr(.16,.30); col.setRGB(g*.9,g*.95,g*1.15); bMesh.setColorAt(n,col);
      BH.push({x:pos.x,z:pos.z,h:h}); n++;
    }
  }
})();
bMesh.instanceMatrix.needsUpdate=true; scene.add(bMesh);

/* ---- traffic signals: two heads per junction, smooth cross-fade, never a blink ---- */
const JN=N*N, POLE_N=JN*2, LAMP_N=POLE_N*3;
const poleMesh=new THREE.InstancedMesh(new THREE.CylinderGeometry(.45,.45,12,6),
  new THREE.MeshLambertMaterial({color:0x2b3038}),POLE_N);
const headMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(3.0,9.0,2.2),
  new THREE.MeshLambertMaterial({color:0x171b21}),POLE_N);
const lampMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(1.15,10,8),
  new THREE.MeshBasicMaterial({color:0xffffff}),LAMP_N);
/* a soft additive halo so a lit lamp reads from down the street - it glows, it never blinks */
const haloMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(__RENDER?2.9:3.4,6,5),
  new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5,
    blending:THREE.AdditiveBlending,depthWrite:false}),LAMP_N);
const JUNC=[];
(function(){
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), s1=new THREE.Vector3(1,1,1);
  const p=new THREE.Vector3(); let n=0;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
    const cx=gx(i), cz=gx(j);
    JUNC.push({x:cx,z:cz,off:rnd()});
    for(let a=0;a<2;a++){
      const sx=a?1:-1;
      p.set(cx+sx*(ROAD/2+1.6),6,cz+(a?-1:1)*(ROAD/2+1.6));
      m.compose(p,q,s1); poleMesh.setMatrixAt(n,m);
      p.y=15.0; m.compose(p,q,s1); headMesh.setMatrixAt(n,m);
      for(let k=0;k<3;k++){
        p.y=18.0-k*3.0; m.compose(p,q,s1);
        lampMesh.setMatrixAt(n*3+k,m); haloMesh.setMatrixAt(n*3+k,m);
      }
      n++;
    }
  }
})();
poleMesh.instanceMatrix.needsUpdate=true; headMesh.instanceMatrix.needsUpdate=true;
lampMesh.instanceMatrix.needsUpdate=true; haloMesh.instanceMatrix.needsUpdate=true;
scene.add(poleMesh); scene.add(headMesh); scene.add(lampMesh); scene.add(haloMesh);
const LAMP_COL=[new THREE.Color(0xff4436),new THREE.Color(0xffb020),new THREE.Color(0x36e07a)];
const _lc=new THREE.Color();
/* phase: 0 = NS green, 1 = EW green. returns 0..2 index + intensity, cross-faded */
function signalState(off,t,dark){
  if(dark) return [0,0,0];
  const CYC=9.0, u=((t/CYC)+off)%1;
  const g=[0,0,0];
  if(u<0.42){ g[2]=1; }
  else if(u<0.50){ g[1]=1; }
  else if(u<0.92){ g[0]=1; }
  else { g[0]=1; g[1]=0.6; }
  return g;
}
function updateSignals(t,dark,fade){
  for(let n=0;n<POLE_N;n++){
    const j=JUNC[n>>1], flip=(n&1);
    const g=signalState(j.off+(flip?0.5:0),t,dark);
    for(let k=0;k<3;k++){
      const v=g[k]*fade;
      _lc.copy(LAMP_COL[k]).multiplyScalar(0.10+0.90*v);
      lampMesh.setColorAt(n*3+k,_lc);
      _lc.copy(LAMP_COL[k]).multiplyScalar(v*0.42);   /* black adds nothing: no blink */
      haloMesh.setColorAt(n*3+k,_lc);
    }
  }
  if(lampMesh.instanceColor) lampMesh.instanceColor.needsUpdate=true;
  if(haloMesh.instanceColor) haloMesh.instanceColor.needsUpdate=true;
}

/* ---- cars ---- */
const CAR_N=300;
const carMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(3.4,2.6,7.2),
  new THREE.MeshLambertMaterial({color:0xffffff}),CAR_N);
const CARS=[];
(function(){
  const col=new THREE.Color();
  for(let n=0;n<CAR_N;n++){
    const horiz=rnd()<.5, lane=rnd()<.5?1:-1;
    const line=(Math.random()*N)|0;
    CARS.push({h:horiz, lane:lane, line:(rnd()*N)|0, s:rr(11,17), p:rr(-HALF,HALF), stop:0});
    const c=[0xdfe6ee,0x8fa6c0,0xc8553d,0xd9a441,0x4f6d8c,0x2f3a46][n%6];
    col.setHex(c); carMesh.setColorAt(n,col);
  }
})();
scene.add(carMesh);
function updateCars(dt,t,dark,dens){
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), s1=new THREE.Vector3(1,1,1);
  const p=new THREE.Vector3(), e=new THREE.Euler();
  for(let n=0;n<CAR_N;n++){
    const c=CARS[n];
    const cross=gx(Math.round((c.p+HALF)/PITCH));      /* next junction centre ahead */
    const dist=Math.abs(cross-c.p);
    let blocked=false;
    if(!dark && dist<11){
      const ji=JUNC.findIndex(j=>(c.h? (j.z===gx(c.line)&&j.x===cross) : (j.x===gx(c.line)&&j.z===cross)));
      if(ji>=0){ const g=signalState(JUNC[ji].off+(c.h?0.5:0),t,false); blocked = g[2]<0.5; }
    }
    c.stop += ((blocked?1:0)-c.stop)*Math.min(1,dt*6);
    c.p += c.s*(1-c.stop)*dt*c.lane;
    if(c.p> HALF+PITCH) c.p=-HALF-PITCH;
    if(c.p< -HALF-PITCH) c.p= HALF+PITCH;
    const off=c.lane*4.6;
    if(c.h){ p.set(c.p, 1.2, gx(c.line)+off); e.set(0,c.lane>0?Math.PI/2:-Math.PI/2,0); }
    else   { p.set(gx(c.line)-off, 1.2, c.p);  e.set(0,c.lane>0?0:Math.PI,0); }
    q.setFromEuler(e);
    s1.set(1,1, n/CAR_N < dens ? 1 : 0.0001);          /* density scales the fleet */
    m.compose(p,q,s1); carMesh.setMatrixAt(n,m);
  }
  carMesh.instanceMatrix.needsUpdate=true;
  if(carMesh.instanceColor) carMesh.instanceColor.needsUpdate=true;
}

/* ---- people waiting at kerbs ---- */
const PED_N=260;
const pedGeo=(typeof THREE.CapsuleGeometry==='function')
  ? new THREE.CapsuleGeometry(.6,1.6,3,6) : new THREE.CylinderGeometry(.55,.55,2.8,6);
const pedMesh=new THREE.InstancedMesh(pedGeo,new THREE.MeshLambertMaterial({color:0xe8eef6}),PED_N);
const PEDS=[];
(function(){
  for(let n=0;n<PED_N;n++){
    const j=JUNC[(rnd()*JUNC.length)|0], sx=rnd()<.5?1:-1, sz=rnd()<.5?1:-1;
    PEDS.push({x:j.x+sx*(ROAD/2+rr(1.5,5)), z:j.z+sz*(ROAD/2+rr(1.5,5)), ph:rnd()*6.28});
  }
})();
scene.add(pedMesh);
function updatePeds(t,amount){
  const m=new THREE.Matrix4(), q=new THREE.Quaternion(), s=new THREE.Vector3(), p=new THREE.Vector3();
  for(let n=0;n<PED_N;n++){
    const d=PEDS[n], on = (n/PED_N) < amount;
    p.set(d.x, 1.5+Math.sin(t*1.6+d.ph)*0.06, d.z);
    s.set(1,1, on?1:0.0001);
    m.compose(p,q,s); pedMesh.setMatrixAt(n,m);
  }
  pedMesh.instanceMatrix.needsUpdate=true;
}

/* ---- never let the camera enter a block below roof height ---- */
function roofNear(x,z){
  let h=0;
  for(let i=0;i<BH.length;i++){ const b=BH[i];
    if(Math.abs(b.x-x)<30 && Math.abs(b.z-z)<30 && b.h>h) h=b.h; }
  return h;
}
function overRoad(x,z){
  const rx=Math.abs(x-(Math.round((x+HALF)/PITCH)*PITCH-HALF));
  const rz=Math.abs(z-(Math.round((z+HALF)/PITCH)*PITCH-HALF));
  return Math.min(rx,rz) <= ROAD/2+2;
}
