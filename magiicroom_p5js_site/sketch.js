// exhibition settings
let drawDensity = 1;
let drawBowlLoopCount = 1;

// style parameters
let noiseScaleX = 0.1;
let noiseScaleY = 0.1;

let lineDensity = 1.0;
let dotDensity = 1.0;
let baseLineThickness = 1;
let baseLineLength = 6;


let mainHue = 0;

let curveTypes = []

// leaf settings
let leafCurveValue = 3;
let leafNoiseScale = 0.01;

// color settings
let nowHue = 0;
let nowSat = 0;
let nowBri = 0;
let nowAlpha = 0;

let bowls = [];

async function setup() {
  let paddingRatio = 0.1;
  createCanvas(windowWidth, windowHeight);
	describe("This artwork draws inspiration from potted succulent plants found on the streets. It integrates recursive algorithms to make the layout and uses easing functions to create the leaf shapes.");

  colorMode(HSB);
  pixelDensity(drawDensity);
  background(20);

  dotDensity = random(0.05, 0.3);
  lineDensity = random(0.4, 0.8);

  noiseScaleX = random(0.0001, 0.01);
  noiseScaleY = random(0.0001, 0.01);

  baseLineThickness = random(1, 6);
  baseLineLength = random(6, 12);

  mainHue = random(0, 360);

  curveTypes.push(easeOutSine);
  curveTypes.push(easeOutCubic);
  curveTypes.push(easeOutQuart);
  curveTypes.push(easeOutQuint);
  curveTypes.push(easeOutExpo);
  curveTypes.push(easeInOutSine);
  curveTypes.push(easeInOutBounce);
  curveTypes.push(easeOutBounce);
  curveTypes.push(easeOutElastic);
  curveTypes.push(easeInSine);
  curveTypes.push(easeOutBack);

  // draw bg with code
  let bgHueA = processHue(mainHue + random(-10, 10));
  let bgHueB = processHue(mainHue + random(-10, 10));
  let bgSatA = random(0, 20);
  let bgSatB = random(0, 20);
  let bgBriA = random(5, 25);
  let bgBriB = random(5, 25);

  if (random() < 0.5) {
    bgBriA = random(20, 40);
    bgBriB = random(20, 40);
  }
  let bgLineCount = height * lineDensity;

  let lastDotDensity = dotDensity;
  for (let y = 0; y < bgLineCount; y++) {
    let t = y / (bgLineCount - 1);
    let nowY = height * t;

    NYSetColorLerp(bgHueA, bgSatA, bgBriA, bgHueB, bgSatB, bgBriB, t);
    NYDotLine(0, nowY, width, nowY);

    if(y % 10 == 0)
    await sleep(1);
  }
  dotDensity = lastDotDensity;

  let xCount = floor(random(1, 3));
  let yCount = floor(random(1, 3));

  let padding = min(width, height) * paddingRatio;

  let rectWidth = (width - 2 * padding) / xCount;
  let rectHeight = (height - 2 * padding) / yCount;

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      let startX = rectWidth * x + padding;
      let startY = rectHeight * y + padding;
      let rects = SubdivideRect(startX, startY, rectWidth, rectHeight, 0);
      for (let r = 0; r < rects.length; r++) {
        let rectObj = rects[r];
        let newBowl = new PlantBowl(rectObj.x, rectObj.y, rectObj.w, rectObj.h);
        bowls.push(newBowl);
      }
    }
  }

  for (let i = 0; i < bowls.length; i++) {
    if (bowls[i].bowlType == 3) continue;
    if (bowls[i].bowlType <= 1) await bowls[i].drawBowlRect();
    else if (bowls[i].bowlType == 2) await bowls[i].drawBowlRound();
    await sleep(1);
  }

  bowls.sort((a, b) => a.plantSize - b.plantSize);
  for (let i = 0; i < bowls.length; i++) {
    if (bowls[i].bowlType == 3) continue;
    bowls[i].drawPlant();
    await sleep(1);
  }
}

function SubdivideRect(_x, _y, _width, _height, _depth) {
  let doSplit = random(0, 1) < 0.9;
  if (_depth == 0) doSplit = true;
  if (min(_width, _height) < 120) doSplit = false;

  if (doSplit) {
    let splitRatio = random(0.4, 0.6);
    if (random() < 0.5) {
      let w1 = _width * splitRatio;
      let w2 = _width * (1 - splitRatio);
      return SubdivideRect(_x, _y, w1, _height, _depth + 1)
        .concat(SubdivideRect(_x + w1, _y, w2, _height, _depth + 1));
    } else {
      let h1 = _height * splitRatio;
      let h2 = _height * (1 - splitRatio);
      return SubdivideRect(_x, _y, _width, h1, _depth + 1)
        .concat(SubdivideRect(_x, _y + h1, _width, h2, _depth + 1));
    }
  } else {
    return [{ x: _x, y: _y, w: _width, h: _height, depth: _depth }];
  }
}

function draw() {}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function keyPressed(e) {
  if (e.key == 's') {
    saveCanvas(`succulent-${width}-${height}.png`);
  }
}
