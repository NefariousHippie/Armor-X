"use strict";

const state = {
  menuOpen: false,
  bootComplete: false
};

const bootScreen = document.getElementById("boot-screen");
const bootProgressBar = document.getElementById("boot-progress-bar");
const bootStatusText = document.getElementById("boot-status-text");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const terminalOutput = document.getElementById("ai-terminal-output");
const suitStage = document.getElementById("suit-stage");

function boot() {
  if (!bootScreen || !bootProgressBar) {
    initializeApplication();
    return;
  }

  document.body.classList.add("booting");

  const messages = [
    "INITIALIZING SYSTEM",
    "LOADING POWER CORE",
    "CALIBRATING ACTUATORS",
    "CONNECTING SENSOR ARRAY",
    "ESTABLISHING NEURAL LINK",
    "VERIFYING ARMOR SYSTEM",
    "STARTING A.I. CORE",
    "SYSTEM READY"
  ];

  let progress = 0;
  let lastMessage = -1;

  const timer = window.setInterval(() => {
    progress = Math.min(100, progress + Math.floor(Math.random() * 7) + 5);
    bootProgressBar.style.width = `${progress}%`;

    const messageIndex = Math.min(
      messages.length - 1,
      Math.floor(progress / (100 / messages.length))
    );

    if (messageIndex !== lastMessage && bootStatusText) {
      bootStatusText.textContent = messages[messageIndex];
      lastMessage = messageIndex;
    }

    if (progress >= 100) {
      window.clearInterval(timer);

      window.setTimeout(() => {
        state.bootComplete = true;
        bootScreen.classList.add("hidden");
        document.body.classList.remove("booting");
        initializeApplication();
      }, 650);
    }
  }, 90);
}

function initializeApplication() {
  initializeNavigation();
  initializeMobileMenu();
  initializeScrollReveal();
  initializeActiveNavigation();
  initializeTerminal();
  initializeHeroInteraction();
}

function initializeNavigation() {
  document.querySelectorAll('.main-nav a, .mobile-menu a').forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        scrollToTarget(href);
      }
      closeMobileMenu();
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      scrollToTarget(href);
      closeMobileMenu();
    });
  });
}

function scrollToTarget(selector) {
  const target = document.querySelector(selector);
  if (!target) return;

  const header = document.querySelector(".site-header");
  const offset = header ? header.offsetHeight + 12 : 12;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth"
  });
}

function initializeMobileMenu() {
  if (!menuToggle || !mobileMenu) return;

  menuToggle.addEventListener("click", () => {
    state.menuOpen ? closeMobileMenu() : openMobileMenu();
  });

  document.addEventListener("click", (event) => {
    if (!state.menuOpen) return;
    if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
}

function openMobileMenu() {
  if (!menuToggle || !mobileMenu) return;
  state.menuOpen = true;
  mobileMenu.classList.add("open");
  menuToggle.classList.add("open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation");
}

function closeMobileMenu() {
  if (!menuToggle || !mobileMenu) return;
  state.menuOpen = false;
  mobileMenu.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

function initializeActiveNavigation() {
  const links = Array.from(document.querySelectorAll(".main-nav a"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  if (!links.length || !sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  }, {
    rootMargin: "-25% 0px -60% 0px",
    threshold: 0.05
  });

  sections.forEach((section) => observer.observe(section));
}

function initializeScrollReveal() {
  const elements = document.querySelectorAll(
    ".section-heading, .system-card, .feature-copy, .feature-visual, .ai-feature, .ai-terminal, .spec-row, .mission-content"
  );

  elements.forEach((element) => element.classList.add("reveal"));

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observerInstance.unobserve(entry.target);
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -45px 0px"
  });

  elements.forEach((element) => observer.observe(element));
}

function initializeTerminal() {
  if (!terminalOutput) return;

  const messages = [
    ">> DIAGNOSTIC SCAN COMPLETE",
    ">> ALL PRIMARY SYSTEMS NOMINAL",
    ">> OPERATOR LINK STABLE",
    ">> ENVIRONMENTAL SENSORS ACTIVE",
    ">> POWER DISTRIBUTION OPTIMIZED",
    ">> PREDICTIVE CONTROL ENABLED"
  ];

  let index = 0;

  window.setInterval(() => {
    const line = document.createElement("div");
    line.textContent = messages[index];
    line.className = "terminal-highlight";
    terminalOutput.appendChild(line);

    while (terminalOutput.children.length > 12) {
      terminalOutput.removeChild(terminalOutput.firstElementChild);
    }

    index = (index + 1) % messages.length;
  }, 4200);
}

function initializeHeroInteraction() {
  if (!suitStage || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let frame = 0;

  const animate = () => {
    currentX += (pointerX - currentX) * 0.055;
    currentY += (pointerY - currentY) * 0.055;

    suitStage.style.setProperty("--pointer-x", `${currentX.toFixed(2)}deg`);
    suitStage.style.setProperty("--pointer-y", `${currentY.toFixed(2)}deg`);

    frame = window.requestAnimationFrame(animate);
  };

  suitStage.addEventListener("pointermove", (event) => {
    const rect = suitStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    pointerX = x * 8;
    pointerY = y * -6;
  });

  suitStage.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
  });

  frame = window.requestAnimationFrame(animate);

  window.addEventListener("beforeunload", () => {
    window.cancelAnimationFrame(frame);
  });
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 850) closeMobileMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") document.body.classList.add("keyboard-navigation");
});

document.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-navigation");
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
