/**
 * GridManager: Handles the Three.js overlay for Sketchfab
 */
class GridManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.offsetWidth / this.container.offsetHeight, 0.1, 10000);
        this.camera.up.set(0, 0, 1);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.container.appendChild(this.renderer.domElement);

        this.grids = {}; // Store grids in an object for easy access
    }

    // A helper to create shader materials concisely
    _createMaterial(color, dist) {
        return new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            uniforms: {
                uSize: { value: 1.0 *dist *0.02},
                uColor: { value: new THREE.Color(color) }
            },
			extensions:{
				derivatives:true
			},
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER
        });
    }

    initGrids(dist) {
        const geo = new THREE.PlaneGeometry(100*dist, 100*dist);

        // Define our grid configurations
        const configs = [
            { id: 'xy', color: 0x444444, pos: [0, 0, 0.01], rot: [0, 0, 0] },
            { id: 'yz', color: 0x444444, pos: [0, 0, 0], rot: [0, Math.PI / 2, 0] },
			{ id: 'xz', color: 0x444444, pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0] }
        ];

        configs.forEach(cfg => {
            const mesh = new THREE.Mesh(geo, this._createMaterial(cfg.color, dist));
            mesh.position.set(...cfg.pos);
            mesh.rotation.set(...cfg.rot);
            mesh.visible = false;
            this.scene.add(mesh);
            this.grids[cfg.id] = mesh;
        });
    }

    toggle(id) {
        if (this.grids[id]) {
            this.grids[id].visible = !this.grids[id].visible;
            return this.grids[id].visible;
        }
    }

    render(camPos, camTarget, fov) {
        this.camera.position.set(...camPos);
        this.camera.lookAt(new THREE.Vector3(...camTarget));
        this.camera.fov = fov;
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    }
	
	isVisible(id) {
		return this.grids[id].visible;
	}
	
	// change the color of the grid to a dark one or light one
	updateGridTheme(wantLightGrid) {
		const newColorValue = wantLightGrid ? 0xdadada : 0x444444; // white : dark grey
		const newColor = new THREE.Color(newColorValue);
		console.log('changing color');

		// Loop through the 'xy', 'xz', 'yz' grids we stored earlier
		Object.values(this.grids).forEach(mesh => {
			// Access the material's uniforms
			mesh.material.uniforms.uColor.value.copy(newColor);
		});
		
		this.renderer.render(this.scene, this.camera);
	}
}
