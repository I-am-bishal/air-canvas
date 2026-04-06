/**
 * AIR CANVAS PRO - COMPLETE ENGINE
 * Feature: Continuous Line Rendering & Hand Tracking
 */

let video;
let hands;
let camera;

// Coordinate State & Smoothing
let pointerX = 0, pointerY = 0;
let smoothedX = 0, smoothedY = 0;
const sensitivity = 0.25; 

// Drawing State: Continuous Path Logic
let allPaths = [];      // Stores finished strokes: { points: [], color: '', size: 0 }
let currentStroke = []; // Points for the line currently being drawn
let isDrawing = false;
let eraseMode = false;
let showCamera = false;

// Brush Settings
let brushColor = '#00ff88';
let brushSize = 8;

function setup() {
    // 1. Initialize Canvas
    const canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent(document.body);

    // 2. Initialize Camera Feed
    video = createCapture(VIDEO);
    video.size(280, 280);
    video.parent('hud-wrapper'); // Mount inside the professional HUD
    video.hide(); 

    // 3. Initialize MediaPipe Hands AI
    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
    });

    hands.onResults(gotHands);

    // 4. Start Camera Heartbeat
    camera = new Camera(video.elt, {
        onFrame: async () => {
            await hands.send({ image: video.elt });
        },
        width: 280,
        height: 280
    });
    camera.start();

    setupUIListeners();
}

function setupUIListeners() {
    // Camera Toggle
    document.getElementById('camera-toggle').addEventListener('click', (e) => {
        showCamera = !showCamera;
        if (showCamera) {
            video.show();
            e.target.textContent = 'Hide Camera';
        } else {
            video.hide();
            e.target.textContent = 'Show Camera';
        }
    });

    // Control Listeners
    document.getElementById('color-picker').addEventListener('input', (e) => brushColor = e.target.value);
    document.getElementById('brush-size').addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        document.getElementById('size-value').textContent = brushSize + 'px';
    });
    
    document.getElementById('clear-btn').addEventListener('click', () => {
        allPaths = [];
        currentStroke = [];
        updateStatus('Canvas Cleared');
    });

    document.getElementById('undo-btn').addEventListener('click', () => {
        if (allPaths.length > 0) allPaths.pop();
        updateStatus('Undo Successful');
    });

    document.getElementById('save-btn').addEventListener('click', () => saveCanvas('air-canvas-export', 'png'));
}

function gotHands(results) {
    const handStatus = document.getElementById('hand-status');
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Map coordinates with Mirror Effect
        pointerX = width - (landmarks[8].x * width);
        pointerY = landmarks[8].y * height;
        
        // HUD Update
        handStatus.className = 'hud-value active';
        handStatus.textContent = '●';

        // GESTURE LOGIC
        if (isPalmOpen(landmarks)) {
            // ERASER MODE
            finalizeCurrentStroke();
            eraseMode = true;
            isDrawing = false;
            updateStatus('Mode: Eraser');
            runSpatialEraser(pointerX, pointerY);
        } else if (isIndexOnly(landmarks)) {
            // DRAWING MODE
            eraseMode = false;
            isDrawing = true;
            updateStatus('Mode: Drawing');
            currentStroke.push({ x: pointerX, y: pointerY });
        } else {
            // IDLE MODE (Hand visible but not drawing)
            finalizeCurrentStroke();
            isDrawing = false;
            eraseMode = false;
            updateStatus('System: Ready');
        }
    } else {
        // NO HAND DETECTED
        handStatus.className = 'hud-value error';
        handStatus.textContent = '○';
        finalizeCurrentStroke();
        isDrawing = false;
    }
}

function finalizeCurrentStroke() {
    if (currentStroke.length > 0) {
        allPaths.push({
            points: [...currentStroke],
            color: brushColor,
            size: brushSize
        });
        currentStroke = [];
    }
}

function draw() {
    background(10, 10, 18); 
    drawGrid();

    // Smooth Cursor Movement (Lerp)
    smoothedX = lerp(smoothedX, pointerX, sensitivity);
    smoothedY = lerp(smoothedY, pointerY, sensitivity);

    // 1. Render Saved Strokes as Continuous Lines
    noFill();
    for (let strokeObj of allPaths) {
        stroke(strokeObj.color);
        strokeWeight(strokeObj.size);
        beginShape();
        for (let p of strokeObj.points) {
            vertex(p.x, p.y);
        }
        endShape();
    }

    // 2. Render Active Stroke (The line you are currently drawing)
    if (currentStroke.length > 0) {
        stroke(brushColor);
        strokeWeight(brushSize);
        beginShape();
        for (let p of currentStroke) {
            vertex(p.x, p.y);
        }
        endShape();
    }

    // 3. Render Interactive Cursor HUD
    renderCursor(smoothedX, smoothedY);
}

function renderCursor(x, y) {
    if (eraseMode) {
        stroke(255, 50, 50);
        strokeWeight(2);
        noFill();
        circle(x, y, 50 + sin(frameCount * 0.1) * 5);
        fill(255, 50, 50, 20);
        circle(x, y, 50);
    } else {
        fill(brushColor);
        noStroke();
        ellipse(x, y, brushSize + 4, brushSize + 4);
    }
}

function runSpatialEraser(x, y) {
    // Professional distance-based point removal
    for (let i = allPaths.length - 1; i >= 0; i--) {
        allPaths[i].points = allPaths[i].points.filter(p => dist(p.x, p.y, x, y) > 40);
        
        // Remove empty paths
        if (allPaths[i].points.length === 0) {
            allPaths.splice(i, 1);
        }
    }
}

function drawGrid() {
    stroke(255, 255, 255, 10);
    for (let i = 0; i < width; i += 60) line(i, 0, i, height);
    for (let i = 0; i < height; i += 60) line(0, i, width, i);
}

function updateStatus(msg) {
    const el = document.getElementById('gesture-status');
    if (el) el.textContent = `SYSTEM // ${msg.toUpperCase()}`;
}

// Gesture Helpers
function isPalmOpen(lm) {
    return lm[8].y < lm[6].y && lm[12].y < lm[10].y && lm[16].y < lm[14].y;
}

function isIndexOnly(lm) {
    const indexUp = lm[8].y < lm[6].y;
    const middleDown = lm[12].y > lm[10].y;
    const ringDown = lm[16].y > lm[14].y;
    return indexUp && middleDown && ringDown;
}