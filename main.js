// Disable right-click context menu
document.addEventListener("contextmenu", (event) => event.preventDefault());

// Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, and Ctrl+U safely
document.addEventListener("keydown", (e) => {
  if (!e.key) return; // Prevent errors if e.key is undefined

  const keyUpper = e.key.toUpperCase();

  if (
    keyUpper === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "M"].includes(keyUpper)) ||
    (e.ctrlKey && keyUpper === "U")
  ) {
    e.preventDefault();
  }
});

// Theme toggle — dark is the default on load, no storage, resets to dark on refresh
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
root.setAttribute("data-theme", "dark");
themeToggle.addEventListener("click", () => {
  const isLight = root.getAttribute("data-theme") === "light";
  root.setAttribute("data-theme", isLight ? "dark" : "light");
  themeToggle.setAttribute("aria-pressed", String(!isLight));
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

// Active tab on scroll
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

// Scroll reveal
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
