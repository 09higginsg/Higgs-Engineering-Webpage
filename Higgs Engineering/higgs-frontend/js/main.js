// Store session id
let sessionId = null;

// Chat section start
/* =========================
   CHAT SYSTEM
========================= */

// Toggle chat open/close
function toggleChat() {

  // Get chat element
  const chat = document.getElementById("chatWindow");

  // Toggle visibility
  chat.classList.toggle("active");

  // If no session yet
  if (!sessionId) {

    // Start conversation
    startConversation();

  }
}

// Start chat session
async function startConversation() {

  // Try request
  try {

    // Send API request
    const res = await fetch("http://localhost:3000/api/chat", {

      // Use POST method
      method: "POST",

      // Set headers
      headers: {"Content-Type": "application/json"},

      // Send initial message
      body: JSON.stringify({ message: "Hi" })

    });

    // Parse response
    const data = await res.json();

    // Save session id
    sessionId = data.sessionId;

    // Show AI reply
    addMessage("AI", data.reply);

  } catch {

    // Show error
    addMessage("AI", "Connection error.");

  }
}

// Add message to UI
function addMessage(sender, text) {

  // Get message box
  const box = document.getElementById("chatMessages");

  // Create message div
  const msg = document.createElement("div");

  // Set message class
  msg.className = sender === "AI" ? "ai-msg" : "user-msg";

  // Set message text
  msg.innerText = text;

  // Add to chat
  box.appendChild(msg);

  // Scroll to bottom
  box.scrollTop = box.scrollHeight;

}

// Send user message
async function sendMessage() {

  // Get input field
  const input = document.getElementById("chatInput");

  // Get trimmed value
  const message = input.value.trim();

  // Stop if empty
  if (!message) return;

  // Show user message
  addMessage("You", message);

  // Clear input
  input.value = "";

  // Try API call
  try {

    // Send message
    const res = await fetch("http://localhost:3000/api/chat", {

      // POST method
      method: "POST",

      // JSON header
      headers: {"Content-Type": "application/json"},

      // Send message + session
      body: JSON.stringify({ message, sessionId })

    });

    // Parse response
    const data = await res.json();

    // Update session
    sessionId = data.sessionId;

    // Show AI reply
    addMessage("AI", data.reply);

  } catch {

    // Show error
    addMessage("AI", "Connection error.");

  }
}

// Three.js section
/* =========================
   THREE.JS PARTICLE SYSTEM
========================= */

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(

  // Field of view
  75,

  // Aspect ratio
  window.innerWidth / window.innerHeight,

  // Near clip
  0.1,

  // Far clip
  1000

);

// Set camera distance
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });

// Set renderer size
renderer.setSize(window.innerWidth, window.innerHeight);

// Add canvas to page
document.getElementById("bg").appendChild(renderer.domElement);

// Particle count
const particlesCount = 600;

// Position array
const positions = new Float32Array(particlesCount * 3);

// Original positions
const original = new Float32Array(particlesCount * 3);

// Generate particles
for (let i = 0; i < particlesCount * 3; i++) {

  // Random position
  const val = (Math.random() - 0.5) * 12;

  // Set position
  positions[i] = val;

  // Store original
  original[i] = val;

}

// Create geometry
const geometry = new THREE.BufferGeometry();

// Attach positions
geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

// Create particle material
const material = new THREE.PointsMaterial({

  // Size of particles
  size: 0.035,

  // Gold color
  color: 0xFFD700

});

// Create points mesh
const points = new THREE.Points(geometry, material);

// Add to scene
scene.add(points);

// Line mesh holder
let linesMesh;

// Line material
const lineMaterial = new THREE.LineBasicMaterial({

  // Gold color
  color: 0xFFD700,

  // Enable transparency
  transparent: true,

  // Set opacity
  opacity: 0.25

});

// Mouse position
let mouse = { x: 0, y: 0 };

// Track mouse movement
document.addEventListener("mousemove", (e) => {

  // Normalize X
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;

  // Normalize Y
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

});

// Update connecting lines
function updateLines() {

  // Remove old lines
  if (linesMesh) scene.remove(linesMesh);

  // Get positions
  const pos = geometry.attributes.position.array;

  // Store vertices
  const vertices = [];

  // Max distance
  const maxDist = 1.4;

  // Loop particles
  for (let i = 0; i < particlesCount; i++) {

    // Compare with others
    for (let j = i + 1; j < particlesCount; j++) {

      // X distance
      const dx = pos[i*3] - pos[j*3];

      // Y distance
      const dy = pos[i*3+1] - pos[j*3+1];

      // Z distance
      const dz = pos[i*3+2] - pos[j*3+2];

      // Calculate distance
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

      // If close enough
      if (dist < maxDist) {

        // Add line points
        vertices.push(
          pos[i*3], pos[i*3+1], pos[i*3+2],
          pos[j*3], pos[j*3+1], pos[j*3+2]
        );

      }
    }
  }

  // Create line geometry
  const lineGeo = new THREE.BufferGeometry();

  // Set line positions
  lineGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  // Create line mesh
  linesMesh = new THREE.LineSegments(lineGeo, lineMaterial);

  // Add to scene
  scene.add(linesMesh);
}

// Animation loop
function animate() {

  // Loop frames
  requestAnimationFrame(animate);

  // Get positions
  const pos = geometry.attributes.position.array;

  // Loop particles
  for (let i = 0; i < particlesCount; i++) {

    // X index
    let ix = i * 3;

    // Y index
    let iy = i * 3 + 1;

    // Original X
    let ox = original[ix];

    // Original Y
    let oy = original[iy];

    // Distance X to mouse
    let dx = mouse.x * 5 - pos[ix];

    // Distance Y to mouse
    let dy = mouse.y * 5 - pos[iy];

    // Distance value
    let dist = Math.sqrt(dx * dx + dy * dy);

    // If close to mouse
    if (dist < 1.5) {

      // Push away
      pos[ix] -= dx * 0.02;

      // Push away Y
      pos[iy] -= dy * 0.02;

    } else {

      // Return to origin
      pos[ix] += (ox - pos[ix]) * 0.02;

      // Return Y
      pos[iy] += (oy - pos[iy]) * 0.02;

    }
  }

  // Update geometry
  geometry.attributes.position.needsUpdate = true;

  // Rotate particles
  points.rotation.y += 0.001;

  // Move camera X
  camera.position.x += (mouse.x * 2 - camera.position.x) * 0.03;

  // Move camera Y
  camera.position.y += (mouse.y * 2 - camera.position.y) * 0.03;

  // Look at center
  camera.lookAt(scene.position);

  // Update lines
  updateLines();

  // Render scene
  renderer.render(scene, camera);
}

// Start animation
animate();

// Resize handler
window.addEventListener("resize", () => {

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;

  // Update projection
  camera.updateProjectionMatrix();

});