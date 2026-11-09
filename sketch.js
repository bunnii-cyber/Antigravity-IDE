/*
 * ml5.js imageClassifier + Teachable Machine with Interactive Dog
 * Based on dano's sketch (https://editor.p5js.org/dano/sketches/DSWxk5SiO)
 *
 * Behaviors:
 * - "nothing" (or "come" / default): dog walks forward (bounces across the ground)
 * - "stay": dog stops walking and stands alert, wagging tail
 * - "down": dog lies down on the floor
 */

// Teachable Machine Image Classifier variables
let classifier;
let video;
let label = "Model loading...";
let confidence = 0.0;
let imageModelURL = "https://teachablemachine.withgoogle.com/models/S0wmgLQFV/";

// Dog state
let dog = {
  x: 120,
  y: 395,         // Ground level line for the paws
  direction: 1,   // 1: moving right, -1: moving left
  speed: 2.2,
  state: "walk",  // "walk", "stay", "down"
  downAmount: 0,  // Smooth transition (0 = standing, 1 = lying down)
  walkCycle: 0,   // Leg oscillation timer
  tailAngle: 0
};

function preload() {
  classifier = ml5.imageClassifier(imageModelURL + "model.json");
}

function setup() {
  createCanvas(640, 480);

  // Initialize flipped webcam stream
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  // Start continuous classification
  classifier.classifyStart(video, gotResult);
}

function draw() {
  // 1. Draw webcam feed as background
  image(video, 0, 0, width, height);

  // Slight dark tint at the bottom ground to make dog stand out clearly
  noStroke();
  fill(0, 0, 0, 70);
  rect(0, 340, width, 140);
  stroke(255, 255, 255, 40);
  strokeWeight(2);
  line(0, 420, width, 420);

  // 2. Map classification label to dog state
  updateDogStateFromLabel();

  // 3. Update dog motion and physics
  updateDog();

  // 4. Draw the dog
  drawDog();

  // 5. Draw HUD banner with current command & instructions
  drawHUD();
}

// Map the detected gesture label to dog behaviors
function updateDogStateFromLabel() {
  let cleanLabel = label.toLowerCase().trim();

  // "down" gesture -> dog lies down
  if (cleanLabel.includes("down")) {
    dog.state = "down";
  }
  // "stay" gesture -> dog stops walking
  else if (cleanLabel.includes("stay") || cleanLabel.includes("stop")) {
    dog.state = "stay";
  }
  // "nothing", "come", or general walking state
  else {
    dog.state = "walk";
  }
}

function updateDog() {
  // Smoothly interpolate between standing (0) and lying down (1)
  let targetDown = (dog.state === "down") ? 1.0 : 0.0;
  dog.downAmount = lerp(dog.downAmount, targetDown, 0.15);

  // Walking logic
  if (dog.state === "walk") {
    dog.x += dog.speed * dog.direction;
    dog.walkCycle += 0.18;

    // Turn around when reaching screen boundaries
    if (dog.x > width - 80) {
      dog.direction = -1;
    } else if (dog.x < 80) {
      dog.direction = 1;
    }
  } else {
    // Idle gentle tail wagging when staying or down
    dog.walkCycle = 0;
  }

  // Tail wag frequency increases when happy/staying
  let wagSpeed = (dog.state === "stay") ? 0.35 : 0.18;
  dog.tailAngle = sin(frameCount * wagSpeed) * 0.45;
}

// Render a cute cartoon dog that walks, stays, and lies down
function drawDog() {
  push();
  // Anchor at paws ground position
  translate(dog.x, dog.y);
  // Flip horizontally if walking left
  scale(dog.direction, 1);

  // Down interpolation offsets
  let bodyDrop = dog.downAmount * 18; // body lowers toward ground when lying down
  let legFlatten = dog.downAmount;    // legs tuck/fold under

  // Leg swinging motion for walk cycle
  let legSwing1 = (dog.state === "walk") ? sin(dog.walkCycle) * 12 : 0;
  let legSwing2 = (dog.state === "walk") ? sin(dog.walkCycle + PI) * 12 : 0;

  // Colors
  let coatColor = color(220, 160, 95);      // Warm golden brown
  let earColor = color(175, 115, 60);       // Darker caramel ear
  let bellyColor = color(245, 215, 175);    // Soft cream muzzle/chest
  let outlineColor = color(70, 40, 20);

  stroke(outlineColor);
  strokeWeight(2.5);
  strokeCap(ROUND);
  strokeJoin(ROUND);

  // --- TAIL ---
  push();
  translate(-38, -25 + bodyDrop * 0.5);
  rotate(-0.6 + dog.tailAngle);
  fill(coatColor);
  ellipse(-12, -4, 28, 11);
  pop();

  // --- BACK LEGS ---
  if (legFlatten < 0.85) {
    // Standing / walking legs
    push();
    fill(earColor);
    // Back-left leg
    rect(-26 + legSwing2 * 0.6, -10 + bodyDrop, 10, 25 - bodyDrop, 5);
    // Back-right leg
    rect(18 + legSwing1 * 0.6, -10 + bodyDrop, 10, 25 - bodyDrop, 5);
    pop();
  }

  // --- BODY ---
  push();
  translate(0, -18 + bodyDrop);
  fill(coatColor);
  // Main torso oval
  ellipse(0, 0, 75, 42 - dog.downAmount * 8);

  // Chest / belly patch
  noStroke();
  fill(bellyColor);
  ellipse(8, 3, 40, 26);
  pop();

  // --- FRONT LEGS (or tucked paws when lying down) ---
  if (legFlatten >= 0.85) {
    // Tucked paws on the ground when lying down
    fill(coatColor);
    ellipse(26, 12, 18, 9);
    ellipse(-22, 12, 18, 9);
  } else {
    // Walking/standing front legs
    push();
    fill(coatColor);
    // Front-back leg
    rect(-18 + legSwing1 * 0.8, -10 + bodyDrop, 11, 26 - bodyDrop, 5);
    // Front-forward leg
    rect(24 + legSwing2 * 0.8, -10 + bodyDrop, 11, 26 - bodyDrop, 5);
    pop();
  }

  // --- HEAD ---
  push();
  // Head drops slightly when lying down
  translate(32, -34 + bodyDrop * 0.85);

  // Head circle
  fill(coatColor);
  ellipse(0, 0, 38, 36);

  // Snout / Muzzle
  fill(bellyColor);
  ellipse(12, 6, 22, 17);

  // Nose
  fill(40, 20, 20);
  noStroke();
  ellipse(20, 4, 7, 5);

  // Smiling mouth
  stroke(outlineColor);
  strokeWeight(2);
  noFill();
  arc(13, 9, 8, 7, 0, PI * 0.9);

  // Eye
  fill(40, 20, 20);
  noStroke();
  if (dog.state === "down") {
    // Happy sleeping closed-eye curve (◠)
    stroke(outlineColor);
    strokeWeight(2.5);
    noFill();
    arc(4, -3, 8, 8, PI, TWO_PI);
  } else {
    // Open alert eye with cute reflection
    ellipse(4, -3, 6, 7);
    fill(255);
    ellipse(3, -5, 2.5, 2.5);
  }

  // Droopy floppy ear
  fill(earColor);
  stroke(outlineColor);
  strokeWeight(2.5);
  push();
  rotate(0.2 - dog.downAmount * 0.2);
  ellipse(-10, 4, 14, 25);
  pop();

  pop(); // End head

  pop(); // End dog transform
}

// Display HUD with camera feed status, detected label, and interactive guide
function drawHUD() {
  push();
  // Status banner top-left
  noStroke();
  fill(0, 0, 0, 160);
  rect(15, 15, 340, 75, 10);

  // Current detected label
  fill(255);
  textSize(14);
  textAlign(LEFT, TOP);
  text("Hand Gesture Detected:", 28, 25);

  // Highlight color based on state
  if (dog.state === "down") {
    fill(255, 180, 50); // Orange for Down
  } else if (dog.state === "stay") {
    fill(255, 90, 90);  // Red for Stay
  } else {
    fill(80, 235, 120); // Green for Walking / Nothing
  }
  textSize(22);
  textStyle(BOLD);
  text(label.toUpperCase(), 28, 45);



  // Bottom instruction guide
  fill(0, 0, 0, 140);
  rect(15, height - 36, width - 30, 24, 6);
  fill(240);
  textSize(11);
  textAlign(CENTER, CENTER);
  text("Gestures: 'stay' = Stop | 'down' = Lie Down | 'nothing' / other = Walk", width / 2, height - 24);

  pop();
}

// Callback when ml5 finishes classifying a frame
function gotResult(results) {
  if (results && results.length > 0) {
    label = results[0].label;
    confidence = results[0].confidence;
  }
}

// Key controls as a convenient fallback/testing tool
function keyPressed() {
  if (key === '1') label = "nothing";
  if (key === '2') label = "stay";
  if (key === '3') label = "down";
}
