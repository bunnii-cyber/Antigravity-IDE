let x;
let y;
let speedX;
let speedY;
let radius = 30;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Start near the center
  x = width / 2;
  y = height / 2;

  // Set initial velocities
  speedX = 5;
  speedY = 4;
}

function draw() {
  background(26, 26, 36);

  // Update position
  x += speedX;
  y += speedY;

  // Bounce horizontally
  if (x + radius >= width) {
    x = width - radius;
    speedX *= -1;
  } else if (x - radius <= 0) {
    x = radius;
    speedX *= -1;
  }

  // Bounce vertically
  if (y + radius >= height) {
    y = height - radius;
    speedY *= -1;
  } else if (y - radius <= 0) {
    y = radius;
    speedY *= -1;
  }

  // Draw circle
  noStroke();
  fill(255, 59, 48);
  circle(x, y, radius * 2);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

