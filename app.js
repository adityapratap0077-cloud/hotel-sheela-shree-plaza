/* Hotel Sheela Shree Plaza — interactions */
(function(){
  "use strict";

  /* ── preloader ── */
  window.addEventListener("load", function(){
    setTimeout(function(){ document.getElementById("preloader").classList.add("done"); }, 900);
  });
  // safety: never trap the user
  setTimeout(function(){ document.getElementById("preloader").classList.add("done"); }, 4000);

  /* ── sticky header ── */
  var header = document.getElementById("header");
  window.addEventListener("scroll", function(){
    header.classList.toggle("scrolled", window.scrollY > 40);
  }, {passive:true});

  /* ── mobile menu ── */
  var menuBtn = document.getElementById("menuBtn"),
      nav = document.getElementById("nav");
  menuBtn.addEventListener("click", function(){
    var open = nav.classList.toggle("open");
    document.body.classList.toggle("menu-open", open);
  });
  nav.querySelectorAll("a").forEach(function(a){
    a.addEventListener("click", function(){
      nav.classList.remove("open"); document.body.classList.remove("menu-open");
    });
  });

  /* ── hero slider ── */
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide")),
      dotsBox = document.getElementById("heroDots"),
      cur = 0, timer = null;

  slides.forEach(function(_, i){
    var d = document.createElement("button");
    d.setAttribute("aria-label", "Slide " + (i+1));
    if (i === 0) d.classList.add("active");
    d.addEventListener("click", function(){ go(i); restart(); });
    dotsBox.appendChild(d);
  });
  var dots = Array.prototype.slice.call(dotsBox.children);

  function go(i){
    slides[cur].classList.remove("active"); dots[cur].classList.remove("active");
    cur = (i + slides.length) % slides.length;
    // retrigger ken-burns
    var s = slides[cur]; s.style.animation = "none"; void s.offsetWidth; s.style.animation = "";
    s.classList.add("active"); dots[cur].classList.add("active");
  }
  function restart(){ clearInterval(timer); timer = setInterval(function(){ go(cur+1); }, 7000); }
  restart();

  /* ── reveal on scroll ── */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, {threshold:.12, rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".reveal").forEach(function(el){ io.observe(el); });

  /* ── counters ── */
  var cio = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target, target = +el.getAttribute("data-count"), t0 = null;
      function tick(t){
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1600, 1),
            v = Math.round(target * (1 - Math.pow(1-p, 3)));
        el.textContent = v + (p === 1 && target >= 700 ? "+" : "");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, {threshold:.6});
  document.querySelectorAll("[data-count]").forEach(function(el){ cio.observe(el); });

  /* ── lightbox ── */
  var items = Array.prototype.slice.call(document.querySelectorAll(".gal-item")),
      lb = document.getElementById("lightbox"),
      lbImg = lb.querySelector("img"),
      lbCap = lb.querySelector(".lb-cap"),
      li = 0;
  function show(i){
    li = (i + items.length) % items.length;
    lbImg.src = items[li].getAttribute("data-full");
    lbCap.textContent = items[li].querySelector("span").textContent;
    lb.classList.add("open"); document.body.style.overflow = "hidden";
  }
  function hide(){ lb.classList.remove("open"); document.body.style.overflow = ""; }
  items.forEach(function(b, i){ b.addEventListener("click", function(){ show(i); }); });
  lb.querySelector(".lb-close").addEventListener("click", hide);
  lb.querySelector(".lb-prev").addEventListener("click", function(e){ e.stopPropagation(); show(li-1); });
  lb.querySelector(".lb-next").addEventListener("click", function(e){ e.stopPropagation(); show(li+1); });
  lb.addEventListener("click", function(e){ if (e.target === lb) hide(); });
  document.addEventListener("keydown", function(e){
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") hide();
    if (e.key === "ArrowLeft") show(li-1);
    if (e.key === "ArrowRight") show(li+1);
  });

  /* ── date minimums (today) ── */
  var today = new Date().toISOString().split("T")[0];
  ["bbIn","bbOut","fIn","fOut"].forEach(function(id){
    var el = document.getElementById(id); if (el) el.min = today;
  });

  /* ── booking bar → contact form ── */
  document.getElementById("bbGo").addEventListener("click", function(){
    var room = document.getElementById("bbRoom").value.split(" — ")[0];
    var sel = document.getElementById("fRoom");
    for (var i = 0; i < sel.options.length; i++){
      if (sel.options[i].text.indexOf(room) === 0){ sel.selectedIndex = i; break; }
    }
    var bin = document.getElementById("bbIn").value, bout = document.getElementById("bbOut").value;
    if (bin) document.getElementById("fIn").value = bin;
    if (bout) document.getElementById("fOut").value = bout;
    var g = document.getElementById("bbGuests").value.replace(" Guests","").replace(" Guest","");
    var gs = document.getElementById("fGuests");
    for (var j = 0; j < gs.options.length; j++){
      if (gs.options[j].text === g || (g === "5+" && gs.options[j].text === "5+")){ gs.selectedIndex = j; break; }
    }
    document.getElementById("contact").scrollIntoView({behavior:"smooth"});
  });

  /* ── room reserve buttons ── */
  document.querySelectorAll(".reserve").forEach(function(btn){
    btn.addEventListener("click", function(){
      var label = btn.getAttribute("data-room"), sel = document.getElementById("fRoom");
      for (var i = 0; i < sel.options.length; i++){
        if (label.indexOf(sel.options[i].text.split(" — ")[0]) !== -1){ sel.selectedIndex = i; break; }
      }
      document.getElementById("contact").scrollIntoView({behavior:"smooth"});
    });
  });

  /* ── banquet enquire button ── */
  document.querySelectorAll("[data-event]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var sel = document.getElementById("fRoom");
      for (var i = 0; i < sel.options.length; i++){
        if (sel.options[i].text.indexOf("Banquet") === 0){ sel.selectedIndex = i; break; }
      }
    });
  });

  /* ── contact form → mailto ── */
  document.getElementById("bookForm").addEventListener("submit", function(e){
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
  document.getElementById("year").textContent = new Date().getFullYear();
})();
