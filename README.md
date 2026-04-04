# Air Canvas Pro

A professional web-based air drawing application that uses computer vision to track hand gestures for drawing and erasing. Built with MediaPipe Hands and p5.js for real-time hand tracking and smooth drawing experience.

![Air Canvas Pro](https://via.placeholder.com/800x400/1a1a2e/00ff88?text=Air+Canvas+Pro)

## ✨ Features

### 🎨 Drawing & Gestures

- **Draw**: Extend only your index finger to draw
- **Erase**: Open your palm fully to erase nearby drawings
- **Real-time tracking**: Smooth, responsive hand gesture recognition

### 🛠️ Professional Tools

- **Color Picker**: Choose any color for your brush
- **Brush Size**: Adjustable brush thickness (1-50px)
- **Undo**: Step back through your drawing history
- **Clear All**: Start fresh with a clean canvas
- **Save**: Export your artwork as PNG

### 📹 Camera Controls

- **Toggle Camera**: Show/hide live camera feed
- **Professional Positioning**: Camera feed positioned in bottom-right corner
- **Hand Focus**: Visual guides for optimal hand positioning

### 🎯 User Experience

- **Responsive Design**: Works on different screen sizes
- **Gesture Status**: Real-time feedback on current gesture
- **Smooth Performance**: Optimized for real-time drawing
- **Professional UI**: Modern gradient design with glassmorphism effects

## 🚀 Quick Start

### Prerequisites

- Modern web browser with camera access
- Webcam (built-in or external)

### Installation

1. **Clone or download** the project files
2. **Navigate** to the project directory
3. **Start a local server**:

   ```bash
   # Using Python (recommended)
   python -m http.server 8000

   # Or using Node.js
   npx serve .

   # Or any other static file server
   ```

4. **Open** `http://localhost:8000` in your browser
5. **Allow camera access** when prompted

## 🎮 How to Use

### Basic Drawing

1. **Position your hand** in front of the camera
2. **Extend only your index finger** to start drawing
3. **Move your finger** to create strokes
4. **Curl your index finger** to stop drawing

### Erasing

1. **Open your palm fully** (extend all fingers)
2. **Move your open palm** over areas you want to erase
3. **The red circle** shows the erase area

### Advanced Controls

- **Color**: Click the color picker to change brush color
- **Size**: Drag the slider to adjust brush thickness
- **Undo**: Click to remove the last action
- **Clear**: Click to erase everything
- **Save**: Click to download your drawing as PNG
- **Camera**: Toggle to show/hide the camera feed

## 🏗️ Technical Architecture

### Technologies Used

- **MediaPipe Hands**: Google's hand tracking ML model
- **p5.js**: Creative coding library for canvas rendering
- **HTML5/CSS3**: Modern web standards
- **JavaScript ES6+**: Client-side logic

### File Structure

```
Air_Canvas/
├── index.html          # Main HTML structure
├── sketch.js           # p5.js drawing logic & hand tracking
├── style.css           # Professional styling
└── README.md           # This file
```

### Key Components

#### Hand Gesture Recognition

```javascript
// Detect different hand gestures
function isIndexOnly(landmarks)    // Drawing gesture
function isPalmOpen(landmarks)     // Erase gesture
function isFist(landmarks)         // Idle gesture
```

#### Drawing System

```javascript
// Real-time drawing with history
let paths = []; // Current drawing points
let history = []; // Undo stack
let brushColor = "#00ff88";
let brushSize = 8;
```

#### Camera Integration

```javascript
// MediaPipe camera setup
const camera = new Camera(video.elt, {
  onFrame: async () => {
    await hands.send({ image: video.elt });
  },
  width: 1280,
  height: 720,
});
```

## 🔧 Configuration

### Hand Tracking Settings

Adjust these values in `sketch.js` for different sensitivity:

```javascript
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1, // 0-2 (higher = more accurate but slower)
  minDetectionConfidence: 0.5, // 0-1 (lower = more sensitive)
  minTrackingConfidence: 0.5, // 0-1 (lower = smoother tracking)
});
```

### Erase Radius

```javascript
let eraseRadius = 50; // Pixels around palm to erase
```

## 🎨 Customization

### Color Themes

Modify the gradient in `style.css`:

```css
body {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
}
```

### Brush Presets

Add more brush options in the controls:

```html
<select id="brush-preset">
  <option value="pen">Pen</option>
  <option value="brush">Brush</option>
  <option value="marker">Marker</option>
</select>
```

## 🐛 Troubleshooting

### Common Issues

**Camera not working:**

- Ensure camera permissions are granted
- Check if camera is being used by another app
- Try refreshing the page

**Gestures not detected:**

- Ensure good lighting
- Keep hand steady and clearly visible
- Adjust camera angle for better tracking

**Performance issues:**

- Close other browser tabs
- Use a faster device
- Reduce `modelComplexity` in hand tracking options

**Drawing lag:**

- Lower brush size
- Reduce canvas resolution if needed
- Check browser performance

## 📱 Browser Compatibility

- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

_Requires WebGL support for optimal performance_

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup

```bash
# Install dependencies (if any)
npm install

# Start development server
npm start

# Or use Python server for testing
python -m http.server 8000
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **MediaPipe**: Google's ML framework for hand tracking
- **p5.js**: Processing Foundation's creative coding library
- **Google**: For providing the MediaPipe Hands model

## 📞 Support

For issues, questions, or feature requests:

- Create an issue on GitHub
- Check the troubleshooting section
- Ensure you're using a supported browser

---

**Made with ❤️ using computer vision and creative coding**

_Draw in the air, create on screen!_ 🎨✨</content>
<parameter name="filePath">c:\Users\ACER\.vscode\Air_Canvas\README.md
