(() => {
  'use strict';

  const TWO_PI = Math.PI * 2;
  const style = document.createElement('style');
  style.textContent = `
    #armor-x-effects{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#010407}
    #armor-x-webgl{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:1}
    #app{position:relative;z-index:1}
    .site-background{z-index:-1!important;background:transparent!important}
    .armor-visual .ax-suit-svg{position:absolute;inset:4% 12%;width:76%;height:92%;z-index:5;pointer-events:none;filter:drop-shadow(0 0 12px rgba(80,220,255,.28));animation:axSuitDrift 2.9s ease-in-out infinite}
    .armor-visual.ax-enhanced .armor-silhouette{display:none!important}
    .ax-reactor-shell{position:absolute;left:50%;top:50%;width:min(58%,250px);aspect-ratio:1;transform:translate(-50%,-50%);z-index:8;pointer-events:none;mix-blend-mode:screen;filter:drop-shadow(0 0 24px rgba(60,220,255,.55))}
    .ax-reactor-shell canvas{width:100%;height:100%;display:block}
    .ax-reactor-label{position:absolute;left:50%;top:108%;transform:translateX(-50%);font:8px var(--mono,monospace);letter-spacing:.22em;color:#d9fcff;text-shadow:0 0 14px rgba(90,225,255,1);white-space:nowrap}
    @keyframes axSuitDrift{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}25%{transform:translate3d(3px,-10px,0) rotate(-.5deg)}55%{transform:translate3d(-3px,5px,0) rotate(.45deg)}78%{transform:translate3d(2px,-4px,0) rotate(-.2deg)}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'armor-x-effects';
  root.setAttribute('aria-hidden','true');
  const canvas = document.createElement('canvas');
  canvas.id = 'armor-x-webgl';
  root.appendChild(canvas);
  document.body.prepend(root);

  const gl = canvas.getContext('webgl', {alpha:false, antialias:false, powerPreference:'high-performance'});
  if (!gl) {
    console.error('[Armor X] WebGL unavailable');
    return;
  }

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.0,1.0);}
  `;

  const fragmentSource = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_pointer;

    #define PI 3.14159265359
    #define TAU 6.28318530718

    float hash21(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+34.5);return fract(p.x*p.y);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=hash21(i),b=hash21(i+vec2(1.,0.)),c=hash21(i+vec2(0.,1.)),d=hash21(i+vec2(1.,1.));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
    float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=noise(p)*a;p=p*2.02+7.13;a*=.5;}return v;}
    float gridLine(float x,float w){return 1.0-smoothstep(0.0,w,abs(fract(x)-.5));}
    float seg(float x,float a,float b,float blur){return smoothstep(a-blur,a,x)*(1.0-smoothstep(b,b+blur,x));}

    void main(){
      vec2 uv=v_uv;
      vec2 p=uv*2.0-1.0;
      float aspect=u_resolution.x/u_resolution.y;
      p.x*=aspect;
      p+= (u_pointer-.5)*.06;

      float t=u_time;
      float radius=length(p);
      float vign=1.0-smoothstep(.65,1.65,radius);
      vec3 col=vec3(.003,.008,.012);

      // Layered animated atmospheric field.
      float fog=fbm(p*2.0+vec2(t*.025,-t*.018));
      col+=vec3(.003,.028,.045)*fog;
      col+=vec3(.0,.035,.06)*(1.0-smoothstep(.1,1.35,radius));

      // Large cybermesh.
      vec2 g=p*vec2(11.0,15.5);
      g.y+=t*.85;
      g.x+=sin(t*.35)*.7;
      float gx=gridLine(g.x,.055);
      float gy=gridLine(g.y,.055);
      float gxm=gridLine(g.x*2.0,.025);
      float gym=gridLine(g.y*2.0,.025);
      float mesh=(gx+gy)*.9+(gxm+gym)*.22;
      float wave=.5+.5*sin(t*2.4+g.x*.65+g.y*.28);
      col+=vec3(.005,.095,.14)*mesh*(.6+.75*wave);

      // Sweeping energy fronts: unmistakable movement across the whole screen.
      float sweep1=seg(fract((uv.x*.72+uv.y*.38)-t*.12),.02,.08,.012);
      float sweep2=seg(fract((uv.x*.25-uv.y*.9)+t*.095),.41,.48,.014);
      float sweep3=seg(fract((uv.x*.9+uv.y*.18)+t*.055),.77,.835,.018);
      float sweeps=sweep1+sweep2+sweep3;
      col+=vec3(.02,.24,.34)*sweeps;
      col+=vec3(.3,.9,1.)*pow(sweeps,3.0)*.85;

      // Animated traveling nodes embedded in the grid.
      vec2 cellSize=vec2(11.0,15.5);
      vec2 cell=floor((p+vec2(aspect,1.0))*cellSize*.5);
      vec2 f=fract((p+vec2(aspect,1.0))*cellSize*.5)-.5;
      float nodePhase=hash21(cell)*TAU;
      float travel=fract(hash21(cell+3.1)+t*(.11+.08*hash21(cell+8.2)));
      float nodeRadius=.025+.018*sin(t*6.0+nodePhase);
      float node=smoothstep(nodeRadius,.0,length(f-vec2(0.45*sin(travel*TAU),0.45*cos(travel*TAU))));
      float pulse=.3+.7*(.5+.5*sin(t*8.0+nodePhase));
      col+=vec3(.02,.25,.34)*node*pulse;
      col+=vec3(.35,.95,1.)*pow(node,4.0)*pulse;

      // Moving diagonal electrical filaments.
      for(int i=0;i<7;i++){
        float fi=float(i);
        float n=hash21(vec2(fi,44.2));
        float a=fract(.13*fi+n+t*(.018+fi*.004));
        float d=abs(fract((p.x+p.y*.72)*3.2+n)-a);
        d=min(d,1.0-d);
        float filament=smoothstep(.035,0.0,d)*(1.0-smoothstep(1.0,0.15,abs(p.x+p.y*.72)));
        float flash=.5+.5*sin(t*(4.0+fi*.7)+n*20.0);
        col+=vec3(.0,.12,.2)*filament*(.5+.5*flash);
        col+=vec3(.22,.75,.95)*pow(filament,4.0)*flash;
      }

      // Dense drifting particle field.
      vec2 sid=floor((uv+vec2(t*.008,-t*.006))*vec2(54.,38.));
      vec2 sf=fract((uv+vec2(t*.008,-t*.006))*vec2(54.,38.))-.5;
      float sh=hash21(sid);
      float particle=smoothstep(.055,.0,length(sf));
      particle*=step(.79,sh);
      float twinkle=.25+.75*(.5+.5*sin(t*(2.0+sh*8.0)+sh*50.0));
      col+=vec3(.12,.52,.7)*particle*twinkle;

      // Central electromagnetic disturbance behind the suit.
      float core=smoothstep(.6,.03,radius);
      float rings=.5+.5*sin(radius*54.0-t*5.5+sin(t*2.0+radius*10.0));
      col+=vec3(.0,.025,.05)*core;
      col+=vec3(.01,.13,.19)*rings*core*.25;

      // Vertical scan pulse.
      float scan=pow(smoothstep(.0,.018,abs(fract(uv.y-t*.16)-.5)),2.0);
      col+=vec3(.02,.12,.18)*scan;

      col*=vign+.28;
      gl_FragColor=vec4(col,1.0);
    }
  `;

  function shader(type, source){
    const s=gl.createShader(type);
    gl.shaderSource(s,source);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)||'shader compile failed');
    return s;
  }

  let program;
  try{
    const vs=shader(gl.VERTEX_SHADER,vertexSource);
    const fs=shader(gl.FRAGMENT_SHADER,fragmentSource);
    program=gl.createProgram();
    gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program)||'program link failed');
  }catch(err){
    console.error('[Armor X] WebGL shader error',err);
    root.remove();
    return;
  }

  const quad=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,quad);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'a_position');
  const resolution=gl.getUniformLocation(program,'u_resolution');
  const time=gl.getUniformLocation(program,'u_time');
  const pointer=gl.getUniformLocation(program,'u_pointer');

  let width=innerWidth,height=innerHeight,dpr=1;
  let pointerX=.5,pointerY=.5;
  let targetX=.5,targetY=.5;

  function resize(){
    width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);
    canvas.style.width=width+'px';canvas.style.height=height+'px';
    gl.viewport(0,0,canvas.width,canvas.height);
  }

  function draw(now){
    pointerX+=(targetX-pointerX)*.045;
    pointerY+=(targetY-pointerY)*.045;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,quad);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    gl.uniform2f(resolution,width,height);
    gl.uniform1f(time,now*.001);
    gl.uniform2f(pointer,pointerX,pointerY);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    requestAnimationFrame(draw);
  }

  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{targetX=e.clientX/Math.max(1,width);targetY=e.clientY/Math.max(1,height)},{passive:true});
  addEventListener('pointerleave',()=>{targetX=.5;targetY=.5},{passive:true});
  resize();
  requestAnimationFrame(draw);

  function installSuit(){
    const visual=document.querySelector('.armor-visual');
    if(!visual)return;
    visual.classList.add('ax-enhanced');
    if(!visual.querySelector('.ax-suit-svg')){
      const ns='http://www.w3.org/2000/svg';
      const svg=document.createElementNS(ns,'svg');
      svg.classList.add('ax-suit-svg');svg.setAttribute('viewBox','0 0 420 760');svg.setAttribute('aria-hidden','true');
      svg.innerHTML=`<defs><linearGradient id="axMetal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071118"/><stop offset=".45" stop-color="#324a57"/><stop offset=".72" stop-color="#081219"/><stop offset="1" stop-color="#4a7887"/></linearGradient><radialGradient id="axCore"><stop stop-color="#fff"/><stop offset=".13" stop-color="#d8ffff"/><stop offset=".34" stop-color="#42dcff" stop-opacity=".96"/><stop offset="1" stop-color="#079bda" stop-opacity="0"/></radialGradient></defs><g fill="url(#axMetal)" stroke="#79e1ff" stroke-opacity=".74" stroke-width="2"><path d="M184 55l10-24 16-12 16 12 10 24-6 40-12 12h-16l-12-12z"/><path d="M181 102l-42 27-14 50 21 43 35-20 6-53z"/><path d="M239 102l42 27 14 50-21 43-35-20-6-53z"/><path d="M183 101l27-11 27 11 27 32-13 105-16 34h-51l-16-34-13-105z"/><path d="M170 231l20 35h40l20-35 13 73-28 28h-50l-28-28z"/><path d="M166 315l44 15 44-15 19 91-35 20h-56l-35-20z"/><path d="M128 177l-24 14-14 47 15 22 21-14 16-42z"/><path d="M292 177l24 14 14 47-15 22-21-14-16-42z"/><path d="M165 399l45 20 45-20 12 64-27 102-30 24-30-24-27-102z"/><path d="M154 560l36 14-7 94-18 38h-29l8-54z"/><path d="M266 560l-36 14 7 94 18 38h29l-8-54z"/></g><g fill="none" stroke="#c7faff" stroke-linecap="round"><path d="M188 69q22-18 44 0" stroke-width="4"/><path d="M175 130l35-17 35 17M171 158l39-22 39 22" stroke-width="3"/><path d="M169 350l41-13 41 13" stroke-width="3"/><path d="M150 216l26-13M270 203l-26 13" stroke-width="4"/><path d="M156 454l25 8M264 454l-25 8M154 500l26-10M266 500l-26-10" stroke-width="3" opacity=".8"/></g><circle cx="210" cy="245" r="58" fill="url(#axCore)"/><circle cx="210" cy="245" r="15" fill="#f7ffff"/><circle cx="210" cy="245" r="32" fill="none" stroke="#68ddff" stroke-width="2" stroke-dasharray="7 10"/>`;
      visual.appendChild(svg);
    }

    const old=visual.querySelector('.ax-reactor-shell');if(old)old.remove();
    const reactor=document.createElement('div');reactor.className='ax-reactor-shell';
    const rc=document.createElement('canvas');reactor.appendChild(rc);
    const label=document.createElement('div');label.className='ax-reactor-label';label.textContent='ARC // CRITICAL';reactor.appendChild(label);
    visual.appendChild(reactor);
    startReactor(rc);
  }

  function startReactor(canvas){
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx)return;
    const loops=Array.from({length:12},()=>({phase:Math.random()*TWO_PI,speed:-1.2+Math.random()*2.4,seed:Math.random()*100,tilt:.5+Math.random()*.45}));
    const sparks=Array.from({length:36},()=>({angle:Math.random()*TWO_PI,r:.5+Math.random()*.55,speed:.4+Math.random()*1.8,phase:Math.random()*TWO_PI}));
    let size=160,dpr=1;

    function resize(){
      const b=canvas.parentElement.getBoundingClientRect();
      size=Math.max(130,Math.floor(Math.min(b.width,b.height)));
      dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.floor(size*dpr);canvas.height=Math.floor(size*dpr);canvas.style.width=size+'px';canvas.style.height=size+'px';
    }

    function frame(now){
      const t=now*.001;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,size,size);
      const cx=size/2,cy=size/2;
      const r=size*.25;
      const pulse=1+.18*Math.sin(t*7.0)+.08*Math.sin(t*15.0);

      const halo=ctx.createRadialGradient(cx,cy,2,cx,cy,r*2.8);
      halo.addColorStop(0,'rgba(255,255,255,.9)');halo.addColorStop(.12,'rgba(92,236,255,.8)');halo.addColorStop(.4,'rgba(16,161,218,.24)');halo.addColorStop(1,'rgba(0,20,35,0)');
      ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*2.8,0,TWO_PI);ctx.fill();

      for(let i=0;i<loops.length;i++){
        const a=loops[i];
        ctx.save();ctx.translate(cx,cy);ctx.rotate(a.phase+t*a.speed*.55);ctx.scale(1,a.tilt);
        ctx.beginPath();
        for(let k=0;k<=150;k++){
          const q=k/150,ang=q*TWO_PI;
          const wobble=1+.12*Math.sin(ang*5+t*(2.6+a.seed*.035)+a.seed)+.07*Math.sin(ang*11-t*3.2);
          const rr=r*(.72+i*.035)*wobble*pulse;
          const x=Math.cos(ang)*rr,y=Math.sin(ang)*rr;
          if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.closePath();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=`rgba(${105+i*8},${226+Math.min(i*2,25)},255,${.18+(i%4)*.045})`;ctx.lineWidth=.8+(i%3)*.42;ctx.shadowBlur=16;ctx.shadowColor='rgba(68,225,255,.9)';ctx.stroke();ctx.restore();
      }

      // Violent branching arcs.
      for(let j=0;j<9;j++){
        const base=t*(.4+j*.11)+j*.73;
        ctx.save();ctx.translate(cx,cy);ctx.rotate(base);ctx.beginPath();
        for(let k=0;k<24;k++){
          const q=k/23;const rr=r*(.18+1.18*q);const jitter=Math.sin(k*3.7+t*13+j)*size*.035*(1-q*.4);
          const x=rr,y=jitter+Math.sin(k*1.8+t*7+j)*size*.025;
          if(k===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
        }
        ctx.strokeStyle='rgba(177,248,255,.62)';ctx.lineWidth=1.1;ctx.shadowBlur=20;ctx.shadowColor='rgba(69,227,255,1)';ctx.stroke();ctx.restore();
      }

      for(const s of sparks){
        s.angle+=.012*s.speed;
        const rr=r*(.72+.26*Math.sin(t*s.speed+s.phase));
        const x=cx+Math.cos(s.angle)*rr,y=cy+Math.sin(s.angle)*rr*.82;
        const a=.2+.8*(.5+.5*Math.sin(t*9+s.phase));
        ctx.fillStyle=`rgba(203,252,255,${a})`;ctx.shadowBlur=10;ctx.shadowColor='rgba(80,225,255,1)';ctx.beginPath();ctx.arc(x,y,1+a*1.3,0,TWO_PI);ctx.fill();
      }

      const core=ctx.createRadialGradient(cx,cy,1,cx,cy,r*.7*pulse);
      core.addColorStop(0,'rgba(255,255,255,1)');core.addColorStop(.08,'rgba(207,255,255,1)');core.addColorStop(.22,'rgba(64,222,255,.95)');core.addColorStop(.62,'rgba(8,127,179,.28)');core.addColorStop(1,'rgba(0,25,42,0)');
      ctx.fillStyle=core;ctx.beginPath();ctx.arc(cx,cy,r*.7*pulse,0,TWO_PI);ctx.fill();
      ctx.strokeStyle='rgba(233,255,255,.98)';ctx.lineWidth=2;ctx.shadowBlur=20;ctx.shadowColor='rgba(75,231,255,1)';ctx.beginPath();ctx.arc(cx,cy,r*.16*(1+.18*Math.sin(t*11)),0,TWO_PI);ctx.stroke();
      requestAnimationFrame(frame);
    }
    resize();addEventListener('resize',resize,{passive:true});requestAnimationFrame(frame);
  }

  installSuit();
})();
