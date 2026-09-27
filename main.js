const header = document.getElementById("header");
const panels = document.querySelectorAll(".mega");
const panelButtons = document.querySelectorAll("[data-panel]");
const search = document.getElementById("search");
const searchToggle = document.getElementById("searchToggle");
const mobileMenu = document.getElementById("mobileMenu");
const menuToggle = document.getElementById("menuToggle");

// Header background + collapse utility bar on scroll
const onScroll = () => {
  const scrolled = window.scrollY > 40;
  header.classList.toggle("is-scrolled", scrolled);
  header.classList.toggle("is-hidden", scrolled && !header.classList.contains("is-open"));
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const syncOpenState = () => {
  const anyOpen = [...panels].some((p) => !p.hidden) || !search.hidden || !mobileMenu.hidden;
  header.classList.toggle("is-open", anyOpen);
  onScroll();
};

const closeAll = () => {
  panels.forEach((p) => (p.hidden = true));
  panelButtons.forEach((b) => b.setAttribute("aria-expanded", "false"));
  search.hidden = true;
  mobileMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("no-scroll");
  syncOpenState();
};

// Mega menu panels
panelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = document.getElementById(`panel-${btn.dataset.panel}`);
    const wasOpen = !panel.hidden;
    closeAll();
    if (!wasOpen) {
      panel.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }
    syncOpenState();
  });
});

// Search
searchToggle.addEventListener("click", () => {
  const wasOpen = !search.hidden;
  closeAll();
  if (!wasOpen) {
    search.hidden = false;
    search.querySelector("input").focus();
  }
  syncOpenState();
});

// Mobile menu
menuToggle.addEventListener("click", () => {
  const wasOpen = !mobileMenu.hidden;
  closeAll();
  if (!wasOpen) {
    mobileMenu.hidden = false;
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
  }
  syncOpenState();
});

document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
document.addEventListener("click", (e) => {
  if (!header.contains(e.target) && !mobileMenu.contains(e.target)) closeAll();
  else if (e.target.closest(".mega a, .mobile-menu a")) closeAll();
});

// Reveal on scroll
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// Count-up stats
const countObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const start = performance.now();
    const duration = 1600;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  }),
  { threshold: 0.5 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();
