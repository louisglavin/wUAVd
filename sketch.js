// ==== GLOBALS ====
// Your location (example values — replace with real ones)
let myLat = 53.3498;
let myLon = -6.2603;

// Up to 8 friends
let friendLat = new Array(8).fill(0);
let friendLon = new Array(8).fill(0);
let friendNames = new Array(8).fill("");

let blips = new Array(8).fill(null);
let distances = new Array(8).fill(0);

let sweepAngle = 0;
let maxRadarRange = 300; // meters

// App state
let appState = 0; // 0 = setup screen, 1 = radar screen

// Setup screen
let myName = "";
let colorOptions = [];
let selectedColorIndex = -1;

// UI colors
const bgColor = "#050806";
const panelColor = "#0b1410";
const neonPrimary = "#00ff96";
const neonSecondary = "#00c86f";
const mutedGrey = "#1a1f1a";

function setup() {
  createCanvas(600, 600);
  noSmooth();

  // Define color options using p5 color()
  colorOptions = [
    color(255, 0, 0),
    color(0, 255, 0),
    color(0, 0, 255),
    color(255, 255, 0),
    color(255, 0, 255),
    color(0, 255, 255),
    color(255, 128, 0),
    color(128, 0, 255)
  ];

  // Example friend positions
  friendLat[0] = 53.3500;
  friendLon[0] = -6.2600;

  friendLat[1] = 53.3490;
  friendLon[1] = -6.2610;

  // Example friend names
  for (let i = 0; i < 8; i++) {
    friendNames[i] = "Friend " + (i + 1);
  }

  textFont("Segoe UI, system-ui, sans-serif");
}

function draw() {
  if (appState === 0) {
    drawSetupScreen();
  } else {
    drawRadarScreen();
  }
}

// ==== RADAR SCREEN ====

function drawRadarScreen() {
  background(10);
  push();
  translate(width / 2, height / 2);

  updateBlipPositions();
  drawRadarGrid();
  drawBlips();
  drawSweep();
  drawDistanceReadout();

  sweepAngle += 0.02;
  pop();

  // Subtle title
  noStroke();
  fill(150);
  textAlign(CENTER);
  textSize(14);
  text("RADAR", width / 2, 30);
}

function updateBlipPositions() {
  for (let i = 0; i < 8; i++) {
    if (friendLat[i] === 0 && friendLon[i] === 0) continue;

    let d = distanceMeters(myLat, myLon, friendLat[i], friendLon[i]);
    let a = bearing(myLat, myLon, friendLat[i], friendLon[i]);

    distances[i] = d;

    let r = map(d, 0, maxRadarRange, 0, 250);
    r = constrain(r, 0, 250);

    let x = cos(a) * r;
    let y = sin(a) * r;

    blips[i] = { x, y };
  }
}

function drawDistanceReadout() {
  fill(0, 255, 150);
  textAlign(CENTER);
  textSize(18);

  let minD = 999999;
  let closestIndex = -1;

  for (let i = 0; i < 8; i++) {
    if (distances[i] > 0 && distances[i] < minD) {
      minD = distances[i];
      closestIndex = i;
    }
  }

  if (closestIndex !== -1) {
    let label = friendNames[closestIndex] || ("Friend " + (closestIndex + 1));
    text(label + " — " + nf(minD, 0, 1) + " m", width / 2, height - 30);
  }
}

// ==== BLIPS ====

function drawBlips() {
  for (let i = 0; i < 8; i++) {
    if (!blips[i]) continue;

    let angleToBlip = atan2(blips[i].y, blips[i].x);
    let diff = abs(angleToBlip - sweepAngle);

    let intensity = map(diff, 0, 0.3, 255, 0);
    intensity = constrain(intensity, 0, 255);

    noStroke();

    if (i === 0 && selectedColorIndex !== -1) {
      let c = colorOptions[selectedColorIndex];
      fill(red(c), green(c), blue(c), intensity);
    } else {
      fill(0, 255, 150, intensity);
    }

    ellipse(blips[i].x, blips[i].y, 12, 12);
  }
}

// ==== GPS UTILS ====

function distanceMeters(lat1, lon1, lat2, lon2) {
  let R = 6371000;
  let dLat = radians(lat2 - lat1);
  let dLon = radians(lon2 - lon1);

  let a =
    sin(dLat / 2) * sin(dLat / 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    sin(dLon / 2) * sin(dLon / 2);

  let c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c;
}

function bearing(lat1, lon1, lat2, lon2) {
  let dLon = radians(lon2 - lon1);

  let y = sin(dLon) * cos(radians(lat2));
  let x =
    cos(radians(lat1)) * sin(radians(lat2)) -
    sin(radians(lat1)) * cos(radians(lat2)) * cos(dLon);

  let brng = atan2(y, x);
  return (brng + TWO_PI) % TWO_PI;
}

// ==== RADAR GRID ====

function drawRadarGrid() {
  noFill();
  stroke(40);
  strokeWeight(2);

  for (let r = 100; r <= 250; r += 50) {
    ellipse(0, 0, r * 2, r * 2);
  }

  line(-250, 0, 250, 0);
  line(0, -250, 0, 250);
}

// ==== SWEEP ====

function drawSweep() {
  let x = cos(sweepAngle) * 260;
  let y = sin(sweepAngle) * 260;

  for (let i = 0; i < 50; i++) {
    stroke(0, 255, 150, 8 - i * 0.15);
    line(
      0,
      0,
      cos(sweepAngle - i * 0.01) * 260,
      sin(sweepAngle - i * 0.01) * 260
    );
  }

  stroke(0, 255, 150);
  strokeWeight(3);
  line(0, 0, x, y);
}

// ==== SETUP SCREEN (MINIMAL, AESTHETIC) ====

function drawSetupScreen() {
  background(bgColor);

  // Centered panel
  push();
  translate(width / 2, height / 2);
  noStroke();
  fill(panelColor);
  rectMode(CENTER);
  rect(0, 0, 420, 360, 24);

  // Title
  fill(neonPrimary);
  textAlign(CENTER);
  textSize(26);
  text("Radar Setup", 0, -130);

  // Subtitle
  fill(180);
  textSize(14);
  text("Enter your name and choose your radar color", 0, -105);

  // Name label
  textAlign(LEFT);
  textSize(14);
  fill(160);
  text("NAME", -170, -65);

  // Name input box
  let boxX = -170;
  let boxY = -55;
  let boxW = 340;
  let boxH = 40;

  stroke(selectedColorIndex === -1 ? 80 : color(neonPrimary));
  strokeWeight(2);
  noFill();
  rect(boxX + boxW / 2, boxY + boxH / 2, boxW, boxH, 10);

  // Name text
  noStroke();
  fill(230);
  textAlign(LEFT, CENTER);
  textSize(18);
  text(myName || "Type your name...", boxX + 12, boxY + boxH / 2);

  // Color label
  textAlign(LEFT);
  textSize(14);
  fill(160);
  text("COLOR", -170, 10);

  // Color circles
  let startX = -150;
  let y = 50;
  let spacing = 40;

  for (let i = 0; i < 8; i++) {
    let cx = startX + i * spacing;
    let cy = y;

    let c = colorOptions[i];
    let isSelected = (i === selectedColorIndex);

    // Glow
    noStroke();
    if (isSelected) {
      fill(red(c), green(c), blue(c), 80);
      ellipse(cx, cy, 34, 34);
    }

    // Main circle
    stroke(isSelected ? neonPrimary : 220);
    strokeWeight(isSelected ? 2 : 1);
    fill(c);
    ellipse(cx, cy, 26, 26);
  }

  // Start button
  let btnW = 180;
  let btnH = 46;
  let btnX = 0;
  let btnY = 120;

  let canStart = (myName.trim().length > 0 && selectedColorIndex !== -1);

  rectMode(CENTER);
  strokeWeight(0);
  fill(canStart ? neonPrimary : mutedGrey);
  rect(btnX, btnY, btnW, btnH, 999);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("START", btnX, btnY + 1);

  pop();
}

// ==== INPUT HANDLERS ====

function mousePressed() {
  if (appState === 0) {
    // Color selection
    let startX = width / 2 - 150;
    let y = height / 2 + 50;
    let spacing = 40;

    for (let i = 0; i < 8; i++) {
      let cx = startX + i * spacing;
      let cy = y;
      if (dist(mouseX, mouseY, cx, cy) < 18) {
        selectedColorIndex = i;
      }
    }

    // Start button
    let btnW = 180;
    let btnH = 46;
    let btnX = width / 2;
    let btnY = height / 2 + 120;

    let canStart = (myName.trim().length > 0 && selectedColorIndex !== -1);

    if (
      mouseX > btnX - btnW / 2 &&
      mouseX < btnX + btnW / 2 &&
      mouseY > btnY - btnH / 2 &&
      mouseY < btnY + btnH / 2 &&
      canStart
    ) {
      appState = 1;
    }
  }
}

function keyTyped() {
  if (appState === 0) {
    if ((key === "Backspace" || keyCode === BACKSPACE) && myName.length > 0) {
      myName = myName.substring(0, myName.length - 1);
    } else if (keyCode === ENTER || keyCode === RETURN) {
      // ignore
    } else if (key.length === 1) {
      myName += key;
    }
  }
}