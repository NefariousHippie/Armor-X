/* ============================================================
   ARMOR X — APPLICATION JAVASCRIPT
   ============================================================ */

"use strict";


/* ============================================================
   DOM REFERENCES
   ============================================================ */

const bootScreen = document.getElementById("boot-screen");
const bootProgressBar = document.getElementById("boot-progress-bar");
const bootStatusText = document.getElementById("boot-status-text");

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

const aiTerminalOutput = document.getElementById("ai-terminal-output");


/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {
    bootComplete: false,
    menuOpen: false
};


/* ============================================================
   BOOT SEQUENCE
   ============================================================ */

function initializeBootSequence() {

    if (!bootScreen || !bootProgressBar) {
        initializeApplication();
        return;
    }

    document.body.classList.add("booting");

    const bootMessages = [
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
    let messageIndex = 0;

    const interval = window.setInterval(() => {

        progress += Math.floor(Math.random() * 8) + 4;

        if (progress > 100) {
            progress = 100;
        }

        bootProgressBar.style.width = `${progress}%`;

        const nextMessageIndex = Math.min(
            Math.floor(progress / (100 / bootMessages.length)),
            bootMessages.length - 1
        );

        if (
            nextMessageIndex !== messageIndex ||
            progress === 100
        ) {
            messageIndex = nextMessageIndex;

            if (bootStatusText) {
                bootStatusText.textContent =
                    bootMessages[messageIndex];
            }
        }

        if (progress >= 100) {

            window.clearInterval(interval);

            window.setTimeout(() => {

                state.bootComplete = true;

                bootScreen.classList.add("hidden");
                document.body.classList.remove("booting");

                initializeApplication();

            }, 650);
        }

    }, 90);
}


/* ============================================================
   APPLICATION INITIALIZATION
   ============================================================ */

function initializeApplication() {

    initializeNavigation();
    initializeMobileMenu();
    initializeScrollReveal();
    initializeActiveNavigation();
    initializeTerminal();
    initializeSmoothLinks();

}


/* ============================================================
   MOBILE NAVIGATION
   ============================================================ */

function initializeMobileMenu() {

    if (!menuToggle || !mobileMenu) {
        return;
    }

    menuToggle.addEventListener("click", () => {

        toggleMobileMenu();

    });


    const mobileLinks = mobileMenu.querySelectorAll("a");

    mobileLinks.forEach((link) => {

        link.addEventListener("click", () => {

            closeMobileMenu();

        });

    });


    document.addEventListener("click", (event) => {

        if (!state.menuOpen) {
            return;
        }

        const clickedInsideMenu =
            mobileMenu.contains(event.target);

        const clickedToggle =
            menuToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle) {
            closeMobileMenu();
        }

    });


    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeMobileMenu();
        }

    });

}


function toggleMobileMenu() {

    if (state.menuOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }

}


function openMobileMenu() {

    if (!menuToggle || !mobileMenu) {
        return;
    }

    state.menuOpen = true;

    mobileMenu.classList.add("open");
    menuToggle.classList.add("open");

    menuToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Close navigation"
    );

}


function closeMobileMenu() {

    if (!menuToggle || !mobileMenu) {
        return;
    }

    state.menuOpen = false;

    mobileMenu.classList.remove("open");
    menuToggle.classList.remove("open");

    menuToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    menuToggle.setAttribute(
        "aria-label",
        "Open navigation"
    );

}


/* ============================================================
   NAVIGATION
   ============================================================ */

function initializeNavigation() {

    const navigationLinks =
        document.querySelectorAll(".main-nav a");

    navigationLinks.forEach((link) => {

        link.addEventListener("click", () => {

            navigationLinks.forEach((item) => {
                item.classList.remove("active");
            });

            link.classList.add("active");

        });

    });

}


/* ============================================================
   ACTIVE SECTION NAVIGATION
   ============================================================ */

function initializeActiveNavigation() {

    const sections =
        document.querySelectorAll("main section[id]");

    const navigationLinks =
        document.querySelectorAll(".main-nav a");

    if (!sections.length || !navigationLinks.length) {
        return;
    }


    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach((entry) => {

                if (!entry.isIntersecting) {
                    return;
                }

                const sectionId =
                    entry.target.getAttribute("id");

                navigationLinks.forEach((link) => {

                    const target =
                        link.getAttribute("href");

                    link.classList.toggle(
                        "active",
                        target === `#${sectionId}`
                    );

                });

            });

        },
        {
            root: null,
            threshold: 0.2,
            rootMargin: "-20% 0px -60% 0px"
        }
    );


    sections.forEach((section) => {
        observer.observe(section);
    });

}


/* ============================================================
   SCROLL REVEAL
   ============================================================ */

function initializeScrollReveal() {

    const revealTargets = document.querySelectorAll(
        ".section-heading, " +
        ".system-card, " +
        ".feature-copy, " +
        ".feature-visual, " +
        ".ai-feature, " +
        ".ai-terminal, " +
        ".spec-row, " +
        ".mission-content"
    );

    if (!revealTargets.length) {
        return;
    }


    revealTargets.forEach((element) => {

        element.classList.add("reveal");

    });


    if (
        window.matchMedia &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches
    ) {

        revealTargets.forEach((element) => {
            element.classList.add("visible");
        });

        return;
    }


    const revealObserver =
        new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -50px 0px"
            }
        );


    revealTargets.forEach((element) => {

        revealObserver.observe(element);

    });

}


/* ============================================================
   AI TERMINAL
   ============================================================ */

function initializeTerminal() {

    if (!aiTerminalOutput) {
        return;
    }


    const terminalMessages = [
        ">> DIAGNOSTIC SCAN COMPLETE",
        ">> ALL PRIMARY SYSTEMS NOMINAL",
        ">> OPERATOR LINK STABLE",
        ">> ENVIRONMENTAL SENSORS ACTIVE",
        ">> POWER DISTRIBUTION OPTIMIZED",
        ">> PREDICTIVE CONTROL ENABLED"
    ];


    let messageIndex = 0;


    window.setInterval(() => {

        if (messageIndex >= terminalMessages.length) {
            messageIndex = 0;
        }

        const message =
            document.createElement("div");

        message.textContent =
            terminalMessages[messageIndex];

        aiTerminalOutput.appendChild(message);

        while (aiTerminalOutput.children.length > 12) {

            aiTerminalOutput.removeChild(
                aiTerminalOutput.firstElementChild
            );

        }

        messageIndex++;

    }, 4200);

}


/* ============================================================
   SMOOTH INTERNAL LINKS
   ============================================================

function initializeSmoothLinks() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    links.forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId =
                link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#"
            ) {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            const header =
                document.querySelector(".site-header");

            const headerHeight =
                header
                    ? header.offsetHeight
                    : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            if (state.menuOpen) {
                closeMobileMenu();
            }

        });

    });

}


/* ============================================================
   KEYBOARD ACCESSIBILITY
   ============================================================ */

document.addEventListener("keydown", (event) => {

    if (event.key !== "Tab") {
        return;
    }

    document.body.classList.add("keyboard-navigation");

});


document.addEventListener("mousedown", () => {

    document.body.classList.remove(
        "keyboard-navigation"
    );

});


/* ============================================================
   RESPONSIVE MENU SAFETY
   ============================================================ */

window.addEventListener("resize", () => {

    if (
        window.innerWidth > 850 &&
        state.menuOpen
    ) {
        closeMobileMenu();
    }

});


/* ============================================================
   INITIAL START
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeBootSequence
    );

} else {

    initializeBootSequence();

}