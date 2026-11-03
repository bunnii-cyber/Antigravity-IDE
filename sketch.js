// The Very Hungry Caterpillar themed inching caterpillar
// Segment 0 is the tail (leftmost), segment 6 is the head (rightmost)

const NUM_SEGMENTS = 7;
const SEG_RADIUS = 36;
const HEAD_INDEX = 6;

// Classic Eric Carle Hungry Caterpillar color palette
const SEGMENT_COLORS = [
  "#2d7f36", // Forest green
  "#74a82e", // Olive yellow-green
  "#1e693b", // Deep leaf green
  "#8dbb34", // Bright spring green
  "#3a8e41", // Medium green
  "#5fa835", // Chartreuse-green
  "#d92b2b"  // Iconic Hungry Caterpillar Red Head
];

// Slider/scale state
let sliderX, sliderY, sliderW, sliderH;
let sliderVal = 0.0; // 0.0 to 1.0
let isDraggingSlider = false;

// Inching animation state
let crawlPhase = 0; // phase variable driven by slider movement
let lastSliderVal = 0.0;
let headBaseX, caterpillarBaseY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  sliderVal = 0.15;
  lastSliderVal = sliderVal;
  updateLayout();
}

function updateLayout() {
  // Slider dimensions positioned nicely below the caterpillar
  sliderW = min(width * 0.7, 520);
  sliderH = 14;
  sliderX = (width - sliderW) / 2;
  sliderY = height * 0.68;

  caterpillarBaseY = height * 0.42;
  // Let the caterpillar move across a generous horizontal window as the scale changes
  headBaseX = width * 0.32;
}

function draw() {
  // Eric Carle textured-feel off-white cream background
  background(250, 247, 238);

  // Subtle decorative collage-style dots/sunshine backdrop vibe
  drawBackgroundAccents();

  // Handle slider movement interaction
  let delta = sliderVal - lastSliderVal;
  if (abs(delta) > 0.0001) {
    // Inching motion phase advances as fruit moves across scale
    crawlPhase += delta * 24.0;
    lastSliderVal = sliderVal;
  }

  // Draw the Caterpillar with caterpillar crawling mechanics
  drawCaterpillar();

  // Draw the scale / slider with draggable fruit icon
  drawScaleAndFruit();

  // Helpful hint
  drawInstructions();
}

function drawBackgroundAccents() {
  noStroke();
  fill(240, 234, 218, 120);
  ellipse(width * 0.5, caterpillarBaseY + 65, min(width * 0.85, 750), 32);
}

function drawInstructions() {
  fill(110, 105, 95);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(15);
  text("Drag the fruit along the scale to make the caterpillar inch forward and back!", width / 2, sliderY + 55);
}

// Draw the inchworm caterpillar with realistic wave motion
function drawCaterpillar() {
  // Total span of the caterpillar body
  let defaultSpacing = SEG_RADIUS * 1.55;

  // Calculate caterpillar position driven by slider and creeping wave
  let forwardTravel = (sliderVal - 0.15) * (sliderW * 0.8);
  let currentHeadX = headBaseX + forwardTravel;

  // We compute positions for each of the 7 segments (0 to 6)
  let segmentPositions = [];

  for (let i = 0; i < NUM_SEGMENTS; i++) {
    // Phase offset per segment creates the traveling peristaltic arch wave
    // Segments arch upwards from back to front in an inching rhythm
    let waveOffset = i * 0.65;
    let wave = sin(crawlPhase - waveOffset);

    // Arch height: middle segments arch the highest, head and tail stay closer to ground
    let archEnvelope = sin((i / (NUM_SEGMENTS - 1)) * PI); // 0 at ends, 1 in middle
    let verticalLift = max(0, -wave) * 48 * archEnvelope;

    // Horizontal compression during the arch (inching bunching effect)
    let bunching = wave * 9 * archEnvelope;

    let segX = currentHeadX - (NUM_SEGMENTS - 1 - i) * defaultSpacing + bunching;
    let segY = caterpillarBaseY - verticalLift;

    segmentPositions.push({ x: segX, y: segY, lift: verticalLift, index: i });
  }

  // 1. Draw legs for the 6 body segments (indices 0 to 5)
  for (let i = 0; i < HEAD_INDEX; i++) {
    let p = segmentPositions[i];
    drawLegs(p.x, p.y, p.lift, i);
  }

  // 2. Draw the 7 body circles
  for (let i = 0; i < NUM_SEGMENTS; i++) {
    let p = segmentPositions[i];

    push();
    translate(p.x, p.y);

    // Soft organic Eric-Carle style caterpillar segment outline
    stroke(25, 60, 20, 45);
    strokeWeight(2.5);
    fill(SEGMENT_COLORS[i]);

    // Slight organic squish as it inches
    let squishX = SEG_RADIUS * 2 * (1 + (p.lift > 5 ? -0.06 : 0.04));
    let squishY = SEG_RADIUS * 2 * (1 + (p.lift > 5 ? 0.08 : -0.03));
    ellipse(0, 0, squishX, squishY);

    // If head, draw antennas and derpy face
    if (i === HEAD_INDEX) {
      drawHeadFeatures();
    } else {
      // Body segment decorative texture spot (Hungry Caterpillar collage aesthetic)
      noStroke();
      fill(255, 230, 80, 50);
      ellipse(-SEG_RADIUS * 0.25, -SEG_RADIUS * 0.25, SEG_RADIUS * 0.6, SEG_RADIUS * 0.5);
    }
    pop();
  }
}

// Draw the derpy face on the head circle
function drawHeadFeatures() {
  // Eric Carle signature purple/blue antennas
  push();
  stroke("#4d3663");
  strokeWeight(4.5);
  strokeCap(ROUND);
  noFill();

  // Left antenna
  bezier(SEG_RADIUS * 0.1, -SEG_RADIUS * 0.7,
    SEG_RADIUS * 0.0, -SEG_RADIUS * 1.35,
    SEG_RADIUS * 0.3, -SEG_RADIUS * 1.5,
    SEG_RADIUS * 0.45, -SEG_RADIUS * 1.45);

  // Right antenna
  bezier(SEG_RADIUS * 0.4, -SEG_RADIUS * 0.6,
    SEG_RADIUS * 0.55, -SEG_RADIUS * 1.3,
    SEG_RADIUS * 0.85, -SEG_RADIUS * 1.4,
    SEG_RADIUS * 0.95, -SEG_RADIUS * 1.3);
  pop();

  // Derpy Eyes (Hungry caterpillar has bright yellow oval eyes with green/black pupils)
  // Eye 1 (Left / larger)
  // push();
  // fill(255, 225, 45);
  // stroke(40, 15, 15, 60);
  // strokeWeight(1.5);
  // ellipse(SEG_RADIUS * 0.15, -SEG_RADIUS * 0.2, 17, 23);

  // // Green center
  // fill(46, 139, 87);
  // noStroke();
  // ellipse(SEG_RADIUS * 0.18, -SEG_RADIUS * 0.2, 10, 14);

  // // Derpy misaligned pupil
  // fill(20);
  // ellipse(SEG_RADIUS * 0.22, -SEG_RADIUS * 0.22, 5, 6);
  // // Eye highlight
  // fill(255);
  // ellipse(SEG_RADIUS * 0.14, -SEG_RADIUS * 0.25, 2.5, 2.5);
  // pop();

  // // Eye 2 (Right / slightly goofy placement & size)
  // push();
  // fill(255, 225, 45);
  // stroke(40, 15, 15, 60);
  // strokeWeight(1.5);
  // ellipse(SEG_RADIUS * 0.62, -SEG_RADIUS * 0.1, 14, 19);

  // // Green center
  // fill(46, 139, 87);
  // noStroke();
  // ellipse(SEG_RADIUS * 0.64, -SEG_RADIUS * 0.1, 8, 12);

  // // Derpy misaligned pupil looking in slightly silly direction
  // fill(20);
  // ellipse(SEG_RADIUS * 0.60, -SEG_RADIUS * 0.07, 4.5, 5);
  // // Highlight
  // fill(255);
  // ellipse(SEG_RADIUS * 0.57, -SEG_RADIUS * 0.13, 2, 2);
  // pop();

  // Derpy smiling mouth made of an arch (arc)
  push();
  noFill();
  stroke(60, 20, 20);
  strokeWeight(3.5);
  strokeCap(ROUND);
  // Arch opening upward for a wide goofy smile
  arc(SEG_RADIUS * 0.35, SEG_RADIUS * 0.28, 26, 20, 0.15, PI - 0.15);

  // Cute little smile creases
  strokeWeight(2.5);
  line(SEG_RADIUS * 0.21, SEG_RADIUS * 0.29, SEG_RADIUS * 0.17, SEG_RADIUS * 0.24);
  line(SEG_RADIUS * 0.49, SEG_RADIUS * 0.29, SEG_RADIUS * 0.53, SEG_RADIUS * 0.24);

  // Derpy rosy cheek
  noStroke();
  fill(255, 120, 120, 90);
  ellipse(SEG_RADIUS * 0.05, SEG_RADIUS * 0.22, 9, 7);
  pop();
}

// Two small legs on each of the 6 body segments
function drawLegs(x, y, lift, index) {
  push();
  stroke(92, 53, 31); // Brownish legs
  strokeWeight(4);
  strokeCap(ROUND);
  noFill();

  let legBaseY = y + SEG_RADIUS * 0.85;
  // Legs kick slightly backward/forward when lifted up
  let kick = (lift > 4) ? sin(crawlPhase + index) * 5 : 0;

  // Front leg of segment
  line(x - 7, legBaseY - 4, x - 12 + kick, legBaseY + 11);
  line(x - 12 + kick, legBaseY + 11, x - 16 + kick, legBaseY + 13); // tiny foot

  // Rear leg of segment
  line(x + 7, legBaseY - 4, x + 3 - kick, legBaseY + 11);
  line(x + 3 - kick, legBaseY + 11, x + 7 - kick, legBaseY + 13); // tiny foot
  pop();
}

// Draw the scale track, tick marks, and draggable fruit handle
function drawScaleAndFruit() {
  push();

  // Scale track background card
  noStroke();
  fill(242, 237, 222);
  rect(sliderX - 25, sliderY - 26, sliderW + 50, sliderH + 52, 16);

  // Scale track grove
  fill(218, 210, 190);
  rect(sliderX, sliderY, sliderW, sliderH, sliderH / 2);

  // Tick marks on the scale
  stroke(180, 172, 150);
  strokeWeight(2);
  for (let step = 0; step <= 10; step++) {
    let tx = sliderX + (sliderW * step) / 10;
    let tLen = (step % 5 === 0) ? 9 : 5;
    line(tx, sliderY + sliderH + 4, tx, sliderY + sliderH + 4 + tLen);
  }

  // Fruit handle position along scale
  let handleX = sliderX + sliderVal * sliderW;
  let handleY = sliderY + sliderH / 2;

  // Active track indicator (reddish caterpillar apple red)
  noStroke();
  fill(217, 43, 43, 110);
  rect(sliderX, sliderY, sliderVal * sliderW, sliderH, sliderH / 2);

  // Fruit Icon: Crisp Eric Carle style Strawberry / Apple treat
  drawFruitIcon(handleX, handleY);

  pop();
}

// Draw the interactive fruit icon (delicious apple/strawberry)
function drawFruitIcon(x, y) {
  push();
  translate(x, y);

  // Subtle shadow under fruit
  noStroke();
  fill(0, 0, 0, 25);
  ellipse(0, 18, 34, 10);

  // Hover or drag highlight glow
  let hovering = dist(mouseX, mouseY, x, y) < 26;
  if (hovering || isDraggingSlider) {
    fill(217, 43, 43, 40);
    ellipse(0, 0, 56, 56);
  }

  // Fruit Stem
  stroke(80, 50, 20);
  strokeWeight(3.5);
  noFill();
  strokeCap(ROUND);
  bezier(0, -12, 2, -22, 8, -24, 7, -26);

  // Green Leaf
  fill(80, 160, 45);
  noStroke();
  push();
  translate(4, -20);
  rotate(PI / 5);
  ellipse(0, 0, 13, 7);
  pop();

  // Fruit body (Eric Carle Apple shape)
  fill(225, 38, 48);
  stroke(160, 20, 30);
  strokeWeight(2);

  beginShape();
  // Double-lobed apple silhouette
  vertex(0, -10);
  bezierVertex(12, -18, 22, -4, 19, 10);
  bezierVertex(16, 20, 4, 18, 0, 14);
  bezierVertex(-4, 18, -16, 20, -19, 10);
  bezierVertex(-22, -4, -12, -18, 0, -10);
  endShape(CLOSE);

  // Hungry caterpillar bite hole! (signature Eric Carle detail)
  fill(250, 247, 238); // background color hole
  stroke(130, 25, 25);
  strokeWeight(1.5);
  circle(4, 2, 9);

  // White highlight on apple
  noStroke();
  fill(255, 255, 255, 90);
  ellipse(-7, -4, 6, 9);

  pop();
}

// Drag & drop logic for scale
function mousePressed() {
  checkSliderPress(mouseX, mouseY);
}

function touchStarted() {
  checkSliderPress(touches[0]?.x || mouseX, touches[0]?.y || mouseY);
  return false; // prevent scrolling on mobile
}

function checkSliderPress(px, py) {
  let handleX = sliderX + sliderVal * sliderW;
  let handleY = sliderY + sliderH / 2;

  // Click on fruit or along the scale track
  if (dist(px, py, handleX, handleY) <= 30 ||
    (px >= sliderX - 15 && px <= sliderX + sliderW + 15 && abs(py - handleY) <= 24)) {
    isDraggingSlider = true;
    updateSliderFromPointer(px);
  }
}

function mouseDragged() {
  if (isDraggingSlider) {
    updateSliderFromPointer(mouseX);
  }
}

function touchMoved() {
  if (isDraggingSlider && touches.length > 0) {
    updateSliderFromPointer(touches[0].x);
    return false;
  }
}

function mouseReleased() {
  isDraggingSlider = false;
}

function touchEnded() {
  isDraggingSlider = false;
}

function updateSliderFromPointer(px) {
  let val = (px - sliderX) / sliderW;
  sliderVal = constrain(val, 0.0, 1.0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}
