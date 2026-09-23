/* Hotel Sheela Shree Plaza v2 — editorial motion engine */
(function(){
  "use strict";
  var fine = window.matchMedia("(pointer:fine)").matches,
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      $ = function(s, c){ return (c||document).querySelector(s); },
      $$ = function(s, c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

  /* ── preloader ── */
  var pre = $("#preloader"), plCount = $("#plCount"), hero = $(".hero");
  document.documentElement.classList.add("locked");
  function finishLoad(){
    if (pre.classList.contains("lift")) return;
    pre.classList.add("lift");
    setTimeout(function(){
      pre.classList.add("gone");
      document.documentElement.classList.remove("locked");
      hero.classList.add("go");
    }, 1150);
  }
  if (reduced){ plCount.textContent = "100"; finishLoad(); }
  else {
    var t0 = null, DUR = 1600;
    function count(t){
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / DUR, 1),
          e = 1 - Math.pow(1 - p, 3);
      plCount.textContent = String(Math.round(e * 100)).padStart(2, "0");
      if (p < 1) requestAnimationFrame(count); else setTimeout(finishLoad, 250);
    }
    requestAnimationFrame(count);
  }
  setTimeout(finishLoad, 6000); // safety

  /* ── custom cursor ── */
  if (fine && !reduced){
    var dot = $("#cDot"), ring = $("#cRing"),
        mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener("mousemove", function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + (mx) + "px," + (my) + "px) translate(-50%,-50%)";
    });
    (function loop(){
      rx += (mx - rx) * .14; ry += (my - ry) * .14;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function(e){
      if (e.target.closest("[data-view]")){ ring.classList.add("is-view"); ring.classList.remove("is-hover"); }
      else if (e.target.closest("a,button,[data-hover],input,select,textarea")){ ring.classList.add("is-hover"); ring.classList.remove("is-view"); }
    });
    document.addEventListener("mouseout", function(e){
      if (e.target.closest("[data-view],a,button,[data-hover],input,select,textarea")){
        ring.classList.remove("is-hover"); ring.classList.remove("is-view");
      }
    });
  }

  /* ── scroll: progress, header, parallax ── */
  var header = $("#header"), prog = $("#progBar"),
      heroSlides = $(".hero-slides"), heroIn = $(".hero-in"),
      lastY = 0, ticking = false;
  var pEls = $$("[data-parallax]");
  function onScroll(){
    var y = window.scrollY,
        max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    header.classList.toggle("scrolled", y > 40);
    if (y > 420 && y > lastY + 4 && !document.body.classList.contains("menu-open")) header.classList.add("hide");
    else if (y < lastY - 4 || y < 420) header.classList.remove("hide");
    lastY = y;
    // hero depth
    if (y < window.innerHeight * 1.2 && !reduced){
      heroSlides.style.transform = "translateY(" + y * .26 + "px)";
      heroIn.style.transform = "translateY(" + y * .1 + "px)";
      heroIn.style.opacity = Math.max(0, 1 - y / (window.innerHeight * .85));
    }
    // generic parallax
    var vh = window.innerHeight;
    pEls.forEach(function(el){
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var sp = parseFloat(el.getAttribute("data-parallax")) || .1,
          off = (r.top + r.height / 2 - vh / 2) * sp;
      el.style.transform = "translateY(" + (-off).toFixed(1) + "px)";
    });
    ticking = false;
  }
  window.addEventListener("scroll", function(){
    if (!ticking){ ticking = true; requestAnimationFrame(onScroll); }
  }, {passive:true});
  onScroll();

  /* ── mobile menu ── */
  var menuBtn = $("#menuBtn"), nav = $("#nav");
  menuBtn.addEventListener("click", function(){
    var open = nav.classList.toggle("open");
    document.body.classList.toggle("menu-open", open);
    header.classList.remove("hide");
  });
  $$("#nav a").forEach(function(a){
    a.addEventListener("click", function(){
      nav.classList.remove("open"); document.body.classList.remove("menu-open");
    });
  });

  /* ── hero slider ── */
  var slides = $$(".hero-slide"), dotsBox = $("#heroDots"),
      cap = $("#heroCap"), cur = 0, timer = null;
  slides.forEach(function(_, i){
    var d = document.createElement("button");
    d.setAttribute("aria-label", "Slide " + (i + 1));
    if (i === 0) d.classList.add("active");
    d.addEventListener("click", function(){ go(i); restart(); });
    dotsBox.appendChild(d);
  });
  var dots = $$("#heroDots button");
  function go(i){
    slides[cur].classList.remove("active"); dots[cur].classList.remove("active");
    // retrigger ken-burns on incoming
    var n = (i + slides.length) % slides.length,
        ph = slides[n].querySelector(".ph");
    ph.style.animation = "none"; void ph.offsetWidth; ph.style.animation = "";
    cur = n;
    slides[cur].classList.add("active"); dots[cur].classList.add("active");
    if (cap){
      cap.style.opacity = 0;
      setTimeout(function(){
        cap.textContent = slides[cur].getAttribute("data-cap") || "";
        cap.style.transition = "opacity .6s"; cap.style.opacity = 1;
      }, 350);
    }
  }
  function restart(){ clearInterval(timer); timer = setInterval(function(){ go(cur + 1); }, 7000); }
  restart();

  /* ── reveal on scroll ── */
  $$("[data-delay]").forEach(function(el){
    el.style.transitionDelay = el.getAttribute("data-delay") + "ms";
  });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {threshold:.12, rootMargin:"0px 0px -6% 0px"});
  $$("[data-reveal]").forEach(function(el){ io.observe(el); });
  // clip-path image reveals
  var cio2 = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add("clip-in"); cio2.unobserve(e.target); }
    });
  }, {threshold:.18});
  $$("[data-clip]").forEach(function(el){ cio2.observe(el); });

  /* ── counters ── */
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.getAttribute("data-count"), t0 = null;
      function tick(t){
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1700, 1),
            v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, {threshold:.6});
  $$("[data-count]").forEach(function(el){ cio.observe(el); });

  /* ── magnetic buttons ── */
  if (fine && !reduced){
    $$("[data-magnetic]").forEach(function(el){
      var strength = 10;
      el.addEventListener("mousemove", function(e){
        var r = el.getBoundingClientRect(),
            x = e.clientX - r.left - r.width / 2,
            y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + (x / r.width * strength * 2).toFixed(1) + "px," +
          ((y / r.height * strength * 2).toFixed(1)) + "px)";
      });
      el.addEventListener("mouseleave", function(){
        el.style.transition = "transform .6s cubic-bezier(.19,1,.22,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(function(){ el.style.transition = ""; }, 600);
      });
    });
  }

  /* ── gallery: drag strip + lightbox ── */
  var strip = $("#galStrip"), items = $$(".gal-item"),
      lb = $("#lightbox"), lbImg = lb.querySelector("img"),
      lbCap = lb.querySelector(".lb-cap"), li = 0,
      dragMoved = false;
  if (strip){
    var down = false, sx = 0, sl = 0;
    strip.addEventListener("pointerdown", function(e){
      down = true; dragMoved = false; sx = e.clientX; sl = strip.scrollLeft;
      strip.classList.add("dragging");
    });
    window.addEventListener("pointermove", function(e){
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 8) dragMoved = true;
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", function(){
      down = false; strip.classList.remove("dragging");
    });
    strip.addEventListener("click", function(e){
      if (dragMoved){ e.stopPropagation(); e.preventDefault(); dragMoved = false; }
    }, true);
  }
  function show(i){
    li = (i + items.length) % items.length;
    lbImg.src = items[li].getAttribute("data-full");
    var fc = items[li].querySelector("figcaption");
    lbCap.textContent = fc ? fc.textContent : "";
    lb.classList.add("open"); document.body.style.overflow = "hidden";
  }
  function hide(){ lb.classList.remove("open"); document.body.style.overflow = ""; }
  items.forEach(function(b, i){ b.addEventListener("click", function(){ show(i); }); });
  lb.querySelector(".lb-close").addEventListener("click", hide);
  lb.querySelector(".lb-prev").addEventListener("click", function(e){ e.stopPropagation(); show(li - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function(e){ e.stopPropagation(); show(li + 1); });
  lb.addEventListener("click", function(e){ if (e.target === lb) hide(); });
  document.addEventListener("keydown", function(e){
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") show(li - 1);
    if (e.key === "ArrowRight") show(li + 1);
  });

  /* ── date minimums ── */
  var today = new Date().toISOString().split("T")[0];
  ["bbIn","bbOut","fIn","fOut"].forEach(function(id){
    var el = document.getElementById(id); if (el) el.min = today;
  });

  /* ── booking bar → contact form ── */
  $("#bbGo").addEventListener("click", function(){
    var room = $("#bbRoom").value.split(" — ")[0], sel = $("#fRoom");
    for (var i = 0; i < sel.options.length; i++){
      if (sel.options[i].text.indexOf(room) === 0){ sel.selectedIndex = i; break; }
    }
    var bin = $("#bbIn").value, bout = $("#bbOut").value;
    if (bin) $("#fIn").value = bin;
    if (bout) $("#fOut").value = bout;
    var g = $("#bbGuests").value.replace(" Guests","").replace(" Guest",""),
        gs = $("#fGuests");
    for (var j = 0; j < gs.options.length; j++){
      if (gs.options[j].text === g || (g === "5+" && gs.options[j].text === "5+")){ gs.selectedIndex = j; break; }
    }
    $("#contact").scrollIntoView({behavior:"smooth"});
  });

  /* ── room reserve buttons ── */
  $$(".reserve").forEach(function(btn){
    btn.addEventListener("click", function(){
      var label = btn.getAttribute("data-room"), sel = $("#fRoom");
      for (var i = 0; i < sel.options.length; i++){
        if (label.indexOf(sel.options[i].text.split(" — ")[0]) !== -1){ sel.selectedIndex = i; break; }
      }
      $("#contact").scrollIntoView({behavior:"smooth"});
    });
  });

  /* ── banquet enquire button ── */
  $$("[data-event]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var sel = $("#fRoom");
      for (var i = 0; i < sel.options.length; i++){
        if (sel.options[i].text.indexOf("Banquet") === 0){ sel.selectedIndex = i; break; }
      }
    });
  });

  /* ── contact form → mailto ── */
  $("#bookForm").addEventListener("submit", function(e){
    e.preventDefault();
    var v = function(id){ return document.getElementById(id).value.trim(); };
    var subject = "Booking Request — " + v("fRoom") + " — " + (v("fName") || "Guest");
    var lines = [
      "New booking request from the website:", "",
      "Name: " + v("fName"),
      "Phone: " + v("fPhone"),
      "Room / Enquiry: " + v("fRoom"),
      "Guests: " + v("fGuests"),
      "Check-in: " + (v("fIn") || "—"),
      "Check-out: " + (v("fOut") || "—"), "",
      "Message:", v("fMsg") || "—"
    ];
    window.location.href = "mailto:info@hotelsheelashree.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
  });

  /* ── footer year ── */
  $("#year").textContent = new Date().getFullYear();
})();
