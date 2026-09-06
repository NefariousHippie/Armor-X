(() => {
  'use strict';

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia?.('(max-width: 720px)').matches;

  const style = document.createElement('style');
  style.textContent = `
    #armor-x-effects{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;isolation:isolate}
    #armor-x-mesh,#armor-x-energy{position:absolute;inset:0;width:100%;height:100%;display:block}
    #armor-x-mesh{opacity:.92}
    #armor-x-energy{opacity:1;mix-blend-mode:screen}
    #app{position:relative;z-index:1}
    .site-background{z-index:-1!important;background:transparent!important}
    .armor-visual .ax-suit-svg{position:absolute;inset:5% 13%;width:74%;height:90%;z-index:5;overflow:visible;pointer-events:none;filter:drop-shadow(0 0 10px rgba(92,220,255,.24)) drop-shadow(0 0 28px rgba(92,220,255,.1));animation:axSuitDrift 3.8s ease-in-out infinite}
    .armor-visual.ax-enhanced .armor-silhouette{display:none!important}
    .ax-reactor-shell{position:absolute;left:50%;top:50%;width:min(48%,220px);aspect-ratio:1;transform:translate(-50%,-50%);z-index:7;pointer-events:none;mix-blend-mode:screen;filter:drop-shadow(0 0 18px rgba(64,215,255,.3))}
    .ax-reactor-shell canvas{display:block;width:100%;height:100%}
    .ax-reactor-label{position:absolute;left:50%;top:calc(50% + 57%);transform:translate(-50%,-50%);font:8px var(--mono,monospace);letter-spacing:.2em;color:#baf7ff;text-shadow:0 0 12px rgba(91,211,255,.95);white-space:nowrap}
    @keyframes axSuitDrift{0%,100%{transform:translate3d(0,0,0) rotate(0)}35%{transform:translate3d(2px,-7px,0) rotate(-.25deg)}70%{transform:translate3d(-2px,4px,0) rotate(.22deg)}}
    @media(prefers-reduced-motion:reduce){.armor-visual .ax-suit-svg{animation:none!important}.ax-reactor-shell{display:none}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'armor-x-effects';
  root.setAttribute('aria-hidden','true');
  root.innerHTML = '<canvas id="armor-x-mesh"></canvas><canvas id="armor-x-energy"></canvas>';
  document.body.prepend(root);

  const meshCanvas = document.getElementById('armor-x-mesh');
  const energyCanvas = document.getElementById('armor-x-energy');
  const mesh = meshCanvas?.getContext('2d');
  const energy = energyCanvas?.getContext('2d');
  if (!mesh || !energy) return;

  let W=0,H=0,DPR=1,clock=0,last=performance.now();
  let pointerX=.5,pointerY=.5,targetX=.5,targetY=.5;
  const cols=15, rows=22, nodes=[], currents=[], sparks=[];
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function resize(){
    W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
    for(const c of [meshCanvas,energyCanvas]){
      c.width=Math.round(W*DPR);c.height=Math.round(H*DPR);c.style.width=W+'px';c.style.height=H+'px';
    }
    mesh.setTransform(DPR,0,0,DPR,0,0);energy.setTransform(DPR,0,0,DPR,0,0);
    buildMesh();
  }

  function buildMesh(){
    nodes.length=0;
    const sx=W/(cols+1),sy=H/(rows+1);
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      nodes.push({baseX:(c+1)*sx,baseY:(r+1)*sy,x:0,y:0,phase:rnd(0,6.28),depth:rnd(.35,1),pulse:rnd(0,1)});
    }
    currents.length=0;
    const n=mobile?18:38;
    for(let i=0;i<n;i++) spawnCurrent(true);
    sparks.length=0;
    const s=mobile?50:110;
    for(let i=0;i<s;i++) sparks.push({x:rnd(0,W),y:rnd(0,H),life:rnd(0,1),speed:rnd(.25,1),size:rnd(.5,1.8),angle:rnd(0,6.28)});
  }

  function spawnCurrent(initial=false){
    const edge=Math.floor(Math.random()*4);
    let x,y;
    if(edge===0){x=rnd(0,W);y=-20}else if(edge===1){x=W+20;y=rnd(0,H)}else if(edge===2){x=rnd(0,W);y=H+20}else{x=-20;y=rnd(0,H)}
    const dx=W*.5-x+rnd(-180,180),dy=H*.5-y+rnd(-240,240),len=Math.hypot(dx,dy)||1;
    currents.push({x,y,vx:dx/len*rnd(1.1,2.3),vy:dy/len*rnd(1.1,2.3),life:initial?rnd(0,1):0,max:rnd(1.8,3.3),seed:rnd(0,999),width:rnd(.8,1.8),energy:rnd(.7,1.2)});
  }

  function drawMesh(dt){
    mesh.clearRect(0,0,W,H);
    const ox=(pointerX-.5)*26,oy=(pointerY-.5)*18;
    for(const n of nodes){
      n.x=n.baseX+Math.sin(clock*.75+n.phase)*12*n.depth+ox*n.depth;
      n.y=n.baseY+Math.cos(clock*.56+n.phase*1.31)*10*n.depth+oy*n.depth;
    }
    mesh.lineWidth=1;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const i=r*cols+c,a=nodes[i];
      if(c<cols-1) drawMeshLine(a,nodes[i+1],.72);
      if(r<rows-1) drawMeshLine(a,nodes[i+cols],.72);
      if(c<cols-1&&r<rows-1&&(r+c)%2===0) drawMeshLine(a,nodes[i+cols+1],.38);
    }
    for(const n of nodes){
      const pulse=.5+.5*Math.sin(clock*3.2+n.phase);
      mesh.fillStyle=`rgba(102,224,255,${.12+.17*pulse*n.depth})`;
      mesh.beginPath();mesh.arc(n.x,n.y,1.5+2.6*pulse*n.depth,0,6.283);mesh.fill();
      if(pulse>.9){mesh.fillStyle='rgba(205,251,255,.78)';mesh.beginPath();mesh.arc(n.x,n.y,4.2,0,6.283);mesh.fill()}
    }
  }

  function drawMeshLine(a,b,m){
    const d=Math.hypot(a.x-b.x,a.y-b.y),alpha=m*clamp(1.7-d/150,0,1)*.42;
    mesh.strokeStyle=`rgba(65,198,245,${alpha})`;
    mesh.beginPath();mesh.moveTo(a.x,a.y);mesh.lineTo(b.x,b.y);mesh.stroke();
  }

  function drawEnergy(dt){
    energy.clearRect(0,0,W,H);
    for(let i=currents.length-1;i>=0;i--){
      const p=currents[i];p.life+=dt;
      const fade=Math.min(1,p.life/.22,(p.max-p.life)/.3);
      const turn=(Math.sin(p.x*.009+p.seed+clock*4)+Math.cos(p.y*.012-p.seed-clock*3))*.045;
      const cs=Math.cos(turn),sn=Math.sin(turn),vx=p.vx*cs-p.vy*sn,vy=p.vx*sn+p.vy*cs;
      p.vx=vx;p.vy=vy;p.x+=vx*60*dt;p.y+=vy*60*dt;
      const trail=60+Math.sin(clock*5+p.seed)*22;
      const grad=energy.createLinearGradient(p.x,p.y,p.x-vx*trail,p.y-vy*trail);
      grad.addColorStop(0,`rgba(230,255,255,${.98*fade*p.energy})`);
      grad.addColorStop(.16,`rgba(76,225,255,${.85*fade})`);
      grad.addColorStop(.55,`rgba(32,158,221,${.5*fade})`);
      grad.addColorStop(1,'rgba(15,91,145,0)');
      energy.strokeStyle=grad;energy.lineWidth=p.width*(1+.35*Math.sin(clock*9+p.seed));energy.beginPath();energy.moveTo(p.x,p.y);
      const steps=12;for(let s=1;s<=steps;s++){const q=s/steps;const bend=Math.sin(q*12+clock*8+p.seed)*12*q;energy.lineTo(p.x-vx*trail*q-p.vy*bend,p.y-vy*trail*q+p.vx*bend)}energy.stroke();
      if(Math.random()<dt*.9){
        const branchAngle=Math.atan2(vy,vx)+rnd(-1.1,1.1),bl=rnd(22,65);
        energy.strokeStyle=`rgba(126,239,255,${.55*fade})`;energy.lineWidth=.7;energy.beginPath();energy.moveTo(p.x,p.y);energy.lineTo(p.x+Math.cos(branchAngle)*bl,p.y+Math.sin(branchAngle)*bl);energy.stroke();
      }
      if(p.life>p.max||p.x<-150||p.x>W+150||p.y<-150||p.y>H+150){currents.splice(i,1);spawnCurrent()}
    }
    for(const s of sparks){
      s.life+=s.speed*dt;
      if(s.life>1){s.life=0;s.x=rnd(0,W);s.y=rnd(0,H);s.angle=rnd(0,6.28)}
      const a=Math.sin(s.life*Math.PI)**4*.9;
      if(a>.01){energy.fillStyle=`rgba(173,246,255,${a})`;energy.save();energy.translate(s.x,s.y);energy.rotate(s.angle);energy.fillRect(0,0,s.size*5,s.size);energy.restore()}
    }
  }

  function installSuitAndReactor(){
    const visual=document.querySelector('.armor-visual');if(!visual)return;
    visual.classList.add('ax-enhanced');
    let svg=visual.querySelector('.ax-suit-svg');
    if(!svg){
      const ns='http://www.w3.org/2000/svg';svg=document.createElementNS(ns,'svg');svg.classList.add('ax-suit-svg');svg.setAttribute('viewBox','0 0 420 760');svg.setAttribute('aria-hidden','true');
      svg.innerHTML=`<defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0a151d"/><stop offset=".5" stop-color="#304854"/><stop offset=".72" stop-color="#081116"/><stop offset="1" stop-color="#38616f"/></linearGradient><radialGradient id="c"><stop stop-color="#fff"/><stop offset=".13" stop-color="#9ff5ff"/><stop offset=".4" stop-color="#27caff" stop-opacity=".85"/><stop offset="1" stop-color="#12a4df" stop-opacity="0"/></radialGradient></defs><g fill="url(#m)" stroke="#75ddff" stroke-opacity=".72" stroke-width="2"><path d="M184 55l10-24 16-12 16 12 10 24-6 40-12 12h-16l-12-12z"/><path d="M181 102l-42 27-14 50 21 43 35-20 6-53z"/><path d="M239 102l42 27 14 50-21 43-35-20-6-53z"/><path d="M183 101l27-11 27 11 27 32-13 105-16 34h-51l-16-34-13-105z"/><path d="M170 231l20 35h40l20-35 13 73-28 28h-50l-28-28z"/><path d="M166 315l44 15 44-15 19 91-35 20h-56l-35-20z"/><path d="M128 177l-24 14-14 47 15 22 21-14 16-42z"/><path d="M292 177l24 14 14 47-15 22-21-14-16-42z"/><path d="M165 399l45 20 45-20 12 64-27 102-30 24-30-24-27-102z"/><path d="M154 560l36 14-7 94-18 38h-29l8-54z"/><path d="M266 560l-36 14 7 94 18 38h29l-8-54z"/></g><g fill="none" stroke="#bdf8ff" stroke-linecap="round"><path d="M188 69q22-18 44 0" stroke-width="4"/><path d="M175 130l35-17 35 17M171 158l39-22 39 22" stroke-width="3"/><path d="M169 350l41-13 41 13" stroke-width="3"/><path d="M150 216l26-13M270 203l-26 13" stroke-width="4"/><path d="M156 454l25 8M264 454l-25 8M154 500l26-10M266 500l-26-10" stroke-width="3" opacity=".8"/></g><g><circle cx="210" cy="245" r="58" fill="url(#c)"/><circle cx="210" cy="245" r="15" fill="#f3ffff"/><circle cx="210" cy="245" r="32" fill="none" stroke="#68ddff" stroke-width="2" stroke-dasharray="7 10"/></g>`;
      visual.appendChild(svg);
    }
    let reactor=visual.querySelector('.ax-reactor-shell');
    if(reactor)reactor.remove();
    reactor=document.createElement('div');reactor.className='ax-reactor-shell';reactor.innerHTML='<canvas></canvas><div class="ax-reactor-label">ARC // CRITICAL</div>';visual.appendChild(reactor);
    startReactor(reactor.querySelector('canvas'));
  }

  function startReactor(canvas){
    const c=canvas.getContext('2d');if(!c||reduced)return;
    const arcs=Array.from({length:14},(_,i)=>({phase:rnd(0,6.28),speed:rnd(-1.2,1.6),seed:rnd(0,999),amp:rnd(4,13),tilt:rnd(.62,.92)}));
    const sparks=Array.from({length:26},()=>({phase:rnd(0,6.28),radius:rnd(.38,.92),speed:rnd(.6,1.9),seed:rnd(0,99)}));
    function sizeCanvas(){const box=canvas.parentElement.getBoundingClientRect(),css=Math.max(120,Math.min(box.width,box.height));canvas.width=Math.floor(css*DPR);canvas.height=Math.floor(css*DPR);canvas.style.width=css+'px';canvas.style.height=css+'px'}
    function frame(now){
      const box=canvas.parentElement.getBoundingClientRect(),size=Math.max(120,Math.min(box.width,box.height)),scale=DPR;c.setTransform(scale,0,0,scale,0,0);c.clearRect(0,0,size,size);const cx=size/2,cy=size/2,r=size*.26;
      const pulse=1+.16*Math.sin(clock*7)+.07*Math.sin(clock*17);
      const glow=c.createRadialGradient(cx,cy,1,cx,cy,r*2.7);glow.addColorStop(0,'rgba(255,255,255,.98)');glow.addColorStop(.11,'rgba(111,239,255,.92)');glow.addColorStop(.38,'rgba(31,179,237,.3)');glow.addColorStop(1,'rgba(0,55,90,0)');c.fillStyle=glow;c.beginPath();c.arc(cx,cy,r*2.3*pulse,0,6.283);c.fill();
      c.globalCompositeOperation='lighter';
      arcs.forEach((a,i)=>{a.phase+=a.speed*.012;const rr=r*(.58+.25*Math.sin(clock*1.8+a.seed));c.beginPath();for(let q=0;q<=100;q++){const p=q/100*6.283,w=1+.08*Math.sin(p*4+clock*10+a.seed)+.045*Math.sin(p*9-clock*13+a.seed);const rad=rr*w+a.amp*Math.sin(p*5-clock*11+a.seed);const x=cx+Math.cos(p+a.phase)*rad,y=cy+Math.sin(p+a.phase)*rad*a.tilt;if(q===0)c.moveTo(x,y);else c.lineTo(x,y)}c.strokeStyle=`rgba(${145+i*5},${235+i%4*4},255,${.2+.13*(i%4===0)})`;c.lineWidth=1+(i%3)*.7;c.stroke()});
      sparks.forEach((s,i)=>{const p=clock*s.speed+s.phase,rr=r*s.radius*(.75+.28*Math.sin(clock*5+s.seed));const x=cx+Math.cos(p)*rr,y=cy+Math.sin(p)*rr*.75;c.fillStyle='rgba(220,252,255,.9)';c.beginPath();c.arc(x,y,1+(i%3)*.45,0,6.283);c.fill()});
      c.globalCompositeOperation='source-over';requestAnimationFrame(frame);
    }
    sizeCanvas();addEventListener('resize',sizeCanvas,{passive:true});requestAnimationFrame(frame);
  }

  document.addEventListener('pointermove',e=>{targetX=e.clientX/W;targetY=e.clientY/H},{passive:true});
  addEventListener('resize',resize,{passive:true});
  resize();installSuitAndReactor();

  function tick(now){
    const dt=Math.min(.034,(now-last)/1000);last=now;clock+=dt;pointerX+=(targetX-pointerX)*.06;pointerY+=(targetY-pointerY)*.06;drawMesh(dt);drawEnergy(dt);requestAnimationFrame(tick)
  }
  if(reduced){drawMesh(0);drawEnergy(0)}else requestAnimationFrame(tick);
})();
