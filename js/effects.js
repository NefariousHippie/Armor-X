(() => {
  'use strict';

  const TWO_PI = Math.PI * 2;

  function addMotionLayer() {
    if (document.getElementById('ax-motion-layer')) return;

    const style = document.createElement('style');
    style.textContent = `
      #ax-motion-layer {
        position: fixed;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        background:
          radial-gradient(circle at 50% 50%, rgba(0,210,255,.10), transparent 32%),
          radial-gradient(circle at 15% 25%, rgba(0,160,255,.06), transparent 28%),
          radial-gradient(circle at 85% 70%, rgba(20,255,220,.05), transparent 26%);
      }
      #ax-motion-layer::before {
        content: '';
        position: absolute;
        inset: -30%;
        background-image:
          linear-gradient(rgba(0,220,255,.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,220,255,.12) 1px, transparent 1px);
        background-size: 56px 56px;
        transform: perspective(900px) rotateX(62deg) translateY(-12%);
        transform-origin: center;
        animation: axGridDrift 8s linear infinite;
        opacity: .75;
      }
      #ax-motion-layer::after {
        content: '';
        position: absolute;
        inset: -20%;
        background:
          linear-gradient(115deg, transparent 0 43%, rgba(0,240,255,.0) 46%, rgba(0,240,255,.55) 49%, rgba(0,240,255,0) 52%, transparent 56%),
          linear-gradient(295deg, transparent 0 44%, rgba(40,255,220,.0) 47%, rgba(40,255,220,.38) 49%, rgba(40,255,220,0) 51%, transparent 54%);
        background-size: 70% 70%, 90% 90%;
        animation: axEnergySweep 3.2s linear infinite;
        mix-blend-mode: screen;
        opacity: .8;
      }
      .ax-motion-node {
        position: absolute;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #9ff8ff;
        box-shadow: 0 0 8px #00eaff, 0 0 20px rgba(0,220,255,.8);
        animation: axNodePulse 1.6s ease-in-out infinite, axNodeTravel var(--travel, 7s) linear infinite;
      }
      .ax-motion-line {
        position: absolute;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(0,235,255,.9), transparent);
        box-shadow: 0 0 8px rgba(0,220,255,.8);
        transform-origin: left center;
        animation: axLineTravel var(--duration, 5s) linear infinite;
      }
      @keyframes axGridDrift {
        from { background-position: 0 0, 0 0; }
        to   { background-position: 56px 56px, 56px 56px; }
      }
      @keyframes axEnergySweep {
        from { transform: translate3d(-15%, -8%, 0); }
        to   { transform: translate3d(15%, 8%, 0); }
      }
      @keyframes axNodePulse {
        0%,100% { opacity: .25; transform: scale(.65); }
        50% { opacity: 1; transform: scale(1.35); }
      }
      @keyframes axNodeTravel {
        from { left: -5%; }
        to { left: 105%; }
      }
      @keyframes axLineTravel {
        from { transform: translateX(-30vw) rotate(var(--angle, 0deg)); opacity: 0; }
        15% { opacity: 1; }
        85% { opacity: 1; }
        to { transform: translateX(130vw) rotate(var(--angle, 0deg)); opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        #ax-motion-layer::before,
        #ax-motion-layer::after,
        .ax-motion-node,
        .ax-motion-line { animation-duration: .001ms !important; animation-iteration-count: 1 !important; }
      }
    `;
    document.head.appendChild(style);

    const layer = document.createElement('div');
    layer.id = 'ax-motion-layer';
    document.body.prepend(layer);

    const nodeData = [
      [7,18,6.2],[18,63,8.1],[29,31,7.4],[41,76,9.3],[53,17,6.8],
      [65,57,8.7],[76,27,7.1],[89,72,9.8],[95,42,6.6],[12,88,10.2]
    ];
    nodeData.forEach(([x,y,t], i) => {
      const n = document.createElement('span');
      n.className = 'ax-motion-node';
      n.style.left = `${x}%`;
      n.style.top = `${y}%`;
      n.style.setProperty('--travel', `${t}s`);
      n.style.animationDelay = `${-(i * .67)}s, ${-(i * .91)}s`;
      layer.appendChild(n);
    });

    const lineData = [
      [12,22,38,-8,5.5],[42,31,28,7,4.4],[68,18,34,-5,6.2],[18,55,46,4,7.1],
      [53,68,41,-11,5.8],[76,78,36,8,6.7],[4,84,32,-4,4.8]
    ];
    lineData.forEach(([x,y,w,angle,d], i) => {
      const line = document.createElement('span');
      line.className = 'ax-motion-line';
      line.style.left = `${x}%`;
      line.style.top = `${y}%`;
      line.style.width = `${w}vw`;
      line.style.setProperty('--angle', `${angle}deg`);
      line.style.setProperty('--duration', `${d}s`);
      line.style.animationDelay = `${-(i * .83)}s`;
      layer.appendChild(line);
    });
  }

  function buildWebGL() {
    if (!window.WebGLRenderingContext) return null;
    const canvas = document.createElement('canvas');
    canvas.id = 'armor-x-webgl';
    canvas.setAttribute('aria-hidden', 'true');

    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'high-performance' });
    if (!gl) return null;

    const vertexSource = `attribute vec2 a_position; void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
    const fragmentSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_pointer;
      float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution.xy;
        vec2 p=(gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;
        float t=u_time;
        float g=0.0;
        vec2 gp=p*28.0;
        float gx=abs(fract(gp.x)-.5), gy=abs(fract(gp.y)-.5);
        g += smoothstep(.035,.0,gx)+smoothstep(.035,.0,gy);
        float wave=sin((p.x+p.y)*7.0-t*1.9)*.5+.5;
        float sweep=smoothstep(.0,.018,abs(fract((p.x*1.7-p.y*.9)-t*.12)-.5));
        float plasma=fbm(p*4.5+vec2(t*.16,-t*.11));
        vec3 c=vec3(0.0,0.02,0.03);
        c+=vec3(0.0,.12,.18)*g*(.55+.45*sin(t+g));
        c+=vec3(0.0,.18,.25)*pow(wave,8.0);
        c+=vec3(.0,.35,.42)*sweep*(.35+.65*plasma);
        float radial=exp(-4.0*length(p))*(.35+.65*sin(t*3.2+length(p)*28.0));
        c+=vec3(0.0,.18,.25)*max(radial,0.0);
        c+=vec3(.0,.03,.05)*(1.0-length(uv-.5)*1.35);
        gl_FragColor=vec4(c,0.92);
      }
    `;

    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Armor X shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    const vs = compile(gl.VERTEX_SHADER, vertexSource);
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Armor X shader link error:', gl.getProgramInfoLog(program));
      return null;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');
    let dpr = 1, width = 0, height = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      width = Math.floor(innerWidth * dpr); height = Math.floor(innerHeight * dpr);
      canvas.width = width; canvas.height = height;
      canvas.style.width = '100vw'; canvas.style.height = '100vh';
      gl.viewport(0,0,width,height);
      gl.uniform2f(uResolution,width,height);
    }
    let px=.5, py=.5;
    addEventListener('pointermove', e => { px=e.clientX/innerWidth; py=1-e.clientY/innerHeight; }, {passive:true});
    function frame(ms){
      resizeIfNeeded();
      gl.uniform1f(uTime,ms*.001);
      gl.uniform2f(uPointer,px,py);
      gl.drawArrays(gl.TRIANGLES,0,3);
      requestAnimationFrame(frame);
    }
    function resizeIfNeeded(){ if(canvas.width !== Math.floor(innerWidth*dpr) || canvas.height !== Math.floor(innerHeight*dpr) || !dpr) resize(); }
    resize();
    requestAnimationFrame(frame);
    return canvas;
  }

  function makeSuit() {
    if (document.querySelector('.ax-suit-overlay')) return;
    const wrap = document.createElement('div');
    wrap.className='ax-suit-overlay';
    wrap.innerHTML=`<div class="ax-suit-glow"></div><div class="ax-suit-placeholder" aria-hidden="true"><div class="ax-head"></div><div class="ax-body"></div><div class="ax-arm ax-arm-l"></div><div class="ax-arm ax-arm-r"></div><div class="ax-leg ax-leg-l"></div><div class="ax-leg ax-leg-r"></div><div class="ax-chest"></div></div>`;
    document.body.appendChild(wrap);
    const s=document.createElement('style'); s.textContent=`
      .ax-suit-overlay{position:fixed;inset:0;z-index:2;pointer-events:none;display:grid;place-items:center;}
      .ax-suit-glow{position:absolute;width:min(45vw,520px);height:min(65vh,700px);border-radius:50%;background:radial-gradient(circle,rgba(0,220,255,.16),rgba(0,220,255,0) 65%);filter:blur(26px);animation:axSuitBreath 2.8s ease-in-out infinite;}
      .ax-suit-placeholder{position:relative;width:min(20vw,240px);height:min(58vh,620px);filter:drop-shadow(0 0 14px rgba(0,240,255,.6));animation:axSuitFloat 3.6s ease-in-out infinite;}
      .ax-head,.ax-body,.ax-arm,.ax-leg,.ax-chest{position:absolute;background:linear-gradient(145deg,#17252e,#061118);border:1px solid rgba(77,239,255,.7);box-shadow:inset 0 0 18px rgba(0,220,255,.07),0 0 10px rgba(0,190,255,.18);}
      .ax-head{width:24%;height:14%;left:38%;top:2%;border-radius:28% 28% 34% 34%;}
      .ax-body{width:38%;height:42%;left:31%;top:18%;clip-path:polygon(18% 0,82% 0,100% 18%,88% 100%,12% 100%,0 18%);}
      .ax-chest{width:22%;height:20%;left:39%;top:27%;border-radius:42%;background:radial-gradient(circle,rgba(0,250,255,.95) 0 10%,rgba(0,110,150,.9) 18%,#08151d 42%);box-shadow:0 0 20px rgba(0,240,255,.85),inset 0 0 24px rgba(0,255,255,.4);animation:axCorePulse 1.35s ease-in-out infinite;}
      .ax-arm{width:13%;height:37%;top:21%;border-radius:28%;}
      .ax-arm-l{left:14%;transform:rotate(9deg)} .ax-arm-r{right:14%;transform:rotate(-9deg)}
      .ax-leg{width:15%;height:38%;top:59%;border-radius:18% 18% 28% 28%;} .ax-leg-l{left:32%;transform:rotate(2deg)} .ax-leg-r{right:32%;transform:rotate(-2deg)}
      @keyframes axSuitFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-14px,0)}}
      @keyframes axSuitBreath{0%,100%{transform:scale(.9);opacity:.45}50%{transform:scale(1.12);opacity:.85}}
      @keyframes axCorePulse{0%,100%{transform:scale(.86);opacity:.7}50%{transform:scale(1.14);opacity:1}}
      @media(max-width:700px){.ax-suit-placeholder{width:170px;height:470px}.ax-suit-glow{width:300px;height:500px}}
    `; document.head.appendChild(s);
  }

  function makeReactor(){
    if(document.querySelector('.ax-reactor-shell')) return;
    const host=document.querySelector('.hero-display') || document.body;
    const shell=document.createElement('div'); shell.className='ax-reactor-shell';
    const canvas=document.createElement('canvas'); canvas.width=700; canvas.height=700; canvas.setAttribute('aria-hidden','true'); shell.appendChild(canvas); host.appendChild(shell);
    const c=canvas.getContext('2d');
    const particles=Array.from({length:38},()=>({a:Math.random()*TWO_PI,r:130+Math.random()*135,s:.5+Math.random()*1.6,p:Math.random()*TWO_PI}));
    function frame(ms){
      const t=ms*.001; const w=canvas.width, h=canvas.height; const cx=w/2, cy=h/2;
      c.clearRect(0,0,w,h);
      const g=c.createRadialGradient(cx,cy,20,cx,cy,280); g.addColorStop(0,'rgba(0,240,255,.22)'); g.addColorStop(.45,'rgba(0,170,255,.09)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,w,h);
      c.save(); c.translate(cx,cy); c.globalCompositeOperation='lighter';
      for(let k=0;k<10;k++){
        c.beginPath();
        for(let i=0;i<=180;i++){
          const a=i/180*TWO_PI; const rr=150+k*7 + Math.sin(a*(3+k%3)+t*(1.4+k*.08))*14 + Math.sin(a*9-t*2.2+k)*5;
          const x=Math.cos(a+t*(.18+k*.015))*rr; const y=Math.sin(a-t*(.22+k*.01))*rr*.86;
          i?c.lineTo(x,y):c.moveTo(x,y);
        }
        c.strokeStyle=`rgba(${60+k*6},${180+k*5},255,${.08+k*.018})`; c.lineWidth=1.4; c.shadowBlur=9; c.shadowColor='rgba(0,220,255,.75)'; c.stroke();
      }
      for(const p of particles){
        p.a += .004*p.s;
        const rr=p.r+Math.sin(t*2.1+p.p)*18; const x=Math.cos(p.a+t*p.s*.8)*rr; const y=Math.sin(p.a+t*p.s*.8)*rr*.8;
        c.fillStyle='rgba(165,250,255,.95)'; c.shadowBlur=12; c.shadowColor='rgba(0,230,255,1)'; c.beginPath(); c.arc(x,y,1.5+p.s*.35,0,TWO_PI); c.fill();
      }
      for(let j=0;j<9;j++){
        const a0=(j/9)*TWO_PI+t*.4, len=70+38*Math.sin(t*2+j);
        c.beginPath(); c.moveTo(Math.cos(a0)*18,Math.sin(a0)*18);
        let x=Math.cos(a0)*18,y=Math.sin(a0)*18;
        for(let s=0;s<8;s++){ const a=a0+Math.sin(t*5+s+j)*.28; x+=Math.cos(a)*len/8; y+=Math.sin(a)*len/8; c.lineTo(x,y); }
        c.strokeStyle='rgba(80,245,255,.7)'; c.lineWidth=2.2; c.shadowBlur=16; c.shadowColor='rgba(0,230,255,1)'; c.stroke();
      }
      const pulse=1+Math.sin(t*4.5)*.12;
      const core=c.createRadialGradient(0,0,2,0,0,62*pulse); core.addColorStop(0,'rgba(240,255,255,1)'); core.addColorStop(.16,'rgba(90,255,255,.98)'); core.addColorStop(.48,'rgba(0,220,255,.4)'); core.addColorStop(1,'rgba(0,170,255,0)'); c.fillStyle=core; c.beginPath(); c.arc(0,0,62*pulse,0,TWO_PI); c.fill();
      c.restore();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function boot(){
    addMotionLayer();
    const stage=document.getElementById('armor-x-effects') || (()=>{const e=document.createElement('div');e.id='armor-x-effects';document.body.prepend(e);return e;})();
    const webgl=buildWebGL();
    if(webgl) stage.appendChild(webgl);
    makeSuit();
    makeReactor();
    const s=document.createElement('style'); s.textContent=`
      #armor-x-effects{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}
      #armor-x-webgl{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:.78;}
      #app{position:relative;z-index:4;}
      .site-background{background:transparent!important;}
      .ax-reactor-shell{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:7;mix-blend-mode:screen;}
      .hero-display .ax-reactor-shell{position:absolute;}
      .ax-reactor-shell canvas{width:min(42vw,560px);height:min(42vw,560px);max-width:90%;max-height:90%;filter:drop-shadow(0 0 18px rgba(0,220,255,.55));}
    `; document.head.appendChild(s);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();