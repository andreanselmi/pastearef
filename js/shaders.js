const VERTEX_SHADER = `
        varying vec2 vUv; // Three.js provides this automatically if you ask
		
        void main() {
			vUv = uv; // 'uv' is a built-in attribute in Three.js
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
    `;



const FRAGMENT_SHADER = `
	uniform float uSize; // This is a user provided input that defines the grid spacing in the gridManager._createMaterial
	uniform vec3 uColor; // This instead provide the required color
    float uFadeDist = 0.5;
    varying vec2 vUv; // Three.js provides this automatically if you ask
	
	void main() {
		// We use vUv (0.0 to 1.0) multiplied by a scale factor

		float scaleFact = 200.0 / uSize; // this sets the size of the grid spacing scaled between the relative plane uv coordinates from 0 to 1 and the world coordinates
			
		vec2 mainFrac = abs(fract(vUv * scaleFact - 0.5) - 0.5) / fwidth(vUv * scaleFact); //always >=0 sawtooth along the x or y grid
		float line = min(mainFrac.x,mainFrac.y);		
		float mainColor = 1.0 - min(line, 1.0); // when assigned to the alpha color channel makes the plane transparent except when we are along a grid line either in X or Y

		// Plane colour fade-out logic
        float dist = length((vUv-0.5).xy);
		float alphaFade = 1.0 - smoothstep(0.0, uFadeDist, dist); // fading-out everything more than uFadeDist away from the center of the plane

		gl_FragColor = vec4(uColor, mainColor*alphaFade); //let's convolute the grid-intrinsic transparent-except-when-on-a-grid with the fading
	}
`;


const FRAGMENT_SHADER_with_encoded_shadow = `
	uniform float uSize; // This is a user provided input that defines the grid spacing in the gridManager._createMaterial
	uniform vec3 uColor; // This instead provide the required color
    float uFadeDist = 0.5;
    varying vec2 vUv; // Three.js provides this automatically if you ask
	
	void main() {
		// We use vUv (0.0 to 1.0) multiplied by a scale factor

		float scaleFact = 200.0 / uSize; // this sets the size of the grid spacing scaled between the relative plane uv coordinates from 0 to 1 and the world coordinates
			
		vec2 mainFrac = abs(fract(vUv * scaleFact - 0.5) - 0.5) / fwidth(vUv * scaleFact); //always >=0 sawtooth along the x or y grid
		float line = min(mainFrac.x,mainFrac.y);		
		float mainColor = 1.0 - min(line, 1.0); // when assigned to the alpha color channel makes the plane transparent except when we are along a grid line either in X or Y
		

		// Shadow implementation for contrast against dark backgrounds
		
		vec2 shadowvUv = vUv + (dFdx(vUv) * 2.0) + (dFdy(vUv) * 2.0); //PIXEL OFFSET OF THE SHADOW 2PX 2PX WARNING: No shadow are cast for 45° going lines because... math ¯\_(ツ)_/¯
		
		vec2 shadowFrac = abs(fract(shadowvUv * scaleFact - 0.5) - 0.5) / fwidth(shadowvUv * scaleFact);
		float shadowLine = min(shadowFrac.x,shadowFrac.y);		
		float shadowColor = 1.0 - min(shadowLine, 1.0);
		
		// Inverted color for the shadow
		vec3 color = uColor;
		if (mainColor<0.1 && shadowColor>0.1){
			color = 1.0 - uColor; //inverted color only where there are shadow lines and not the main ones
			}
        // =============
		
		// Plane colour fade-out logic
        float dist = length((vUv-0.5).xy);
		float alphaFade = 1.0 - smoothstep(0.0, uFadeDist, dist); // fading-out everything more than uFadeDist away from the center of the plane

		float finalAlpha = alphaFade * max(mainColor, shadowColor);
		gl_FragColor = vec4(color, finalAlpha*0.6); //let's convolute the grid-intrinsic transparent-except-when-on-a-grid with the fading
	}
`;
