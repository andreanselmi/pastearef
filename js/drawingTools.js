// 1. DOM Elements
const canvas = document.getElementById("drawing-canvas");
const canvasToggle = document.getElementById("drawing-canvas-toggle");
const transparentToggle = document.getElementById("drawing-mode-toggle");
const toolBtns = document.querySelectorAll(".tool");
const colorBtns = document.querySelectorAll(".color-swatch");
const colorStrokePicker = document.getElementById("brush-color-picker");
const sizeSlider = document.getElementById("size-slider");
const sizeDots = document.querySelectorAll(".dot");
const clearCanvasBtn = document.getElementById("clear-canvas");
const ctx = canvas.getContext("2d");

// 2. State Variables
let isDrawing = false;
let hasDrawn = false;
let prevMouseX, prevMouseY, snapshot;
let selectedTool = "brush";
let brushWidth = parseInt(sizeSlider.value, 2);
let selectedColor = "#000000";

let undoStack = [];
const UNDOLIMIT = 10;

// -----------------------------------------
// UI CONTROLS LOGIC
// -----------------------------------------

// Helper function to manage the undo cntrl+zIndex
const saveState = () => {
	if (undoStack.length >= UNDOLIMIT) { //if we reach the limit we trash the first screenshot in the memory stack
		undoStack.shift();
		}
	undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
};


// Canvas Toggle
canvasToggle.addEventListener("change", (e) => {
    canvas.style.display = e.target.checked ? "block" : "none";
    
    // Initialize canvas dimensions if turned on
    if (e.target.checked && canvas.width !== canvas.offsetWidth) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        // Ensure brush properties are applied to the new canvas context
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
		saveState();
    }
});

// Transparency / Allow Model Manipulation (Pointer Events)
transparentToggle.addEventListener("change", (e) => {
    canvas.style.pointerEvents = e.target.checked ? "none" : "auto";
});

// Tool Selection (Brush, Eraser, Text)
toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".tools-container .active")?.classList.remove("active");
        btn.classList.add("active");
        selectedTool = btn.id;
    });
});

// Predefined Color Selection
colorBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        // Ignore clicks on the color picker wrapper itself
        if(btn.classList.contains("color-picker-wrapper")) return; 
        
        document.querySelector(".colors-grid .selected")?.classList.remove("selected");
        btn.classList.add("selected");
        selectedColor = e.target.dataset.color || e.target.style.backgroundColor; // for the colorPicker patch the value is taken from the background
    });
});

// Native Color Picker Input
colorStrokePicker.addEventListener("input", (e) => {
    selectedColor = e.target.value;
    const wrapper = colorStrokePicker.closest('.color-swatch');
    document.querySelector(".colors-grid .selected")?.classList.remove("selected");
    wrapper.classList.add("selected");
});

// Size Slider
sizeSlider.addEventListener("input", (e) => {
    brushWidth = e.target.value;
});

// Clickable Dots (Syncs with slider)
const dotSizes = {"dot-sm": 2,"dot-md": 5,"dot-lg": 12,"dot-xl": 20};
sizeDots.forEach(dot => {
    dot.addEventListener("click", (e) => {
        // Check which class the clicked dot has and set size accordingly
        for (let className in dotSizes) {
            if (e.target.classList.contains(className)) {
                brushWidth = dotSizes[className];
                sizeSlider.value = brushWidth; // Sync the visual slider thumb
                break;
            }
        }
    });
});

// Clear Canvas
clearCanvasBtn.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn = false;
	saveState();
});

// -----------------------------------------
// CANVAS DRAWING LOGIC (Mouse + Touch input)
// -----------------------------------------

// Helper to get correct coordinates for both Mouse and Touch
const getPos = (e) => {
    if (e.touches && e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.offsetX, y: e.offsetY };
};

const startDraw = (e) => {
    if (!canvasToggle.checked) return;
    
    isDrawing = true;
	hasDrawn = true;
    const pos = getPos(e);
    
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    if (selectedTool === "text-tool") {
        const text = prompt("Enter text to place on canvas:");
        if (text) {
            ctx.globalCompositeOperation = "source-over";
            ctx.font = `${brushWidth * 3}px sans-serif`; 
            ctx.fillText(text, pos.x, pos.y);
            saveState();
        }
        isDrawing = false; 
    }
};

const drawing = (e) => {
    if (!isDrawing || selectedTool === "text-tool") return;
    e.preventDefault(); // Prevents scrolling on touch devices while drawing
    
    const pos = getPos(e);
    ctx.putImageData(snapshot, 0, 0);

    ctx.globalCompositeOperation = selectedTool === "eraser" ? "destination-out" : "source-over";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
};

const stopDraw = () => {
    if (isDrawing) {
        isDrawing = false;
        if (selectedTool !== "text-tool") saveState();
    }
};


//==========================================================================
// Mouse Events
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseout", stopDraw); // Stops drawing if cursor leaves canvas

// Touch Events
canvas.addEventListener("touchstart", (e) => { e.preventDefault(); startDraw(e); }, { passive: false });
canvas.addEventListener("touchmove", drawing, { passive: false });
canvas.addEventListener("touchend", stopDraw);

// -----------------------------------------
// UNDO LOGIC (Ctrl+Z)
// -----------------------------------------
const undoLastAction = () => {
    if (undoStack.length > 1) {
        undoStack.pop();
        ctx.putImageData(undoStack[undoStack.length - 1], 0, 0);
    }
};

document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undoLastAction();
    }
});