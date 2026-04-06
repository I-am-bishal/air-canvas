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

// HUD Variables
let hudCanvas;
let hudCtx;
let handDetected = false;
let lightingQuality = 'good';
let lastHands = null;
let hudVisible = true;

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

    // Initialize HUD Canvas
    hudCanvas = document.getElementById('hud-canvas');
    hudCtx = hudCanvas.getContext('2d');
    hudCanvas.width = 280;
    hudCanvas.height = 280;

    // HUD Toggle Button
    const hudToggleBtn = document.getElementById('hud-toggle');
    hudToggleBtn.addEventListener('click', () => {
        hudVisible = !hudVisible;
        const hudContainer = document.getElementById('hud-container');
        hudContainer.style.display = hudVisible ? 'block' : 'none';
        updateHUDStatus();
    });

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
        
        handDetected = true;
        lastHands = results;
        
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
        handDetected = false;
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

    // Update HUD Display
    if (hudVisible) {
        updateHUDDisplay();
        updateHUDStatus();
    }
}

// HUD Functions
function updateHUDDisplay() {
    if (!video || !hudCtx) return;

    // Get video dimensions
    const videoWidth = video.elt.videoWidth;
    const videoHeight = video.elt.videoHeight;
    
    // Clear canvas
    hudCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    hudCtx.fillRect(0, 0, 280, 280);

    // Draw mirrored video feed
    hudCtx.save();
    hudCtx.scale(-1, 1); // Horizontal flip for mirror
    hudCtx.translate(-280, 0);
    hudCtx.drawImage(video.elt, 0, 0, 280, 280);
    hudCtx.restore();

    // Assess lighting quality
    assessLighting();
}

function assessLighting() {
    if (!hudCtx || !lastHands) {
        lightingQuality = 'good';
        return;
    }

    // Get image data to assess brightness
    const imageData = hudCtx.getImageData(0, 0, 280, 280);
    const data = imageData.data;
    
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += (r + g + b) / 3;
    }
    
    const avgBrightness = totalBrightness / (280 * 280);
    
    if (avgBrightness < 50) {
        lightingQuality = 'dark';
    } else if (avgBrightness > 200) {
        lightingQuality = 'bright';
    } else {
        lightingQuality = 'good';
    }
}

function updateHUDStatus() {
    // Update camera status
    const camStatus = document.getElementById('cam-status');
    camStatus.className = 'hud-value active';
    camStatus.textContent = '●';

    // Update hand detection status
    const handStatus = document.getElementById('hand-status');
    if (handDetected) {
        handStatus.className = 'hud-value active';
        handStatus.textContent = '●';
    } else {
        handStatus.className = 'hud-value error';
        handStatus.textContent = '○';
    }

    // Update lighting status
    const lightStatus = document.getElementById('light-status');
    switch (lightingQuality) {
        case 'good':
            lightStatus.className = 'hud-value active';
            lightStatus.textContent = '●';
            break;
        case 'dark':
            lightStatus.className = 'hud-value warning';
            lightStatus.textContent = '▼';
            break;
        case 'bright':
            lightStatus.className = 'hud-value warning';
            lightStatus.textContent = '▲';
            break;
    }
}