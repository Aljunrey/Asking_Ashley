// ---------- Settings you can change ----------
const OPEN_GIF = "envelope-opening.GIF"; // plays first
const LETTER_IMG = "letter-final.png";   // shown after the GIF
const GIF_TIME = 1200;                   // how long the GIF plays (ms)
const NO_MIN_HOP = 45;                   // smallest NO jump (px)
const NO_MAX_HOP = 90;                   // biggest NO jump (px)

// ---------- Elements ----------
const envelope = document.getElementById("envelope-container");
const letter = document.getElementById("letter-container");
const letterWindow = document.querySelector(".letter-window");
const noBtn = document.querySelector(".no-btn");
const yesBtn = document.querySelector(".yes-btn");

const title = document.getElementById("heading");
const catImg = document.getElementById("letter-cat");
const buttons = document.getElementById("letter-buttons");
const finalText = document.getElementById("message");

const mail = document.getElementById("mail");
const mailEnv = document.getElementById("mail-envelope");

const overlay = document.getElementById("letter-overlay");
const closeLetter = document.getElementById("close-letter");
const letterGif = document.getElementById("letter-gif");
const letterText = document.getElementById("letter-text");

// Load the letter images early so nothing flickers later
[OPEN_GIF, LETTER_IMG].forEach((src) => {
    const img = new Image();
    img.src = src;
});

// ---------- Screen 1: click the envelope ----------
envelope.addEventListener("click", () => {
    envelope.style.display = "none";
    letter.style.display = "flex";

    setTimeout(() => {
        letterWindow.classList.add("open");
    }, 50);
});

// ---------- Screen 2: the NO button dodges ----------
let offsetX = 0;
let offsetY = 0;

function moveNo() {
    const distance = Math.random() * (NO_MAX_HOP - NO_MIN_HOP) + NO_MIN_HOP;
    const angle = Math.random() * Math.PI * 2;

    let dx = Math.cos(angle) * distance;
    let dy = Math.sin(angle) * distance;

    // bounce back if the hop would leave the screen
    const rect = noBtn.getBoundingClientRect();
    const pad = 10;

    if (rect.left + dx < pad || rect.right + dx > window.innerWidth - pad) {
        dx = -dx;
    }
    if (rect.top + dy < pad || rect.bottom + dy > window.innerHeight - pad) {
        dy = -dy;
    }

    offsetX += dx;
    offsetY += dy;

    noBtn.style.transition = "transform 0.2s ease";
    noBtn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

noBtn.addEventListener("mouseover", moveNo);
noBtn.addEventListener("click", moveNo);
noBtn.addEventListener(
    "touchstart",
    (e) => {
        e.preventDefault();
        moveNo();
    },
    { passive: false }
);

// ---------- YES is clicked ----------
yesBtn.addEventListener("click", () => {
    title.textContent = "Yippeeee!";
    catImg.src = "cat_dance.gif";

    letterWindow.classList.add("final");

    buttons.style.display = "none";
    finalText.style.display = "block";
    mail.style.display = "flex";
});

// ---------- Screen 3: open and close the letter ----------
let openTimer;

function openLetter() {
    clearTimeout(openTimer);
    letterText.classList.add("hidden");

    // "?t=" makes the GIF restart from its first frame every time
    letterGif.src = OPEN_GIF + "?t=" + Date.now();
    overlay.classList.add("show");

    openTimer = setTimeout(() => {
        letterGif.src = LETTER_IMG;
        letterText.classList.remove("hidden");
    }, GIF_TIME);
}

function closeLetterView() {
    clearTimeout(openTimer);
    overlay.classList.remove("show");
}

mailEnv.addEventListener("click", openLetter);
closeLetter.addEventListener("click", closeLetterView);

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeLetterView();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLetterView();
});