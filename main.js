// // Disable right-click context menu
// document.addEventListener("contextmenu", (event) => event.preventDefault());

// // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, and Ctrl+U safely
// document.addEventListener("keydown", (e) => {
//   if (!e.key) return; // Prevent errors if e.key is undefined

//   const keyUpper = e.key.toUpperCase();

//   if (
//     keyUpper === "F12" ||
//     (e.ctrlKey && e.shiftKey && ["I", "J", "M"].includes(keyUpper)) ||
//     (e.ctrlKey && keyUpper === "U")
//   ) {
//     e.preventDefault();
//   }
// });

// Theme toggle with localStorage persistence
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");

// Load saved theme (default: dark)
const savedTheme = localStorage.getItem("theme") || "dark";
root.setAttribute("data-theme", savedTheme);

themeToggle.setAttribute("aria-pressed", String(savedTheme === "light"));

themeToggle.addEventListener("click", () => {
  const currentTheme = root.getAttribute("data-theme");

  const newTheme = currentTheme === "light" ? "dark" : "light";

  root.setAttribute("data-theme", newTheme);

  // Save user preference
  localStorage.setItem("theme", newTheme);

  themeToggle.setAttribute("aria-pressed", String(newTheme === "light"));
});

// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const tabList = document.getElementById("tabList");
menuToggle.addEventListener("click", () => {
  const isOpen = tabList.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});
tabList.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    tabList.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".tab-list a");

const setActive = () => {
  let current = sections[0]?.id;
  const scrollPos = window.scrollY + 140;
  sections.forEach((sec) => {
    if (scrollPos >= sec.offsetTop) current = sec.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === "#" + current,
    );
  });
};
window.addEventListener("scroll", setActive, { passive: true });
setActive();

const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 },
);
revealEls.forEach((el) => io.observe(el));

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// temporary unavailable
function projectUnavailable(event) {
  event.preventDefault();

  Swal.fire({
    icon: "info",
    title: "Currently Unavailable",
    html: `
      <p>This feature is not available right now.</p>
      <br>
      <p>Please try again later.</p>
    `,
    confirmButtonText: "OK",
    confirmButtonColor: "#41b883",
    width: "420px",
    
    showClass: {
      popup: "animate__animated animate__backInDown",
    },

    hideClass: {
      popup: "animate__animated animate__backOutUp",
    },
  });
}

/* ==========================================================
   Certificates — slider, flip, autoplay, lightbox
   ========================================================== */
(function initCertificates() {
  const viewport = document.getElementById("certViewport");
  const track = document.getElementById("certTrack");
  if (!viewport || !track) return;

  const slides = Array.from(track.querySelectorAll("[data-cert]"));
  if (!slides.length) return;

  const prevBtn = document.getElementById("certPrev");
  const nextBtn = document.getElementById("certNext");
  const dotsWrap = document.getElementById("certDots");
  const currentEl = document.getElementById("certCurrent");
  const totalEl = document.getElementById("certTotal");
  const playBtn = document.getElementById("certPlay");
  const progressEl = document.getElementById("certProgress");

  const AUTOPLAY_MS = 6000;
  const pad = (n) => String(n).padStart(2, "0");

  let index = 0;
  let width = viewport.clientWidth;
  let dragMoved = false;
  let hoverPaused = false;
  let playing = true;
  let timerStart = 0;
  let rafId = null;

  if (totalEl) totalEl.textContent = pad(slides.length);

  // Build dots
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.className = "cert-dot";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "Go to certificate " + (i + 1));
    b.addEventListener("click", () => {
      goTo(i);
      restartAutoplay();
    });
    dotsWrap && dotsWrap.appendChild(b);
    return b;
  });

  function setTransform(offset = 0, animate = true) {
    track.classList.toggle("dragging", !animate);
    track.style.transform = `translate3d(${-index * width + offset}px, 0, 0)`;
  }

  function render() {
    slides.forEach((s, i) => {
      const active = i === index;
      s.classList.toggle("active", active);
      if (!active) s.classList.remove("flipped");
      s.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === index);
      d.setAttribute("aria-selected", String(i === index));
    });
    if (currentEl) currentEl.textContent = pad(index + 1);
    setTransform(0, true);
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    render();
  }

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  prevBtn &&
    prevBtn.addEventListener("click", () => {
      prev();
      restartAutoplay();
    });
  nextBtn &&
    nextBtn.addEventListener("click", () => {
      next();
      restartAutoplay();
    });

  // ---- Flip ----
  function flip(slide) {
    slide.classList.toggle("flipped");
    if (slide.classList.contains("flipped")) pauseAutoplay(false);
  }

  slides.forEach((slide) => {
    const card = slide.querySelector(".cert-card");
    const flipBtn = slide.querySelector("[data-flip]");
    const zoomBtn = slide.querySelector("[data-zoom]");

    card &&
      card.addEventListener("click", () => {
        if (dragMoved) return; // ignore click that ended a drag
        if (!slide.classList.contains("active")) return;
        flip(slide);
      });

    flipBtn &&
      flipBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        flip(slide);
      });

    zoomBtn &&
      zoomBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const img = slide.querySelector(".cert-img img");
        if (img) openLightbox(img.src, img.alt);
      });
  });

  // ---- Drag / swipe ----
  let dragging = false;
  let startX = 0;
  let delta = 0;

  viewport.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".cert-btn")) return;
    dragging = true;
    dragMoved = false;
    startX = e.clientX;
    delta = 0;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    delta = e.clientX - startX;
    if (Math.abs(delta) > 6) dragMoved = true;
    if (slides[index].classList.contains("flipped")) return;
    setTransform(delta, false);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    const threshold = Math.min(120, width * 0.18);
    if (delta < -threshold) next();
    else if (delta > threshold) prev();
    else render();
    if (dragMoved) restartAutoplay();
    setTimeout(() => {
      dragMoved = false;
    }, 60);
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", endDrag);
  viewport.addEventListener("dragstart", (e) => e.preventDefault());

  // ---- Keyboard ----
  document.addEventListener("keydown", (e) => {
    const rect = viewport.getBoundingClientRect();
    const visible = rect.top < window.innerHeight * 0.8 && rect.bottom > 120;
    if (!visible || lightboxOpen()) return;
    if (e.key === "ArrowRight") {
      next();
      restartAutoplay();
    } else if (e.key === "ArrowLeft") {
      prev();
      restartAutoplay();
    }
  });

  // ---- Autoplay with progress bar ----
  function tick(now) {
    if (!playing) return;
    const elapsed = now - timerStart;
    const pct = Math.min(100, (elapsed / AUTOPLAY_MS) * 100);
    if (progressEl) progressEl.style.width = pct + "%";
    if (elapsed >= AUTOPLAY_MS) {
      next();
      timerStart = now;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startAutoplay() {
    if (playing) return;
    playing = true;
    timerStart = performance.now();
    playBtn && playBtn.classList.remove("paused");
    playBtn && playBtn.setAttribute("aria-pressed", "true");
    rafId = requestAnimationFrame(tick);
  }

  function pauseAutoplay(resetBar = true) {
    playing = false;
    if (rafId) cancelAnimationFrame(rafId);
    if (resetBar && progressEl) progressEl.style.width = "0%";
    playBtn && playBtn.classList.add("paused");
    playBtn && playBtn.setAttribute("aria-pressed", "false");
  }

  function restartAutoplay() {
    if (!playing) return;
    timerStart = performance.now();
    if (progressEl) progressEl.style.width = "0%";
  }

  playBtn &&
    playBtn.addEventListener("click", () => {
      playing ? pauseAutoplay() : startAutoplay();
    });

  viewport.addEventListener("mouseenter", () => {
    if (playing) {
      cancelAnimationFrame(rafId);
      hoverPaused = true;
    }
  });

  viewport.addEventListener("mouseleave", () => {
    if (playing && hoverPaused) {
      hoverPaused = false;
      timerStart = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else if (playing) {
      timerStart = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  });

  // ---- Lightbox ----
  const lightbox = document.createElement("div");
  lightbox.className = "cert-lightbox";
  lightbox.innerHTML =
    '<button class="cert-lightbox-close" type="button" aria-label="Close">&times;</button><img alt="" />';
  document.body.appendChild(lightbox);
  const lightboxImg = lightbox.querySelector("img");

  const lightboxOpen = () => lightbox.classList.contains("open");

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "Certificate";
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.closest(".cert-lightbox-close")) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightboxOpen()) closeLightbox();
  });

  // ---- Resize ----
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      width = viewport.clientWidth;
      setTransform(0, false);
      requestAnimationFrame(() => setTransform(0, true));
    }, 120);
  });

  // ---- Boot ----
  width = viewport.clientWidth;
  render();
  timerStart = performance.now();
  rafId = requestAnimationFrame(tick);
})();

/* ==========================================================
   Journey — rail fill + animated stat counters
   ========================================================== */
(function initJourney() {
  const timeline = document.getElementById("journey-timeline");
  const fill = document.getElementById("jFill");

  if (timeline && fill) {
    const updateRail = () => {
      const rect = timeline.getBoundingClientRect();
      const trigger = window.innerHeight * 0.65;
      const progress = (trigger - rect.top) / rect.height;
      fill.style.height = Math.max(0, Math.min(1, progress)) * 100 + "%";
    };
    window.addEventListener("scroll", updateRail, { passive: true });
    window.addEventListener("resize", updateRail);
    updateRail();
  }

  const counters = document.querySelectorAll(".j-stat b[data-count]");
  if (!counters.length) return;

  const runCounter = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  counters.forEach((c) => statObserver.observe(c));
})();
