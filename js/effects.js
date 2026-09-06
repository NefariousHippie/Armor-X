(() => {
  'use strict';

  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia?.('(max-width: 720px)').matches;

  const style = document.createElement('style');
  style.textContent = `
    #armor-x-effects{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#02070a}
    #armor-x-webgl{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:.98}
    #app{position:relative;z-index:1}
    .site-background{z-index:-1!important;background:transparent!important}
    .armor-visual .ax-suit-svg{position:absolute;inset:5% 13%;width:74%;height:90%;z-index:5;overflow:visible;pointer-events:none;filter:drop-shadow(0 0 10px rgba(92,220,255,.22)) drop-shadow(0 0 24px rgba(92,220,255,.1));animation:axSuitDrift 3.6s ease-in-out infinite}
    .armor-visual.ax-enhanced .armor-silhouette{display:none!important}
    .ax-reactor-shell{position:absolute;left:50%;top:50%;width:min(54%,240px);aspect-ratio:1;transform:translate(-50%,-50%);z-index:7;pointer-events:none;mix-blend-mode:screen;filter:drop-shadow(0 0 22px rgba(64,215,255,.36))}
    .ax-reactor-shell canvas{display:block;width:100%;height:100%}
    .ax-reactor-label{position:absolute;left:50%;top:108%;transform:translateX(-50%);font:8px var(--mono,monospace);letter-spacing:.22em;color:#d7fbff;text-shadow:0 0 14px rgba(91,211,255,.95);white-space:nowrap}
    @keyframes axSuitDrift{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}30%{transform:translate3d(2px,-8px,0) rotate(-.3deg)}63%{transform:translate3d(-3px,3px,0) rotate(.28deg)}82%{transform:translate3d(1px,-2px,0) rotate(-.08deg)}}
    @media(prefers-reduced-motion:reduce){.armor-visual .ax-suit-svg{animation:none!important}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'armor-x-effects';
  root.setAttribute('aria-hidden', 'true');
  const bg = document.createElement('canvas');
  bg.id = 'armor-x-webgl';
  root.appendChild(bg);
  document.body.prepend(root);

  const gl = bg.getContext('webgl', {alpha:false, antialias:false, powerPreference:'high-performance'});
  if (!gl) return;

  const vertex = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main(){
      v_uv=a_position*.5+.5;
      gl_Position=vec4(a_position,0.0,1.0);
    }
  `;

  const fragment = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_pointer;

    #define PI 3.14159265359
    #define TAU 6.28318530718

    float hash21(vec2 p){
      p=fract(p*vec2(123.34,456.21));
      p+=dot(p,p+45.32);
      return fract(p.x*p.y);
    }

    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p);
      f=f*f*(3.0-2.0*f);
      float a=hash21(i),b=hash21(i+vec2(1.,0.)),c=hash21(i+vec2(0.,1.)),d=hash21(i+vec2(1.,1.));
      return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
    }

    float fbm(vec2 p){
      float v=0.0,a=.5;
      for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+7.1;a*=.5;}
      return v;
    }

    float line(float x,float width){return smoothstep(width,0.0,abs(x));}

    float movingCurrent(vec2 p,float lane,float seed){
      float y=fract(p.y+u_time*(.035+seed*.012)+sin(p.x*5.0+seed)*.02);
      float d=abs(y-lane);
      d=min(d,1.0-d);
      float pulse=0.5+0.5*sin((p.x*7.0+p.y*13.0-u_time*(3.5+seed*2.0))+seed*9.0);
      return line(d,.012+.005*pulse)*(0.35+0.65*pulse);
    }

    void main(){
      vec2 uv=v_uv;
      vec2 p=uv*2.0-1.0;
      p.x*=u_resolution.x/u_resolution.y;

      vec2 par=(u_pointer-.5)*.075;
      p+=par;

      float vign=1.0-smoothstep(.5,1.45,length(p));
      float depth=clamp(1.0-length(p)*.28,0.45,1.0);

      vec3 col=vec3(.003,.009,.013);

      // Deep technological haze.
      float haze=fbm(p*1.7+vec2(0.,u_time*.018));
      col+=vec3(.005,.02,.028)*haze;
      col+=vec3(.0,.025,.045)*smoothstep(.05,1.0,1.0-length(p));

      // Perspective cybermesh.
      vec2 gp=p*vec2(11.5,14.0);
      gp.y+=u_time*.55;
      float gridX=line(fract(gp.x)-.5,.028);
      float gridY=line(fract(gp.y)-.5,.028);
      float microX=line(fract(gp.x*2.0)-.5,.012);
      float microY=line(fract(gp.y*2.0)-.5,.012);
      float grid=(gridX+gridY)*.75+(microX+microY)*.22;

      float depthFade=pow(clamp(1.15-abs(p.y)*.7,0.,1.),1.35);
      float meshGlow=grid*depthFade*(.16+.15*(.5+.5*sin(u_time*1.8+gp.x*1.3)));
      col+=vec3(.01,.13,.19)*meshGlow;

      // Long-form electrical lanes crossing and bending through the field.
      float current=0.0;
      for(int i=0;i<12;i++){
        float fi=float(i);
        float lane=fract(fi*.083+hash21(vec2(fi,9.7))*.72);
        current+=movingCurrent(uv,lane,hash21(vec2(fi,22.4)))*(.55+.45*hash21(vec2(fi,2.1)));
      }
      current*=smoothstep(.12,1.0,vign+.15);
      col+=vec3(.02,.22,.34)*current;
      col+=vec3(.22,.67,.9)*pow(current,4.0)*.9;

      // Diagonal branching filaments.
      float warp=noise(p*5.0+u_time*.12)-.5;
      vec2 q=p+vec2(warp*.11,sin(p.x*3.0+u_time)*.025);
      float branch1=line(fract(q.x*8.0+q.y*1.7+u_time*.11)-.5,.015);
      float branch2=line(fract(q.y*9.0-q.x*2.1-u_time*.09)-.5,.012);
      float branches=(branch1+branch2)*smoothstep(1.1,.08,length(p));
      col+=vec3(.0,.15,.23)*branches;
      col+=vec3(.22,.8,1.)*pow(branches,5.0)*.55;

      // Node field.
      vec2 cell=fract((p+vec2(.5))*vec2(13.,18.));
      vec2 id=floor((p+vec2(.5))*vec2(13.,18.));
      vec2 local=cell-.5;
      float node=length(local);
      float nodePulse=.5+.5*sin(u_time*3.2+hash21(id)*TAU);
      float nodeGlow=smoothstep(.06,.0,node)*(.3+.7*nodePulse);
      float nodeHalo=smoothstep(.18,.0,node)*.16*nodePulse;
      col+=vec3(.03,.25,.33)*(nodeGlow+nodeHalo);

      // Random-looking star/electric particle field.
      vec2 sp=floor((p+2.0)*vec2(38.,28.));
      float sh=hash21(sp);
      float drift=fract(sh+u_time*(.035+.05*hash21(sp+4.))); 
      vec2 particlePos=fract(vec2(hash21(sp+1.7),hash21(sp+8.4))+vec2(u_time*.012*fract(sh*7.0),drift*.14))-.5;
      float particle=smoothstep(.045,.0,length(cell-vec2(sh,fract(sh*13.0))));
      particle*=step(.89,sh);
      col+=vec3(.2,.72,.92)*particle*depth;

      // Center energy well: the field visually converges toward the suit / ARC region.
      float radius=length(p-vec2(0,.02));
      float core=smoothstep(.48,.08,radius);
      col+=vec3(.0,.035,.05)*core;

      col*=vign+.22;
      col+=vec3(.003,.012,.017)*(1.0-vign);
      gl_FragColor=vec4(col,1.0);
    }
  `;

  function compile(type, source){
    const shader=gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader)||'shader compile failed');
    return shader;
  }

  let program;
  try{
    const vs=compile(gl.VERTEX_SHADER,vertex);
    const fs=compile(gl.FRAGMENT_SHADER,fragment);
    program=gl.createProgram();
    gl.attachShader(program,vs);
    gl.attachShader(program,fs);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)||'program link failed');
  }catch(error){
    console.error('[Armor X] WebGL init failed',error);
    root.remove();
    return;
  }

  const buffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);

  const locPos=gl.getAttribLocation(program,'a_position');
  const locRes=gl.getUniformLocation(program,'u_resolution');
  const locTime=gl.getUniformLocation(program,'u_time');
  const locPointer=gl.getUniformLocation(program,'u_pointer');

  let width=0,height=0,dpr=1;
  let px=.5,py=.5,tx=.5,ty=.5;

  function resize(){
    width=window.innerWidth;
    height=window.innerHeight;
    dpr=Math.min(window.devicePixelRatio||1,2);
    bg.width=Math.floor(width*dpr);
    bg.height=Math.floor(height*dpr);
    bg.style.width=width+'px';
    bg.style.height=height+'px';
    gl.viewport(0,0,bg.width,bg.height);
  }

  function render(time){
    tx+=(px-tx)*.04;
    ty+=(py-ty)*.04;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos,2,gl.FLOAT,false,0,0);
    gl.uniform2f(locRes,width,height);
    gl.uniform1f(locTime,prefersReduced?0:time*.001);
    gl.uniform2f(locPointer,tx,ty);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    requestAnimationFrame(render);
  }

  window.addEventListener('resize',resize,{passive:true});
  window.addEventListener('pointermove',event=>{
    px=Math.min(1,Math.max(0,event.clientX/Math.max(1,width)));
    py=Math.min(1,Math.max(0,event.clientY/Math.max(1,height)));
  },{passive:true});
  window.addEventListener('pointerleave',()=>{px=.5;py=.5},{passive:true});

  resize();
  requestAnimationFrame(render);

  function installSuit(){
    const visual=document.querySelector('.armor-visual');
    if(!visual) return;
    visual.classList.add('ax-enhanced');
    if(!visual.querySelector('.ax-suit-svg')){
      const ns='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(ns,'svg');
      svg.classList.add('ax-suit-svg');
      svg.setAttribute('viewBox','0 0 420 760');
      svg.setAttribute('aria-hidden','true');
      svg.innerHTML=`
        <defs>
          <linearGradient id="axMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071118"/><stop offset=".45" stop-color="#314955"/><stop offset=".72" stop-color="#09141a"/><stop offset="1" stop-color="#3f6e7c"/></linearGradient>
          <radialGradient id="axCore"><stop stop-color="#fff"/><stop offset=".12" stop-color="#d4feff"/><stop offset=".35" stop-color="#47dbff" stop-opacity=".95"/><stop offset="1" stop-color="#0da5db" stop-opacity="0"/></radialGradient>
        </defs>
        <g fill="url(#axMetal)" stroke="#79e1ff" stroke-opacity=".7" stroke-width="2">
          <path d="M184 55l10-24 16-12 16 12 10 24-6 40-12 12h-16l-12-12z"/>
          <path d="M181 102l-42 27-14 50 21 43 35-20 6-53z"/>
          <path d="M239 102l42 27 14 50-21 43-35-20-6-53z"/>
          <path d="M183 101l27-11 27 11 27 32-13 105-16 34h-51l-16-34-13-105z"/>
          <path d="M170 231l20 35h40l20-35 13 73-28 28h-50l-28-28z"/>
          <path d="M166 315l44 15 44-15 19 91-35 20h-56l-35-20z"/>
          <path d="M128 177l-24 14-14 47 15 22 21-14 16-42z"/>
          <path d="M292 177l24 14 14 47-15 22-21-14-16-42z"/>
          <path d="M165 399l45 20 45-20 12 64-27 102-30 24-30-24-27-102z"/>
          <path d="M154 560l36 14-7 94-18 38h-29l8-54z"/>
          <path d="M266 560l-36 14 7 94 18 38h29l-8-54z"/>
        </g>
        <g fill="none" stroke="#c0f8ff" stroke-linecap="round">
          <path d="M188 69q22-18 44 0" stroke-width="4"/>
          <path d="M175 130l35-17 35 17M171 158l39-22 39 22" stroke-width="3"/>
          <path d="M169 350l41-13 41 13" stroke-width="3"/>
          <path d="M150 216l26-13M270 203l-26 13" stroke-width="4"/>
          <path d="M156 454l25 8M264 454l-25 8M154 500l26-10M266 500l-26-10" stroke-width="3" opacity=".78"/>
        </g>
        <g><circle cx="210" cy="245" r="58" fill="url(#axCore)"/><circle cx="210" cy="245" r="15" fill="#f3ffff"/><circle cx="210" cy="245" r="32" fill="none" stroke="#68ddff" stroke-width="2" stroke-dasharray="7 10"/></g>
      `;
      visual.appendChild(svg);
    }
    let reactor=visual.querySelector('.ax-reactor-shell');
    if(reactor) reactor.remove();
    reactor=document.createElement('div');
    reactor.className='ax-reactor-shell';
    const canvas=document.createElement('canvas');
    reactor.appendChild(canvas);
    const label=document.createElement('div');
    label.className='ax-reactor-label';
    label.textContent='ARC // CRITICAL';
    reactor.appendChild(label);
    visual.appendChild(reactor);
    initReactor(canvas);
  }

  function initReactor(canvas){
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx) return;
    let cw=0,ch=0,cdpr=1;
    const loops=Array.from({length:10},(_,i)=>({phase:Math.random()*TAU,speed:(Math.random()-.5)*1.7,seed:Math.random()*99,tilt:.55+Math.random()*.38}));
    const sparks=Array.from({length:30},()=>({a:Math.random()*TAU,r:.25+Math.random()*.72,v:.45+Math.random()*1.7,phase:Math.random()*TAU}));

    function size(){
      const b=canvas.parentElement.getBoundingClientRect();
      cw=Math.max(120,Math.floor(b.width));
      ch=cw;
      cdpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.floor(cw*cdpr);
      canvas.height=Math.floor(ch*cdpr);
      canvas.style.width=cw+'px';
      canvas.style.height=ch+'px';
    }

    function frame(now){
      const t=now*.001;
      ctx.setTransform(cdpr,0,0,cdpr,0,0);
      ctx.clearRect(0,0,cw,ch);
      const cx=cw/2,cy=ch/2;
      const base=cw*.26;
      const pulse=1+.15*Math.sin(t*6.6)+.06*Math.sin(t*15.7);

      const glow=ctx.createRadialGradient(cx,cy,2,cx,cy,base*2.9);
      glow.addColorStop(0,'rgba(255,255,255,.95)');
      glow.addColorStop(.08,'rgba(101,235,255,.85)');
      glow.addColorStop(.34,'rgba(26,165,218,.25)');
      glow.addColorStop(1,'rgba(0,40,65,0)');
      ctx.fillStyle=glow;
      ctx.beginPath();ctx.arc(cx,cy,base*2.8,0,TAU);ctx.fill();

      for(let i=0;i<loops.length;i++){
        const a=loops[i];
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(a.phase+t*a.speed*.35);
        ctx.scale(1,a.tilt);
        ctx.beginPath();
        const pts=110;
        for(let k=0;k<=pts;k++){
          const q=k/pts;
          const ang=q*TAU;
          const wobble=1+.13*Math.sin(ang*4+t*(2.6+a.seed*.03)+a.seed)+.07*Math.sin(ang*9-t*3.1);
          const rr=base*(.72+.055*i)*wobble*pulse;
          const x=Math.cos(ang)*rr;
          const y=Math.sin(ang)*rr;
          if(k===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.strokeStyle=`rgba(${110+Math.floor(i*6)},${231+Math.min(24,i*2)},255,${.18+.055*(i%3)})`;
        ctx.lineWidth=.8+(i%3)*.35;
        ctx.globalCompositeOperation='lighter';
        ctx.shadowBlur=12;
        ctx.shadowColor='rgba(68,220,255,.75)';
        ctx.stroke();
        ctx.restore();
      }

      // Irregular electrical filaments.
      for(let j=0;j<7;j++){
        const ang=t*(.35+j*.11)+j*0.83;
        ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);
        ctx.beginPath();
        const start=base*.35,end=base*1.35;
        for(let k=0;k<18;k++){
          const q=k/17;
          const rr=start+(end-start)*q;
          const jitter=Math.sin(q*17+t*10+j*3.1)*base*.06*(1-q*.4);
          const x=rr;
          const y=jitter+Math.sin(q*9+t*5+j)*base*.04;
          if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.strokeStyle='rgba(140,245,255,.55)';
        ctx.lineWidth=1.1;
        ctx.shadowBlur=16;ctx.shadowColor='rgba(80,225,255,.9)';
        ctx.stroke();ctx.restore();
      }

      for(const s of sparks){
        s.a+=.0016*s.v*now;
        const rr=base*(.7+.28*Math.sin(t*s.v+s.phase));
        const x=cx+Math.cos(s.a)*rr;
        const y=cy+Math.sin(s.a)*rr*.8;
        const alpha=.25+.65*(.5+.5*Math.sin(t*8+s.phase));
        ctx.fillStyle=`rgba(188,251,255,${alpha})`;
        ctx.shadowBlur=9;ctx.shadowColor='rgba(84,220,255,.9)';
        ctx.beginPath();ctx.arc(x,y,1.1+(alpha*1.2),0,TAU);ctx.fill();
      }

      const core=ctx.createRadialGradient(cx,cy,1,cx,cy,base*.62*pulse);
      core.addColorStop(0,'rgba(255,255,255,1)');
      core.addColorStop(.08,'rgba(190,254,255,.98)');
      core.addColorStop(.25,'rgba(58,219,255,.92)');
      core.addColorStop(.7,'rgba(9,123,174,.24)');
      core.addColorStop(1,'rgba(0,32,52,0)');
      ctx.fillStyle=core;
      ctx.beginPath();ctx.arc(cx,cy,base*.66*pulse,0,TAU);ctx.fill();

      ctx.strokeStyle='rgba(220,255,255,.96)';
      ctx.lineWidth=2;
      ctx.shadowBlur=18;ctx.shadowColor='rgba(73,230,255,1)';
      ctx.beginPath();ctx.arc(cx,cy,base*.16*(1+.12*Math.sin(t*9)),0,TAU);ctx.stroke();

      if(!prefersReduced) requestAnimationFrame(frame);
    }
    size();
    window.addEventListener('resize',size,{passive:true});
    frame(performance.now());
  }

  installSuit();
})();
