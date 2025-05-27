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

// --- MISSING FUNCTION DEFINITIONS START HERE ---

// Easing Functions - Standard implementations for common easing types
function easeOutSine(t) { return sin(t * PI / 2); }
function easeOutCubic(t) { return 1 - pow(1 - t, 3); }
function easeOutQuart(t) { return 1 - pow(1 - t, 4); }
function easeOutQuint(t) { return 1 - pow(1 - t, 5); }
function easeOutExpo(t) { return t === 1 ? 1 : 1 - pow(2, -10 * t); }
function easeInOutSine(t) { return -(cos(PI * t) - 1) / 2; }
function easeInBounce(t) { return 1 - easeOutBounce(1 - t); } // Helper for easeInOutBounce
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
function easeInOutBounce(t) {
    return t < 0.5 ? easeInBounce(t * 2) / 2 : easeOutBounce(t * 2 - 1) / 2 + 0.5;
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

// Custom Drawing Functions - Basic implementations, adjust as needed
function processHue(hue) {
    return (hue + 360) % 360; // Ensures hue stays within 0-360 range
}

function NYSetColorLerp(hueA, satA, briA, hueB, satB, briB, t) {
    // Lerp colors between A and B based on t
    nowHue = lerp(hueA, hueB, t);
    nowSat = lerp(satA, satB, t);
    nowBri = lerp(briA, briB, t);
    // Assumes nowAlpha is set elsewhere or defaults to 1
    stroke(nowHue, nowSat, nowBri, 100); // Use 100 for full opacity in HSB by default
    fill(nowHue, nowSat, nowBri, 100);   // Use 100 for full opacity in HSB by default
    noFill(); // Lines are drawn with stroke, so often noFill is desired
}

function NYDotLine(x1, y1, x2, y2) {
    let dist = p5.Vector.dist(createVector(x1, y1), createVector(x2, y2));
    let numDots = max(1, floor(dist * dotDensity)); // Ensure at least one dot
    for (let i = 0; i < numDots; i++) {
        let t = i / (numDots - 1);
        let x = lerp(x1, x2, t);
        let y = lerp(y1, y2, t);

        // Add noise to position for organic feel
        let offsetX = map(noise(x * noiseScaleX, y * noiseScaleY), 0, 1, -baseLineLength / 4, baseLineLength / 4);
        let offsetY = map(noise(x * noiseScaleX + 1000, y * noiseScaleY + 1000), 0, 1, -baseLineLength / 4, baseLineLength / 4);

        let thickness = baseLineThickness * map(noise(x * 0.01, y * 0.01), 0, 1, 0.5, 1.5); // Vary thickness
        let length = baseLineLength * map(noise(x * 0.01 + 2000, y * 0.01 + 2000), 0, 1, 0.7, 1.3); // Vary length

        let angle = atan2(y2 - y1, x2 - x1); // Angle of the main line segment
        push();
        translate(x + offsetX, y + offsetY);
        rotate(angle + map(noise(x * 0.005, y * 0.005), 0, 1, -PI / 8, PI / 8)); // Add some noise to rotation
        strokeWeight(thickness);
        line(-length / 2, 0, length / 2, 0); // Draw a short line segment
        pop();
    }
}


// --- PLANTBOWL CLASS DEFINITION ---
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

            // Make bowl color slightly darker towards the bottom
            let currentBri = lerp(80, 40, t);
            NYSetColorLerp(this.bowlColor, 60, currentBri, this.bowlColor, 60, currentBri, 0);
            NYDotLine(bowlRectX, y, bowlRectX + bowlWidth, y);
            if (i % 5 === 0) await sleep(1); // Introduce small delay for drawing effect
        }
    }

    async drawBowlRound() {
        let bowlCenterY = this.y + this.h * random(0.6, 0.9);
        let bowlRadius = min(this.w, this.h) * random(0.2, 0.4);

        // Draw multiple horizontal lines to form the circle
        let steps = floor(bowlRadius * 2 * lineDensity); // Number of horizontal lines
        for (let i = 0; i < steps; i++) {
            let t = i / (steps - 1);
            let y = bowlCenterY - bowlRadius + t * bowlRadius * 2;
            let xOffset = sqrt(pow(bowlRadius, 2) - pow(y - bowlCenterY, 2)); // Calculate width at current y

            // Skip if xOffset is NaN (outside circle bounds due to float precision)
            if (isNaN(xOffset)) continue;

            // Make bowl color slightly darker towards the bottom
            let currentBri = lerp(80, 40, t);
            NYSetColorLerp(this.bowlColor, 60, currentBri, this.bowlColor, 60, currentBri, 0);
            NYDotLine(this.x + this.w / 2 - xOffset, y, this.x + this.w / 2 + xOffset, y);
            if (i % 5 === 0) await sleep(1); // Introduce small delay for drawing effect
        }
    }

    drawPlant() {
        let plantCenterX = this.x + this.w / 2;
        let plantCenterY = this.y + this.h * 0.4; // Place plant slightly higher than center of bowl bounding box

        let chosenCurveType = random(curveTypes);

        for (let l = 0; l < this.layers; l++) {
            let layerProgress = l / (this.layers - 1);
            let layerAngleOffset = random(PI * 2); // Random starting angle for each layer

            for (let i = 0; i < this.countPerLayer; i++) {
                let angle = map(i, 0, this.countPerLayer, 0, PI * 2) + layerAngleOffset;
                let radius = lerp(this.plantSize * 0.1, this.plantSize * 0.8, layerProgress); // Inner layers are smaller

                let leafX = plantCenterX + cos(angle) * radius;
                let leafY = plantCenterY + sin(angle) * radius;

                this.drawLeaf(plantCenterX, plantCenterY, leafX, leafY, this.leafWidth, angle, chosenCurveType);
            }
        }
    }

    drawLeaf(x1, y1, x2, y2, width, angle, curveFunction) {
        let numLines = max(1, floor(width * lineDensity)); // Ensure at least one line for the leaf
        let mainColor = this.plantHue;

        for (let i = 0; i < numLines; i++) {
            let t = i / (numLines - 1);
            let offset = map(curveFunction(t), 0, 1, -width / 2, width / 2); // Apply easing to offset for leaf shape

            let hue = processHue(mainColor + map(noise(t * leafNoiseScale, frameCount * 0.001), 0, 1, -20, 20)); // Subtle hue variation
            let sat = map(t, 0, 1, 60, 90); // Saturation increases towards tip
            let bri = map(noise(t * leafNoiseScale + 100, frameCount * 0.001), 0, 1, 70, 90); // Brightness variation

            NYSetColorLerp(hue, sat, bri, hue, sat,
