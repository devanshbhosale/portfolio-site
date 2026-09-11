(() => {
  "use strict";
  const C = window.SITE;
  let reduce = localStorage.getItem("portfolio-motion") === "off";
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = !!window.gsap && !!window.ScrollTrigger;
  let lenis, menuTimeline, menuOpen = false, marqueeTween, motionInitialized = false;

  const esc = (v) => { const d=document.createElement("div"); d.textContent=String(v); return d.innerHTML; };
  const safe = (u) => { const s=String(u||"#").trim(); return s==="#"||s.startsWith("https://")||s.startsWith("http://")||s.startsWith("assets/") ? esc(s) : "#"; };

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

    const story=document.querySelector("#projectStory");
    story.innerHTML=C.projects.map(p=>`<article class="story-card horizontal-panel">
      <div class="story-media"><img src="${safe(p.img)}" alt="${esc(p.title)} project placeholder" loading="lazy"><span class="story-count">${esc(p.num)}</span></div>
      <div class="story-foot"><div><p class="story-meta">${esc(p.year)} / ${esc(p.tags.join(" / "))}</p><h3 class="story-title">${esc(p.title)}</h3></div><p class="story-desc">${esc(p.desc)}</p></div>
    </article>`).join("");

    document.querySelector("#archiveGrid").innerHTML=C.projects.map(p=>`<a class="archive-card" href="${safe(p.link)}" ${p.link!=="#"?'target="_blank" rel="noopener"':""}>
      <div class="archive-card-base"><img src="${safe(p.archiveImg||p.img)}" data-fallback="${safe(p.img)}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt="${esc(p.title)} project"></div>
      <div class="archive-card-reveal"><img src="${safe(p.archiveAltImg||p.altImg)}" data-fallback="${safe(p.altImg)}" onerror="this.onerror=null;this.src=this.dataset.fallback" alt=""></div>
      <div class="archive-info"><small>${esc(p.num)} / ${esc(p.year)}</small><h3>${esc(p.title)}</h3><p>${esc(p.tags.join(" / "))}</p></div>
    </a>`).join("");

    document.querySelector("#experienceList").innerHTML=C.experience.map(e=>`<article class="experience-row"><span>${esc(e.period)}</span><strong>${esc(e.title)}</strong><span>${esc(e.org)}</span><p>${esc(e.desc)}</p></article>`).join("");

    document.querySelector("#fanWrap").innerHTML=C.fanCards.map((c,i)=>`<a class="fan-card" href="${safe(c.url)}" data-fan="${i}" ${c.url!=="#"?'target="_blank" rel="noopener"':""}><img src="${safe(c.img)}" alt="${esc(c.label)} placeholder"><span class="fan-card-copy"><strong>${esc(c.label)}</strong><span>${esc(c.text)}</span></span></a>`).join("");

    const words=C.skills.map(s=>`<span class="marquee-word">${esc(s)}</span>`).join("");
    document.querySelector("#skillsMarquee").innerHTML=`<div class="marquee-set">${words}</div><div class="marquee-set" aria-hidden="true">${words}</div>`;
    document.querySelector("#footerSocials").innerHTML=C.socials.map(s=>`<a href="${safe(s.url)}" ${s.url!=="#"?'target="_blank" rel="noopener"':""}>${esc(s.label)}</a>`).join("");
    document.querySelector('[data-cfg-href="github"]').href=C.github;
    document.querySelector('[data-project-link="2"]').href=C.projects[2].link;
    buildMenuArt();
  }

  function buildMenuArt(){
    const imgs=[...C.projects.map(p=>p.img),...C.fanCards.map(c=>c.img)];
    const make=(offset)=>[0,1,2].map((_,i)=>`<figure data-art="${i+offset}"><img src="${safe(imgs[i+offset])}" alt=""></figure>`).join("");
    document.querySelector("#menuArtLeft").innerHTML=make(0); document.querySelector("#menuArtRight").innerHTML=make(2);
  }

  function transitionCanvas(){
    const canvas=document.querySelector("#transitionCanvas"),ctx=canvas.getContext("2d"); let raf;
    const resize=()=>{canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}; resize();
    let t=0; const draw=()=>{t+=.012;ctx.clearRect(0,0,innerWidth,innerHeight);ctx.strokeStyle="rgba(7,19,15,.5)";ctx.lineWidth=1;for(let j=0;j<7;j++){ctx.beginPath();for(let x=0;x<=innerWidth;x+=12){const y=innerHeight*.5+Math.sin(x*.008+t+j*.7)*70+j*18-54; x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke()}raf=requestAnimationFrame(draw)}; draw(); return()=>cancelAnimationFrame(raf);
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
    const menu=document.querySelector("#menu"),toggle=document.querySelector("#menuToggle"),links=gsap.utils.toArray(".menu-links a span"),arts=gsap.utils.toArray(".menu-art figure");
    menuTimeline=gsap.timeline({paused:true,onStart:()=>{menu.style.visibility="visible";menu.setAttribute("aria-hidden","false");lenis?.stop()},onReverseComplete:()=>{menu.style.visibility="hidden";menu.setAttribute("aria-hidden","true");lenis?.start()}})
      .to(menu,{clipPath:"ellipse(110% 110% at 50% 0%)",duration:.8,ease:"power3.out"})
      .fromTo(arts,{y:100,scale:.82},{y:0,scale:1,duration:.8,stagger:.06,ease:"power3.out"},.15)
      .fromTo(links,{yPercent:120},{yPercent:0,duration:.6,stagger:.08,ease:"back.out(1.2)"},.35);
    const set=(open)=>{menuOpen=open;toggle.classList.toggle("is-open",open);toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Close menu":"Open menu");open?menuTimeline.timeScale(1).play():menuTimeline.timeScale(1.5).reverse()};
    toggle.addEventListener("click",()=>set(!menuOpen));document.addEventListener("keydown",e=>{if(e.key==="Escape"&&menuOpen)set(false)});
    document.querySelectorAll(".menu-links a").forEach((a,i)=>a.addEventListener("pointerenter",()=>arts.forEach((art,j)=>art.classList.toggle("is-active",j%5===i))));
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

  function heroScene(){
    const tl=gsap.timeline({scrollTrigger:{trigger:".hero-track",start:"top top",end:"bottom bottom",scrub:.5}});
    tl.to(".nav",{scale:.84,duration:.1},0).to(".hero-copy",{opacity:0,y:-80,duration:.25},.08).to("#heroStage",{scale:.56,y:"32vh",borderRadius:"2.5rem",filter:"saturate(.35)",duration:.55,ease:"none"},.1).to(".hero-fluid-label",{opacity:0,duration:.1},.22).to(".hero-message",{opacity:1,y:0,duration:.28},.42).to(".drawn-signature path",{strokeDashoffset:0,duration:.35,ease:"power2.inOut"},.52).to("#heroStage",{y:"62vh",duration:.25,ease:"none"},.75);
    gsap.fromTo(".hero-word",{yPercent:110},{yPercent:0,duration:1.5,stagger:.15,ease:"power2.inOut",delay:.05});
  }

  function horizontalScene(){
    ScrollTrigger.matchMedia({
      "(min-width: 992px)":()=>{const section=document.querySelector("[data-horizontal]"),track=document.querySelector("#horizontalTrack");const distance=()=>track.scrollWidth-innerWidth;const tween=gsap.to(track,{x:()=>-distance(),ease:"none",scrollTrigger:{trigger:section,start:"top top",end:()=>`+=${distance()}`,pin:true,scrub:1,invalidateOnRefresh:true}});gsap.utils.toArray(".story-media img").forEach(img=>gsap.fromTo(img,{xPercent:-6},{xPercent:6,ease:"none",scrollTrigger:{trigger:img,containerAnimation:tween,start:"left right",end:"right left",scrub:true}}));return()=>tween.kill()},
      "(max-width: 991px)":()=>gsap.utils.toArray(".story-card").forEach((card,i)=>gsap.fromTo(card,{x:i%2?-45:45,opacity:.4},{x:0,opacity:1,duration:.8,scrollTrigger:{trigger:card,start:"top 85%",once:true}}))
    });
  }

  function disciplineScene(){
    gsap.fromTo(".discipline-image-left",{x:-320},{x:0,ease:"none",scrollTrigger:{trigger:"[data-disciplines]",start:"top bottom",end:"bottom bottom",scrub:1}});gsap.fromTo(".discipline-image-right",{x:320},{x:0,ease:"none",scrollTrigger:{trigger:"[data-disciplines]",start:"top bottom",end:"bottom bottom",scrub:1}});gsap.fromTo(".discipline-left",{x:-80},{x:0,ease:"none",scrollTrigger:{trigger:"[data-disciplines]",start:"top bottom",end:"60% bottom",scrub:true}});gsap.fromTo(".discipline-right",{x:80},{x:0,ease:"none",scrollTrigger:{trigger:"[data-disciplines]",start:"top bottom",end:"60% bottom",scrub:true}});gsap.to(".discipline-bottom img",{yPercent:-16,scale:1.1,ease:"none",scrollTrigger:{trigger:".discipline-bottom",start:"top bottom",end:"bottom top",scrub:true}});
  }

  function archiveScene(){if(innerWidth<992)return;gsap.utils.toArray(".archive-card").forEach((card,i)=>gsap.fromTo(card,{y:i*80},{y:0,ease:"none",scrollTrigger:{trigger:".archive-grid",start:"top bottom",end:"bottom bottom",scrub:1}}))}

  function featureScene(){gsap.to("#featureVisor",{clipPath:"ellipse(85% 105% at 50% 0%)",ease:"none",scrollTrigger:{trigger:"[data-feature]",start:"top bottom",end:"bottom center",scrub:1}});gsap.utils.toArray(".feature-images figure").forEach((f,i)=>gsap.fromTo(f,{y:80+i*30},{y:-70,ease:"none",scrollTrigger:{trigger:"[data-feature]",start:"top bottom",end:"bottom top",scrub:true}}))}

  function marquee(){marqueeTween=gsap.to("#skillsMarquee",{xPercent:-50,duration:36,ease:"none",repeat:-1});gsap.fromTo("#skillsMarquee",{marginLeft:"-10vw"},{marginLeft:"10vw",ease:"none",scrollTrigger:{trigger:".skills",start:"top bottom",end:"bottom top",scrub:true}})}

  function fanScene(){const cards=gsap.utils.toArray(".fan-card"),n=cards.length,center=(n-1)/2;cards.forEach(c=>gsap.set(c,{xPercent:-50,x:0,rotation:0,scale:.8,y:160}));const fan=gsap.timeline({scrollTrigger:{trigger:"#fanWrap",start:"top 90%",once:true}});fan.to(cards,{y:0,duration:.8,stagger:{amount:.5,from:"end"},ease:"power3.out"}).to(cards,{x:i=>(i-center)*176,rotation:i=>(i-center)*7,scale:i=>1-Math.abs(i-center)*.075,duration:1.2,stagger:.03,ease:"elastic.out(1,.75)"},"-=.4");if(canHover)cards.forEach((card,i)=>{card.addEventListener("pointerenter",()=>cards.forEach((c,j)=>{const d=j-i;gsap.to(c,{x:(j-center)*176+(d===0?0:Math.sign(d)*Math.max(0,110-Math.abs(d)*30)),y:d===0?-40:0,scale:d===0?1.08:1-Math.abs(j-center)*.075,rotation:(j-center)*7+Math.sign(d)*3,duration:.5,ease:"elastic.out(1,.75)"})}));card.addEventListener("pointerleave",()=>cards.forEach((c,j)=>gsap.to(c,{x:(j-center)*176,y:0,scale:1-Math.abs(j-center)*.075,rotation:(j-center)*7,duration:.55,ease:"power3.out"})))})}

  function footerScene(){gsap.to("#footerMask",{clipPath:innerWidth<992?"ellipse(115% 105% at 50% 0%)":"ellipse(82% 105% at 50% 0%)",ease:"none",scrollTrigger:{trigger:".footer",start:"top bottom",end:"55% center",scrub:1}})}

  function themeScene(){document.querySelectorAll("[data-nav-theme]").forEach(section=>ScrollTrigger.create({trigger:section,start:"top 8%",end:"bottom 8%",onEnter:()=>document.documentElement.dataset.navTheme=section.dataset.navTheme,onEnterBack:()=>document.documentElement.dataset.navTheme=section.dataset.navTheme}))}

  function init(){
    if(motionInitialized)return;motionInitialized=true;window.__portfolioInitialized=true;document.body.classList.remove("is-locked");
    if(!hasGSAP)return;gsap.registerPlugin(ScrollTrigger);setupLenis();setupMenu();heroCanvas();
    if(reduce)return;
    heroScene();wipeReveals();horizontalScene();disciplineScene();archiveScene();featureScene();marquee();fanScene();footerScene();themeScene();
    gsap.fromTo(".manifesto-small",{opacity:0,y:50},{opacity:1,y:0,duration:.8,scrollTrigger:{trigger:".manifesto-small",start:"top 88%",once:true}});
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
