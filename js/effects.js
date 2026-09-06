(() => {
  'use strict';

  const TWO_PI = Math.PI * 2;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function injectStyle() {
    if ($('#ax-effects-style')) return;
    const s = document.createElement('style');
    s.id = 'ax-effects-style';
    s.textContent = `
      #armor-x-effects{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
      #armor-x-webgl{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:.72}
      #ax-motion-layer{position:absolute;inset:0;overflow:hidden}
      #app{position:relative;z-index:4}
      .site-background{background:transparent!important}

      /* HERO ARMOR */
      .hero-display{position:relative;isolation:isolate}
      .ax-suit-stage{position:absolute;inset:7% 8%;z-index:5;display:grid;place-items:center;pointer-events:none}
      .ax-suit{position:relative;width:min(33%,240px);height:88%;min-width:180px;filter:drop-shadow(0 0 13px rgba(0,224,255,.35)) drop-shadow(0 0 32px rgba(0,110,180,.18));animation:axSuitFloat 4.8s ease-in-out infinite}
      .ax-suit svg{width:100%;height:100%;overflow:visible}
      .ax-suit .armor-dark{fill:url(#axMetal)}
      .ax-suit .armor-red{fill:url(#axRed)}
      .ax-suit .armor-gold{fill:url(#axGold)}
      .ax-suit .edge{fill:none;stroke:#69efff;stroke-width:2;stroke-opacity:.7}
      .ax-suit .seam{fill:none;stroke:#08141c;stroke-width:4;stroke-opacity:.95}
      .ax-suit .cyan{fill:#dfffff;filter:url(#axGlow)}
      .ax-suit .cyan-soft{fill:#22dfff;filter:url(#axGlow)}
      .ax-suit .visor{fill:#d8feff;filter:url(#axGlow)}
      .ax-suit .mechanical{fill:#0a151d;stroke:#57eaff;stroke-width:1.2;stroke-opacity:.45}
      .ax-suit .suit-core-ring{fill:none;stroke:#9cffff;stroke-width:4;filter:url(#axGlow);animation:axCoreSpin 7s linear infinite}
      .ax-suit .suit-core{fill:url(#axCore);filter:url(#axGlow);animation:axCorePulse 1.3s ease-in-out infinite}
      .ax-suit .micro{fill:#7eefff;opacity:.7}
      .ax-suit .repulsor{fill:#ecffff;filter:url(#axGlow);animation:axRepulsorPulse 1.1s ease-in-out infinite}
      @keyframes axSuitFloat{0%,100%{transform:translateY(3px) rotate(-.25deg)}50%{transform:translateY(-7px) rotate(.25deg)}}
      @keyframes axCorePulse{0%,100%{transform:scale(.88);opacity:.72}50%{transform:scale(1.12);opacity:1}}
      @keyframes axCoreSpin{to{transform:rotate(360deg);transform-origin:350px 300px}}
      @keyframes axRepulsorPulse{0%,100%{opacity:.55}50%{opacity:1}}
      .ax-suit::after{content:'';position:absolute;inset:8% 22%;background:radial-gradient(ellipse,rgba(0,225,255,.12),transparent 67%);filter:blur(20px);z-index:-1;animation:axSuitAura 2.4s ease-in-out infinite}
      @keyframes axSuitAura{0%,100%{opacity:.35;transform:scale(.9)}50%{opacity:.8;transform:scale(1.08)}}

      /* REACTOR - anchored in the hero display, not the viewport */
      .ax-reactor-shell{position:absolute!important;inset:0!important;display:grid;place-items:center;pointer-events:none;z-index:4;mix-blend-mode:screen}
      .ax-reactor-shell canvas{width:min(48%,470px);height:auto;aspect-ratio:1;filter:drop-shadow(0 0 15px rgba(0,220,255,.6))}
      .ax-reactor-shell{opacity:.72}
      .ax-suit-stage + .ax-reactor-shell{z-index:6}

      /* LIVE TECHNICAL DATA */
      .live-specs{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;margin-top:44px}
      .telemetry-panel,.telemetry-side{border:1px solid rgba(95,232,255,.19);background:linear-gradient(145deg,rgba(9,20,29,.86),rgba(4,10,16,.68));box-shadow:inset 0 0 45px rgba(0,190,255,.035),0 18px 55px rgba(0,0,0,.22);backdrop-filter:blur(12px)}
      .telemetry-panel{padding:26px}
      .telemetry-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:1px solid rgba(95,232,255,.12);font:600 11px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;color:#8ca9b4}
      .telemetry-live{display:flex;align-items:center;gap:8px;color:#75f8ff}
      .telemetry-dot{width:6px;height:6px;border-radius:50%;background:#72faff;box-shadow:0 0 12px #00eaff;animation:telemetryBlink 1.1s ease-in-out infinite}
      @keyframes telemetryBlink{0%,100%{opacity:.35}50%{opacity:1}}
      .telemetry-row{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;padding:19px 0;border-bottom:1px solid rgba(95,232,255,.08)}
      .telemetry-row:last-child{border-bottom:0}
      .telemetry-label{font:600 11px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;color:#718b96}
      .telemetry-readout{text-align:right}
      .telemetry-value{display:block;font:700 clamp(20px,2.1vw,30px)/1 ui-monospace,SFMono-Regular,Consolas,monospace;color:#e8fdff;text-shadow:0 0 14px rgba(0,225,255,.22);font-variant-numeric:tabular-nums}
      .telemetry-unit{font-size:9px;color:#5f8794;letter-spacing:.1em;margin-left:5px}
      .telemetry-bar{height:3px;margin-top:11px;background:#07131a;overflow:hidden}
      .telemetry-bar span{display:block;height:100%;width:var(--pct);background:linear-gradient(90deg,#0c778e,#8cffff);box-shadow:0 0 10px rgba(0,229,255,.8);transform-origin:left;animation:telemetryBar 1.5s ease-out both}
      @keyframes telemetryBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
      .telemetry-side{padding:24px;display:grid;grid-template-rows:auto 1fr auto;min-height:100%}
      .telemetry-side-title{font:600 11px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;color:#8ca9b4}
      .radar{position:relative;min-height:300px;margin:18px 0;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(95,232,255,.1);background:radial-gradient(circle,rgba(0,220,255,.07),rgba(0,0,0,.03) 50%,rgba(0,0,0,.22))}
      .radar::before,.radar::after{content:'';position:absolute;width:72%;aspect-ratio:1;border:1px solid rgba(95,232,255,.18);border-radius:50%}
      .radar::after{width:43%}
      .radar-grid{position:absolute;inset:10%;background:linear-gradient(rgba(95,232,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(95,232,255,.08) 1px,transparent 1px);background-size:50% 50%}
      .radar-sweep{position:absolute;width:44%;height:1px;background:linear-gradient(90deg,transparent,#73fbff);transform-origin:left center;left:50%;top:50%;animation:radarSweep 3.8s linear infinite;box-shadow:0 0 10px rgba(0,225,255,.8)}
      @keyframes radarSweep{to{transform:rotate(360deg)}}
      .radar-core{width:16px;height:16px;border-radius:50%;background:#e8ffff;box-shadow:0 0 8px #fff,0 0 22px #00eaff,0 0 50px rgba(0,220,255,.65);animation:radarCore 1.4s ease-in-out infinite}
      @keyframes radarCore{0%,100%{transform:scale(.7)}50%{transform:scale(1.35)}}
      .telemetry-log{font:10px/1.75 ui-monospace,SFMono-Regular,Consolas,monospace;color:#618793;letter-spacing:.04em}
      .telemetry-log span{color:#82dce6}
      .telemetry-footer{display:flex;justify-content:space-between;border-top:1px solid rgba(95,232,255,.1);padding-top:14px;font:600 9px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;color:#607d88}

      @media(max-width:800px){.live-specs{grid-template-columns:1fr}.ax-suit{width:36%;min-width:140px}.ax-reactor-shell canvas{width:58%}.live-specs{gap:16px}.telemetry-side{min-height:360px}}
      @media(max-width:560px){.ax-suit-stage{inset:8% 4%}.ax-suit{width:42%;min-width:125px}.ax-reactor-shell canvas{width:68%}}
    `;
    document.head.appendChild(s);
  }

  function addMotionLayer() {
    if ($('#ax-motion-layer')) return;
    const layer = document.createElement('div');
    layer.id = 'ax-motion-layer';
    layer.innerHTML = `
      <div class="ax-motion-field"></div>
      ${Array.from({length:18},(_,i)=>`<i class="ax-motion-node n${i}"></i>`).join('')}
      ${Array.from({length:8},(_,i)=>`<i class="ax-motion-line l${i}"></i>`).join('')}
    `;
    document.body.prepend(layer);
    const s=document.createElement('style');
    s.textContent=`
      #ax-motion-layer{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
      .ax-motion-field{position:absolute;inset:-35%;background-image:linear-gradient(rgba(0,220,255,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(0,220,255,.10) 1px,transparent 1px);background-size:62px 62px;transform:perspective(900px) rotateX(61deg);transform-origin:center;animation:axFieldDrift 7s linear infinite}
      .ax-motion-node{position:absolute;width:4px;height:4px;border-radius:50%;background:#a8ffff;box-shadow:0 0 8px #00eaff,0 0 22px rgba(0,220,255,.8);animation:axNodeMove var(--d) linear infinite,axNodePulse 1.4s ease-in-out infinite}
      .ax-motion-line{position:absolute;width:32vw;height:1px;left:-35vw;background:linear-gradient(90deg,transparent,#42efff,transparent);box-shadow:0 0 9px rgba(0,220,255,.75);transform:rotate(var(--a));animation:axLineMove var(--d) linear infinite}
      @keyframes axFieldDrift{from{background-position:0 0}to{background-position:62px 62px}}
      @keyframes axNodeMove{from{transform:translateX(-10vw)}to{transform:translateX(120vw)}}
      @keyframes axNodePulse{0%,100%{opacity:.25;scale:.7}50%{opacity:1;scale:1.3}}
      @keyframes axLineMove{0%{transform:translateX(-20vw) rotate(var(--a));opacity:0}15%,80%{opacity:1}100%{transform:translateX(150vw) rotate(var(--a));opacity:0}}
      .n0{left:4%;top:18%;--d:6s;animation-delay:-1s}.n1{left:13%;top:46%;--d:8s;animation-delay:-4s}.n2{left:25%;top:29%;--d:7s;animation-delay:-2s}.n3{left:37%;top:76%;--d:9s;animation-delay:-5s}.n4{left:49%;top:17%;--d:6.5s;animation-delay:-3s}.n5{left:61%;top:57%;--d:8.5s;animation-delay:-6s}.n6{left:74%;top:25%;--d:7.5s;animation-delay:-1.5s}.n7{left:87%;top:72%;--d:9.2s;animation-delay:-7s}.n8{left:95%;top:41%;--d:6.8s;animation-delay:-2.7s}.n9{left:7%;top:83%;--d:8.8s;animation-delay:-5.5s}.n10{left:20%;top:12%;--d:7.2s;animation-delay:-3.7s}.n11{left:33%;top:61%;--d:10s;animation-delay:-8s}.n12{left:45%;top:43%;--d:6.2s;animation-delay:-1.2s}.n13{left:57%;top:82%;--d:8.1s;animation-delay:-5.9s}.n14{left:69%;top:34%;--d:7.7s;animation-delay:-4.2s}.n15{left:81%;top:88%;--d:9.5s;animation-delay:-6.3s}.n16{left:91%;top:16%;--d:6.4s;animation-delay:-3.1s}.n17{left:54%;top:8%;--d:8.9s;animation-delay:-7.3s}
      .l0{top:19%;--a:-7deg;--d:5.2s;animation-delay:-1s}.l1{top:32%;--a:4deg;--d:6.8s;animation-delay:-4s}.l2{top:46%;--a:-5deg;--d:5.9s;animation-delay:-2s}.l3{top:58%;--a:8deg;--d:7.3s;animation-delay:-6s}.l4{top:67%;--a:-3deg;--d:6.1s;animation-delay:-3s}.l5{top:77%;--a:6deg;--d:8s;animation-delay:-5s}.l6{top:86%;--a:-8deg;--d:5.6s;animation-delay:-1.8s}.l7{top:11%;--a:3deg;--d:7.1s;animation-delay:-4.8s}
    `;
    document.head.appendChild(s);
  }

  function buildWebGL() {
    const canvas=document.createElement('canvas'); canvas.id='armor-x-webgl';
    const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'high-performance'});
    if(!gl)return null;
    const vsSource=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fsSource=`precision mediump float;uniform vec2 r;uniform float t;float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}void main(){vec2 p=(gl_FragCoord.xy-.5*r)/r.y;float tt=t;vec2 g=p*28.;float gx=abs(fract(g.x)-.5),gy=abs(fract(g.y)-.5);float grid=smoothstep(.035,.0,gx)+smoothstep(.035,.0,gy);float sweep=smoothstep(.0,.014,abs(fract(p.x*1.7-p.y*.9-tt*.12)-.5));float plasma=n(p*6.+vec2(tt*.14,-tt*.12));float pulse=max(0.,sin(tt*3.-length(p)*24.));vec3 c=vec3(0.,.012,.018);c+=vec3(0.,.10,.15)*grid;c+=vec3(0.,.30,.36)*sweep*(.3+.7*plasma);c+=vec3(0.,.12,.18)*pulse*exp(-3.*length(p));c*=1.-.35*length(p);gl_FragColor=vec4(c,.82);}`;
    function shader(type,src){const x=gl.createShader(type);gl.shaderSource(x,src);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(x));gl.deleteShader(x);return null}return x}
    const v=shader(gl.VERTEX_SHADER,vsSource),f=shader(gl.FRAGMENT_SHADER,fsSource);if(!v||!f)return null;
    const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))return null;gl.useProgram(p);
    const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(p,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const ur=gl.getUniformLocation(p,'r'),ut=gl.getUniformLocation(p,'t'); let lastW=0,lastH=0;
    function resize(){const d=Math.min(devicePixelRatio||1,1.5),w=Math.floor(innerWidth*d),h=Math.floor(innerHeight*d);if(w!==lastW||h!==lastH){canvas.width=w;canvas.height=h;canvas.style.width='100vw';canvas.style.height='100vh';gl.viewport(0,0,w,h);gl.uniform2f(ur,w,h);lastW=w;lastH=h}}
    function frame(ms){resize();gl.uniform1f(ut,ms*.001);gl.drawArrays(gl.TRIANGLES,0,3);requestAnimationFrame(frame)}
    resize();requestAnimationFrame(frame);return canvas;
  }

  function buildSuit() {
    const host=$('.armor-visual');
    if(!host||$('.ax-suit-stage',host))return;
    const old=$('.armor-silhouette',host); if(old) old.style.display='none';
    const stage=document.createElement('div');stage.className='ax-suit-stage';
    stage.innerHTML=`<div class="ax-suit">
      <svg viewBox="0 0 700 760" role="img" aria-label="ARMOR X powered exoskeleton visualization">
        <defs>
          <linearGradient id="axMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#33424c"/><stop offset=".38" stop-color="#101c24"/><stop offset="1" stop-color="#050b10"/></linearGradient>
          <linearGradient id="axRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b2528"/><stop offset=".45" stop-color="#421216"/><stop offset="1" stop-color="#18080b"/></linearGradient>
          <linearGradient id="axGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c39955"/><stop offset=".45" stop-color="#72542a"/><stop offset="1" stop-color="#2c2112"/></linearGradient>
          <radialGradient id="axCore"><stop offset="0" stop-color="#fff"/><stop offset=".16" stop-color="#bfffff"/><stop offset=".45" stop-color="#17dcff" stop-opacity=".9"/><stop offset="1" stop-color="#0088a8" stop-opacity="0"/></radialGradient>
          <filter id="axGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <!-- helmet -->
        <path class="armor-dark edge" d="M270 112 L291 55 Q350 22 409 55 L430 112 L418 155 L382 176 L318 176 L282 155 Z"/>
        <path class="armor-red" d="M282 111 L300 63 Q350 38 400 63 L418 111 L401 145 L374 161 L326 161 L299 145 Z"/>
        <path class="armor-dark" d="M306 75 L350 55 L394 75 L383 108 L317 108 Z"/>
        <path class="visor" d="M313 89 L342 78 L350 81 L358 78 L387 89 L375 109 L325 109 Z"/>
        <path class="gold" d="M318 111 L382 111 L369 150 L331 150 Z" fill="url(#axGold)"/>
        <path class="seam" d="M318 111 L350 125 L382 111"/>
        <!-- neck -->
        <path class="armor-dark edge" d="M306 154 L394 154 L408 202 L292 202 Z"/>
        <path class="mechanical" d="M316 166 L384 166 L391 192 L309 192 Z"/>
        <!-- torso -->
        <path class="armor-dark edge" d="M273 188 L319 180 L350 202 L381 180 L427 188 L462 330 L420 404 L350 423 L280 404 L238 330 Z"/>
        <path class="armor-red" d="M279 194 L319 189 L350 211 L381 189 L421 194 L443 315 L404 374 L350 390 L296 374 L257 315 Z"/>
        <path class="armor-gold" d="M272 206 L312 198 L329 218 L302 268 L266 293 Z" opacity=".9"/>
        <path class="armor-gold" d="M428 206 L388 198 L371 218 L398 268 L434 293 Z" opacity=".9"/>
        <!-- chest containment -->
        <circle class="suit-core-ring" cx="350" cy="300" r="62"/>
        <circle class="suit-core-ring" cx="350" cy="300" r="45" stroke-width="2" opacity=".75"/>
        <circle class="suit-core" cx="350" cy="300" r="44"/>
        <path class="cyan-soft" d="M350 270 L373 284 L373 316 L350 330 L327 316 L327 284 Z"/>
        <path class="edge" d="M350 255 L389 277 L389 323 L350 345 L311 323 L311 277 Z"/>
        <!-- abdomen -->
        <path class="armor-dark" d="M302 377 L334 391 L366 391 L398 377 L410 447 L389 492 L311 492 L290 447 Z"/>
        <path class="seam" d="M311 415 L389 415 M306 445 L394 445 M316 475 L384 475"/>
        <path class="armor-gold" d="M336 393 L364 393 L369 480 L350 492 L331 480 Z" opacity=".78"/>
        <!-- shoulders -->
        <path class="armor-dark edge" d="M241 199 Q201 186 170 223 L151 261 L209 281 L257 250 Z"/>
        <path class="armor-dark edge" d="M459 199 Q499 186 530 223 L549 261 L491 281 L443 250 Z"/>
        <path class="armor-red" d="M189 218 L214 203 L247 211 L240 248 L204 260 L170 248 Z"/>
        <path class="armor-red" d="M511 218 L486 203 L453 211 L460 248 L496 260 L530 248 Z"/>
        <!-- arms -->
        <path class="armor-dark edge" d="M169 250 L207 258 L226 374 L201 436 L157 425 L145 363 Z"/>
        <path class="armor-red" d="M172 261 L202 268 L214 365 L192 409 L166 402 L155 361 Z"/>
        <path class="armor-dark edge" d="M531 250 L493 258 L474 374 L499 436 L543 425 L555 363 Z"/>
        <path class="armor-red" d="M528 261 L498 268 L486 365 L508 409 L534 402 L545 361 Z"/>
        <path class="armor-gold" d="M151 292 L205 304 L211 328 L156 316 Z"/><path class="armor-gold" d="M549 292 L495 304 L489 328 L544 316 Z"/>
        <path class="mechanical" d="M173 374 L201 380 L194 418 L166 411 Z"/><path class="mechanical" d="M527 374 L499 380 L506 418 L534 411 Z"/>
        <!-- gauntlets -->
        <path class="armor-dark edge" d="M155 422 L198 433 L212 477 L185 512 L145 494 L135 455 Z"/>
        <path class="armor-dark edge" d="M545 422 L502 433 L488 477 L515 512 L555 494 L565 455 Z"/>
        <circle class="repulsor" cx="171" cy="463" r="9"/><circle class="repulsor" cx="529" cy="463" r="9"/>
        <!-- hips -->
        <path class="armor-dark edge" d="M291 487 L350 503 L409 487 L431 532 L400 564 L350 572 L300 564 L269 532 Z"/>
        <path class="armor-gold" d="M305 503 L350 515 L395 503 L408 531 L350 551 L292 531 Z"/>
        <!-- legs -->
        <path class="armor-dark edge" d="M286 549 L344 563 L338 682 L304 731 L255 701 L262 592 Z"/>
        <path class="armor-dark edge" d="M414 549 L356 563 L362 682 L396 731 L445 701 L438 592 Z"/>
        <path class="armor-red" d="M278 568 L329 579 L323 665 L296 706 L268 688 L273 604 Z"/>
        <path class="armor-red" d="M422 568 L371 579 L377 665 L404 706 L432 688 L427 604 Z"/>
        <path class="armor-gold" d="M269 606 L328 620 L326 644 L267 630 Z"/><path class="armor-gold" d="M431 606 L372 620 L374 644 L433 630 Z"/>
        <!-- boots -->
        <path class="armor-dark edge" d="M257 696 L300 707 L287 748 L210 748 Q202 732 219 719 Z"/>
        <path class="armor-dark edge" d="M443 696 L400 707 L413 748 L490 748 Q498 732 481 719 Z"/>
        <path class="mechanical" d="M222 727 L287 727 L280 742 L216 742 Z"/><path class="mechanical" d="M478 727 L413 727 L420 742 L484 742 Z"/>
        <circle class="micro" cx="300" cy="205" r="3"/><circle class="micro" cx="400" cy="205" r="3"/><circle class="micro" cx="216" cy="277" r="3"/><circle class="micro" cx="484" cy="277" r="3"/>
      </svg>
    </div>`;
    host.appendChild(stage);
  }

  function buildReactor() {
    const existing=$('.ax-reactor-shell'); if(existing) existing.remove();
    const host=$('.hero-display .armor-visual'); if(!host)return;
    const shell=document.createElement('div');shell.className='ax-reactor-shell';
    const canvas=document.createElement('canvas');canvas.width=700;canvas.height=700;canvas.setAttribute('aria-hidden','true');shell.appendChild(canvas);host.appendChild(shell);
    const c=canvas.getContext('2d');
    const particles=Array.from({length:34},()=>({a:Math.random()*TWO_PI,r:120+Math.random()*145,s:.5+Math.random()*1.7,p:Math.random()*TWO_PI}));
    function frame(ms){const t=ms*.001,w=700,cx=350,cy=350;c.clearRect(0,0,w,w);const glow=c.createRadialGradient(cx,cy,10,cx,cy,285);glow.addColorStop(0,'rgba(0,235,255,.17)');glow.addColorStop(.45,'rgba(0,160,255,.07)');glow.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=glow;c.fillRect(0,0,w,w);c.save();c.translate(cx,cy);c.globalCompositeOperation='lighter';
      for(let k=0;k<8;k++){c.beginPath();for(let i=0;i<=180;i++){const a=i/180*TWO_PI,rr=88+k*13+Math.sin(a*(3+k%3)+t*(1.1+k*.08))*12+Math.sin(a*8-t*2+k)*4,x=Math.cos(a+t*(.15+k*.01))*rr,y=Math.sin(a-t*(.18+k*.01))*rr*.85;i?c.lineTo(x,y):c.moveTo(x,y)}c.strokeStyle=`rgba(60,${190+k*6},255,${.07+k*.02})`;c.lineWidth=1.6;c.shadowBlur=9;c.shadowColor='rgba(0,220,255,.9)';c.stroke()}
      for(const p of particles){p.a+=.004*p.s;const rr=p.r+Math.sin(t*2+p.p)*16,x=Math.cos(p.a+t*p.s*.85)*rr,y=Math.sin(p.a+t*p.s*.85)*rr*.82;c.fillStyle='rgba(200,255,255,.95)';c.shadowBlur=12;c.shadowColor='#00eaff';c.beginPath();c.arc(x,y,1.4+p.s*.3,0,TWO_PI);c.fill()}
      for(let j=0;j<10;j++){const a0=j/10*TWO_PI+t*.5;c.beginPath();let x=Math.cos(a0)*18,y=Math.sin(a0)*18;c.moveTo(x,y);for(let q=0;q<9;q++){const a=a0+Math.sin(t*6+q+j)*.34;x+=Math.cos(a)*(18+Math.sin(t*2+j)*10);y+=Math.sin(a)*(18+Math.cos(t*1.7+j)*10);c.lineTo(x,y)}c.strokeStyle='rgba(130,250,255,.72)';c.lineWidth=2;c.shadowBlur=15;c.shadowColor='#00eaff';c.stroke()}
      const pulse=1+Math.sin(t*4.5)*.12,core=c.createRadialGradient(0,0,1,0,0,72*pulse);core.addColorStop(0,'#fff');core.addColorStop(.13,'rgba(130,255,255,1)');core.addColorStop(.38,'rgba(0,220,255,.55)');core.addColorStop(1,'rgba(0,150,255,0)');c.fillStyle=core;c.beginPath();c.arc(0,0,72*pulse,0,TWO_PI);c.fill();c.restore();requestAnimationFrame(frame)}
    requestAnimationFrame(frame);
  }

  function buildTelemetry() {
    const section=$('#specifications'); if(!section||$('.live-specs',section))return;
    const table=$('.spec-table',section); if(table) table.style.display='none';
    const wrap=document.createElement('div');wrap.className='live-specs';
    wrap.innerHTML=`
      <div class="telemetry-panel">
        <div class="telemetry-head"><span>LIVE SYSTEM TELEMETRY</span><span class="telemetry-live"><i class="telemetry-dot"></i>STREAMING</span></div>
        <div class="telemetry-rows">
          <div class="telemetry-row"><span class="telemetry-label">ARC OUTPUT</span><div class="telemetry-readout"><strong class="telemetry-value" data-min="438" data-max="491" data-dec="1">480.0<span class="telemetry-unit">kW</span></strong><div class="telemetry-bar"><span style="--pct:84%"></span></div></div></div>
          <div class="telemetry-row"><span class="telemetry-label">CORE EFFICIENCY</span><div class="telemetry-readout"><strong class="telemetry-value" data-min="94.8" data-max="97.2" data-dec="1">96.4<span class="telemetry-unit">%</span></strong><div class="telemetry-bar"><span style="--pct:96.4%"></span></div></div></div>
          <div class="telemetry-row"><span class="telemetry-label">THERMAL LOAD</span><div class="telemetry-readout"><strong class="telemetry-value" data-min="31" data-max="49" data-dec="1">41.2<span class="telemetry-unit">%</span></strong><div class="telemetry-bar"><span style="--pct:41%"></span></div></div></div>
          <div class="telemetry-row"><span class="telemetry-label">ACTUATOR LOAD</span><div class="telemetry-readout"><strong class="telemetry-value" data-min="22" data-max="76" data-dec="1">43.2<span class="telemetry-unit">%</span></strong><div class="telemetry-bar"><span style="--pct:43%"></span></div></div></div>
          <div class="telemetry-row"><span class="telemetry-label">NEURAL LINK</span><div class="telemetry-readout"><strong class="telemetry-value" data-min="98.7" data-max="99.9" data-dec="1">99.7<span class="telemetry-unit">%</span></strong><div class="telemetry-bar"><span style="--pct:99%"></span></div></div></div>
        </div>
      </div>
      <div class="telemetry-side">
        <div class="telemetry-side-title">DIAGNOSTIC CORE // AX-01</div>
        <div class="radar"><div class="radar-grid"></div><div class="radar-sweep"></div><div class="radar-core"></div></div>
        <div class="telemetry-log">&gt; actuator matrix <span>ONLINE</span><br>&gt; coolant loop <span>NOMINAL</span><br>&gt; sensor fusion <span>LOCKED</span><br>&gt; armor network <span>SYNCED</span></div>
        <div class="telemetry-footer"><span>FRAME RATE // <b id="ax-fps">60</b> FPS</span><span>UPTIME // <b id="ax-uptime">00:00:00</b></span></div>
      </div>`;
    const container=$('.container',section);container.appendChild(wrap);

    const values=$$('.telemetry-value',wrap);
    setInterval(()=>values.forEach(v=>{const min=+v.dataset.min,max=+v.dataset.max,dec=+v.dataset.dec;const current=parseFloat(v.firstChild?.nodeValue||0);let next=current+(Math.random()-.5)*(max-min)*.035;next=Math.max(min,Math.min(max,next));v.firstChild.nodeValue=next.toFixed(dec)}),900);

    let started=performance.now(),frames=0,last=started;
    function fps(now){frames++;if(now-last>=1000){const f=Math.round(frames*1000/(now-last));const el=$('#ax-fps');if(el)el.textContent=String(f);frames=0;last=now}requestAnimationFrame(fps)}requestAnimationFrame(fps);
    setInterval(()=>{const total=Math.floor((performance.now()-started)/1000),h=String(Math.floor(total/3600)).padStart(2,'0'),m=String(Math.floor(total%3600/60)).padStart(2,'0'),s=String(total%60).padStart(2,'0');const el=$('#ax-uptime');if(el)el.textContent=`${h}:${m}:${s}`},1000);
  }

  function boot(){
    injectStyle();
    addMotionLayer();
    let stage=$('#armor-x-effects');if(!stage){stage=document.createElement('div');stage.id='armor-x-effects';document.body.prepend(stage)}
    const gl=buildWebGL();if(gl)stage.appendChild(gl);
    buildSuit();
    buildReactor();
    buildTelemetry();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();