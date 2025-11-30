const colors = [
    'red', 'blue', 'green', 'yellow', 'purple',
    'orange', 'pink', 'brown', 'gray', 'cyan',
    'magenta', 'lime', 'olive', 'teal', 'navy'
];

let targetColor = '';
let attempts = 3;
let isGameOver = false;

// DOM Elements
const colorInput = document.getElementById('color-input');
const guessBtn = document.getElementById('guess-btn');
const restartBtn = document.getElementById('restart-btn');
const feedbackMessage = document.getElementById('feedback-message');
const attemptsCount = document.getElementById('attempts-count');
const body = document.body;
const colorBackground = document.getElementById('color-background');

let blobs = [];

// Physics Constants
const SPRING_STIFFNESS = 0.05;
const SPRING_DAMPING = 0.9;

class ColorBlob {
    constructor(color) {
        this.element = document.createElement('div');
        this.element.classList.add('color-blob');
        this.element.textContent = color;
        this.element.style.backgroundColor = color;

        // Random Size (40px - 80px radius)
        this.radius = Math.floor(Math.random() * 30) + 40;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;

        // Random Organic Shape
        this.setRandomShape();

        colorBackground.appendChild(this.element);

        // Position & Velocity
        this.x = Math.random() * (window.innerWidth - this.width);
        this.y = Math.random() * (window.innerHeight - this.height);
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.mass = this.radius;

        // Jelly Physics (Scale)
        this.scaleX = 1;
        this.scaleY = 1;
        this.scaleVx = 0;
        this.scaleVy = 0;
    }

    setRandomShape() {
        const r1 = Math.floor(Math.random() * 30) + 40;
        const r2 = Math.floor(Math.random() * 30) + 40;
        const r3 = Math.floor(Math.random() * 30) + 40;
        const r4 = Math.floor(Math.random() * 30) + 40;
        this.element.style.borderRadius = `${r1}% ${r2}% ${r3}% ${r4}% / ${r4}% ${r3}% ${r2}% ${r1}%`;
    }

    update() {
        // 1. Move
        this.x += this.vx;
        this.y += this.vy;

        // Speed Limit
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const MAX_SPEED = 4;
        if (speed > MAX_SPEED) {
            this.vx = (this.vx / speed) * MAX_SPEED;
            this.vy = (this.vy / speed) * MAX_SPEED;
        }

        // 2. Spring Physics (Jiggle)
        // Hooke's Law: F = -k * x
        const targetScale = 1;

        const forceX = (targetScale - this.scaleX) * SPRING_STIFFNESS;
        this.scaleVx += forceX;
        this.scaleVx *= SPRING_DAMPING;
        this.scaleX += this.scaleVx;

        const forceY = (targetScale - this.scaleY) * SPRING_STIFFNESS;
        this.scaleVy += forceY;
        this.scaleVy *= SPRING_DAMPING;
        this.scaleY += this.scaleVy;

        // 3. Wall Collisions
        if (this.x <= 0) {
            this.x = 0;
            this.vx *= -1;
            this.jiggle(0.8, 1.2); // Squish vertically
        } else if (this.x + this.width >= window.innerWidth) {
            this.x = window.innerWidth - this.width;
            this.vx *= -1;
            this.jiggle(0.8, 1.2);
        }

        if (this.y <= 0) {
            this.y = 0;
            this.vy *= -1;
            this.jiggle(1.2, 0.8); // Squish horizontally
        } else if (this.y + this.height >= window.innerHeight) {
            this.y = window.innerHeight - this.height;
            this.vy *= -1;
            this.jiggle(1.2, 0.8);
        }

        // 4. Render
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scaleX}, ${this.scaleY})`;
    }

    jiggle(sx, sy) {
        this.scaleX = sx;
        this.scaleY = sy;
        this.scaleVx = 0;
        this.scaleVy = 0;
    }
}

// Mouse State
let mouseX = -1000;
let mouseY = -1000;
const MOUSE_RADIUS = 30;
const MOUSE_MASS = 1000; // Heavy object so it doesn't move, but blobs bounce off

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function checkCollisions() {
    // 1. Blob vs Blob
    for (let i = 0; i < blobs.length; i++) {
        for (let j = i + 1; j < blobs.length; j++) {
            const b1 = blobs[i];
            const b2 = blobs[j];

            const dx = (b2.x + b2.width / 2) - (b1.x + b1.width / 2);
            const dy = (b2.y + b2.height / 2) - (b1.y + b1.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (b1.width / 2 + b2.width / 2) * 0.9;

            if (distance < minDistance) {
                // Resolve Collision
                const angle = Math.atan2(dy, dx);
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);

                // Rotate velocities
                const vx1 = b1.vx * cos + b1.vy * sin;
                const vy1 = b1.vy * cos - b1.vx * sin;
                const vx2 = b2.vx * cos + b2.vy * sin;
                const vy2 = b2.vy * cos - b2.vx * sin;

                // Elastic collision
                const vFinal1 = ((b1.mass - b2.mass) * vx1 + 2 * b2.mass * vx2) / (b1.mass + b2.mass);
                const vFinal2 = ((b2.mass - b1.mass) * vx2 + 2 * b1.mass * vx1) / (b1.mass + b2.mass);

                b1.vx = vFinal1 * cos - vy1 * sin;
                b1.vy = vFinal1 * sin + vy1 * cos;
                b2.vx = vFinal2 * cos - vy2 * sin;
                b2.vy = vFinal2 * sin + vy2 * cos;

                // Separate
                const overlap = minDistance - distance;
                const moveX = (overlap * cos) / 2;
                const moveY = (overlap * sin) / 2;

                b1.x -= moveX;
                b1.y -= moveY;
                b2.x += moveX;
                b2.y += moveY;

                // Jiggle Effect
                const impact = Math.abs(vx1 - vx2);
                const deform = Math.min(impact * 0.1, 0.3);
                b1.jiggle(1 - deform, 1 + deform);
                b2.jiggle(1 - deform, 1 + deform);
            }
        }

        // 2. Blob vs Mouse
        const b = blobs[i];
        const dx = mouseX - (b.x + b.width / 2);
        const dy = mouseY - (b.y + b.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (b.width / 2 + MOUSE_RADIUS);

        if (distance < minDistance) {
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Rotate blob velocity
            const vx1 = b.vx * cos + b.vy * sin;
            const vy1 = b.vy * cos - b.vx * sin;

            // Mouse is "static" (infinite mass relative to blob) or just heavy
            // Simple bounce: reverse velocity component towards mouse
            const vFinal1 = -vx1 * 1.5; // Add some energy (1.5) for fun "kick"

            b.vx = vFinal1 * cos - vy1 * sin;
            b.vy = vFinal1 * sin + vy1 * cos;

            // Separate
            const overlap = minDistance - distance;
            b.x -= overlap * cos;
            b.y -= overlap * sin;

            // Jiggle
            b.jiggle(0.7, 1.3); // Stronger jiggle on mouse hit
        }
    }
}

function animate() {
    blobs.forEach(b => b.update());
    checkCollisions();
    requestAnimationFrame(animate);
}

function generateBlobs() {
    colorBackground.innerHTML = '';
    blobs = [];

    // Create a blob for EVERY color
    colors.forEach(color => {
        blobs.push(new ColorBlob(color));
    });

    // Select target from available colors
    targetColor = colors[Math.floor(Math.random() * colors.length)];
    console.log('Target:', targetColor);
}

// Game Logic
function initGame() {
    attempts = 3;
    isGameOver = false;

    generateBlobs();

    attemptsCount.textContent = attempts;
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'message';
    colorInput.value = '';
    colorInput.disabled = false;
    guessBtn.disabled = false;
    restartBtn.classList.add('hidden');

    // Reset Background
    body.style.backgroundColor = ''; // Reverts to CSS default

    colorInput.focus();
}

function handleGuess() {
    if (isGameOver) return;

    const guess = colorInput.value.trim().toLowerCase();
    if (!guess) return;

    if (guess === targetColor) {
        endGame(true);
    } else {
        attempts--;
        attemptsCount.textContent = attempts;
        if (attempts <= 0) {
            endGame(false);
        } else {
            showMessage(`Wrong! Not ${guess}. Try again.`, 'error');
            colorInput.value = '';
            colorInput.focus();
        }
    }
}

function endGame(win) {
    isGameOver = true;
    colorInput.disabled = true;
    guessBtn.disabled = true;
    restartBtn.classList.remove('hidden');

    // Reveal Background Color
    body.style.backgroundColor = targetColor;

    if (win) {
        showMessage('Correct! You won! 🎉', 'success');
    } else {
        showMessage(`Game Over! It was ${targetColor}.`, 'error');
    }
}

function showMessage(text, type) {
    feedbackMessage.textContent = text;
    feedbackMessage.className = `message ${type}`;
}

// Events
guessBtn.addEventListener('click', handleGuess);
colorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});
restartBtn.addEventListener('click', initGame);

// Start
initGame();
animate();
