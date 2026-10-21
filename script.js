(() => {
  "use strict";

  const STORAGE_KEY = "cv-pamela-theme";
  const resume = document.querySelector(".resume");
  const yearEl = document.getElementById("year");
  const btnTheme = document.getElementById("btn-theme");
  const btnPrint = document.getElementById("btn-print");
  const jobs = document.querySelectorAll(".job[data-expandable]");
  const skillTags = document.querySelectorAll("#skills-list li");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Theme */
  const preferred = localStorage.getItem(STORAGE_KEY);
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = preferred || (systemDark ? "dark" : "light");
  applyTheme(initialTheme);

  btnTheme?.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (btnTheme) {
      const isDark = theme === "dark";
      btnTheme.setAttribute("aria-pressed", String(isDark));
      btnTheme.querySelector(".btn__icon").textContent = isDark ? "☀" : "☾";
      btnTheme.querySelector(".btn__label").textContent = isDark ? "Claro" : "Escuro";
    }
  }

  /* Print / PDF */
  btnPrint?.addEventListener("click", () => {
    expandAllJobsForPrint();
    window.print();
  });

  window.addEventListener("beforeprint", expandAllJobsForPrint);

  function expandAllJobsForPrint() {
    jobs.forEach((job) => {
      job.classList.remove("is-collapsed");
      const bullets = job.querySelector(".job__bullets");
      if (bullets) bullets.style.maxHeight = "none";
      const toggle = job.querySelector(".job__toggle");
      if (toggle) toggle.textContent = "Recolher detalhes";
    });
  }

  /* Expand / collapse job details (desktop: all open; small screens start collapsed after 2) */
  const collapseExtra = window.matchMedia("(max-width: 720px)").matches;

  jobs.forEach((job, index) => {
    const bullets = job.querySelector(".job__bullets");
    if (!bullets) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "job__toggle";
    toggle.setAttribute("aria-expanded", "true");
    job.appendChild(toggle);

    const setOpen = (open) => {
      job.classList.toggle("is-collapsed", !open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Recolher detalhes" : "Ver detalhes";
      if (open) {
        bullets.style.maxHeight = `${bullets.scrollHeight}px`;
      }
    };

    const startOpen = !collapseExtra || index < 2;
    setOpen(startOpen);

    const header = job.querySelector(".job__header");
    const onToggle = () => setOpen(job.classList.contains("is-collapsed"));
    header?.addEventListener("click", onToggle);
    toggle.addEventListener("click", onToggle);

    window.addEventListener("resize", () => {
      if (!job.classList.contains("is-collapsed")) {
        bullets.style.maxHeight = `${bullets.scrollHeight}px`;
      }
    });
  });

  /* Reveal animations */
  requestAnimationFrame(() => resume?.classList.add("is-ready"));

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -24px 0px" }
  );

  jobs.forEach((job, i) => {
    job.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
    revealObserver.observe(job);
  });

  skillTags.forEach((tag, i) => {
    tag.style.animationDelay = `${i * 35}ms`;
    tag.classList.add("is-visible");
  });

  /* Keyboard shortcut: Ctrl/Cmd + P already prints; Ctrl+Shift+T toggles theme */
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "t") {
      event.preventDefault();
      btnTheme?.click();
    }
  });
})();
