document.addEventListener("DOMContentLoaded", function () {
  setupTestimonialTabs();
  setupStatCounter();
  setupScrollReveal();
  setupCircleShuffle();
  setupHeaderOnScroll();
  setupButtonRipple();
  setupButtonSpotlight(); 
  setupGlassCardTilt();
  setupCustomCursor();
  setupFooterSurprise();
});

// showing the sliding effect for the TestimonialTabs
function setupTestimonialTabs() {
  const carousel = document.getElementById("testimonialCarousel");
  const tabs = Array.from(document.querySelectorAll(".testimonial-tab"));
  if (!carousel || !tabs.length) return;

  function activateTab(index) {
    tabs.forEach((tab) => tab.classList.remove("active"));
    // reflow  so the progress bar animation restarts cleanly each time
    void tabs[index].offsetWidth;
    tabs[index].classList.add("active");
  }

  carousel.addEventListener("slide.bs.carousel", (e) => activateTab(e.to));
  activateTab(1);
}

// this for the numbers moving in the hero, this function splits  the numeric value and suffix (k / mil) out of something like "1.2k" or "3 mil"
function readStatText(text) {
  const number =parseFloat(text);
  let label = "";
  if (text.indexOf("mil") !== -1 ) label =" mil";//work for thw web iam making so customized
  if (text.toLowerCase().indexOf("k") !==-1) label = "k";
  return {number,label};
}
// it takes the text and animates its  content counting up.
function countUpStat(el) {
  const stat =readStatText(el.textContent);
  const steps = 40;


  let i = 0;

  const timer = setInterval(function () {
    i++;
    el.textContent = Math.round(stat.number * (i / steps)) + stat.label;
    if (i >= steps) clearInterval(timer);
  }, 20);
}

// Fires the count-up once each stat card actually scrolls into view, not on page load
function setupStatCounter() {
  const statNumbers =document.querySelectorAll(".stat-card h2");
  if (!statNumbers.length) return;

  const watcher =new IntersectionObserver(function(entries) {
    for (const entry of entries) {


      if (!entry.isIntersecting) continue ;
      countUpStat(entry.target);

      watcher.unobserve(entry.target);//once a stat has counted up there's no reason to keep watching it
    }
  }, { threshold: 0.4 });
  statNumbers.forEach((el) => watcher.observe(el));
}

// Generic "fade/slide in as you scroll" setup, reused for a few different sections
function revealOnScroll(selector) {
  const items =Array.from(document.querySelectorAll(selector));

  if (!items.length) return;

  // sorting top to bottom so  it reads naturally regardless of DOM(the order they appear in the HTML source)order.
  items.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

  items.forEach(function (el, i){
    el.classList.add("reveal");
    el.style.transitionDelay = i* 90 + "ms";
  });
  const watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        watcher.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15});
  items.forEach((el) => watcher.observe(el));
}

function setupScrollReveal() {
  [".feature", ".service-card", ".testimonial-card"].forEach(revealOnScroll);
}
/////////////////////////////////////////////////////////////////////

// The trust circles slowly swap positions while visible on screen.just a bit of motion
function setupCircleShuffle() {
  const circleBox = document.querySelector("#trust .circles");
  if (!circleBox) return;

  const circles = Array.from(circleBox.children);
  let homePositions = [];
  function saveHomePositions() {
    homePositions = circles.map((el) => el.getBoundingClientRect());
  }
  saveHomePositions();

  // recalculate positions after a resize but skip the transition so it doesn't look glitchy or wired or anything 
  window.addEventListener("resize", function () {
    circles.forEach(function (el) {
      el.style.transition = "none";
      el.style.transform = "";
    });
    requestAnimationFrame(saveHomePositions);
  });
  // basic FisherYates shuffle
  function shuffledOrder(n) {
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }

  function shuffleCircles() {
    if (!circles.length || !homePositions.length) return;
    const order = shuffledOrder(circles.length);
    circles.forEach(function (el, i){
      const target = order[i];
      const dx = homePositions[target].left- homePositions[i].left;
      const dy = homePositions[target].top - homePositions[i].top;

      el.style.transition = "transform 1.8s cubic-bezier(.65,0,.35,1) " + i * 60 + "ms";
      el.style.transform = "translate(" + dx+ "px, " + dy+ "px) scale(1.05)";
    });
  }

  let shuffleTimer = null;
// to start
  function startShuffling() {
    if (shuffleTimer) return;
    shuffleCircles();
    shuffleTimer = setInterval(shuffleCircles, 3200);
  }
//to stop it 
  function stopShuffling() {
    clearInterval(shuffleTimer);
    shuffleTimer = null;
  }

  // only animate while the section is actually on screen no point burning cycles otherwise..
  const watcher= new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      entry.isIntersecting ? startShuffling() : stopShuffling();
    });
  }, { threshold: 0.2 });
  watcher.observe(circleBox);
}
// Adds a blurred/shadowed background to the header once you've scrolled past the hero
function setupHeaderOnScroll() {
  const header = document.querySelector("header");
  if (!header) return;

  let ticking = false;

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle("scrolled", window.scrollY > 40);
      ticking = false;
    });
  });
}

// Standard materialdesign style click ripple. makes buttons feel responsive
function setupButtonRipple() {
  const buttons = document.querySelectorAll(".btn-prim, .btn-out, .get-touch-btn, .footer-cta-btn");

  buttons.forEach(function (el) {
    el.classList.add("ripple");
    el.addEventListener("click", function (e) {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const circle = document.createElement("span");
      circle.className = "ripple-circle";
      circle.style.width = size + "px";
      circle.style.height = size + "px";
      circle.style.left = e.clientX - rect.left - size / 2 + "px";
      circle.style.top = e.clientY - rect.top - size / 2 + "px";
      el.appendChild(circle);
      circle.addEventListener("animationend", () => circle.remove());
    });
  });
}
// Makes the radial glow in .btn-prim::after / .get-touch-btn::after / .footer-cta-btn::after
// follow the cursor by updating the --mx/--my custom properties the CSS already expects
function setupButtonSpotlight() {
  const buttons = document.querySelectorAll(".btn-prim, .get-touch-btn, .footer-cta-btn");

  buttons.forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", e.clientX - rect.left + "px");
      el.style.setProperty("--my", e.clientY - rect.top + "px");
    });
  });
}
// Card tilts toward the cursor on hover and gently floats when idle. for the glass card .
function setupGlassCardTilt() {
  const card = document.querySelector(".glass-card");
  if (!card) return;
  if (!window.matchMedia("(pointer: fine)").matches) return; // skip on touch devices
  let currentTiltX = 0;
  let currentTiltY= 0;
  let wantedTiltX = 0;
  let wantedTiltY= 0;
  card.addEventListener("pointermove", function (e) {
    const rect = card.getBoundingClientRect();
    const xPercent = (e.clientX - rect.left) / rect.width;
    const yPercent = (e.clientY - rect.top) / rect.height;
    wantedTiltY = (xPercent - 0.5) * 26;
    wantedTiltX = (0.5 - yPercent) * 26;

    card.classList.add("tilting");
  });
  card.addEventListener("pointerleave", function () {
    wantedTiltX = 0;
    wantedTiltY = 0;
    card.classList.remove("tilting");
  });

  // so the tilt eases toward the target instead of snapping
  function moveTowards(current, target, amount) {
    return current + (target - current) * amount;
  }

  function animateCard(time) {
    currentTiltX = moveTowards(currentTiltX, wantedTiltX, 0.08);
    currentTiltY = moveTowards(currentTiltY, wantedTiltY, 0.08);
    const floatAmount = card.classList.contains("tilting") ? 0 : Math.sin(time / 900) * 8;
    card.style.transform =
      "perspective(900px) rotateX(" + currentTiltX + "deg) rotateY(" + currentTiltY + "deg) translateY(" + floatAmount + "px)";
    requestAnimationFrame(animateCard);
  }

  requestAnimationFrame(animateCard);
}
// Swaps the default cursor for a little glowing lightning bolt that follows the pointer and 
// its shaped like this ⚡ as the web is about energy
function setupCustomCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return; // mouse-only,no touch devices

  document.body.classList.add("has-custom-cursor");

  const bolt = document.createElement("div");
  bolt.className = "cursor-bolt";
  bolt.textContent = "⚡";
  document.body.appendChild(bolt);
  window.addEventListener("pointermove", function (e) {
    bolt.style.left = e.clientX + "px";
    bolt.style.top = e.clientY + "px";
  });

  // gives the bolt a little "active" state when hovering interactive stuff
  const hoverTargets = document.querySelectorAll(
    "a, button, .feature, .service-card, .glass-card, .circle, input, textarea"
  );
  hoverTargets.forEach(function (el) {
    el.addEventListener("mouseenter", () => bolt.classList.add("cursor-active"));
    el.addEventListener("mouseleave", () => bolt.classList.remove("cursor-active"));
  });
}
// Little celebration when someone actually scrolls all the way to the footer. Only fires once the first time they reach the end and thats it 
function setupFooterSurprise() {
  const footer= document.querySelector(".site-footer");
  if (!footer) return;
  const confettiColors = ["#00D47E", "#059669", "#FFFFFF", "#FFD166", "#8D959D"];
  const confettiEmojis = ["⚡", "🌞", "🍃", "✨"];

  function makeOnePiece() {
    const piece = document.createElement("span");
    const startX = Math.random() * window.innerWidth;
    const moveX = (Math.random() - 0.5) * 420;
    const moveY = window.innerHeight * (0.55 + Math.random() * 0.5);
    const spin = Math.random() * 900 - 450;
    const duration = 2.4 + Math.random() * 1.8;
    // roughly 1 in 5 pieces is an emoji instead of a plain confetti dot/square
    if (Math.random() < 0.22) {
      piece.textContent = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
      piece.style.cssText =
        "position:fixed; top:-30px; left:" + startX + "px; font-size:" + (18 + Math.random() * 14) + "px;" +
        "pointer-events:none; z-index:9998;" +
        "--tx:" + moveX + "px; --ty:" + moveY + "px; --rot:" + spin + "deg;" +
        "animation: confettiFall " + duration + "s ease-in forwards;";
    } else {
      const size = 8 + Math.random() * 10;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const shape = Math.random() > 0.5 ? "50%" : "2px";
      piece.style.cssText =
        "position:fixed; top:-20px; left:" + startX + "px;" +
        "width:" + size + "px; height:" + size + "px;" +
        "background:" + color + "; border-radius:" + shape + ";" +
        "pointer-events:none; z-index:9998;" +
        "--tx:" + moveX + "px; --ty:" + moveY + "px; --rot:" + spin + "deg;" +
        "animation: confettiFall " + duration + "s ease-in forwards;";
    }
    document.body.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }

  function launchConfetti() {
    // two bursts so it feels a bit fuller instead of one flat wave
    Array.from({ length: 160 }).forEach(makeOnePiece);
    setTimeout(() => Array.from({ length: 90 }).forEach(makeOnePiece), 300);
  }
  function launchFlash() {
    const flash = document.createElement("div");
    flash.className = "footer-flash";
    const size = Math.max(window.innerWidth, window.innerHeight) * 2.2;
    flash.style.width = size + "px";
    flash.style.height = size + "px";
    flash.style.marginTop = -size / 2 + "px";
    flash.style.marginLeft = -size / 2 + "px";
    document.body.appendChild(flash);
    flash.addEventListener("animationend", () => flash.remove());
  }

  function showToast() {
    const toast = document.createElement("div");
    toast.className= "footer-toast";
    toast.innerHTML ='<span class="emoji">🎉⚡🎉</span><span>You made it to the bottom ! nice scrolling!</span>';
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(function () {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 4500);
  }
  // only trigger once, then stop watching so it doesn't refire on scroll-up/scroll-down
  const watcher = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    launchFlash();
    launchConfetti();
    showToast();
    watcher.disconnect();
  }, { threshold: 0.3 });
  watcher.observe(footer);
}