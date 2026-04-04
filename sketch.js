let handtrack;
let pointerX = 0, pointerY = 0;
let isDrawing = false;
let paths = []; // Stores the drawing points
let history = []; // For undo
let video;
let eraseMode = false;
let showCamera = false;
let eraseRadius = 50;
let brushColor = '#00ff88';
let brushSize = 8;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    video = createCapture(VIDEO);
    video.size(1280, 720);
    video.hide(); // Hide the video element
    
    // Initialize MediaPipe Hands
    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    hands.onResults(gotHands);

    const camera = new Camera(video.elt, {
        onFrame: async () => {
            await hands.send({ image: video.elt });
        },
        width: 1280,
        height: 720
    });
    camera.start();

    // Camera toggle button with professional positioning
    const btn = document.getElementById('camera-toggle');
    btn.addEventListener('click', () => {
        showCamera = !showCamera;
        if (showCamera) {
            video.show();
            video.style('border-radius', '15px');
            video.style('border', '2px solid rgba(0, 255, 136, 0.5)');
            video.style('box-shadow', '0 8px 32px rgba(0, 0, 0, 0.3)');
            video.style('object-fit', 'cover');
            // Position: bottom-right corner
            video.position(windowWidth - 270, windowHeight - 270);
            video.size(250, 250);
            btn.textContent = 'Hide Camera';
        } else {
            video.hide();
            btn.textContent = 'Show Camera';
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (showCamera) {
            video.position(windowWidth - 270, windowHeight - 270);
        }
    });

    // Color picker
    const colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('input', (e) => {
        brushColor = e.target.value;
    });

    // Brush size slider
    const brushSizeSlider = document.getElementById('brush-size');
    const sizeValue = document.getElementById('size-value');
    brushSizeSlider.addEventListener('input', (e) => {
        brushSize = parseInt(e.target.value);
        sizeValue.textContent = brushSize + 'px';
    });

    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
        paths = [];
        history = [];
        updateStatus('Canvas cleared');
    });

    // Undo button
    document.getElementById('undo-btn').addEventListener('click', () => {
        if (history.length > 0) {
            paths = history.pop();
            updateStatus('Undid last action');
        }
    });

    // Save button
    document.getElementById('save-btn').addEventListener('click', () => {
        saveCanvas('air-canvas-drawing', 'png');
        updateStatus('Drawing saved');
    });
}

function updateStatus(message) {
    const statusEl = document.getElementById('gesture-status');
    statusEl.textContent = message;
    setTimeout(() => statusEl.textContent = 'Ready', 2000);
}

function isFist(landmarks) {
    // All fingers curled
    const fingers = [
        [8, 6], // index
        [12, 10], // middle
        [16, 14], // ring
        [20, 18] // pinky
    ];
    let curled = 0;
    for (let [tip, pip] of fingers) {
        if (landmarks[tip].y > landmarks[pip].y) curled++;
    }
    return curled >= 4;
}

function isPalmOpen(landmarks) {
    // All fingers extended
    const fingers = [
        [8, 6], // index
        [12, 10], // middle
        [16, 14], // ring
        [20, 18] // pinky
    ];
    let extended = 0;
    for (let [tip, pip] of fingers) {
        if (landmarks[tip].y < landmarks[pip].y) extended++;
    }
    return extended >= 4;
}

function isIndexOnly(landmarks) {
    // Only index finger extended
    const indexExtended = landmarks[8].y < landmarks[6].y;
    const middleCurled = landmarks[12].y > landmarks[10].y;
    const ringCurled = landmarks[16].y > landmarks[14].y;
    const pinkyCurled = landmarks[20].y > landmarks[18].y;
    return indexExtended && middleCurled && ringCurled && pinkyCurled;
}

function gotHands(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const indexTip = landmarks[8];
        pointerX = width - (indexTip.x * width); // Flip for mirror effect
        pointerY = indexTip.y * height;
        
        if (isPalmOpen(landmarks)) {
            if (!eraseMode) {
                history.push([...paths]); // Save state before erasing
            }
            eraseMode = true;
            isDrawing = false;
            updateStatus('Erasing');
        } else if (isIndexOnly(landmarks)) {
            if (eraseMode || !isDrawing) {
                history.push([...paths]); // Save state before drawing
            }
            eraseMode = false;
            isDrawing = true;
            paths.push({x: pointerX, y: pointerY});
            updateStatus('Drawing');
        } else {
            eraseMode = false;
            isDrawing = false;
            updateStatus('Ready');
        }
    } else {
        isDrawing = false;
        eraseMode = false;
        updateStatus('No hand detected');
    }
}

function draw() {
    clear();
    background(0, 0, 0, 50); // Slight trail effect

    // Erase points near pointer if in erase mode
    if (eraseMode) {
        paths = paths.filter(p => dist(p.x, p.y, pointerX, pointerY) > eraseRadius);
    }

    // Draw the path
    noFill();
    stroke(brushColor);
    strokeWeight(brushSize);
    beginShape();
    for (let p of paths) {
        vertex(p.x, p.y);
    }
    endShape();

    // Draw hand focus indicator (professional frame)
    stroke(brushColor);
    strokeWeight(1);
    // Vertical guide lines
    line(pointerX - 40, pointerY - 80, pointerX - 40, pointerY + 80);
    line(pointerX + 40, pointerY - 80, pointerX + 40, pointerY + 80);
    // Horizontal guide lines
    line(pointerX - 40, pointerY - 80, pointerX + 40, pointerY - 80);
    line(pointerX - 40, pointerY + 80, pointerX + 40, pointerY + 80);
    
    // Draw cursor with professional indicator
    if (eraseMode) {
        stroke(255, 0, 0);
        strokeWeight(2);
        noFill();
        circle(pointerX, pointerY, eraseRadius * 2);
        fill(255, 0, 0, 50);
        circle(pointerX, pointerY, eraseRadius * 2);
    } else if (isDrawing) {
        fill(brushColor);
        noStroke();
        ellipse(pointerX, pointerY, brushSize, brushSize);
        // Outline
        stroke(brushColor);
        strokeWeight(1);
        noFill();
        ellipse(pointerX, pointerY, brushSize + 4, brushSize + 4);
    }
}