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
let brushWidth = parseInt(sizeSlider.value, 10);
let selectedColor = "#000000";

let undoStack = [];
const UNDOLIMIT = 5;

// -----------------------------------------
// UI CONTROLS LOGIC
// -----------------------------------------

// Helper function to manage the undo cntrl+zIndex
const saveState = () => {
	if (undoStack.lenght < UNDOLIMIT) {
		undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
	} else { // if we reached the undo limit we trash the first state saved
		undoStack.shift;
		undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
	};
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
const dotSizes = {
    "dot-sm": 2,
    "dot-md": 5,
    "dot-lg": 12,
    "dot-xl": 20
};

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
// CANVAS DRAWING LOGIC
// -----------------------------------------

const startDraw = (e) => {
    if (!canvasToggle.checked) return;
    
    isDrawing = true;
    hasDrawn = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Logic for Text Tool
    if (selectedTool === "text-tool") {
        const text = prompt("Enter text to place on canvas:");
        if (text) {
            ctx.globalCompositeOperation = "source-over";
            // Scale font size based on brush width (multiplier can be adjusted)
            ctx.font = `${brushWidth * 3}px sans-serif`; 
            ctx.fillText(text, e.offsetX, e.offsetY);
			saveState();
        }
        isDrawing = false; // Prevent drawing a line after placing text
    }
};

const drawing = (e) => {
    if (!isDrawing || selectedTool === "text-tool") return; // Text tool doesn't drag
    
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();        
    } else if (selectedTool === "brush") {
        ctx.globalCompositeOperation = "source-over";
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
};

// Event Listeners for mouse actions
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => {
	if (isDrawing) {
		isDrawing = false;
		if (selectedTool!=="text-tool") {
			saveState();
		}
	}
});

//Event listner for the undo cntrl-z LOGIC
const undoLastAction = () => {
	if (undoStack.length > 1) {
		undoStack.pop();
		ctx.putImageData(undoStack[undoStack.length -1],0,0);
	}
};

document.addEventListener("keydown", (e) => {
	if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
		e.preventDefault();
		undoLastAction();
		console.log('gna');
	}
});