//global state

let apiInstance = null;
let isPlaying = true; // Sketchfab auto-plays by default
let updateTimer = null; // clean the timer update loop
const fps = 24;	//animation user-defined fps
let statesLight = []; // stores light state infos for the 3 possible light in the model
let lightIntensitiesWhenOn = [1, 1, 1]; // Memory for the 3 lights: index 0, 1, and 2

//UI elements (more at the bottom)

const playBtn = document.getElementById('play');
// frame and seconds timers
const elTime = document.getElementById('current-time-val');
const elFrame = document.getElementById('current-frame-val');
// display animation style timing in seconds+frame within a second (eg. 2s+12frame = 2.5 sec at 24fps)
const elIntSec = document.getElementById('int-sec-val');
const elFrameSec = document.getElementById('frame-sec-val');

const colorPicker = document.querySelector("#color-picker")

// Setting up a new perspective grid

const gridManager = new GridManager('viewer-container');
//gridManager.initGrids();



// Promisifies API calls that use the (err, result) callback pattern 
function promisify(fn, ...args) {
        return new Promise((resolve, reject) => {
            fn.apply(this.api, [...args, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }]);
        });
    };



// Play/pause button logic UI

playBtn.addEventListener('click', () => {
	//console.log("isPlaying =", isPlaying,"\u23F8");
	if (!apiInstance) return; // Do nothing if the API isn't ready
	isPlaying = !isPlaying; //flip the boolean once the button has been pressed
	playBtn.innerText = isPlaying? "\u23F8" : "▶"; // alternate the button play/pause icon
	isPlaying ? apiInstance.play() : apiInstance.pause();
});

// Frame skip logic UI

document.getElementById('one-frame-forward').onclick = () => {
	if (!apiInstance) return; // Do nothing if the API isn't ready	
	apiInstance.getCurrentTime(function(err,time){
		apiInstance.seekTo(time+(1/fps));			
	});
};
document.getElementById('one-frame-back').onclick = () => {
	if (!apiInstance) return; // Do nothing if the API isn't ready	
	apiInstance.getCurrentTime(function(err,time){
		apiInstance.seekTo(time-(1/fps));			
	});
};
document.getElementById('two-frame-forward').onclick = () => {
	if (!apiInstance) return; // Do nothing if the API isn't ready	
	apiInstance.getCurrentTime(function(err,time){
		apiInstance.seekTo(time+(2/fps));			
	});
};
document.getElementById('two-frame-back').onclick = () => {
	if (!apiInstance) return; // Do nothing if the API isn't ready	
	apiInstance.getCurrentTime(function(err,time){
		apiInstance.seekTo(time-(2/fps));			
	});
};


function setupLightingUI() {
	if(!apiInstance) {return};
	// Run this initialization after your apiInstance is ready
	
	// 1. Find all light control groups
	
	const lightGroups = document.querySelectorAll('.light-control-group'); //NodeList of all 3 light control groups

	lightGroups.forEach((group) => {
	
		const lindex = parseInt(group.dataset.index); //index 0 to 2 of the light beeing considered at the moment
		const startState = statesLight[lindex]; // start-up state of the light in the 3D model
		lightIntensitiesWhenOn[lindex] = startState.intensity;
		//console.log(statesLight);
		
		const sidebarBtn = group.querySelector('.toggle-light');
		const diagramBtn = document.querySelector(`.diagram-toggle-light[data-index="${lindex}"]`); // its a template strings: the backticks implies that the placeholder is read as the currently considered lindex
		const colorPicker = group.querySelector('.color-picker');
		const intensitySlider = group.querySelector('.intensity-slider');
		const intensityNum = group.querySelector('.intensity-num');


		const syncVisuals = (isOn, val) => {
			[sidebarBtn, diagramBtn].forEach(btn => {
				if (!btn) return; //if the button hasn't load yet go on

				btn.style.backgroundColor = isOn ? "var(--accent-blue)" : "#444";
				btn.classList.toggle('is-active', isOn); // depending is the state is on/off it adds/removes a CSS class to the button called 'is-active'
				
				// Only update text if it's the sidebar button
				if (btn === sidebarBtn) btn.textContent = isOn ? "Turn off" : "Turn on";
			});

			// 2. Update the intensity inputs (only if a value was provided)
			if (val !== undefined) {
				intensitySlider.value = intensityNum.value = val; // Set both at once!
			}
		}
		
		// Initialization
		const startsOn = startState.intensity > 0.000001;		
		syncVisuals(startsOn, startState.intensity);
		colorPicker.value = normalizedRgbToHex(startState.color); //initializing colour to start-up start: DOESN'T DISPLAY CORRECTLY
		

		
		// Intensity Change (Slider or Box)
		const onIntensityChange = (e) => {
		  const val = parseFloat(e.target.value);
		  lightIntensitiesWhenOn[lindex] = val; // Store memory for the current light intensity when on
		  apiInstance.setLight(lindex, { intensity: val });
		  syncVisuals(val > 0.000001, val); //if the slider or the numInput is set to zero the UI for the button goes off
		};

		intensitySlider.onchange = onIntensityChange;
		intensityNum.onchange = onIntensityChange;

		// Toggle Logic (On/Off)
		const handleToggle = () => {
		  apiInstance.getLight(lindex, (err, state) => {
			if (err) return;
			const isTurningOff = state.intensity > 0.000001; // the light is ON when the button is pressed, so it is currently turning off
			
			const nextIntensity = isTurningOff ? 0 : lightIntensitiesWhenOn[lindex];
			apiInstance.setLight(lindex, { intensity: nextIntensity });
			syncVisuals(!isTurningOff, nextIntensity);
		  });
		};

		sidebarBtn.onclick = handleToggle;
		diagramBtn.onclick = handleToggle;			
		
		
		// Color Change
		colorPicker.onchange = (e) => {
			apiInstance.setLight(lindex, { color: hexToNormalizedRgb(e.target.value) });
		};
		
	});
};


// 3. Load Model Input Logic

const modelInput = document.getElementById('model-id-input');

document.getElementById('load-model').onclick = () => {

	const modelString = modelInput.value.trim();		
	let uid = modelString;
	if (modelString.startsWith('http')) {
		console.log('Loading model from a URL...');
		uid = modelString.split('-').slice(-1)[0]; // Ensure we get the string, not an array
	} else {console.log('Loading model from a direct uid...');}    
	loadModel(uid);
};


async function loadModel(modelId) {
    const iframe = document.getElementById('api-frame');
    const client = new Sketchfab(iframe);

    console.log("🚀 Initializing model:", modelId);

    client.init(modelId, {
        success: async function(api) {
            apiInstance = api;

            // 1. Start the API and wait for the 'viewerready' event
            api.start(async () => {
                api.addEventListener('viewerready', async () => {
                    console.log("✅ Viewer Ready");

                    try {
                        // --- STEP 1: CALCULATE INITIAL STATE ---
                        // We await the camera data so we have 'dist' before doing anything else
                        const cam = await promisify(api.getCameraLookAt);
                        const dist = Math.hypot(
                            cam.target[0] - cam.position[0],
                            cam.target[1] - cam.position[1],
                            cam.target[2] - cam.position[2]
                        );

                        // Now it's safe to initialize grids. 
                        // The 'undefined' error disappears because this happens FIRST.
                        gridManager.initGrids(dist);

                        // --- STEP 2: INITIALIZE SUBSYSTEMS ---
                        // We move these to helper functions to keep loadModel readable
                        await initializeLights(api);
                        await initializeAnimations(api);

                        // --- STEP 3: ENABLE UI & LISTENERS ---
                        // Only now do we allow the camera to trigger 'sync'
                        setupCameraListeners(api);
                        
                        sync(); // Final initial render
                        playBtn.innerText = "\u23F8";

                    } catch (err) {
                        console.error("❌ Initialization failed:", err);
                    }
                });
            });
        },
        error: (err) => console.error('Could not load Sketchfab', err)
    });
}

// --- HELPER FUNCTIONS (Maintenance-friendly) ---

function setupCameraListeners(api) {
    api.addEventListener('camerastop', () => {
        const anyGridActive = ['xy', 'yz', 'xz'].some(p => gridManager.isVisible(p));
        const horizonActive = document.getElementById('horizon-toggle').checked;

        if (anyGridActive || horizonActive) {
            sync();
        }
    }, { pick: 'fast' });
}

async function initializeLights(api) {
    // Fetch all 3 lights in parallel for speed
    const lightPromises = [0, 1, 2].map(i => promisify(api.getLight, i));
    statesLight = await Promise.all(lightPromises);
    
    console.log("💡 Lights loaded:", statesLight);
    setupLightingUI();
}

async function initializeAnimations(api) {
    const animations = await promisify(api.getAnimations);
    
    if (!animations || animations.length === 0) {
        console.log("📦 Static model loaded.");
        isPlaying = false;
        // ... (update UI for static model)
        return;
    }

    console.log("🎬 Animated model detected.");
    isPlaying = true;

    if (updateTimer) clearInterval(updateTimer);
    updateTimer = setInterval(async () => {
        const time = await promisify(api.getCurrentTime);
        elTime.textContent = time.toFixed(2);
        elFrame.textContent = Math.floor(time * fps);
        elIntSec.textContent = Math.floor(time);
        elFrameSec.textContent = Math.floor((time % 1) * fps);
    }, 200);
}


function sync() {
	if (!apiInstance) return; // if the API isn't firing there is no syncing to be done

	apiInstance.getCameraLookAt((err, cam) => {
		if (err) return;
		apiInstance.getFov((err, fov) => {
			if (err) return;
			
			// Update the 3D overlay
			gridManager.render(cam.position, cam.target, fov);
			
			// Update horizon line logic with some whimsical trigonometry
			const dist = Math.sqrt(
				Math.pow((cam.target[0] - cam.position[0]), 2) +
				Math.pow((cam.target[1] - cam.position[1]), 2) +
				Math.pow((cam.target[2] - cam.position[2]), 2)
			);

			const h = document.getElementById('viewer-container').offsetHeight;
			const pitch = Math.asin((cam.target[2] - cam.position[2]) / dist);
			const yOffset = (Math.tan(pitch) / Math.tan((fov * Math.PI/180) / 2)) * (h/2);
			//console.log(pitch,fov,yOffset);
			
			const hl = document.getElementById('horizon-line');
			//hl.style.display = 'block';
			hl.style.transform = `translateY(${yOffset}px)`;
		});
	});
}


// 2. Grid & FOV Logic UI listners	
const xyBtn = document.getElementById('toggle-grid-xy');
const yzBtn = document.getElementById('toggle-grid-yz');
const xzBtn = document.getElementById('toggle-grid-xz');

const horizonToggle = document.getElementById('horizon-toggle');

const gridColor = document.getElementById('grid-theme-toggle');

xyBtn.onclick = () => { gridManager.toggle('xy'); sync(); gridManager.isVisible('xy') ? xyBtn.style.backgroundColor = "var(--accent-blue)" : xyBtn.style.backgroundColor = "var(--bg-button)";}; 
yzBtn.onclick = () => { gridManager.toggle('yz'); sync(); gridManager.isVisible('yz') ? yzBtn.style.backgroundColor = "var(--accent-blue)" : yzBtn.style.backgroundColor = "var(--bg-button)";};
xzBtn.onclick = () => { gridManager.toggle('xz'); sync(); gridManager.isVisible('xz') ? xzBtn.style.backgroundColor = "var(--accent-blue)" : xzBtn.style.backgroundColor = "var(--bg-button)";};

gridColor.addEventListener('change', (e) => {
	const wantLightGrid = e.target.checked; // the variable isDark is true if the checkbox is checked
	gridManager.updateGridTheme(wantLightGrid);
	document.body.classList.toggle('light-grid', wantLightGrid); // this is a add/remove function conditioned whether or not the second argument (wantLightGrid) is true/false
});	

horizonToggle.addEventListener('change', (e) => {
	document.getElementById('horizon-line').style.display = horizonToggle.checked? 'block' : 'none';
});

document.getElementById('fov-slider').addEventListener('input', (e) => {document.getElementById('fov-val').innerText = e.target.value});

document.getElementById('apply-fov').onclick = () => {
	const val = parseInt(document.getElementById('fov-slider').value);
	if (apiInstance) apiInstance.setFov(val);
};


// --- STARTUP LOGIC ---
// Launch the initial model immediately when the script runs
const defaultModelUid = '9688985db84d447580d40e40e1649407'; //no anim uid = 1c5c8929e7374407aeb3c5be3b25401d; anim uid = 0bd689488cc3413c9a6a354bf4495dde shadow uid = 6de5599d1b3d426bbc8c23479fee227e
loadModel(defaultModelUid);
