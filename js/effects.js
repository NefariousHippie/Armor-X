(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);

  function injectStyle() {
    if ($('#ax-effects-style')) return;
    const s = document.createElement('style');
    s.id = 'ax-effects-style';
    s.textContent = `
      #armor-x-effects{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
      #armor-x-webgl{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:.7}
      #ax-motion-layer{position:absolute;inset:0;overflow:hidden}
      #app{position:relative;z-index:4}
      .site-background{background:transparent!important}

      /* HERO ARMOR */
      .hero-display{position:relative;isolation:isolate}
      .armor-silhouette,.armor-core{display:none!important}
      .ax-suit-stage{position:absolute!important;inset:2% 0 2% 31%!important;z-index:7;display:flex!important;align-items:center;justify-content:center;pointer-events:none}
      .ax-suit{position:relative;width:min(62%,360px);height:97%;min-width:235px;filter:drop-shadow(0 0 10px rgba(0,224,255,.24)) drop-shadow(0 0 28px rgba(0,120,190,.22));animation:axSuitFloat 5.8s ease-in-out infinite}
      .ax-suit svg{width:100%;height:100%;overflow:visible;display:block}
      .ax-suit .armor-dark{fill:url(#axMetal)}
      .ax-suit .armor-red{fill:url(#axRed)}
      .ax-suit .armor-gold{fill:url(#axGold)}
      .ax-suit .armor-black{fill:url(#axBlack)}
      .ax-suit .edge{fill:none;stroke:#71efff;stroke-width:1.8;stroke-opacity:.72}
      .ax-suit .micro{fill:#77efff;opacity:.8}
      .ax-suit .cyan-soft{fill:#18ddff;filter:url(#axGlow)}
      .ax-suit .visor{fill:url(#axVisor);filter:url(#axGlow)}
      .ax-suit .mechanical{fill:#07131c;stroke:#4adff3;stroke-width:1;stroke-opacity:.5}
      .ax-suit .joint{fill:#03080d;stroke:#4adff3;stroke-width:1.2;stroke-opacity:.55}
      .ax-suit .suit-core-ring{fill:none;stroke:#aaffff;stroke-width:4;filter:url(#axGlow);transform-box:fill-box;transform-origin:center;animation:axCoreSpin 8s linear infinite}
      .ax-suit .suit-core-ring.alt{stroke:#29e7ff;stroke-width:1.5;animation-duration:5.3s;animation-direction:reverse}
      .ax-suit .suit-core{fill:url(#axCore);filter:url(#axGlow);transform-box:fill-box;transform-origin:center;animation:axCorePulse 1.2s ease-in-out infinite}
      .ax-suit .repulsor{fill:#f4ffff;filter:url(#axGlow);animation:axRepulsorPulse 1s ease-in-out infinite}
      .ax-suit .warning{fill:#ff5a58;filter:url(#axGlow);animation:axWarn 1.8s ease-in-out infinite}
      .ax-suit .vent{fill:#0a1821;stroke:#68efff;stroke-width:1;opacity:.9}
      @keyframes axSuitFloat{0%,100%{transform:translateY(5px) rotate(-.35deg)}50%{transform:translateY(-8px) rotate(.35deg)}}
      @keyframes axCorePulse{0%,100%{transform:scale(.82);opacity:.68}50%{transform:scale(1.15);opacity:1}}
      @keyframes axCoreSpin{to{transform:rotate(360deg)}}
      @keyframes axRepulsorPulse{0%,100%{opacity:.48}50%{opacity:1}}
      @keyframes axWarn{0%,100%{opacity:.12}50%{opacity:1}}
      .ax-suit::after{content:'';position:absolute;inset:11% 18%;background:radial-gradient(ellipse,rgba(0,225,255,.12),transparent 68%);filter:blur(23px);z-index:-1;animation:axSuitAura 2.8s ease-in-out infinite}
      @keyframes axSuitAura{0%,100%{opacity:.25;transform:scale(.88)}50%{opacity:.85;transform:scale(1.08)}}
      .armor-ring{opacity:.42;z-index:1!important}
      .armor-crosshair{opacity:.32;z-index:2!important}
      .target-marker{z-index:8!important}

      /* LIVE TECHNICAL DATA */
      .live-specs{display:grid;grid-template-columns:1.15fr .85fr;gap:28px;margin-top:44px}
      .spec-table{display:none!important}
      .telemetry-panel,.telemetry-side{border:1px solid rgba(95,232,255,.19);background:linear-gradient(145deg,rgba(9,20,29,.86),rgba(4,10,16,.68));box-shadow:inset 0 0 45px rgba(0,190,255,.035),0 18px 55px rgba(0,0,0,.22);backdrop-filter:blur(12px)}
      .telemetry-panel{padding:26px}
      .telemetry-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:1px solid rgba(95,232,255,.12);font:600 11px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.16em;color:#8ca9b4}
      .telemetry-live{display:flex;align-items:center;gap:8px;color:#75f8ff}
      .telemetry-dot{width:6px;height:6px;border-radius:50%;background:#72faff;box-shadow:0 0 12px #00eaff;animation:telemetryBlink 1.1s ease-in-out infinite}
      @keyframes telemetryBlink{0%,100%{opacity:.35}50%{opacity:1}}
      .telemetry-row{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;padding:17px 0;border-bottom:1px solid rgba(95,232,255,.08)}
      .telemetry-row:last-child{border-bottom:0}
      .telemetry-label{font:600 11px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.12em;color:#718b96}
      .telemetry-readout{text-align:right}
      .telemetry-value{display:block;font:700 clamp(20px,2.1vw,30px)/1 ui-monospace,SFMono-Regular,Consolas,monospace;color:#e8fdff;text-shadow:0 0 14px rgba(0,225,255,.22);font-variant-numeric:tabular-nums}
      .telemetry-unit{font-size:9px;color:#5f8794;letter-spacing:.1em;margin-left:5px}
      .telemetry-bar{height:3px;margin-top:10px;background:#07131a;overflow:hidden}
      .telemetry-bar span{display:block;height:100%;width:var(--pct);background:linear-gradient(90deg,#0c778e,#8cffff);box-shadow:0 0 10px rgba(0,229,255,.8);animation:telemetryBar 1.5s ease-out both}
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
      .telemetry-spark{height:42px;margin-top:18px;position:relative;overflow:hidden;border:1px solid rgba(95,232,255,.08);background:repeating-linear-gradient(90deg,rgba(84,230,255,.04) 0,rgba(84,230,255,.04) 1px,transparent 1px,transparent 32px)}
      .telemetry-spark svg{width:100%;height:100%;overflow:visible}.telemetry-spark path{fill:none;stroke:#72faff;stroke-width:1.2;filter:drop-shadow(0 0 4px rgba(0,225,255,.8));stroke-dasharray:260;stroke-dashoffset:260;animation:sparkDraw 2.8s linear infinite}
      @keyframes sparkDraw{to{stroke-dashoffset:0}}
      @media(max-width:900px){.ax-suit-stage{inset:3% -1% 3% 27%!important}.ax-suit{width:min(65%,330px);min-width:210px}.live-specs{grid-template-columns:1fr}}
      @media(max-width:620px){.ax-suit-stage{inset:6% -10% 5% 29%!important}.ax-suit{width:65%;min-width:180px}.armor-ring{opacity:.25!important}.target-marker{font-size:8px}.live-specs{gap:16px}.telemetry-side{min-height:360px}}
    `;
    document.head.appendChild(s);
  }

  function installSuit() {
    const host = $('.armor-visual');
    if (!host || $('.ax-suit-stage', host)) return;
    const old = $('.armor-silhouette', host); if (old) old.remove();
    const oldCore = $('.armor-core', host); if (oldCore) oldCore.remove();

    const stage = document.createElement('div');
    stage.className = 'ax-suit-stage';
    stage.innerHTML = `
      <div class="ax-suit" aria-label="ARMOR X AX-01 powered armor visualization">
        <svg viewBox="0 0 700 900" role="img" aria-hidden="true">
          <defs>
            <linearGradient id="axMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#43525d"/><stop offset=".3" stop-color="#101a21"/><stop offset=".58" stop-color="#6a7680"/><stop offset=".75" stop-color="#18242d"/><stop offset="1" stop-color="#050b10"/></linearGradient>
            <linearGradient id="axRed" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3e35"/><stop offset=".3" stop-color="#8a1516"/><stop offset=".56" stop-color="#df2b28"/><stop offset=".78" stop-color="#4c0b0f"/><stop offset="1" stop-color="#130306"/></linearGradient>
            <linearGradient id="axGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe7a1"/><stop offset=".35" stop-color="#b48735"/><stop offset=".55" stop-color="#f1c75a"/><stop offset=".8" stop-color="#654819"/><stop offset="1" stop-color="#211607"/></linearGradient>
            <linearGradient id="axBlack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17242c"/><stop offset=".5" stop-color="#050b10"/><stop offset="1" stop-color="#010407"/></linearGradient>
            <linearGradient id="axVisor" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaffff"/><stop offset=".35" stop-color="#55efff"/><stop offset=".7" stop-color="#0b7191"/><stop offset="1" stop-color="#04252f"/></linearGradient>
            <radialGradient id="axCore"><stop offset="0" stop-color="#ffffff"/><stop offset=".25" stop-color="#bfffff"/><stop offset=".52" stop-color="#11e5ff"/><stop offset="1" stop-color="#005064" stop-opacity=".25"/></radialGradient>
            <filter id="axGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path class="armor-black" d="M250 220Q350 170 450 220L486 324 463 430 504 510 482 621 448 673 420 848 350 870 280 848 252 673 218 621 196 510 237 430 214 324Z" opacity=".95"/>
          <path class="armor-dark" d="M275 120Q287 59 350 43Q413 59 425 120L410 198 350 226 290 198Z" stroke="#071019" stroke-width="8"/>
          <path class="armor-red" d="M277 116Q291 68 350 54Q409 68 423 116L407 134 293 134Z"/>
          <path class="armor-dark" d="M286 126L304 150 321 145 327 192 350 210 373 192 379 145 396 150 414 126 409 193 350 224 291 193Z"/>
          <path class="visor" d="M304 117Q350 94 396 117L385 146 350 160 315 146Z"/>
          <path class="edge" d="M306 116Q350 93 394 116"/><path class="armor-gold" d="M293 103L312 92 318 113 301 126Z"/><path class="armor-gold" d="M407 103L388 92 382 113 399 126Z"/>
          <circle class="warning" cx="350" cy="73" r="3"/>
          <path class="armor-black" d="M306 192L332 210 350 226 368 210 394 192 409 228 380 258 320 258 291 228Z" stroke="#0a151d" stroke-width="5"/>
          <path class="armor-gold" d="M307 205L329 218 316 242 294 228Z"/><path class="armor-gold" d="M393 205L371 218 384 242 406 228Z"/>
          <path class="armor-red" d="M229 240Q188 235 147 273L129 338 187 361 246 314 262 267Z" stroke="#08121a" stroke-width="8"/><path class="armor-red" d="M471 240Q512 235 553 273L571 338 513 361 454 314 438 267Z" stroke="#08121a" stroke-width="8"/>
          <path class="armor-gold" d="M149 275L194 254 181 318 146 332Z"/><path class="armor-gold" d="M551 275L506 254 519 318 554 332Z"/>
          <path class="mechanical" d="M151 334Q194 333 230 307L239 330Q203 363 161 361Z"/><path class="mechanical" d="M549 334Q506 333 470 307L461 330Q497 363 539 361Z"/>
          <path class="armor-red" d="M296 235L350 219 404 235 438 309 420 419 350 463 280 419 262 309Z" stroke="#071019" stroke-width="9"/>
          <path class="armor-dark" d="M286 254L312 236 341 277 307 331 268 314Z"/><path class="armor-dark" d="M414 254L388 236 359 277 393 331 432 314Z"/>
          <path class="armor-gold" d="M279 265L304 249 321 276 299 298 271 291Z"/><path class="armor-gold" d="M421 265L396 249 379 276 401 298 429 291Z"/>
          <path class="armor-black" d="M306 331L394 331 411 404 350 444 289 404Z"/>
          <polygon class="armor-dark" points="350,277 392,302 406,346 380,383 320,383 294,346 308,302" stroke="#6cefff" stroke-opacity=".45" stroke-width="2"/>
          <circle cx="350" cy="334" r="40" fill="#06151d" stroke="#4beeff" stroke-opacity=".45" stroke-width="2"/><circle class="suit-core-ring" cx="350" cy="334" r="33"/><circle class="suit-core-ring alt" cx="350" cy="334" r="25"/><circle class="suit-core" cx="350" cy="334" r="15"/><circle cx="350" cy="334" r="4" fill="#fff" filter="url(#axGlow)"/>
          <path class="armor-dark" d="M292 405L334 433 350 447 366 433 408 405 420 475 384 514 350 532 316 514 280 475Z"/><path class="armor-red" d="M314 421L338 438 350 449 362 438 386 421 392 464 350 487 308 464Z" stroke="#09131a" stroke-width="5"/>
          <path class="armor-red" d="M319 474L350 488 381 474 386 505 350 526 314 505Z"/><path class="armor-gold" d="M286 438L307 429 313 462 290 474Z"/><path class="armor-gold" d="M414 438L393 429 387 462 410 474Z"/>
          <path class="armor-red" d="M184 347L229 313 272 350 261 426 236 493 197 505 175 448Z" stroke="#071019" stroke-width="8"/><path class="armor-red" d="M516 347L471 313 428 350 439 426 464 493 503 505 525 448Z" stroke="#071019" stroke-width="8"/>
          <path class="armor-dark" d="M194 362L223 340 248 359 233 414 204 432Z"/><path class="armor-dark" d="M506 362L477 340 452 359 467 414 496 432Z"/>
          <path class="armor-gold" d="M176 392L205 365 212 404 184 428Z"/><path class="armor-gold" d="M524 392L495 365 488 404 516 428Z"/>
          <circle class="joint" cx="231" cy="350" r="13"/><circle class="joint" cx="469" cy="350" r="13"/>
          <path class="armor-dark" d="M176 435L235 427 252 497 232 561 188 569 163 507Z" stroke="#08131a" stroke-width="8"/><path class="armor-dark" d="M524 435L465 427 448 497 468 561 512 569 537 507Z" stroke="#08131a" stroke-width="8"/>
          <path class="armor-red" d="M171 466L215 451 236 478 227 520 188 531Z"/><path class="armor-red" d="M529 466L485 451 464 478 473 520 512 531Z"/>
          <circle class="repulsor" cx="198" cy="490" r="12"/><circle class="repulsor" cx="502" cy="490" r="12"/>
          <path class="armor-dark" d="M184 556L229 551 246 574 239 620 213 646 181 637 163 604Z" stroke="#08131a" stroke-width="7"/><path class="armor-dark" d="M516 556L471 551 454 574 461 620 487 646 519 637 537 604Z" stroke="#08131a" stroke-width="7"/>
          <path class="armor-gold" d="M175 578L201 565 224 584 212 606 181 610Z"/><path class="armor-gold" d="M525 578L499 565 476 584 488 606 519 610Z"/>
          <path class="cyan-soft" d="M188 617l15-28 8 12-10 23z"/><path class="cyan-soft" d="M512 617l-15-28-8 12 10 23z"/>
          <path class="armor-black" d="M280 506L315 520 350 534 385 520 420 506 438 562 395 604 350 616 305 604 262 562Z"/><path class="armor-red" d="M290 524L328 537 350 546 372 537 410 524 414 562 382 585 350 593 318 585 286 562Z" stroke="#09131a" stroke-width="6"/>
          <path class="armor-gold" d="M266 540L286 526 301 552 283 578Z"/><path class="armor-gold" d="M434 540L414 526 399 552 417 578Z"/>
          <path class="armor-red" d="M292 592L347 607 329 741 278 760 253 704 257 620Z" stroke="#071019" stroke-width="9"/><path class="armor-red" d="M408 592L353 607 371 741 422 760 447 704 443 620Z" stroke="#071019" stroke-width="9"/>
          <path class="armor-dark" d="M293 615L332 627 315 710 278 721 271 674Z"/><path class="armor-dark" d="M407 615L368 627 385 710 422 721 429 674Z"/>
          <path class="armor-gold" d="M269 620L290 612 302 650 279 667Z"/><path class="armor-gold" d="M431 620L410 612 398 650 421 667Z"/>
          <circle class="joint" cx="289" cy="742" r="15"/><circle class="joint" cx="411" cy="742" r="15"/>
          <path class="armor-dark" d="M278 746L327 735 348 853 310 877 274 844 259 792Z" stroke="#071019" stroke-width="8"/><path class="armor-dark" d="M422 746L373 735 352 853 390 877 426 844 441 792Z" stroke="#071019" stroke-width="8"/>
          <path class="armor-red" d="M285 760L317 752 330 825 308 846 282 824Z"/><path class="armor-red" d="M415 760L383 752 370 825 392 846 418 824Z"/>
          <path class="armor-gold" d="M265 787L286 777 294 818 273 829Z"/><path class="armor-gold" d="M435 787L414 777 406 818 427 829Z"/>
          <path class="vent" d="M292 797h23l-3 5h-23zM295 811h21l-3 5h-21zM298 825h18l-3 5h-18zM408 797h-23l3 5h23zM405 811h-21l3 5h21zM402 825h-18l3 5h18z"/>
          <path class="armor-red" d="M273 839L311 848 326 870 313 892 231 891 215 873 241 850Z" stroke="#071019" stroke-width="8"/><path class="armor-red" d="M427 839L389 848 374 870 387 892 469 891 485 873 459 850Z" stroke="#071019" stroke-width="8"/>
          <path class="armor-dark" d="M244 856L301 862 312 878 298 886 230 884Z"/><path class="armor-dark" d="M456 856L399 862 388 878 402 886 470 884Z"/><path class="cyan-soft" d="M237 875h59l6 5h-66zM463 875h-59l-6 5h66z"/>
          <g opacity=".75"><circle class="micro" cx="245" cy="279" r="3"/><circle class="micro" cx="455" cy="279" r="3"/><circle class="micro" cx="258" cy="296" r="2"/><circle class="micro" cx="442" cy="296" r="2"/><circle class="micro" cx="211" cy="468" r="2"/><circle class="micro" cx="489" cy="468" r="2"/><circle class="micro" cx="296" cy="650" r="2"/><circle class="micro" cx="404" cy="650" r="2"/><circle class="micro" cx="300" cy="708" r="2"/><circle class="micro" cx="400" cy="708" r="2"/></g>
        </svg>
      </div>`;
    host.appendChild(stage);
  }

  function addMotionLayer() {
    if ($('#ax-motion-layer')) return;
    const layer = document.createElement('div');
    layer.id = 'ax-motion-layer';
    layer.innerHTML = `<div class="ax-motion-field"></div>${Array.from({length:20},(_,i)=>`<i class="ax-motion-node n${i}"></i>`).join('')}${Array.from({length:9},(_,i)=>`<i class="ax-motion-line l${i}"></i>`).join('')}`;
    document.body.prepend(layer);
    const s=document.createElement('style');s.id='ax-motion-style';s.textContent=`
      #ax-motion-layer{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
      .ax-motion-field{position:absolute;inset:-35%;background-image:linear-gradient(rgba(0,220,255,.085) 1px,transparent 1px),linear-gradient(90deg,rgba(0,220,255,.085) 1px,transparent 1px);background-size:62px 62px;transform:perspective(900px) rotateX(61deg);transform-origin:center;animation:axFieldDrift 7s linear infinite}
      .ax-motion-node{position:absolute;width:4px;height:4px;border-radius:50%;background:#a8ffff;box-shadow:0 0 8px #00eaff,0 0 22px rgba(0,220,255,.8);animation:axNodeMove var(--d) linear infinite,axNodePulse 1.4s ease-in-out infinite}
      .ax-motion-line{position:absolute;width:32vw;height:1px;left:-35vw;background:linear-gradient(90deg,transparent,#42efff,transparent);box-shadow:0 0 9px rgba(0,220,255,.75);transform:rotate(var(--a));animation:axLineMove var(--d) linear infinite}
      @keyframes axFieldDrift{from{background-position:0 0}to{background-position:62px 62px}}@keyframes axNodeMove{from{transform:translateX(-10vw)}to{transform:translateX(120vw)}}@keyframes axNodePulse{0%,100%{opacity:.2;scale:.65}50%{opacity:1;scale:1.35}}@keyframes axLineMove{0%{transform:translateX(-20vw) rotate(var(--a));opacity:0}15%,80%{opacity:1}100%{transform:translateX(150vw) rotate(var(--a));opacity:0}}
      .n0{left:4%;top:18%;--d:6s;animation-delay:-1s}.n1{left:13%;top:46%;--d:8s;animation-delay:-4s}.n2{left:25%;top:29%;--d:7s;animation-delay:-2s}.n3{left:37%;top:76%;--d:9s;animation-delay:-5s}.n4{left:49%;top:17%;--d:6.5s;animation-delay:-3s}.n5{left:61%;top:57%;--d:8.5s;animation-delay:-6s}.n6{left:74%;top:25%;--d:7.5s;animation-delay:-1.5s}.n7{left:87%;top:72%;--d:9.2s;animation-delay:-7s}.n8{left:95%;top:41%;--d:6.8s;animation-delay:-2.7s}.n9{left:7%;top:83%;--d:8.8s;animation-delay:-5.5s}.n10{left:20%;top:12%;--d:7.2s;animation-delay:-3.7s}.n11{left:33%;top:61%;--d:10s;animation-delay:-8s}.n12{left:45%;top:43%;--d:6.2s;animation-delay:-1.2s}.n13{left:57%;top:82%;--d:8.1s;animation-delay:-5.9s}.n14{left:69%;top:34%;--d:7.7s;animation-delay:-4.2s}.n15{left:81%;top:88%;--d:9.5s;animation-delay:-6.3s}.n16{left:91%;top:16%;--d:6.4s;animation-delay:-3.1s}.n17{left:54%;top:8%;--d:8.9s;animation-delay:-7.3s}.n18{left:29%;top:91%;--d:7.9s;animation-delay:-2.9s}.n19{left:76%;top:9%;--d:9.1s;animation-delay:-6.8s}
      .l0{top:19%;--a:-7deg;--d:5.2s;animation-delay:-1s}.l1{top:32%;--a:4deg;--d:6.8s;animation-delay:-4s}.l2{top:46%;--a:-5deg;--d:5.9s;animation-delay:-2s}.l3{top:58%;--a:8deg;--d:7.3s;animation-delay:-6s}.l4{top:67%;--a:-3deg;--d:6.1s;animation-delay:-3s}.l5{top:77%;--a:6deg;--d:8s;animation-delay:-5s}.l6{top:86%;--a:-8deg;--d:5.6s;animation-delay:-1.8s}.l7{top:11%;--a:3deg;--d:7.1s;animation-delay:-4.8s}.l8{top:93%;--a:-4deg;--d:6.4s;animation-delay:-2.4s}
    `;document.head.appendChild(s);
  }

  function buildWebGL() {
    if ($('#armor-x-webgl')) return;
    const root=document.createElement('div');root.id='armor-x-effects';const canvas=document.createElement('canvas');canvas.id='armor-x-webgl';root.appendChild(canvas);document.body.prepend(root);
    const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'high-performance'});if(!gl){root.remove();return;}
    const vs=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
    const fs=`precision mediump float;uniform vec2 r;uniform float t;float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}float line(vec2 p,vec2 a,vec2 b,float w){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return smoothstep(w,0.,length(pa-ba*h));}void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv-.5;p.x*=r.x/r.y;float time=t;vec3 c=vec3(.006,.014,.022);vec2 g=p*3.4;vec2 f=fract(g)-.5;float grid=max(smoothstep(.028,.0,abs(f.x)),smoothstep(.028,.0,abs(f.y)))*.38;float drift=noise(p*3.5+vec2(time*.12,-time*.09));c+=vec3(.01,.09,.13)*(grid*.55+drift*.28);for(int i=0;i<9;i++){float fi=float(i);float yy=fract(fi*.173+time*(.028+.006*mod(fi,3.)));float x=.08+.84*noise(vec2(fi,fi*2.3));float seg=exp(-abs(uv.y-yy)*125.)*exp(-abs(uv.x-x)*18.);c+=vec3(.02,.35,.48)*seg*(.35+.65*sin(time*2.1+fi));}for(int i=0;i<7;i++){float fi=float(i);vec2 a=vec2(fract(fi*.197+.13),fract(fi*.319+time*.035));vec2 b=vec2(fract(fi*.413+.67),fract(fi*.221-time*.022));float q=line(uv,a,b,.0018);c+=vec3(.05,.45,.65)*q*(.35+.65*sin(time*2.4+fi*1.7));}for(int i=0;i<18;i++){float fi=float(i);vec2 q=vec2(fract(fi*.271+time*(.02+.003*fi)),fract(fi*.617+sin(time*.2+fi)));float d=length(uv-q);float s=smoothstep(.012,0.,d);c+=vec3(.08,.75,1.)*s*(.35+.65*sin(time*3.+fi));}float scan=smoothstep(.02,0.,abs(fract(uv.y+time*.055)-.5)-.47);c+=vec3(.08,.65,.75)*scan*.16;float vign=smoothstep(.95,.18,length(uv-.5));c*=vign;gl_FragColor=vec4(c,.9);}`;
    function compile(type,src){const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);return sh;}
    const pr=gl.createProgram();gl.attachShader(pr,compile(gl.VERTEX_SHADER,vs));gl.attachShader(pr,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);const tr=gl.getUniformLocation(pr,'t'),rr=gl.getUniformLocation(pr,'r');
    function resize(){const d=Math.min(devicePixelRatio||1,1.8);canvas.width=innerWidth*d;canvas.height=innerHeight*d;gl.viewport(0,0,canvas.width,canvas.height)}addEventListener('resize',resize);resize();function draw(now){gl.uniform1f(tr,now*.001);gl.uniform2f(rr,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(draw)}requestAnimationFrame(draw);
  }

  function buildTelemetry(){
    const section=$('#specifications'),container=section&&$('.container',section);if(!container||$('.live-specs',section))return;
    const wrap=document.createElement('div');wrap.className='live-specs';wrap.innerHTML=`<div class="telemetry-panel"><div class="telemetry-head"><span>LIVE SYSTEM TELEMETRY</span><span class="telemetry-live"><i class="telemetry-dot"></i>STREAMING</span></div><div id="ax-telemetry-rows"></div><div class="telemetry-spark"><svg viewBox="0 0 500 42" preserveAspectRatio="none"><path d="M0 29 L22 27 L39 30 L55 12 L71 19 L93 17 L111 31 L127 26 L148 28 L166 14 L183 22 L201 10 L221 18 L241 15 L259 31 L278 25 L296 27 L318 9 L337 16 L355 13 L374 28 L391 23 L410 25 L431 7 L448 15 L467 12 L500 26"/></svg></div></div><div class="telemetry-side"><div class="telemetry-side-title">DIAGNOSTIC CORE // AX-01</div><div class="radar"><div class="radar-grid"></div><div class="radar-sweep"></div><div class="radar-core"></div></div><div class="telemetry-log">ACTUATOR MATRIX <span>ONLINE</span><br>COOLANT LOOP <span>NOMINAL</span><br>SENSOR FUSION <span>LOCKED</span><br>ARMOR NETWORK <span>SYNCED</span></div><div class="telemetry-footer"><span>FPS <strong id="ax-fps">60</strong></span><span>UPTIME <strong id="ax-uptime">00:00:00</strong></span></div></div>`;container.appendChild(wrap);
    const specs=[['ARC OUTPUT','kW',480,438,491],['CORE EFFICIENCY','%',96.4,94.8,97.2],['THERMAL LOAD','%',41.2,31,49],['ACTUATOR LOAD','%',43.2,22,76],['NEURAL LINK','%',99.7,98.7,99.9]];const rows=$('#ax-telemetry-rows');
    specs.forEach((sp,i)=>{const row=document.createElement('div');row.className='telemetry-row';row.innerHTML=`<div><div class="telemetry-label">${sp[0]}</div><div class="telemetry-bar"><span style="--pct:${Math.min(100,sp[2]/(sp[1]==='%'?100:500)*100)}%"></span></div></div><div class="telemetry-readout"><span class="telemetry-value" id="ax-tv-${i}">${sp[2].toFixed(1)}<span class="telemetry-unit">${sp[1]}</span></span></div>`;rows.appendChild(row)});
    const start=Date.now();let last=performance.now(),frames=0;function tick(now){specs.forEach((sp,i)=>{const el=$(`#ax-tv-${i}`);if(el)el.firstChild.nodeValue=(sp[3]+Math.random()*(sp[4]-sp[3])).toFixed(1)});frames++;if(now-last>1000){const f=$('#ax-fps');if(f)f.textContent=Math.min(60,Math.max(30,frames));frames=0;last=now}const sec=Math.floor((Date.now()-start)/1000),h=String(Math.floor(sec/3600)).padStart(2,'0'),m=String(Math.floor(sec%3600/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0'),u=$('#ax-uptime');if(u)u.textContent=`${h}:${m}:${s}`;requestAnimationFrame(tick)}requestAnimationFrame(tick);
  }

  function boot(){injectStyle();installSuit();addMotionLayer();buildWebGL();buildTelemetry()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
