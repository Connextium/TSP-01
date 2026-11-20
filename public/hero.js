(function(){const $=id=>document.getElementById(id);
const hero=document.querySelector('.hero'),canvas=$('mesh'),ctx=canvas.getContext('2d');if(!ctx){hero.classList.add('loaded');return}
const COLS=50,ROWS=30,points=[];let W=0,H=0,DPR=1,raf=0,last=0,visible=true,mx=-9999,my=-9999,hover=false,down=false;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const ripples=[],bubbles=[],bursts=[],wakes=[];
let lastPulse=0,lastTrailAt=0,lastTrailX=-9999,lastTrailY=-9999;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fract=n=>n-Math.floor(n);
const pseudo=n=>fract(Math.sin(n*12.9898+78.233)*43758.5453);
function disturb(x,y,power,radius){
 for(const v of points){
  const dx=v.x-x,dy=v.y-y,d=Math.hypot(dx,dy);
  if(d>=radius)continue;
  const f=Math.pow(1-d/radius,2)*power,norm=Math.max(d,1);
  v.vz+=f*22;
  v.vx+=dx/norm*f*1.5;
  v.vy+=dy/norm*f*1.5;
 }
}
function keepParticles(){
 if(bubbles.length>330)bubbles.splice(0,bubbles.length-330);
 if(ripples.length>38)ripples.splice(0,ripples.length-38);
}
function trailBubble(x,y,angle,now,seed,flowX,flowY){
 const size=1.45+pseudo(seed+3)*2.3;
 bubbles.push({kind:'trail',x,y,angle,orbit:8+pseudo(seed+5)*25,
  start:now+pseudo(seed+8)*70,life:770+pseudo(seed+2)*460,
  size,drift:22+pseudo(seed+7)*38,seed,
  flowX,flowY,strength:.9});
}
function addPointerTrail(x,y,now=performance.now()){
 if(reduce||!Number.isFinite(x)||!Number.isFinite(y))return;
 if(lastTrailX===-9999){lastTrailX=x;lastTrailY=y;lastTrailAt=now;return}
 const dx=x-lastTrailX,dy=y-lastTrailY,dist=Math.hypot(dx,dy);
 if(dist<7||now-lastTrailAt<17)return;
 const steps=clamp(Math.ceil(dist/15),1,12),
  ux=dx/Math.max(dist,1),uy=dy/Math.max(dist,1),
  nx=-uy,ny=ux,theta=Math.atan2(dy,dx),
  speed=clamp(dist/Math.max(16,now-lastTrailAt),.2,2.9);
 for(let j=0;j<steps;j++){
  const t=(j+1)/steps,
   px=lastTrailX+dx*t,py=lastTrailY+dy*t,
   shiftedTime=now-(steps-j-1)*7;
  // As the cursor advances, displace the fluid at the leading edge.
  // Two softer opposing depressions create the wake's side lobes.
  disturb(px,py,.14+speed*.12,73);
  disturb(px-ux*20+nx*23,py-uy*20+ny*23,-(.065+speed*.045),60);
  disturb(px-ux*20-nx*23,py-uy*20-ny*23,-(.065+speed*.045),60);
  wakes.push({
   x:px,y:py,ux,uy,start:shiftedTime,
   energy:clamp(.62+speed*.28,.55,1.4),
   seed:now*.009+j*1.47,
   life:1450
  });
  // Small foam/bubble particles float within the actual traversed trail.
  for(let k=0;k<2;k++){
   const seed=now*.017+j*17.1+k*5.9,
    side=(pseudo(seed+1)-.5)*2,
    bx=px-ux*(8+k*8)+nx*side*9,
    by=py-uy*(8+k*8)+ny*side*9;
   trailBubble(bx,by,theta+Math.PI+(pseudo(seed+4)-.5)*1.35,now,seed,-ux*20,-uy*12);
  }
 }
 if(wakes.length>135)wakes.splice(0,wakes.length-135);
 keepParticles();
 lastTrailX=x;lastTrailY=y;lastTrailAt=now;
}
// Organic bloom, not concentric radar-like rings. A click starts
// a timed five-stage emitter, from sparse bubbles to a full burst.
function createRipple(x,y,strength=1,mode='hover'){
 if(reduce||!Number.isFinite(x)||!Number.isFinite(y))return;
 const now=performance.now();
 if(mode==='burst'){
  bursts.push({x,y,start:now,stage:-1,strength});
  if(bursts.length>3)bursts.shift();
  // A lake impact produces a soft initial dimple, then successive
  // low-amplitude gravity waves. Staggered crests soften rather than stack.
  const limit=Math.min(490,Math.max(250,Math.min(W,H)*.64));
  ripples.push({x,y,start:now,mode:'bloom',life:1900,strength:strength*.55,maxRadius:limit*.55});
  for(let i=0;i<3;i++){
   ripples.push({x,y,start:now+i*230,mode:'lake',life:2520+i*170,
    strength:strength*[1,.58,.32][i],maxRadius:limit*[1,.82,.7][i],index:i});
  }
  disturb(x,y,strength*.38,125);
 }else{
  disturb(x,y,strength*.48,178);
  ripples.push({x,y,start:now,mode:'hover',life:1650,
    strength,phase:pseudo(x+y)*Math.PI*2,stretch:1.04,maxRadius:190});
  for(let i=0;i<11;i++){
   const seed=now*.013+i*4.21,angle=i/11*Math.PI*2+pseudo(seed)*.8;
   bubbles.push({kind:'hover',x,y,angle,orbit:38+pseudo(seed+1)*58,
    start:now+i*27,life:1220+pseudo(seed+2)*470,
    size:2+pseudo(seed+3)*2,drift:25+pseudo(seed+4)*32,
    seed,flowX:0,flowY:0,strength});
  }
 }
 keepParticles();
}
const BURST_TIMES=[0,160,355,585,820],
 BURST_COUNTS=[7,15,28,46,25],
 BURST_RADIUS=[13,36,69,138,208],
 BURST_POWER=[.22,.38,.6,.76,.3];
function advanceBursts(now){
 for(let bi=bursts.length-1;bi>=0;bi--){
  const b=bursts[bi],elapsed=now-b.start;
  for(let stage=b.stage+1;stage<BURST_TIMES.length;stage++){
   if(elapsed<BURST_TIMES[stage])break;
   b.stage=stage;
   const n=BURST_COUNTS[stage],radius=BURST_RADIUS[stage];
   for(let i=0;i<n;i++){
    const seed=(bi+1)*37.47+stage*113.11+i*17.13+b.x*.04+b.y*.06,
     angle=(i/n)*Math.PI*2+(pseudo(seed)-.5)*.62+stage*.23,
     spread=radius*(.35+.65*pseudo(seed+1)),
     px=b.x+Math.cos(angle)*spread*.34,
     py=b.y+Math.sin(angle)*spread*.34,
     size=1.9+pseudo(seed+2)*(stage===3?5.8:4.2),
     life=1380+pseudo(seed+3)*1110;
    bubbles.push({kind:'burst',x:px,y:py,angle,orbit:radius*.55+25+pseudo(seed+4)*80,
     start:b.start+BURST_TIMES[stage]+i%7*24,
     life,size,drift:25+pseudo(seed+5)*62,seed,
     flowX:(pseudo(seed+6)-.5)*34,flowY:-4,strength:Math.min(1.7,b.strength)});
   }
   disturb(b.x,b.y,b.strength*BURST_POWER[stage],100+stage*67);
  }
  if(elapsed>4000)bursts.splice(bi,1);
 }
 keepParticles();
}

function resize(){W=hero.clientWidth;H=hero.clientHeight;DPR=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);points.length=0;const max=Math.hypot(W/2,H/2);for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const x=c*W/(COLS-1)+(c===0||c===COLS-1?0:Math.sin(c*2.61+r*1.91)*5.3),y=r*H/(ROWS-1)+(r===0||r===ROWS-1?0:Math.cos(c*1.71+r*2.43)*4.7),f=Math.pow(1-Math.min(1,Math.hypot(x-W/2,y-H/2)/max*1.4),1.5);points.push({x,y,rx:x,ry:y,vx:0,vy:0,z:0,vz:0,f,r,c})}}
function frame(ts){raf=requestAnimationFrame(frame);if(!visible||document.hidden)return;let dt=Math.min(1.65,Math.max(.4,(ts-last)/16.667||1));last=ts;const time=ts*.001;advanceBursts(ts);const zOld=points.map(p=>p.z);ctx.clearRect(0,0,W,H);
for(let i=0;i<points.length;i++){const p=points[i];if(!reduce){const dx=p.x-mx,dy=p.y-my,dist=Math.hypot(dx,dy)||1,rad=down?200:130,flow=hover?clamp(1-(ts-lastTrailAt)/250,0,1):0,force=dist<rad?Math.pow(1-dist/rad,1.5)*(down?28:15*flow)*dt:0;p.vx+=dx/dist*force*.12;p.vy+=dy/dist*force*.12;p.vz+=force*.4;p.vx+=(p.rx-p.x)*.025*dt;p.vy+=(p.ry-p.y)*.025*dt;p.vz-=p.z*.025*1.5*dt;p.vz+=(Math.sin(time*.6+p.c*.15+p.r*.12)*2-p.z)*.002*dt;p.vx*=Math.pow(.93,dt);p.vy*=Math.pow(.93,dt);p.vz*=Math.pow(.93,dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt}}
if(!reduce)for(let i=0;i<points.length;i++){const p=points[i];let sum=0;if(p.c>0)sum+=zOld[i-1]-zOld[i];if(p.c<COLS-1)sum+=zOld[i+1]-zOld[i];if(p.r>0)sum+=zOld[i-COLS]-zOld[i];if(p.r<ROWS-1)sum+=zOld[i+COLS]-zOld[i];p.vz+=sum*.18*.25*dt}
// No persistent mesh lines: luminous vertices and transient bubbles only.
for(let i=ripples.length-1;i>=0;i--){
 const q=ripples[i],age=ts-q.start;
 if(age>q.life){ripples.splice(i,1);continue}
 if(age<0)continue;
 const p=age/q.life,fade=Math.pow(1-p,1.65);
 if(q.mode==='lake'){
  // Water-surface reflection: horizontally stretched wavefront,
  // rendered as a gradient band (never a hard stroked circle).
  const radius=14+q.maxRadius*(1-Math.pow(1-p,1.5)),
        grow=clamp(age/450,0,1),
        intensity=Math.pow(1-p,1.8)*grow*(q.strength||1),
        a=clamp(.38*intensity,0,.44);
  if(a>.003){
   ctx.save();
   ctx.translate(q.x,q.y);
   ctx.scale(1,.64);
   const width=clamp(10+radius*.07,11,38),
         inner=clamp((radius-width)/radius,.18,.94);
   const g=ctx.createRadialGradient(0,0,Math.max(0,radius-width*1.85),0,0,radius+width);
   g.addColorStop(0,'rgba(230,231,215,0)');
   g.addColorStop(clamp((radius-width*1.4)/(radius+width),.03,.9),'rgba(228,228,212,0)');
   g.addColorStop(clamp((radius-width*.55)/(radius+width),.06,.95),
       'rgba(218,230,224,'+(a*.30).toFixed(3)+')');
   g.addColorStop(clamp(radius/(radius+width),.1,.98),
       'rgba(248,245,229,'+a.toFixed(3)+')');
   g.addColorStop(1,'rgba(230,230,219,0)');
   ctx.beginPath();ctx.arc(0,0,radius+width,0,Math.PI*2);
   ctx.fillStyle=g;ctx.fill();
   ctx.restore();
  }
  continue;
 }
 if(q.mode==='bloom'){
  // The expanding glow diffuses without a hard ring or radar outline.
  const envelope=Math.sin(Math.PI*clamp(p*1.1,0,1)),
   r=28+q.maxRadius*(1-Math.pow(1-p,2.5)),
   a=clamp(.21*envelope*q.strength,0,.28);
  const gradient=ctx.createRadialGradient(q.x,q.y,2,q.x,q.y,r);
  gradient.addColorStop(0,'rgba(252,242,222,'+(a*.43).toFixed(3)+')');
  gradient.addColorStop(.3,'rgba(171,211,221,'+(a*.22).toFixed(3)+')');
  gradient.addColorStop(.78,'rgba(194,215,219,'+(a*.035).toFixed(3)+')');
  gradient.addColorStop(1,'rgba(194,215,219,0)');
  ctx.beginPath();ctx.fillStyle=gradient;
  ctx.arc(q.x,q.y,r,0,Math.PI*2);ctx.fill();
  continue;
 }
 // One irregular, partial water-wave, not a set of concentric circles.
 const trail=q.mode==='trail',
  r=(trail?9:18)+(1-Math.pow(1-p,1.55))*q.maxRadius,
  opacity=(trail?.30:.25)*fade*q.strength,
  angle=q.phase||0,start=angle-1.22,span=trail?2.55:3.45;
 ctx.beginPath();
 for(let j=0;j<=36;j++){
  const theta=start+span*j/36,
   wobble=1+Math.sin(3*theta+ts*.002+q.x*.009)*.085
           +Math.sin(5*theta-ts*.0017+q.y*.015)*.052,
   rr=r*wobble,
   xx=q.x+Math.cos(theta)*rr*(q.stretch||1),
   yy=q.y+Math.sin(theta)*rr*.76;
  if(!j)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy);
 }
 ctx.lineWidth=trail?1.1:1.35;ctx.lineCap='round';
 ctx.strokeStyle='rgba(194,224,227,'+opacity.toFixed(3)+')';ctx.stroke();
}
// Soft water displacement: translucent, feathered pressure wakes.
// No connected outlines, sharp strokes, zig-zags, or radar contours.
for(let i=wakes.length-1;i>=0;i--){
 const w=wakes[i],age=ts-w.start;
 if(age>w.life){wakes.splice(i,1);continue}
 if(age<0)continue;
 const p=age/w.life,fade=Math.pow(1-p,1.75),
       energy=clamp(w.energy,0,1.4),
       behind=9+age*.022,
       x=w.x-w.ux*behind,y=w.y-w.uy*behind,
       spread=4+age*.020,
       length=19+age*.045,
       width=10+age*.012,
       nx=-w.uy,ny=w.ux,
       angle=Math.atan2(w.uy,w.ux);
 // A light central underwater glow expands gently through the wake.
 ctx.save();
 ctx.translate(x,y);ctx.rotate(angle);
 ctx.scale(length,width);
 let g=ctx.createRadialGradient(-.13,0,0,0,0,1);
 let a=clamp(.14*fade*energy,0,.17);
 g.addColorStop(0,'rgba(208,222,217,'+a.toFixed(3)+')');
 g.addColorStop(.44,'rgba(196,215,212,'+(a*.36).toFixed(3)+')');
 g.addColorStop(1,'rgba(196,215,212,0)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();
 ctx.restore();
 // Two very soft side disturbances; their spread suggests a boat wake
 // without depicting a geometric V or disconnected outlined crests.
 if(i%2===0){
  for(const sign of [-1,1]){
   const sx=x+nx*spread*sign,sy=y+ny*spread*sign;
   ctx.save();ctx.translate(sx,sy);ctx.rotate(angle);
   ctx.scale(length*.84,width*.72);
   let foam=ctx.createRadialGradient(-.18,0,0,0,0,1);
   const fa=clamp(.13*fade*energy,0,.17);
   foam.addColorStop(0,'rgba(244,239,223,'+fa.toFixed(3)+')');
   foam.addColorStop(.5,'rgba(224,226,216,'+(fa*.34).toFixed(3)+')');
   foam.addColorStop(1,'rgba(224,226,216,0)');
   ctx.fillStyle=foam;ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fill();
   ctx.restore();
  }
 }
}
for(let i=bubbles.length-1;i>=0;i--){
 const b=bubbles[i],age=ts-b.start;
 if(age>b.life){bubbles.splice(i,1);continue}
 if(age<0)continue;
 const p=age/b.life,travel=1-Math.pow(1-p,2.35),
  swirl=Math.sin(p*8+b.seed)*5*p,
  x=b.x+Math.cos(b.angle)*b.orbit*travel+(b.flowX||0)*travel+swirl,
  y=b.y+Math.sin(b.angle)*b.orbit*travel-b.drift*p+(b.flowY||0)*travel,
  envelope=Math.pow(Math.sin(Math.PI*p),.65),
  alpha=clamp(envelope*(b.kind==='burst'?.85:.68)*Math.min(b.strength,1.4),0,.92),
  R=b.size*(.25+1.06*Math.sin(Math.PI*p));
 if(R<=0||alpha<=.005)continue;
 if(R>2.4){
  ctx.beginPath();ctx.arc(x,y,R*2.45,0,Math.PI*2);
  ctx.fillStyle='rgba(148,208,221,'+(alpha*.1).toFixed(3)+')';ctx.fill();
 }
 ctx.beginPath();ctx.arc(x,y,R,0,Math.PI*2);
 ctx.fillStyle=b.kind==='trail'
  ?'rgba(236,245,239,'+alpha.toFixed(3)+')'
  :'rgba(252,244,224,'+alpha.toFixed(3)+')';
 ctx.fill();
}

for(const p of points){const disp=Math.hypot(p.x-p.rx,p.y-p.ry,p.z),f=p.f,b=Math.min(1,Math.max(0,(disp-3)/23)),rgb=[130+115*f,130+105*f,140+70*f].map((v,i)=>Math.round(v*(1-b)+[255,252,245][i]*b));let alpha=Math.max(.06+f*.18,disp>.5?Math.min(.9,disp*.05):0);if(hover){let ell=((p.rx-W/2)/(W*.35))**2+((p.ry-H/2)/(H*.35))**2;if(ell<1)alpha*=1-(1-ell)*.7}const size=1+f+(disp>.5?disp*.05:0),sy=p.y-p.z*.3;if(disp>1.5||f>.4){ctx.fillStyle='rgba('+rgb.join(',')+','+(alpha*.09)+')';ctx.beginPath();ctx.arc(p.x,sy,size+6,0,Math.PI*2);ctx.fill()}ctx.fillStyle='rgba('+rgb.join(',')+','+alpha+')';ctx.beginPath();ctx.arc(p.x,sy,size,0,Math.PI*2);ctx.fill()}}
function pointer(e){const rect=hero.getBoundingClientRect();mx=e.clientX-rect.left;my=e.clientY-rect.top}hero.addEventListener('pointerenter',e=>{pointer(e);hover=true;lastPulse=performance.now();lastTrailAt=0;lastTrailX=mx;lastTrailY=my},{passive:true});
hero.addEventListener('pointermove',e=>{pointer(e);hover=true;addPointerTrail(mx,my)},{passive:true});
hero.addEventListener('pointerleave',()=>{mx=my=-9999;hover=down=false;lastPulse=0;lastTrailX=lastTrailY=-9999;lastTrailAt=0});
hero.addEventListener('pointerdown',e=>{pointer(e);down=true;lastPulse=performance.now();createRipple(mx,my,1.25,'burst')});window.addEventListener('pointerup',()=>down=false);window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>last=0);new IntersectionObserver(e=>{visible=e[0].isIntersecting;last=0},{threshold:0}).observe(hero);resize();raf=requestAnimationFrame(frame);
function startupBubbles(){
 if(reduce)return;
 setTimeout(()=>createRipple(W*.27,H*.57,1.2,'burst'),670);
 setTimeout(()=>createRipple(W*.74,H*.41,1.05,'burst'),1190);
}
function animateEntrance(){const elements=[...document.querySelectorAll('[data-reveal]')];if(reduce){canvas.style.opacity=1;hero.classList.add('loaded')}else if(window.gsap){gsap.to(canvas,{opacity:1,duration:2,ease:'power2.inOut'});gsap.fromTo(elements,{opacity:0,y:30,scale:.94,filter:'blur(6px)'},{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:1,ease:'power4.out',stagger:.13,delay:.5,onComplete:()=>hero.classList.add('loaded')})}else{canvas.style.transition='opacity 2s ease-in-out';canvas.style.opacity=1;elements.forEach((e,i)=>setTimeout(()=>{e.style.transition='all 1s cubic-bezier(.16,1,.3,1)';e.style.opacity=1;e.style.filter='none';e.style.transform='none'},500+i*130))}}
window.addEventListener('load',()=>{animateEntrance();startupBubbles()},{once:true});if(document.readyState==='complete'){animateEntrance();startupBubbles();}
})();
