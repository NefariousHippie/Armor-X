(() => {
  'use strict';

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;

  const style = document.createElement('style');
  style.id = 'armor-x-effects-style';
  style.textContent = `
    #armor-x-effects{position:fixed;inset:0;z-index:-7;pointer-events:none;overflow:hidden;background:radial-gradient(circle at 50% 35%,rgba(7,44,63,.12),transparent 42%)}
    #armor-x-mesh{position:absolute;inset:0;width:100%;height:100%;opacity:.7}
    #armor-x-energy{position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen;opacity:.9}
    .ax-suit-svg{position:absolute;inset:7% 17%;width:66%;height:86%;overflow:visible;filter:drop-shadow(0 0 14px rgba(92,220,255,.18));z-index:3;pointer-events:none}
    .armor-visual.ax-enhanced .armor-silhouette{display:none}
    .armor-visual.ax-enhanced .ax-suit-svg{animation:axSuitFloat 6s ease-in-out infinite}
    @keyframes axSuitFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-5px,0)}}
    .ax-reactor-shell{position:absolute;left:50%;top:50%;width:168px;height:168px;transform:translate(-50%,-50%);z-index:4;pointer-events:none;mix-blend-mode:screen}
    .ax-reactor-shell canvas{width:100%;height:100%;display:block}
    .ax-reactor-label{position:absolute;left:50%;top:calc(50% + 95px);transform:translateX(-50%);font:8px var(--mono,monospace);letter-spacing:.2em;color:#8de9ff;text-shadow:0 0 10px rgba(91,211,255,.9);white-space:nowrap}
    .system-card,.display-frame,.power-core-unit,.armor-system-diagram,.mobility-display,.ai-terminal,.mission-content{--ax-mx:50%;--ax-my:50%;}
    .system-card:before,.display-frame:after,.power-core-unit:after,.armor-system-diagram:after,.mobility-display:after,.ai-terminal:after,.mission-content:after{transition:background .15s ease;}
    @media(max-width:720px){.ax-suit-svg{inset:8% 12%;width:76%;height:84%}.ax-reactor-shell{width:140px;height:140px}}
    @media(prefers-reduced-motion:reduce){#armor-x-mesh,#armor-x-energy,.armor-visual.ax-enhanced .ax-suit-svg{animation:none!important}.ax-reactor-shell{display:none}}
  `;
  document.head.appendChild(style);

  const effectsRoot = document.createElement('div');
  effectsRoot.id = 'armor-x-effects';
  effectsRoot.setAttribute('aria-hidden', 'true');
  effectsRoot.innerHTML = '<canvas id="armor-x-mesh"></canvas><canvas id="armor-x-energy"></canvas>';
  document.body.prepend(effectsRoot);

  const meshCanvas = document.getElementById('armor-x-mesh');
  const energyCanvas = document.getElementById('armor-x-energy');
  const mesh = meshCanvas.getContext('2d');
  const energy = energyCanvas.getContext('2d');
  if (!mesh || !energy) return;

  let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  let mouseX = 0.5, mouseY = 0.5, targetX = 0.5, targetY = 0.5;
  const nodes = [];
  const currents = [];
  const sparks = [];
  const cols = 12;
  const rows = 18;
  let t = 0;

  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = v => v * v * (3 - 2 * v);

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    [meshCanvas, energyCanvas].forEach(c => {
      c.width = Math.floor(W * dpr);
      c.height = Math.floor(H * dpr);
      c.style.width = `${W}px`;
      c.style.height = `${H}px`;
    });
    mesh.setTransform(dpr,0,0,dpr,0,0);
    energy.setTransform(dpr,0,0,dpr,0,0);
  }

  function seededNoise(x, y, time) {
    return (Math.sin(x * 1.73 + y * .91 + time) + Math.sin(y * 2.17 - x * .73 - time * 1.31) + 2) / 4;
  }

  function rebuildMesh() {
    nodes.length = 0;
    const sx = W / (cols + 1);
    const sy = H / (rows + 1);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const jitterX = rnd(-sx * .25, sx * .25);
        const jitterY = rnd(-sy * .18, sy * .18);
        nodes.push({x:(c+1)*sx+jitterX,y:(r+1)*sy+jitterY,baseX:(c+1)*sx,baseY:(r+1)*sy,depth:rnd(.25,1),phase:rnd(0,Math.PI*2),energy:rnd(0,.25)});
      }
    }
    currents.length = 0;
    const count = isMobile ? 14 : 24;
    for (let i=0;i<count;i++) spawnCurrent(true);
    sparks.length = 0;
    const sparkCount = isMobile ? 34 : 72;
    for (let i=0;i<sparkCount;i++) sparks.push({x:rnd(0,W),y:rnd(0,H),life:rnd(0,1),speed:rnd(.0015,.006),len:rnd(5,18),phase:rnd(0,Math.PI*2)});
  }

  function spawnCurrent(initial=false) {
    const start = nodes[Math.floor(Math.random()*nodes.length)] || {x:rnd(0,W),y:rnd(0,H)};
    const angle = rnd(0,Math.PI*2);
    currents.push({
      x:start.x+rnd(-60,60), y:start.y+rnd(-60,60),
      vx:Math.cos(angle)*rnd(.22,.72), vy:Math.sin(angle)*rnd(.22,.72),
      life:initial?rnd(.15,1):0, maxLife:rnd(.8,1.6), width:rnd(.55,1.45),
      hue:rnd(184,205), seed:rnd(0,999), branch:rnd(0,1),
    });
  }

  function drawMesh() {
    mesh.clearRect(0,0,W,H);
    const px = (mouseX-.5)*18;
    const py = (mouseY-.5)*12;
    const index = (r,c) => r*cols+c;
    for (let r=0;r<rows;r++) {
      for (let c=0;c<cols;c++) {
        const n = nodes[index(r,c)];
        n.x = n.baseX + Math.sin(t*.45+n.phase)*8*n.depth + px*n.depth;
        n.y = n.baseY + Math.cos(t*.32+n.phase*.7)*6*n.depth + py*n.depth;
      }
    }
    mesh.lineWidth=1;
    for (let r=0;r<rows;r++) {
      for (let c=0;c<cols;c++) {
        const n=nodes[index(r,c)];
        if(c<cols-1) line(n,nodes[index(r,c+1)]);
        if(r<rows-1) line(n,nodes[index(r+1,c)]);
        if(c<cols-1&&r<rows-1&&((r+c)%3===0)) line(n,nodes[index(r+1,c+1)],.45);
      }
    }
    for(const n of nodes){
      const pulse=seededNoise(n.baseX*.008,n.baseY*.006,t*.65);
      const a=.035+.05*n.depth+.065*pulse;
      mesh.fillStyle=`rgba(84,210,255,${a})`;
      mesh.beginPath(); mesh.arc(n.x,n.y,1.2+2.2*n.depth*pulse,0,Math.PI*2); mesh.fill();
      if(pulse>.82){mesh.fillStyle=`rgba(135,235,255,${a*3})`;mesh.beginPath();mesh.arc(n.x,n.y,3.2,0,Math.PI*2);mesh.fill();}
    }
  }

  function line(a,b,m=.62){
    const d=Math.hypot(a.x-b.x,a.y-b.y);
    mesh.strokeStyle=`rgba(70,190,235,${m*clamp(1-d/160,0,1)*.22})`;
    mesh.beginPath();mesh.moveTo(a.x,a.y);mesh.lineTo(b.x,b.y);mesh.stroke();
  }

  function drawCurrents() {
    energy.clearRect(0,0,W,H);
    for(let i=currents.length-1;i>=0;i--){
      const p=currents[i];
      p.life += .009;
      const fade = p.life<.14 ? p.life/.14 : p.life>p.maxLife-.18 ? (p.maxLife-p.life)/.18 : 1;
      const nse = Math.sin((p.x+p.seed)*.018+t*3)*.75 + Math.sin((p.y-p.seed)*.014-t*2.4)*.45;
      const turn = nse*.014;
      const cos=Math.cos(turn), sin=Math.sin(turn);
      const vx=p.vx*cos-p.vy*sin, vy=p.vx*sin+p.vy*cos;
      p.vx=vx; p.vy=vy; p.x+=vx*(1.8+Math.sin(t+p.seed)*.35); p.y+=vy*(1.8+Math.cos(t*.7+p.seed)*.35);
      const len=34+Math.sin(t*4+p.seed)*15;
      const grad=energy.createLinearGradient(p.x,p.y,p.x-p.vx*len,p.y-p.vy*len);
      grad.addColorStop(0,`rgba(186,248,255,${.9*fade})`);
      grad.addColorStop(.25,`rgba(70,220,255,${.7*fade})`);
      grad.addColorStop(1,'rgba(36,150,210,0)');
      energy.strokeStyle=grad; energy.lineWidth=p.width; energy.beginPath();
      energy.moveTo(p.x,p.y);
      const step=5;
      for(let s=step;s<len;s+=step){
        const qx=p.x-p.vx*s + Math.sin(s*.19+t*5+p.seed)*3;
        const qy=p.y-p.vy*s + Math.cos(s*.16-t*4+p.seed)*3;
        energy.lineTo(qx,qy);
      }
      energy.stroke();
      if(Math.random()<.013 && !prefersReduced){
        energy.fillStyle=`rgba(210,250,255,${fade})`;energy.beginPath();energy.arc(p.x,p.y,2.2+Math.random()*2,0,Math.PI*2);energy.fill();
        for(let b=0;b<2;b++){
          const a=rnd(-Math.PI,Math.PI), l=rnd(12,34);
          energy.strokeStyle=`rgba(120,230,255,${fade*.55})`;energy.lineWidth=.6;energy.beginPath();energy.moveTo(p.x,p.y);energy.lineTo(p.x+Math.cos(a)*l,p.y+Math.sin(a)*l);energy.stroke();
        }
      }
      if(p.life>p.maxLife || p.x<-120 || p.x>W+120 || p.y<-120 || p.y>H+120){currents.splice(i,1);spawnCurrent();}
    }
    for(const s of sparks){
      s.life += s.speed;
      if(s.life>1){s.life=0;s.x=rnd(0,W);s.y=rnd(0,H);}
      const a=Math.pow(Math.sin(s.life*Math.PI),5)*(.15+.2*Math.sin(t*3+s.phase)**2);
      if(a>.01){energy.fillStyle=`rgba(150,240,255,${a})`;energy.fillRect(s.x,s.y,s.len,speedSafe(s.len*.12));}
    }
  }

  function speedSafe(v){return Math.max(1,v)}

  // A sharp original exoskeleton, rendered as SVG so it stays crisp at every size.
  function installSuit() {
    const visual=document.querySelector('.armor-visual');
    if(!visual) return;
    visual.classList.add('ax-enhanced');
    const old=visual.querySelector('.ax-suit-svg'); if(old) old.remove();
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg'); svg.setAttribute('class','ax-suit-svg'); svg.setAttribute('viewBox','0 0 420 760'); svg.setAttribute('role','img'); svg.setAttribute('aria-label','ARMOR X AX-01 powered exoskeleton visualization');
    svg.innerHTML=`
      <defs>
        <linearGradient id="ax-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#09141c"/><stop offset=".45" stop-color="#213743"/><stop offset=".7" stop-color="#071015"/><stop offset="1" stop-color="#2f5361"/></linearGradient>
        <linearGradient id="ax-edge" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#4acdf5" stop-opacity=".2"/><stop offset=".5" stop-color="#b4f3ff"/><stop offset="1" stop-color="#35bfe9" stop-opacity=".2"/></linearGradient>
        <radialGradient id="ax-core"><stop stop-color="#f7ffff"/><stop offset=".12" stop-color="#9df1ff"/><stop offset=".35" stop-color="#31cfff" stop-opacity=".85"/><stop offset="1" stop-color="#12a4df" stop-opacity="0"/></radialGradient>
        <filter id="ax-glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g stroke="#69dcff" stroke-opacity=".62" stroke-width="2" fill="url(#ax-metal)">
        <path d="M183 54L194 31 210 20 226 31 237 54 231 93 220 103 200 103 189 93Z"/>
        <path d="M171 102L141 121 127 172 145 208 178 192 186 149Z"/>
        <path d="M249 102L279 121 293 172 275 208 242 192 234 149Z"/>
        <path d="M183 102L210 92 237 102 265 132 252 238 236 271 184 271 168 238 155 132Z"/>
        <path d="M168 235L190 266 230 266 252 235 263 304 235 329 185 329 157 304Z"/>
        <path d="M183 312L201 326 219 326 237 312 245 358 226 375 194 375 175 358Z"/>
        <path d="M128 176L107 188 94 230 108 252 127 238 142 204Z"/>
        <path d="M292 176L313 188 326 230 312 252 293 238 278 204Z"/>
        <path d="M94 247L108 252 119 309 99 316 82 294Z"/>
        <path d="M326 247L312 252 301 309 321 316 338 294Z"/>
        <path d="M171 319L199 330 221 330 249 319 269 404 238 423 182 423 151 404Z"/>
        <path d="M181 414L239 414 251 463 228 477 192 477 169 463Z"/>
        <path d="M164 459L194 470 188 563 159 583 142 563 151 480Z"/>
        <path d="M256 459L226 470 232 563 261 583 278 563 269 480Z"/>
        <path d="M143 557L170 564 167 650 148 697 123 697 132 648Z"/>
        <path d="M277 557L250 564 253 650 272 697 297 697 288 648Z"/>
      </g>
      <g fill="none" stroke="#77e2ff" stroke-linecap="round">
        <path d="M189 66Q210 54 231 66" stroke-width="5" opacity=".55"/>
        <path d="M178 129L210 114 242 129M176 154L210 136 244 154" stroke-width="3" opacity=".7"/>
        <path d="M171 191L210 178 249 191" stroke-width="3" opacity=".45"/>
        <path d="M108 215L127 206M312 215L293 206M101 276L116 279M319 276L304 279" stroke-width="4"/>
        <path d="M169 343L187 351M251 343L233 351M158 397L186 386M262 397L234 386" stroke-width="3"/>
        <path d="M157 492L177 500M263 492L243 500M154 596L169 607M266 596L251 607" stroke-width="3"/>
      </g>
      <g filter="url(#ax-glow)"><circle cx="210" cy="258" r="48" fill="url(#ax-core)"/><path d="M174 258Q210 220 246 258Q210 296 174 258Z" fill="none" stroke="#b7f7ff" stroke-width="3" opacity=".9"/><circle cx="210" cy="258" r="15" fill="#ecffff"/><circle cx="210" cy="258" r="29" fill="none" stroke="#50d8ff" stroke-width="2" stroke-dasharray="6 8"/></g>
      <g fill="#b7f7ff" opacity=".9"><circle cx="210" cy="23" r="3"/><circle cx="99" cy="231" r="3"/><circle cx="321" cy="231" r="3"/><circle cx="148" cy="697" r="3"/><circle cx="272" cy="697" r="3"/></g>`;
    visual.appendChild(svg);

    const reactor=document.createElement('div');
    reactor.className='ax-reactor-shell';
    reactor.innerHTML='<canvas></canvas><div class="ax-reactor-label">ARC // CRITICAL CONTAINMENT</div>';
    visual.appendChild(reactor);
    startReactor(reactor.querySelector('canvas'));
  }

  function startReactor(canvas){
    const c=canvas.getContext('2d'); if(!c) return;
    let size=168;
    function rs(){const box=canvas.parentElement.getBoundingClientRect();size=Math.max(120,Math.min(box.width,box.height));canvas.width=Math.floor(size*1.8);canvas.height=Math.floor(size*1.8);canvas.style.width='100%';canvas.style.height='100%';}
    rs();window.addEventListener('resize',rs,{passive:true});
    const arcs=Array.from({length:9},(_,i)=>({phase:Math.random()*6.28,speed:(.004+.004*Math.random())*(i%2?-1:1),seed:Math.random()*999,amp:5+Math.random()*11}));
    function frame(){
      const w=canvas.width,h=canvas.height,scale=w/size;c.setTransform(scale,0,0,scale,0,0);c.clearRect(0,0,size,size);const cx=size/2,cy=size/2,r=size*.27;
      const pulse=1+.08*Math.sin(t*4.2)+.04*Math.sin(t*9.3);
      const g=c.createRadialGradient(cx,cy,2,cx,cy,r*2.2);g.addColorStop(0,'rgba(232,255,255,.95)');g.addColorStop(.12,'rgba(102,228,255,.75)');g.addColorStop(.38,'rgba(18,175,232,.25)');g.addColorStop(1,'rgba(0,65,100,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,r*2*pulse,0,Math.PI*2);c.fill();
      c.globalCompositeOperation='screen';
      arcs.forEach((a,i)=>{a.phase+=a.speed;const rr=r*(.72+.1*Math.sin(t*2+a.seed));c.beginPath();for(let q=0;q<=72;q++){const p=q/72*6.28;const wob=1+Math.sin(p*3+t*5+a.seed)*.035+Math.sin(p*7-t*3+a.seed)*.022;const rad=rr*wob + a.amp*Math.sin(p*4-t*7+a.seed);const x=cx+Math.cos(p+a.phase)*rad;const y=cy+Math.sin(p+a.phase)*(rad*.72);if(q===0)c.moveTo(x,y);else c.lineTo(x,y)}c.closePath();c.strokeStyle=`rgba(${120+i*8},${225+i*3},255,${.18+.08*Math.sin(t*3+a.seed)})`;c.lineWidth=1.2+(i%3)*.55;c.stroke();});
      for(let i=0;i<14;i++){const p=t*1.9+i*.44;const rr=r*(.55+.5*((i%3)/3));const x=cx+Math.cos(p)*rr,y=cy+Math.sin(p)*rr*.72;c.fillStyle='rgba(190,250,255,.78)';c.beginPath();c.arc(x,y,1.1+(i%2),0,Math.PI*2);c.fill();}
      c.globalCompositeOperation='source-over'; if(!prefersReduced) requestAnimationFrame(frame);
    }
    if(prefersReduced){return;} requestAnimationFrame(frame);
  }

  function pointerEffects(){
    document.addEventListener('pointermove',e=>{targetX=e.clientX/W;targetY=e.clientY/H;},{passive:true});
    const reactive=document.querySelectorAll('.system-card,.display-frame,.power-core-unit,.armor-system-diagram,.mobility-display,.ai-terminal,.mission-content');
    reactive.forEach(el=>{
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=((e.clientX-r.left)/r.width)*100;const y=((e.clientY-r.top)/r.height)*100;el.style.setProperty('--ax-mx',`${x}%`);el.style.setProperty('--ax-my',`${y}%`);}, {passive:true});
      el.addEventListener('pointerleave',()=>{el.style.setProperty('--ax-mx','50%');el.style.setProperty('--ax-my','50%');},{passive:true});
    });
  }

  function animationLoop(){
    targetX=clamp(targetX,.02,.98);targetY=clamp(targetY,.02,.98);mouseX+=(targetX-mouseX)*.025;mouseY+=(targetY-mouseY)*.025;t+=.011;
    drawMesh();drawCurrents();
    if(!prefersReduced) requestAnimationFrame(animationLoop);
  }

  resize(); rebuildMesh(); installSuit(); pointerEffects(); animationLoop();
  window.addEventListener('resize',()=>{resize();rebuildMesh();},{passive:true});
})();
