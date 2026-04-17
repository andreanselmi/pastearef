// Manager for controlling all the non threejs perspective 3d grids: rectangular grids, composition guides, letterbox


document.addEventListener("DOMContentLoaded", () => {

    const inputField = document.getElementById('rect-grid-value');
    const btnMinus = document.getElementById('rect-grid-minus');
    const btnPlus = document.getElementById('rect-grid-plus');
	
	const overlay = document.getElementById('grid-overlay');
	const composition = document.getElementById('composition-overlay');
	const letterboxOverlay = document.getElementById('letterbox-overlay');
	
	// RECTANGULAR GRIDS CONTROLS -------------------------------------------------------

    let internalValue = 0;

    function updateUI(value) {
        internalValue = Math.max(0, parseInt(value) || 0);
        inputField.value = (internalValue === 0) ? "Off" : internalValue;
        
        // Trigger your grid redraw logic here
		updateGrids(internalValue);
        // console.log("Updating grid to:", internalValue);
    }

    // Stepper Button Logic
    btnMinus.addEventListener('click', () => updateUI(internalValue - 1));
    btnPlus.addEventListener('click', () => updateUI(internalValue + 1));

    // Keyboard Input Logic
    inputField.addEventListener('focus', () => {
        // When clicking in, show the number 0 instead of "Off" for easier editing
        if (internalValue === 0) inputField.value = 0;
        inputField.select();
    });

    inputField.addEventListener('blur', () => {
        // When clicking away, re-validate and format
        updateUI(inputField.value);
    });

    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            inputField.blur(); // Triggers the update via the blur event
        }
    });

    // Prevent non-numeric characters (except backspace, etc)
    inputField.addEventListener('input', (e) => {
        // Clean input to allow only digits
        let cleanValue = e.target.value.replace(/[^0-9]/g, '');
        e.target.value = cleanValue;
    });

    // Initialize
    updateUI(internalValue);
	
  //------------------------------------------------------------------------------------------
    // ---DROPDOWNS CONTROLS (for hooking into your logic) ---
    const compositionGuides = document.getElementById('composition-guides');
	
    compositionGuides.addEventListener('change', () => {
        // console.log("Composition guide set to:", e.target.value);
		composition.className = compositionGuides.value + '-active';
    });

	const letterboxSelect = document.getElementById('letterbox-select');
		
	letterboxSelect.addEventListener('change', (e) => {
		const val = e.target.value; 
		
		// 1. Reset everything
		letterboxOverlay.classList.remove('is-active', 'is-animation-grid');
		letterboxOverlay.style.aspectRatio = "";

		if (val === 'off') {
			return; // Stops here if off
		} 

		letterboxOverlay.classList.add('is-active');

		if (val === '16/9-animation') {
			// 2. Trigger the SVG Clone CSS
			letterboxOverlay.classList.add('is-animation-grid');
		} else {
			// 3. Handle standard aspect ratios (e.g., "16/9", "4/3")
			const cleanRatio = val.split('-')[0]; 
			letterboxOverlay.style.aspectRatio = cleanRatio;
		}
	});
	
	//---------------------------------------------------------------------------------------
	function  updateGrids (value) {
		if (value>0){
			overlay.style.setProperty('--grid-cols', value);
			overlay.style.setProperty('--grid-rows', value);
			
			overlay.style.display = "block";
			overlay.classList.add('show-rect-grid');
		} else {
			overlay.classList.add('show-rect-grid');
			overlay.classList.remove('show-rect-grid');
			overlay.style.display = "hidden";		
		}			
	};
	
	// updating composition
	
});