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

// Placeholder easing functions (you'll need to implement or import these)
function easeOutSine(t) { return sin(t * PI / 2); }
function easeOutCubic(t) { return 1 - pow(1 - t, 3); }
function easeOutQuart(t) { return 1 - pow(1 - t, 4); }
function easeOutQuint(t) { return 1 - pow(1 - t, 5); }
function easeOutExpo(t) { return t === 1 ? 1 : 1 - pow(2, -10 * t); }
function easeInOutSine(t) { return -(cos(PI * t) - 1) / 2; }
function easeInOutBounce(t) { return t < 0.5 ? easeInBounce(t * 2) / 2 : easeOutBounce(t * 2 - 1) / 2 + 0.5; } // Requires easeInBounce
function easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
}
// You'll need to define easeInBounce for easeInOutBounce
function easeInBounce(t) {
    return 1 - easeOutBounce(1 - t);
}

function easeOutElastic(t) {
    const c4 = (2 * PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : pow(2, -10 * t) * sin((t * 10 - 0.75) * c4) + 1;
}
function easeInSine(t) { return 1 - cos((t * PI) / 2); }
function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * pow(t - 1, 3) + c1 * pow(t - 1, 2);
}

// Placeholder for your custom drawing functions
function processHue(hue) {
    return (hue + 360) % 360;
}

function NYSetColorLerp(hueA, satA, briA, hueB, satB, briB, t) {
    nowHue = lerp(hueA, hueB, t);
    nowSat = lerp(satA, satB, t);
    nowBri = lerp(briA, briB, t);
    stroke(nowHue, nowSat, nowBri, nowAlpha);
    fill(nowHue, nowSat, nowBri, nowAlpha);
}

function NYDotLine(x1, y1, x2, y2) {
    let dist = p5.Vector.dist(createVector(x1, y1), createVector(x2, y2));
    let numDots = max(1, floor(dist * dotDensity));
    for (let i = 0; i < numDots; i++) {
        let t = i / (numDots - 1);
        let x = lerp(x1, x2, t);
        let y = lerp(y1, y2, t);

        let nX = noise(x * noiseScaleX, y * noiseScaleY);
        let nY = noise(x * noiseScaleX + 1000, y * noiseScaleY + 1000);

        let thickness = baseLineThickness * (0.5 + 0.5 * nX);
        let length = baseLineLength * (0.5 + 0.5 * nY);

        let angle = atan2(y2 - y1, x2 - x1);
        push();
        translate(x, y);
        rotate(angle + map(noise(x * 0.01, y * 0.01), 0, 1, -PI/4, PI/4)); // Add some noise to the angle
        strokeWeight(thickness);
        line(-length / 2, 0, length / 2, 0);
        pop();
    }
}

// Placeholder for PlantBowl class
class PlantBowl {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.plantSize = min(w, h) * random(0.3, 0.6);
        this.leafWidth = this.plantSize * random(0.2, 0.8);
        this.layers = floor(random(3, 12));
        this.countPerLayer = floor(random(3, 24));
        this.bowlType = floor(random(4)); // 0: rect, 1: rect, 2: circle, 3: empty
        this.bowlColor = processHue(mainHue + random(-30, 30));
        this.plantHue = processHue(mainHue + random(-60, 60));
    }

    async drawBowlRect() {
        let bowlCenterY = this.y + this.h * random(0.6, 0.9);
        let bowlHeight = this.h * random(0.1, 0.3);
        let bowlWidth = this.w * random(0.5, 0.9);

        let bowlRectX = this.x + (this.w - bowlWidth) / 2;
        let bowlRectY = bowlCenterY - bowlHeight / 2;

        let steps = bowlHeight * lineDensity;
        for (let i = 0; i < steps; i++) {
            let t = i / (steps - 1);
            let y = bowlRectY + t * bowlHeight;
            NYSetColorLerp(this.bowlColor, 30, 20, this.bowlColor, 60, 80, t);
            NYDotLine(bowlRectX, y, bowlRectX + bowlWidth, y);
            if (i % 5 === 0) await sleep(1);
        }
    }

    async drawBowlRound() {
        let bowlCenterY = this.y + this.h * random(0.6, 0.9);
        let bowlRadius = min(this.w, this.h) * random(0.2, 0.4);

        let steps = bowlRadius * 2 * lineDensity;
        for (let i = 0; i < steps; i++) {
            let t = i / (steps - 1);
            let y = bowlCenterY - bowlRadius + t * bowlRadius * 2;
            let xOffset = sqrt(pow(bowlRadius, 2) - pow(y - bowlCenterY, 2));

            NYSetColorLerp(this.bowlColor, 30, 20, this.bowlColor, 60, 80, t);
            if (!isNaN(xOffset)) {
                NYDotLine(this.x + this.w / 2 - xOffset, y, this.x + this.w / 2 + xOffset, y);
            }
            if (i % 5 === 0) await sleep(1);
        }
    }

    drawPlant() {
        let plantCenterX = this.x + this.w / 2;
        let plantCenterY = this.y + this.h / 2;

        let chosenCurveType = random(curveTypes);

        for (let l = 0; l < this.layers; l++) {
            let layerProgress = l / (this.layers - 1);
            let layerAngleOffset = random(PI * 2);

            for (let i = 0; i < this.countPerLayer; i++) {
                let angle = map(i, 0, this.countPerLayer, 0, PI * 2) + layerAngleOffset;
                let radius = lerp(this.plantSize * 0.1, this.plantSize, layerProgress);

                let leafX = plantCenterX + cos(angle) * radius;
                let leafY = plantCenterY + sin(angle) * radius;

                this.drawLeaf(plantCenterX, plantCenterY, leafX, leafY, this.leafWidth, angle, chosenCurveType);
            }
        }
    }

    drawLeaf(x1, y1, x2, y2, width, angle, curveFunction) {
        let numLines = width * lineDensity;
        let mainColor = this.plantHue;

        for (let i = 0; i < numLines; i++) {
            let t = i / (numLines - 1);
            let offset = map(curveFunction(t), 0, 1, -width / 2, width / 2);

            let hue = processHue(mainColor + map(noise(t * leafNoiseScale), 0, 1, -20, 20));
            let sat = map(t, 0, 1, 60, 90);
            let bri = map(noise(t * leafNoiseScale + 100), 0, 1, 70, 90);

            NYSetColorLerp(hue, sat, bri, hue, sat, bri, 0); // No lerp for now, just set color

            let p1x = x1;
            let p1y = y1;
            let p2x = x2;
            let p2y = y2;

            let perpAngle = angle + HALF_PI;

            // Offset points to create leaf shape
            let startX = p1x + cos(perpAngle) * offset;
            let startY = p1y + sin(perpAngle) * offset;
            let endX = p2x + cos(perpAngle) * offset;
            let endY = p2y + sin(perpAngle) * offset;

            NYDotLine(startX, startY, endX, endY);
        }
    }
}


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

    // let bgDensity = 0.06;
    let lastDotDensity = dotDensity;
    // dotDensity = bgDensity;
    for (let y = 0; y < bgLineCount; y++) {
        let t = y / (bgLineCount - 1);
        let nowY = height * t;

        NYSetColorLerp(bgHueA, bgSatA, bgBriA, bgHueB, bgSatB, bgBriB, t);
        NYDotLine(0, nowY, width, nowY);

        if (y % 10 == 0)
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

            let plantX = startX + random(rectWidth * 0.2, rectWidth * 0.8);
            let plantY = startY + random(rectHeight * 0.2, rectHeight * 0.8);

            let plantSize = min(rectWidth, rectHeight) * random(0.3, 0.6);
            let leafWidth = plantSize * random(0.2, 0.8);

            let layers = floor(random(3, 12));
            let countPerLayer = floor(random(3, 24));

            let rects = SubdivideRect(startX, startY, rectWidth, rectHeight, 0);

            for (let r = 0; r < rects.length; r++) {
                let rectObj = rects[r];

                let bowlX = rectObj.x;
                let bowlY = rectObj.y;
                let bowlWidth = rectObj.w;
                let bowlHeight = rectObj.h;

                let newBowl = new PlantBowl(bowlX, bowlY, bowlWidth, bowlHeight);
                bowls.push(newBowl);
            }
        }
    }

    for (let i = 0; i < bowls.length; i++) {

        if (bowls[i].bowlType == 3) // empty bowl
            continue;

        if (bowls[i].bowlType <= 1) // rect
        {
            await bowls[i].drawBowlRect();
        }
        else if (bowls[i].bowlType == 2) // circle
        {
            await bowls[i].drawBowlRound();
        }

        await sleep(1);
    }

    // sort: small bowl draw first
    bowls.sort(function (a, b) {
        if (a.plantSize < b.plantSize)
            return -1;
        else if (a.plantSize > b.plantSize)
            return 1;
        else
            return 0;
    });

    for (let i = 0; i < bowls.length; i++) {
        if (bowls[i].bowlType == 3) // empty bowl
            continue;

        bowls[i].drawPlant();
        await sleep(1);
    }
}


function SubdivideRect(_x, _y, _width, _height, _depth) {

    let doSplit = random(0, 1) < 0.9;

    if (_depth == 0)
        doSplit = true;

    if (min(_width, _height) < 120) {
        doSplit = false;
    }

    if (doSplit) {
        let splitRatio = random(0.4, 0.6);

        // split X
        if (random() < 0.5) {
            let rectA_x = _x;
            let rectA_y = _y;
            let rectA_width = _width * splitRatio;
            let rectA_height = _height;

            let rectB_x = _x + _width * splitRatio;
            let rectB_y = _y;
            let rectB_width = _width * (1 - splitRatio);
            let rectB_height = _height;

            let rectA = SubdivideRect(rectA_x, rectA_y, rectA_width, rectA_height, _depth + 1);
            let rectB = SubdivideRect(rectB_x, rectB_y, rectB_width, rectB_height, _depth + 1);

            return rectA.concat(rectB);
        }
        // split Y
        else {
            let rectA_x = _x;
            let rectA_y = _y;
            let rectA_width = _width;
            let rectA_height = _height * splitRatio;

            let rectB_x = _x;
            let rectB_y = _y + _height * splitRatio;
            let rectB_width = _width;
            let rectB_height = _height * (1 - splitRatio);

            let rectA = SubdivideRect(rectA_x, rectA_y, rectA_width, rectA_height, _depth + 1);
            let rectB = SubdivideRect(rectB_x, rectB_y, rectB_width, rectB_height, _depth + 1);

            return rectA.concat(rectB);
        }
    }
    else {
        return [{ x: _x, y: _y, w: _width, h: _height, depth: _depth }];
    }
}

function draw() {
    // Your draw loop if needed for animation, currently empty.
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function keyPressed(e) {
    if (e.key == 's') {
        saveCanvas(`succulent-${width}-${height}-${fxhash}.png`);
    }
}
