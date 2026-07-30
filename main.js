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
