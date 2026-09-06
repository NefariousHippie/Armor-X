/* ============================================================
   ARMOR X — APPLICATION + CINEMATIC EFFECTS ENGINE
   ============================================================ */

"use strict";

const bootScreen = document.getElementById("boot-screen");
const bootProgressBar = document.getElementById("boot-progress-bar");
const bootStatusText = document.getElementById("boot-status-text");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const aiTerminalOutput = document.getElementById("ai-terminal-output");
const state = { menuOpen:false, effectsStarted:false };

function boot(){
    if(!bootScreen||!bootProgressBar){initializeApplication();return;}
    document.body.classList.add("booting");
    const messages=["INITIALIZING SYSTEM","LOADING POWER CORE","CALIBRATING ACTUATORS","CONNECTING SENSOR ARRAY","ESTABLISHING NEURAL LINK","VERIFYING ARMOR SYSTEM","STARTING A.I. CORE","SYSTEM READY"];
    let progress=0,index=0;
    const timer=setInterval(()=>{
        progress=Math.min(100,progress+Math.floor(Math.random()*8)+5);
        bootProgressBar.style.width=progress+"%";
        const next=Math.min(messages.length-1,Math.floor(progress/(100/messages.length)));
        if(next!==index||progress===100){index=next;if(bootStatusText)bootStatusText.textContent=messages[index];}
        if(progress>=100){clearInterval(timer);setTimeout(()=>{bootScreen.classList.add("hidden");document.body.classList.remove("booting");initializeApplication();},550);}
    },90);
}

function initializeApplication(){
    initializeMobileMenu();initializeNavigation();initializeActiveNavigation();initializeScrollReveal();initializeTerminal();initializeSmoothLinks();initializeCinematicEffects();
}
function initializeMobileMenu(){
    if(!menuToggle||!mobileMenu)return;
    menuToggle.addEventListener("click",()=>state.menuOpen?closeMobileMenu():openMobileMenu());
    mobileMenu.querySelectorAll("a").forEach(link=>link.addEventListener("click",closeMobileMenu));
    document.addEventListener("click",e=>{if(state.menuOpen&&!mobileMenu.contains(e.target)&&!menuToggle.contains(e.target))closeMobileMenu();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMobileMenu();});
    window.addEventListener("resize",()=>{if(window.innerWidth>850)closeMobileMenu();},{passive:true});
}
function openMobileMenu(){state.menuOpen=true;mobileMenu.classList.add("open");menuToggle.classList.add("open");menuToggle.setAttribute("aria-expanded","true");menuToggle.setAttribute("aria-label","Close navigation");}
function closeMobileMenu(){if(!menuToggle||!mobileMenu)return;state.menuOpen=false;mobileMenu.classList.remove("open");menuToggle.classList.remove("open");menuToggle.setAttribute("aria-expanded","false");menuToggle.setAttribute("aria-label","Open navigation");}
function initializeNavigation(){document.querySelectorAll(".main-nav a").forEach(link=>link.addEventListener("click",()=>{document.querySelectorAll(".main-nav a").forEach(x=>x.classList.remove("active"));link.classList.add("active");}));}
function initializeActiveNavigation(){const sections=document.querySelectorAll("main section[id]"),links=document.querySelectorAll(".main-nav a");if(!sections.length||!links.length||!("IntersectionObserver"in window))return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const id=entry.target.id;links.forEach(link=>link.classList.toggle("active",link.getAttribute("href")==="#"+id));}),{threshold:.2,rootMargin:"-20% 0px -60% 0px"});sections.forEach(s=>observer.observe(s));}
function initializeScrollReveal(){const targets=document.querySelectorAll(".section-heading,.system-card,.feature-copy,.feature-visual,.ai-feature,.ai-terminal,.spec-row,.mission-content");if(!targets.length)return;targets.forEach((el,i)=>{el.classList.add("reveal");el.style.setProperty("--reveal-delay",Math.min(i%5,4)*70+"ms");});if(window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches){targets.forEach(el=>el.classList.add("visible"));return;}if(!("IntersectionObserver"in window)){targets.forEach(el=>el.classList.add("visible"));return;}const observer=new IntersectionObserver((entries,obs)=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add("visible");obs.unobserve(entry.target);}),{threshold:.1,rootMargin:"0px 0px -45px 0px"});targets.forEach(el=>observer.observe(el));}
function initializeTerminal(){if(!aiTerminalOutput)return;const messages=[">> DIAGNOSTIC SCAN COMPLETE",">> ALL PRIMARY SYSTEMS NOMINAL",">> OPERATOR LINK STABLE",">> ENVIRONMENTAL SENSORS ACTIVE",">> POWER DISTRIBUTION OPTIMIZED",">> PREDICTIVE CONTROL ENABLED"];let i=0;setInterval(()=>{const line=document.createElement("div");line.textContent=messages[i++%messages.length];line.className="terminal-live-line";aiTerminalOutput.appendChild(line);while(aiTerminalOutput.children.length>12)aiTerminalOutput.removeChild(aiTerminalOutput.firstElementChild);},3200);}
function initializeSmoothLinks(){document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener("click",e=>{const selector=link.getAttribute("href");if(!selector||selector==="#")return;const target=document.querySelector(selector);if(!target)return;e.preventDefault();const header=document.querySelector(".site-header"),offset=header?header.offsetHeight:0;window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-offset,behavior:"smooth"});closeMobileMenu();}));}

function initializeCinematicEffects(){
    if(state.effectsStarted)return;state.effectsStarted=true;
    const reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    installEffectStyles(reduced);initializeParticleField(reduced);initializePointerLighting(reduced);initializePanelTilt(reduced);initializeCardLighting(reduced);initializeTelemetry();
}
function installEffectStyles(reduced){
    if(document.getElementById("armor-x-cinematic-style"))return;
    const style=document.createElement("style");style.id="armor-x-cinematic-style";style.textContent=`
        .app{position:relative;z-index:1}.site-background{z-index:-1!important}
        #ax-particles{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;opacity:.72}
        .site-header,main,.mobile-menu{position:relative;z-index:2}.site-header{position:fixed}.mobile-menu{position:fixed}
        .site-background::before{content:"";position:absolute;inset:-15%;background:radial-gradient(circle at 18% 25%,rgba(0,220,255,.14),transparent 23%),radial-gradient(circle at 82% 62%,rgba(0,145,255,.11),transparent 26%),radial-gradient(circle at 50% 92%,rgba(0,255,220,.07),transparent 30%);filter:blur(45px);animation:ax-atmosphere 14s ease-in-out infinite alternate}
        .site-background::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 42%,rgba(92,230,255,.055) 50%,transparent 58%);background-size:220% 220%;animation:ax-sweep 8s linear infinite}
        .ambient-glow{animation:ax-glow 7s ease-in-out infinite alternate}.glow-two{animation-delay:-3.5s}.scanline{animation:ax-scan 5s linear infinite}
        .display-frame,.power-core-display,.armor-system-diagram,.mobility-display,.ai-terminal,.mission-content{transform-style:preserve-3d;will-change:transform}
        .display-frame::before{content:"";position:absolute;inset:0;z-index:7;pointer-events:none;background:radial-gradient(circle at var(--ax-mx,50%) var(--ax-my,50%),rgba(92,230,255,.18),transparent 27%);mix-blend-mode:screen}
        .display-frame::after{content:"";position:absolute;left:0;right:0;top:-5%;height:2px;z-index:8;pointer-events:none;background:linear-gradient(90deg,transparent,var(--cyan,#5ce6ff),transparent);box-shadow:0 0 18px rgba(92,230,255,.85);animation:ax-hud-sweep 4.6s linear infinite}
        .armor-visual::before{content:"";position:absolute;inset:4%;border:1px solid rgba(92,230,255,.10);border-radius:50%;box-shadow:0 0 65px rgba(92,230,255,.10),inset 0 0 55px rgba(92,230,255,.05);animation:ax-radar 3s ease-in-out infinite}
        .ring-outer{animation:ax-spin 18s linear infinite,ax-ring-pulse 3s ease-in-out infinite}.ring-middle{animation:ax-spin-reverse 12s linear infinite}.ring-inner{animation:ax-spin 7s linear infinite}.armor-core{animation:ax-core 1.8s ease-in-out infinite!important}.core-inner{animation:ax-core-inner 1s ease-in-out infinite alternate}.target-marker{animation:ax-target 2.4s ease-in-out infinite}.marker-two{animation-delay:-.8s}.marker-three{animation-delay:-1.5s}.target-marker span{animation:ax-target-line 1.6s ease-in-out infinite}.status-indicator,.status-light{animation:ax-status 1.3s ease-in-out infinite}
        .power-orbit{animation:ax-spin 10s linear infinite}.orbit-two{animation-duration:16s;animation-direction:reverse}.orbit-three{animation-duration:22s}.power-core-glow{animation:ax-power 2.2s ease-in-out infinite}
        .system-card,.stat-box,.ai-feature,.mission-status{position:relative;overflow:hidden}.system-card::after,.stat-box::after,.ai-feature::after,.mission-status::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(circle at var(--ax-card-x,50%) var(--ax-card-y,50%),rgba(92,230,255,.15),transparent 34%);transition:opacity .2s ease}.system-card:hover::after,.stat-box:hover::after,.ai-feature:hover::after,.mission-status:hover::after{opacity:1}
        .mobility-grid{animation:ax-grid 5s linear infinite}.speed-lines span{animation:ax-speed 1.1s linear infinite}.speed-lines span:nth-child(2){animation-delay:-.22s}.speed-lines span:nth-child(3){animation-delay:-.44s}.speed-lines span:nth-child(4){animation-delay:-.66s}.speed-lines span:nth-child(5){animation-delay:-.88s}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.2,.8,.2,1) var(--reveal-delay,0ms),transform .7s cubic-bezier(.2,.8,.2,1) var(--reveal-delay,0ms)}.reveal.visible{opacity:1;transform:none}.terminal-live-line{animation:ax-terminal-in .35s ease both}
        @keyframes ax-atmosphere{from{transform:translate3d(-3%,-2%,0) scale(1)}to{transform:translate3d(4%,3%,0) scale(1.1)}}@keyframes ax-sweep{from{background-position:120% 0}to{background-position:-120% 0}}@keyframes ax-glow{from{opacity:.45;transform:scale(.94)}to{opacity:.95;transform:scale(1.08)}}@keyframes ax-scan{from{transform:translateY(-2%)}to{transform:translateY(2%)}}@keyframes ax-hud-sweep{0%{transform:translateY(0);opacity:0}12%{opacity:1}65%{opacity:1}100%{transform:translateY(700px);opacity:0}}@keyframes ax-spin{to{transform:rotate(360deg)}}@keyframes ax-spin-reverse{to{transform:rotate(-360deg)}}@keyframes ax-ring-pulse{50%{opacity:.42}}@keyframes ax-radar{50%{box-shadow:0 0 95px rgba(92,230,255,.16),inset 0 0 80px rgba(92,230,255,.08)}}@keyframes ax-core{0%,100%{transform:translate(-50%,-50%) scale(.94);filter:brightness(.9)}50%{transform:translate(-50%,-50%) scale(1.10);filter:brightness(1.5)}}@keyframes ax-core-inner{from{transform:scale(.65);opacity:.45}to{transform:scale(1.3);opacity:1}}@keyframes ax-target{0%,100%{opacity:.55}50%{opacity:1}}@keyframes ax-target-line{50%{opacity:.3;transform:scale(.8)}}@keyframes ax-status{50%{opacity:.3;box-shadow:0 0 22px rgba(103,240,176,1)}}@keyframes ax-power{50%{opacity:.4;transform:scale(1.25);filter:blur(6px)}}@keyframes ax-grid{to{background-position:40px 40px}}@keyframes ax-speed{from{transform:translateX(120%);opacity:0}20%{opacity:.9}to{transform:translateX(-180%);opacity:0}}@keyframes ax-terminal-in{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
        @media(prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none}.display-frame::after,.site-background::before,.site-background::after{animation:none!important}#ax-particles{display:none!important}}
    `;document.head.appendChild(style);
}
function initializeParticleField(reduced){
    if(reduced||document.getElementById("ax-particles"))return;
    const canvas=document.createElement("canvas");canvas.id="ax-particles";document.body.appendChild(canvas);const ctx=canvas.getContext("2d");let width=0,height=0,particles=[];
    function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const count=Math.min(135,Math.max(55,Math.floor(width*height/12000)));particles=Array.from({length:count},()=>({x:Math.random()*width,y:Math.random()*height,r:Math.random()*1.35+.25,speed:Math.random()*.32+.04,alpha:Math.random()*.55+.12,drift:(Math.random()-.5)*.12}));}
    resize();addEventListener("resize",resize,{passive:true});
    function frame(){ctx.clearRect(0,0,width,height);for(const p of particles){p.y-=p.speed;p.x+=p.drift;if(p.y<-5){p.y=height+5;p.x=Math.random()*width}if(p.x<-5)p.x=width+5;if(p.x>width+5)p.x=-5;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(92,230,255,${p.alpha})`;ctx.fill()}requestAnimationFrame(frame)}frame();
}
function initializePointerLighting(reduced){
    if(reduced)return;const light=document.createElement("div");light.id="ax-pointer-light";light.style.cssText="position:fixed;left:0;top:0;width:420px;height:420px;border-radius:50%;pointer-events:none;z-index:1;background:radial-gradient(circle,rgba(92,230,255,.085),rgba(92,230,255,.025) 30%,transparent 68%);filter:blur(10px);transform:translate(-50%,-50%);mix-blend-mode:screen;will-change:transform";document.body.appendChild(light);document.addEventListener("pointermove",e=>{light.style.transform=`translate(${e.clientX-210}px,${e.clientY-210}px)`},{passive:true});
}
function initializePanelTilt(reduced){
    if(reduced)return;document.querySelectorAll(".display-frame,.power-core-display,.armor-system-diagram,.mobility-display,.ai-terminal,.mission-content").forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1100px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg) translateZ(3px)`;el.style.setProperty("--ax-mx",`${((e.clientX-r.left)/r.width)*100}%`);el.style.setProperty("--ax-my",`${((e.clientY-r.top)/r.height)*100}%`)},{passive:true});el.addEventListener("pointerleave",()=>el.style.transform="")});
}
function initializeCardLighting(reduced){if(reduced)return;document.querySelectorAll(".system-card,.stat-box,.ai-feature,.mission-status").forEach(card=>card.addEventListener("pointermove",e=>{const r=card.getBoundingClientRect();card.style.setProperty("--ax-card-x",`${((e.clientX-r.left)/r.width)*100}%`);card.style.setProperty("--ax-card-y",`${((e.clientY-r.top)/r.height)*100}%`)},{passive:true}));}
function initializeTelemetry(){const status=document.querySelector(".status-label");if(!status)return;const messages=["SYSTEM ONLINE","ARC STABLE","SENSORS ACTIVE","A.I. LINKED","ARMOR NOMINAL"];let i=0;setInterval(()=>{status.textContent=messages[i++%messages.length]},2600);}

if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
