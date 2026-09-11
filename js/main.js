(() => {
  "use strict";
  const C = window.SITE;
  let reduce = localStorage.getItem("portfolio-motion") === "off";
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = !!window.gsap && !!window.ScrollTrigger;
  let lenis, menuTimeline, menuOpen = false, marqueeTween, motionInitialized = false;

  const esc = (v) => { const d=document.createElement("div"); d.textContent=String(v); return d.innerHTML; };
  const safe = (u) => { const s=String(u||"#").trim(); return s==="#"||s.startsWith("https://")||s.startsWith("http://")||s.startsWith("assets/") ? esc(s) : "#"; };
  const makeStagger = (text) => `<span class="stagger-roll" aria-hidden="true">${
    Array.from(String(text||"")).map((ch, i) => ch === " " 
      ? `<span class="char-space">&nbsp;</span>` 
      : `<span class="char-col" style="--i:${i}"><span class="char-up">${esc(ch)}</span><span class="char-down">${esc(ch)}</span></span>`
    ).join("")
  }</span>`;

  function populate() {
    document.documentElement.classList.toggle("motion-off", reduce);
    const motionToggle = document.querySelector("#motionToggle");
    motionToggle.textContent = reduce ? "MOTION OFF" : "MOTION ON";
    motionToggle.setAttribute("aria-label", reduce ? "Turn motion on" : "Turn motion off");
    motionToggle.addEventListener("click", () => {
      localStorage.setItem("portfolio-motion", reduce ? "on" : "off");
      location.reload();
    });
    const flat={firstName:C.firstName,lastName:C.lastName,initials:C.initials,fullName:C.fullName,role:C.role,heroKicker:C.heroKicker,heroMessage:C.heroMessage,about:C.about,email:C.email,copyright:C.copyright};
    document.querySelectorAll("[data-cfg]").forEach(el=>{ if(flat[el.dataset.cfg]!==undefined) el.textContent=flat[el.dataset.cfg]; if(el.dataset.cfg==="email"&&el.tagName==="A") el.href=`mailto:${C.email}`; });
    document.querySelector(".hero-title").setAttribute("aria-label",C.fullName);

    const brand = document.querySelector(".nav-brand");
    if (brand && C.fullName) {
      brand.innerHTML = makeStagger(C.fullName);
      brand.setAttribute("aria-label", C.fullName);
    }
    const featureLink = document.querySelector(".feature-link");
    if (featureLink && C.projects && C.projects[2] && C.projects[2].link && C.projects[2].link !== "#") {
      featureLink.href = safe(C.projects[2].link);
      featureLink.target = "_blank";
      featureLink.rel = "noopener";
    }

    const story=document.querySelector("#projectStory");
    const getDomain=(link,title)=>{
      if(link&&link!=="#"&&link!=="/") return link.replace(/^https?:\/\//,"").replace(/\/$/,"");
      return `${title.toLowerCase().replace(/[^a-z0-9]/g,"")}.internal`;
    };
    story.innerHTML=C.projects.map(p=>`<article class="story-card horizontal-panel">
      <div class="story-media">
        <div class="browser-bar">
          <div class="browser-dots"><span></span><span></span><span></span></div>
          <div class="browser-url">${esc(getDomain(p.link,p.title))}</div>
          <span class="story-count">${esc(p.num)}</span>
        </div>
        <img src="${safe(p.img)}" alt="${esc(p.title)} project" loading="lazy">
      </div>
      <div class="story-foot"><div><p class="story-meta">${esc(p.year)} / ${esc(p.tags.join(" / "))}</p><h3 class="story-title">${esc(p.title)}</h3></div><p class="story-desc">${esc(p.desc)}</p></div>
    </article>`).join("");

    document.querySelector("#archiveGrid").innerHTML=C.projects.map(p=>`<a class="archive-card" href="${safe(p.link)}" ${p.link!=="#"?'target="_blank" rel="noopener"':""}>
      <div class="archive-card-base">
        <img src="${safe(p.archiveImg||p.img)}" data-fallback="${safe(p.img)}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="${esc(p.title)} project" loading="lazy">
      </div>
      <div class="archive-card-reveal">
        <img src="${safe(p.archiveAltImg||p.altImg||p.img)}" data-fallback="${safe(p.altImg||p.img)}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="${esc(p.title)} preview" loading="lazy">
      </div>
      <div class="archive-info">
        <div class="archive-meta">
          <small>${esc(p.num)} / ${esc(p.year)}</small>
          <span class="archive-explore">EXPLORE ↗</span>
        </div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.tags.join(" • "))}</p>
      </div>
    </a>`).join("");

    document.querySelector("#experienceList").innerHTML=C.experience.map(e=>`<article class="experience-row"><span>${esc(e.period)}</span><strong>${esc(e.title)}</strong><span>${esc(e.org)}</span><p>${esc(e.desc)}</p></article>`).join("");

    document.querySelector("#fanWrap").innerHTML=C.fanCards.map((c,i)=>`<a class="fan-card" href="${safe(c.url)}" data-fan="${i}" ${c.url!=="#"?'target="_blank" rel="noopener"':""}><img src="${safe(c.img)}" alt="${esc(c.label)} placeholder"><span class="fan-card-copy"><strong>${esc(c.label)}</strong><span>${esc(c.text)}</span></span></a>`).join("");

    const words=C.skills.map(s=>`<span class="marquee-word">${esc(s)}</span>`).join("");
    document.querySelector("#skillsMarquee").innerHTML=`<div class="marquee-set">${words}</div><div class="marquee-set" aria-hidden="true">${words}</div>`;
    document.querySelector("#footerSocials").innerHTML=C.socials.map(s=>`<a href="${safe(s.url)}" ${s.url!=="#"?'target="_blank" rel="noopener"':""}>${esc(s.label)}</a>`).join("");
    document.querySelector('[data-cfg-href="github"]').href=C.github;
    document.querySelector('[data-project-link="2"]').href=C.projects[2].link;

    const statsEl = document.querySelector("#manifestoStats");
    if(statsEl && Array.isArray(C.stats)){
      statsEl.innerHTML = C.stats.map(s => `<div class="stat-card"><span class="stat-value">${esc(s.value)}</span><span class="stat-label">${esc(s.label)}</span></div>`).join("");
    }

    setupCopyEmail();
    buildMenuArt();
    setupMonogramOrbit();
  }

  function setupCopyEmail(){
    const toast=document.querySelector("#copyToast"),toastEmail=document.querySelector("#toastEmail");
    if(toastEmail)toastEmail.textContent=C.email;
    let timer;
    const copy=(text)=>{
      if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text);
      return new Promise((res,rej)=>{
        try{
          const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();
          const ok=document.execCommand("copy");document.body.removeChild(ta);ok?res():rej();
        }catch(err){rej(err)}
      });
    };
    document.querySelectorAll(".footer-email").forEach(link=>{
      link.addEventListener("click",e=>{
        e.preventDefault();
        copy(C.email).then(()=>{
          if(!toast)return;
          toast.classList.add("is-visible");toast.setAttribute("aria-hidden","false");
          clearTimeout(timer);timer=setTimeout(()=>{toast.classList.remove("is-visible");toast.setAttribute("aria-hidden","true")},2400);
        }).catch(()=>{location.href=`mailto:${C.email}`});
      });
    });
  }

  function buildMenuArt(){
    const imgs=[...C.projects.map(p=>p.img),...C.fanCards.map(c=>c.img)];
    const make=(offset)=>[0,1,2].map((_,i)=>`<figure data-art="${i+offset}"><img src="${safe(imgs[i+offset])}" alt=""></figure>`).join("");
    document.querySelector("#menuArtLeft").innerHTML=make(0); document.querySelector("#menuArtRight").innerHTML=make(2);
  }

  function setupMonogramOrbit(){
    const sat=document.querySelector(".monogram-sat-group");
    const monogram=document.querySelector(".nav-monogram");
    if(!sat||!monogram)return;

    let angle=0;
    const idleSpeed=360/11000;
    const hoverSpeed=360/2200;
    let currentSpeed=idleSpeed;
    let isHovered=false;
    let lastTime=performance.now();

    monogram.addEventListener("mouseenter",()=>{isHovered=true;});
    monogram.addEventListener("mouseleave",()=>{isHovered=false;});

    function tick(now){
      if(document.documentElement.classList.contains("motion-off")){
        requestAnimationFrame(tick);
        return;
      }
      const dt=Math.min(now-lastTime,100);
      lastTime=now;

      const destSpeed=isHovered?hoverSpeed:idleSpeed;
      currentSpeed+=(destSpeed-currentSpeed)*0.08;

      angle=(angle+currentSpeed*dt)%360;
      sat.style.transform=`rotate(${angle}deg)`;

      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function transitionCanvas(){
    const canvas=document.querySelector("#transitionCanvas");
    if(!canvas)return ()=>{}
    const ctx=canvas.getContext("2d");
    let raf,w=0,h=0;
    const resize=()=>{
      w=innerWidth;
      h=innerHeight;
      canvas.width=w*devicePixelRatio;
      canvas.height=h*devicePixelRatio;
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    };
    resize();
    window.addEventListener("resize",resize);

    let t=0;
    const numStrands=7;
    const pitch=0.22;
    const cosPitch=Math.cos(pitch);
    const sinPitch=Math.sin(pitch);
    const step=12;

    const draw=()=>{
      t+=0.014;
      ctx.clearRect(0,0,w,h);
      const steps=Math.ceil(w/step)+2;

      for(let j=0;j<numStrands;j++){
        const phi=j*((Math.PI*2)/numStrands);
        const radScale=0.88+0.24*Math.sin(j*1.5);
        let prevX=0,prevY=0;

        for(let i=0;i<=steps;i++){
          const x=i*step;
          // Forward progression along x + circular revolution over time t
          const angle=x*0.0032-t*1.25+phi;
          // Flowing spine across the canvas
          const spineY=h*0.5+Math.sin(x*0.0016+t*0.22)*80+Math.cos(x*0.0028-t*0.12)*35;
          // Circular 3D cylinder coordinates
          const radiusY=(130+Math.sin(x*0.0014+t*0.3)*28)*radScale;
          const radiusZ=(115+Math.sin(x*0.0014+t*0.3)*25)*radScale;

          const y3d=radiusY*Math.sin(angle);
          const z3d=radiusZ*Math.cos(angle);

          // 3D tilt pitch
          const rotY=y3d*cosPitch-z3d*sinPitch;
          const rotZ=y3d*sinPitch+z3d*cosPitch;

          // Perspective depth scaling
          const focal=420;
          const scale=focal/(focal+rotZ*0.6);
          const curX=x;
          const curY=spineY+rotY*scale;

          if(i>0){
            const normZ=Math.max(0,Math.min(1,(rotZ+radiusZ)/(2*radiusZ)));
            const alpha=0.18+normZ*0.36;
            const lw=0.9+normZ*0.8;

            ctx.beginPath();
            ctx.moveTo(prevX,prevY);
            ctx.lineTo(curX,curY);
            ctx.strokeStyle=`rgba(7, 19, 15, ${alpha.toFixed(3)})`;
            ctx.lineWidth=lw;
            ctx.stroke();
          }

          prevX=curX;
          prevY=curY;
        }
      }
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return ()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",resize);
    };
  }

  function preloader(){
    const stop=transitionCanvas(),state={n:0};
    if(reduce||!hasGSAP){document.querySelector("#transition").remove();document.body.classList.remove("is-locked");stop();init();return;}
    gsap.to(state,{n:100,duration:2.2,ease:"power2.inOut",onUpdate:()=>document.querySelector("#loadCount").textContent=String(Math.round(state.n)).padStart(3,"0")});
    let entered=false; const enter=()=>{if(entered)return;entered=true;document.body.classList.remove("is-locked");window.__portfolioEntered=true;try{init()}catch(error){window.__portfolioInitError=`${error.name}: ${error.message}`;console.error(error)}gsap.timeline({onComplete:()=>{document.querySelector("#transition")?.remove();stop()}}).to(".transition-mark",{scale:.7,opacity:0,duration:.5,ease:"power2.in"}).to("#transition",{clipPath:"ellipse(110% 0% at 50% 0%)",duration:1,ease:"power3.inOut"},"-=.2")};
    document.querySelector("#transition").addEventListener("click", enter, { once: true });
  }

  function setupLenis(){
    if(reduce||!window.Lenis)return;
    lenis=new Lenis({lerp:.1,smoothWheel:true,touchMultiplier:1.25,syncTouch:false});
    lenis.on("scroll",e=>{ScrollTrigger.update();if(marqueeTween)gsap.to(marqueeTween,{timeScale:e.direction||1,duration:.3,overwrite:true})});
    gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
  }

  function setupMenu(){
    const menu=document.querySelector("#menu"),toggle=document.querySelector("#menuToggle"),links=gsap.utils.toArray(".menu-links a .menu-link-inner"),arts=gsap.utils.toArray(".menu-art figure");
    menuTimeline=gsap.timeline({paused:true,onStart:()=>{menu.style.visibility="visible";menu.setAttribute("aria-hidden","false");lenis?.stop()},onReverseComplete:()=>{menu.style.visibility="hidden";menu.setAttribute("aria-hidden","true");lenis?.start()}})
      .to(menu,{clipPath:"ellipse(110% 110% at 50% 0%)",duration:.8,ease:"power3.out"})
      .fromTo(arts,{y:100,scale:.82},{y:0,scale:1,duration:.8,stagger:.06,ease:"power3.out"},.15)
      .fromTo(links,{yPercent:120},{yPercent:0,duration:.6,stagger:.08,ease:"back.out(1.2)"},.35);
    const set=(open)=>{menuOpen=open;toggle.classList.toggle("is-open",open);toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Close menu":"Open menu");open?menuTimeline.timeScale(1).play():menuTimeline.timeScale(1.5).reverse()};
    toggle.addEventListener("click",()=>set(!menuOpen));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menuOpen){set(false);toggle.focus();}});
    document.querySelectorAll(".menu-links a").forEach((a,i)=>a.addEventListener("pointerenter",()=>arts.forEach((art,j)=>art.classList.toggle("is-active",j%5===i%5))));
    document.querySelectorAll(".menu-links a:not([data-jump])").forEach(a=>a.addEventListener("click",()=>{if(menuOpen)set(false);}));
    if(canHover){menu.addEventListener("pointermove",e=>{const n=e.clientY/innerHeight-.5;gsap.to(".menu-art-left figure",{y:n*96,duration:2,ease:"power2.out"});gsap.to(".menu-art-right figure",{y:n*-96,duration:2,ease:"power2.out"})})}
    document.querySelectorAll("[data-jump]").forEach(a=>a.addEventListener("click",e=>{const id=a.getAttribute("href");if(!id?.startsWith("#"))return;e.preventDefault();if(menuOpen)set(false);const target=document.querySelector(id);setTimeout(()=>lenis?lenis.scrollTo(target,{duration:1.4}):target.scrollIntoView({behavior:reduce?"auto":"smooth"}),menuOpen?650:0)}));
  }

  function heroCanvas(){
    const canvas=document.querySelector("#heroCanvas"),ctx=canvas.getContext("2d",{alpha:false});let raf,w,h,dpr=Math.min(devicePixelRatio,1.7),pointer={x:.5,y:.5,active:false},time=0;
    const points=Array.from({length:95},(_,i)=>({x:Math.random(),y:Math.random(),r:1+Math.random()*2,p:Math.random()*6.28}));
    const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};resize();
    const move=e=>{const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width;pointer.y=(e.clientY-r.top)/r.height;pointer.active=true};canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerleave",()=>pointer.active=false);
    const draw=()=>{time+=.008;ctx.fillStyle="#0d1d17";ctx.fillRect(0,0,w,h);const px=(pointer.active?pointer.x:.5+Math.cos(time*.7)*.16)*w,py=(pointer.active?pointer.y:.5+Math.sin(time*.9)*.12)*h;const g=ctx.createRadialGradient(px,py,0,px,py,Math.max(w,h)*.48);g.addColorStop(0,"rgba(255,128,0,.4)");g.addColorStop(.35,"rgba(255,128,0,.09)");g.addColorStop(1,"rgba(13,29,23,0)");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);points.forEach((p,i)=>{const x=(p.x+Math.sin(time*1.8+p.p)*.018)*w,y=(p.y+Math.cos(time*1.3+p.p)*.022)*h,dist=Math.hypot(x-px,y-py);ctx.fillStyle=dist<180?"rgba(255,128,0,.9)":"rgba(242,240,232,.26)";ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();for(let j=i+1;j<Math.min(i+6,points.length);j++){const q=points[j],qx=q.x*w,qy=q.y*h,d=Math.hypot(x-qx,y-qy);if(d<100){ctx.strokeStyle=`rgba(255,128,0,${(1-d/100)*.13})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(qx,qy);ctx.stroke()}}});raf=requestAnimationFrame(draw)};draw();addEventListener("resize",resize);return()=>cancelAnimationFrame(raf);
  }

  function wipeReveals(){
    document.querySelectorAll(".wipe-reveal").forEach(el=>{const after=CSS.supports("selector(::after)");gsap.fromTo(el,{yPercent:105},{yPercent:0,duration:.6,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 90%",once:true}});if(after){const cover=document.createElement("span");cover.className="wipe-cover";el.appendChild(cover);gsap.timeline({scrollTrigger:{trigger:el,start:"top 90%",once:true}}).fromTo(cover,{scaleX:0,transformOrigin:"left"},{scaleX:1,duration:.6,ease:"power2.inOut"}).set(cover,{transformOrigin:"right"}).to(cover,{scaleX:0,duration:.6,ease:"power2.inOut"})}});
  }

  function setupLiquidCursor(){
    if(reduce)return;
    const stage=document.querySelector("#heroStage");
    const group=document.querySelector("#heroLiquidGooGroup");
    if(!stage||!group)return;

    const count=12;
    const baseRadii=[92,80,70,60,51,43,36,30,24,19,15,11];
    const lerps=[0.28,0.22,0.18,0.14,0.11,0.09,0.075,0.062,0.052,0.043,0.035,0.028];
    const nodes=[];

    let stageW=stage.clientWidth||innerWidth;
    let stageH=stage.clientHeight||innerHeight;
    let curX=stageW*0.35, curY=stageH*0.35;

    for(let i=0;i<count;i++){
      const circle=document.createElementNS("http://www.w3.org/2000/svg","circle");
      circle.setAttribute("fill","white");
      circle.setAttribute("r",String(baseRadii[i]));
      circle.setAttribute("cx",curX.toFixed(1));
      circle.setAttribute("cy",curY.toFixed(1));
      group.appendChild(circle);
      nodes.push({el:circle,x:curX,y:curY,baseR:baseRadii[i],lerp:lerps[i]});
    }

    const updateRadii=()=>{
      stageW=stage.clientWidth||innerWidth;
      stageH=stage.clientHeight||innerHeight;
      const scale=Math.max(0.55,Math.min(1.2,stageW/1200));
      nodes.forEach(n=>n.el.setAttribute("r",(n.baseR*scale).toFixed(1)));
    };
    updateRadii();
    addEventListener("resize",updateRadii);

    let pointerActive=false,userInteracted=false;
    let targetX=curX,targetY=curY;
    let idleTime=0;

    const onPointerMove=(e)=>{
      const r=stage.getBoundingClientRect();
      const x=e.clientX-r.left;
      const y=e.clientY-r.top;
      if(x>=-60&&x<=r.width+60&&y>=-60&&y<=r.height+60){
        pointerActive=true;
        userInteracted=true;
        targetX=Math.max(0,Math.min(r.width,x));
        targetY=Math.max(0,Math.min(r.height,y));
      } else {
        pointerActive=false;
      }
    };

    stage.addEventListener("pointerenter",(e)=>{
      pointerActive=true;
      userInteracted=true;
      const r=stage.getBoundingClientRect();
      targetX=e.clientX-r.left;
      targetY=e.clientY-r.top;
    });
    stage.addEventListener("pointerleave",()=>{pointerActive=false;});
    addEventListener("pointermove",onPointerMove,{passive:true});
    addEventListener("touchmove",(e)=>{if(e.touches&&e.touches[0])onPointerMove(e.touches[0]);},{passive:true});
    addEventListener("touchstart",(e)=>{if(e.touches&&e.touches[0])onPointerMove(e.touches[0]);},{passive:true});

    const draw=()=>{
      idleTime+=0.018;
      const r=stage.getBoundingClientRect();
      if(r.bottom>0&&r.top<innerHeight){
        let destX,destY;
        if(pointerActive&&userInteracted){
          destX=targetX;
          destY=targetY;
        } else {
          const t=idleTime*0.75;
          destX=(stageW*0.5)+Math.sin(t)*(stageW*0.28);
          destY=(stageH*0.48)+Math.sin(t*2)*(stageH*0.15);
        }

        let prevX=destX,prevY=destY;
        for(let i=0;i<nodes.length;i++){
          const n=nodes[i];
          n.x+=(prevX-n.x)*n.lerp;
          n.y+=(prevY-n.y)*n.lerp;
          n.el.setAttribute("cx",n.x.toFixed(1));
          n.el.setAttribute("cy",n.y.toFixed(1));
          prevX=n.x;
          prevY=n.y;
        }
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  function heroScene(){
    const tl=gsap.timeline({scrollTrigger:{trigger:".hero-track",start:"top top",end:"bottom bottom",scrub:.5}});
    tl.to(".nav",{scale:.84,duration:.1},0).to(".hero-copy",{opacity:0,y:-80,duration:.25},.08).to("#heroStage",{scale:.56,y:"32vh",borderRadius:"2.5rem",filter:"saturate(.35)",duration:.55,ease:"none"},.1).to(".hero-fluid-label",{opacity:0,duration:.1},.22).to(".hero-message",{opacity:1,y:0,duration:.28},.42).to(".drawn-signature path",{strokeDashoffset:0,duration:.35,ease:"power2.inOut"},.52).to("#heroStage",{y:"62vh",duration:.25,ease:"none"},.75);
    gsap.fromTo([".hero-copy-base .hero-word-top",".hero-copy-revealed .hero-word-top"],{yPercent:110},{yPercent:0,duration:1.5,ease:"power2.inOut",delay:.05});
    gsap.fromTo([".hero-copy-base .hero-word-bottom",".hero-copy-revealed .hero-word-bottom"],{yPercent:110},{yPercent:0,duration:1.5,ease:"power2.inOut",delay:.20});
  }

  function horizontalScene(){
    ScrollTrigger.matchMedia({
      "(min-width: 992px)":()=>{const section=document.querySelector("[data-horizontal]"),track=document.querySelector("#horizontalTrack");const distance=()=>track.scrollWidth-innerWidth;const tween=gsap.to(track,{x:()=>-distance(),ease:"none",scrollTrigger:{trigger:section,start:"top top",end:()=>`+=${distance()}`,pin:true,scrub:1,invalidateOnRefresh:true}});return()=>tween.kill()},
      "(max-width: 991px)":()=>gsap.utils.toArray(".story-card").forEach((card,i)=>gsap.fromTo(card,{x:i%2?-45:45,opacity:.4},{x:0,opacity:1,duration:.8,scrollTrigger:{trigger:card,start:"top 85%",once:true}}))
    });
  }

  function disciplineScene(){
    gsap.fromTo(".discipline-image-left",{x:-320},{x:0,ease:"none",scrollTrigger:{trigger:"[data-disciplines]",start:"top bottom",end:"bottom bottom",scrub:1}});gsap.fromTo(".discipline-image-right",{x:320},{x:0,ease:"none",scrollTrigger:{trigger:"[data-disciplines]",start:"top bottom",end:"bottom bottom",scrub:1}});gsap.fromTo(".discipline-left",{x:-80},{x:0,ease:"none",scrollTrigger:{trigger:"[data-disciplines]",start:"top bottom",end:"60% bottom",scrub:true}});gsap.fromTo(".discipline-right",{x:80},{x:0,ease:"none",scrollTrigger:{trigger:"[data-disciplines]",start:"top bottom",end:"60% bottom",scrub:true}});gsap.to(".discipline-bottom img",{yPercent:-16,scale:1.1,ease:"none",scrollTrigger:{trigger:".discipline-bottom",start:"top bottom",end:"bottom top",scrub:true}});
  }

  function archiveScene(){
    if(innerWidth<992)return;
    gsap.utils.toArray(".archive-card").forEach((card,i)=>gsap.fromTo(card,{y:i*45},{y:0,ease:"none",scrollTrigger:{trigger:".archive-grid",start:"top bottom",end:"bottom bottom",scrub:1}}));
  }

  function featureScene(){gsap.to("#featureVisor",{clipPath:"ellipse(170% 120% at 50% 0%)",ease:"none",scrollTrigger:{trigger:"[data-feature]",start:"top bottom",end:"bottom 65%",scrub:1}});gsap.utils.toArray(".feature-images figure").forEach((f,i)=>gsap.fromTo(f,{y:80+i*30},{y:-70,ease:"none",scrollTrigger:{trigger:"[data-feature]",start:"top bottom",end:"bottom top",scrub:true}}))}

  function marquee(){marqueeTween=gsap.to("#skillsMarquee",{xPercent:-50,duration:36,ease:"none",repeat:-1});gsap.fromTo("#skillsMarquee",{marginLeft:"-10vw"},{marginLeft:"10vw",ease:"none",scrollTrigger:{trigger:".skills",start:"top bottom",end:"bottom top",scrub:true}})}

  function fanScene(){const cards=gsap.utils.toArray(".fan-card"),n=cards.length,center=(n-1)/2;cards.forEach(c=>gsap.set(c,{xPercent:-50,x:0,rotation:0,scale:.8,y:160}));const fan=gsap.timeline({scrollTrigger:{trigger:"#fanWrap",start:"top 90%",once:true}});fan.to(cards,{y:0,duration:.8,stagger:{amount:.5,from:"end"},ease:"power3.out"}).to(cards,{x:i=>(i-center)*176,rotation:i=>(i-center)*7,scale:i=>1-Math.abs(i-center)*.075,duration:1.2,stagger:.03,ease:"elastic.out(1,.75)"},"-=.4");if(canHover)cards.forEach((card,i)=>{card.addEventListener("pointerenter",()=>cards.forEach((c,j)=>{const d=j-i;gsap.to(c,{x:(j-center)*176+(d===0?0:Math.sign(d)*Math.max(0,110-Math.abs(d)*30)),y:d===0?-40:0,scale:d===0?1.08:1-Math.abs(j-center)*.075,rotation:(j-center)*7+Math.sign(d)*3,duration:.5,ease:"elastic.out(1,.75)"})}));card.addEventListener("pointerleave",()=>cards.forEach((c,j)=>gsap.to(c,{x:(j-center)*176,y:0,scale:1-Math.abs(j-center)*.075,rotation:(j-center)*7,duration:.55,ease:"power3.out"})))})}

  function footerScene(){gsap.to("#footerMask",{clipPath:"ellipse(220% 140% at 50% 0%)",ease:"power1.inOut",scrollTrigger:{trigger:".footer",start:"top bottom",end:"bottom bottom",scrub:2}})}

  function themeScene(){document.querySelectorAll("[data-nav-theme]").forEach(section=>ScrollTrigger.create({trigger:section,start:"top 8%",end:"bottom 8%",onEnter:()=>document.documentElement.dataset.navTheme=section.dataset.navTheme,onEnterBack:()=>document.documentElement.dataset.navTheme=section.dataset.navTheme}))}

  function init(){
    if(motionInitialized)return;motionInitialized=true;window.__portfolioInitialized=true;document.body.classList.remove("is-locked");
    if(!hasGSAP)return;gsap.registerPlugin(ScrollTrigger);setupLenis();setupMenu();heroCanvas();setupLiquidCursor();
    if(reduce)return;
    heroScene();wipeReveals();horizontalScene();disciplineScene();archiveScene();featureScene();marquee();fanScene();footerScene();themeScene();
    gsap.fromTo(".manifesto-small",{opacity:0,y:50},{opacity:1,y:0,duration:.8,scrollTrigger:{trigger:".manifesto-small",start:"top 88%",once:true}});
    gsap.fromTo(".stat-card",{opacity:0,y:40},{opacity:1,y:0,duration:.75,stagger:.12,ease:"power2.out",scrollTrigger:{trigger:".manifesto-stats",start:"top 88%",once:true}});
    gsap.utils.toArray(".experience-row").forEach((row,i)=>gsap.fromTo(row,{x:i%2?-55:55,opacity:0},{x:0,opacity:1,duration:.75,scrollTrigger:{trigger:row,start:"top 90%",once:true}}));
    ScrollTrigger.refresh();
  }

  try {
    window.__portfolioStage = "populate";
    populate();
    window.__portfolioStage = "init";
    init();
    window.__portfolioStage = "preloader";
    preloader();
    window.__portfolioStage = "ready";
  } catch (error) {
    window.__portfolioError = `${error.name}: ${error.message}`;
    console.error(error);
  }
})();
