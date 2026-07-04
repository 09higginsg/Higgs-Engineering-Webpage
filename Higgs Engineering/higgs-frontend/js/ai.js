// Get canvas
const bg = document.getElementById("bg");

// Context
const ctx = bg.getContext("2d");

// Size
bg.width = window.innerWidth;
bg.height = window.innerHeight;

// Particles
let dots = [];

// Create dots
for (let i = 0; i < 50; i++) {
    dots.push({
        x: Math.random() * bg.width,
        y: Math.random() * bg.height
    });
}

// Animate
function animate() {

    ctx.clearRect(0, 0, bg.width, bg.height);

    dots.forEach(d => {
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(d.x, d.y, 2, 2);
    });

    requestAnimationFrame(animate);
}

animate();