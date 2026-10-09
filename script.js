// ---------- Settings you can change ----------
const IMG_FOLDER = "";                   // e.g. "images/" if your pictures are in a folder
const OPEN_GIF = IMG_FOLDER + "envelope-opening.GIF"; // plays first
const LETTER_IMG = IMG_FOLDER + "letter-final.png";   // shown after the GIF
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
const memories = document.getElementById("memories");
const yesPhotos = document.getElementById("yes-photos");

const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("music-btn");
bgm.volume = 0.4; // 0 is silent, 1 is full volume

// Browsers only allow music after a click, so we start it on the first envelope click
function startMusic() {
    bgm.play()
        .then(() => {
            musicBtn.style.display = "block";
        })
        .catch(() => {}); // the browser refused, so stay silent
}

musicBtn.addEventListener("click", () => {
    if (bgm.paused) {
        bgm.play();
        musicBtn.textContent = "🔊";
    } else {
        bgm.pause();
        musicBtn.textContent = "🔇";
    }
});

// Load the letter images early so nothing flickers later
[OPEN_GIF, LETTER_IMG].forEach((src) => {
    const img = new Image();
    img.src = src;
});

letterGif.src = LETTER_IMG;

// ---------- Screen 1: click the envelope ----------
envelope.addEventListener("click", () => {
    startMusic();
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
    yesPhotos.classList.add("in");
});

// ---------- Screen 3: open and close the letter ----------
let openTimer;

function showLetter() {
    clearTimeout(openTimer);
    letterGif.src = LETTER_IMG;
    letterText.classList.remove("hidden");
    memories.classList.add("in");
}

function openLetter() {
    clearTimeout(openTimer);
    letterText.classList.add("hidden");
    memories.classList.remove("in");
    yesPhotos.style.visibility = "hidden"; // no faded copies behind the letter

    // "?t=" makes the GIF restart from its first frame every time
    letterGif.src = OPEN_GIF + "?t=" + Date.now();
    overlay.classList.add("show");

    openTimer = setTimeout(showLetter, GIF_TIME);
}

// If the GIF can't be found, skip it and show the letter right away
letterGif.addEventListener("error", () => {
    const failed = letterGif.getAttribute("src") || "";
    console.warn("Could not load image: " + failed + " (check the file name and folder)");
    if (!failed.includes(LETTER_IMG)) showLetter();
});

function closeLetterView() {
    clearTimeout(openTimer);
    memories.classList.remove("in");
    yesPhotos.style.visibility = "";
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

// ---------- Draggable stickers ----------
let topZ = 10;

document.querySelectorAll(".memory").forEach((sticker) => {
    let offsetX = 0;
    let offsetY = 0;
    let box = null;

    sticker.setAttribute("draggable", "false");

    sticker.addEventListener("pointerdown", (e) => {
        e.preventDefault();

        // the sticker's position is its center, so remember where we grabbed it
        box = sticker.parentElement.getBoundingClientRect();
        const r = sticker.getBoundingClientRect();
        offsetX = e.clientX - (r.left + r.width / 2);
        offsetY = e.clientY - (r.top + r.height / 2);

        sticker.style.transitionDelay = "0s"; // no entrance delay while dragging
        sticker.style.zIndex = ++topZ;        // bring it to the front
        sticker.classList.add("dragging");
        sticker.setPointerCapture(e.pointerId);
    });

    sticker.addEventListener("pointermove", (e) => {
        if (!sticker.classList.contains("dragging")) return;

        // stored as percentages so it still fits if the window is resized
        let x = ((e.clientX - offsetX - box.left) / box.width) * 100;
        let y = ((e.clientY - offsetY - box.top) / box.height) * 100;

        x = Math.min(100, Math.max(0, x));
        y = Math.min(100, Math.max(0, y));

        sticker.style.left = x + "%";
        sticker.style.top = y + "%";
    });

    const drop = (e) => {
        sticker.classList.remove("dragging");
        if (sticker.hasPointerCapture(e.pointerId)) {
            sticker.releasePointerCapture(e.pointerId);
        }
    };

    sticker.addEventListener("pointerup", drop);
    sticker.addEventListener("pointercancel", drop);
});