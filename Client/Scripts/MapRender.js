SelectTypes = 
{
	SELECT: "select",
	ADD: "add",
	REMOVE: "remove"
};

class MapScreen
{
	constructor()
	{
		// Map size variables
		this.xDimension = 20;
		this.yDimension = 20;
		this.count = this.xDimension * this.yDimension + 1;

		// Bind the rendering function to a single instance
		this.render = this.Render.bind(this);
		// User interaction variables
		this.activeSelectType = SelectTypes.SELECT;
	/*
	* Initialises the canvas, renderer, scene and camera, ready for display.
	*/
	InitialiseScene()
	{
		// Get canvas and pass it to the renderer
		this.canvas = document.querySelector("#c");
		this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});

		// Set up default values for the camera
		const fov = 35;
		const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
		const near = 0.1;
		const far = 10000;
		this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
		this.camera.position.y = 15;
		this.camera.position.x = 0;
		this.camera.position.z = 0;

		// Construct new Scene
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x330033);

		// Create directional light source
		const color = 0xFFFFFF;
		const intensity = 1;

		var light = new THREE.DirectionalLight(color, intensity);
		light.position.set(3, 2, 2);
		light.target.position.set(0, 0, 0);
		this.scene.add(light);
		this.scene.add(light.target);

		var light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-3, 2, -2);
		light.target.position.set(0, 0, 0);
		this.scene.add(light);
		this.scene.add(light.target);

		// Create orbital camera control with the mouse
		const controls = new THREE.OrbitControls(this.camera, this.canvas);
		controls.target.set(this.xDimension / 2, 0, this.yDimension / 2);
		controls.update();
	}

	/*
	* Generates a new flat map with defined dimensions, then adds it to the scene.
	*/
	CreateNewMap()
	{
		// Generate a new map
		this.mapMatrix = new Map(this.xDimension, this.yDimension);

		// Set up the geometry
		let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
		let geometry = new THREE.InstancedBufferGeometry();
		geometry.fromGeometry(boxGeometry);

		// Set up a colour buffer for the mesh
		let material = new THREE.MeshPhongMaterial();
		geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( this.mapMatrix.colourArray, 3 ) );
		material.vertexColors = THREE.VertexColors;

		// Set up the final instanced mesh and add to the scene
		let mesh = new THREE.InstancedMesh( geometry, material, this.count);
		mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
		this.scene.add(mesh);

		// Iterate through the height map and move instances to fill the generated map
		const dummy = new THREE.Object3D();
		let offset = 0;

		for (let i = 0; i < this.mapMatrix.heightMap.length; i++)
		{
			for (let j = 0; j < this.mapMatrix.heightMap[i].length; j++)
			{			
				offset++;
				dummy.position.set(i, this.mapMatrix.heightMap[i][j] / 2, j);
				dummy.updateMatrix();
				mesh.setMatrixAt( offset, dummy.matrix );
			}
		}

		mesh.instanceMatrix.needsUpdate = true;
	}
	/*
	* Modifies the camera projection matrix and the canvas rendering resolution
	* to account for modified canvas size.
	*/
	ResizeDisplay()
	{
		// Modify the camera aspect
		this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
		this.camera.updateProjectionMatrix();
		
		// Modify the internal rendering resolution
		this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
	}

	/*
	* Function to maintain a rendering loop.
	* @Param time The time value provided by requestAnimationFrame
	*/
	Render(time)
	{
		// Convert time to seconds and then half
		time *= 0.001;
		time *= 0.5;

		// Check if resizing is required
		if (this.canvas.width !== this.canvas.clientWidth || this.canvas.height !== this.canvas.clientHeight)
		{
			this.ResizeDisplay();
		}
		
		
		// Render the current frame and calculate the next frame
		this.renderer.render(this.scene, this.camera);	
		requestAnimationFrame(this.render);
	}

	/*
	* Initiates the render loop.
	*/
	BeginRendering()
	{
		// Begin rendering loop
		requestAnimationFrame(this.render);
	}
}

var screen = new MapScreen();
screen.InitialiseScene();
screen.CreateNewMap();
screen.BeginRendering();
InitialiseEventListeners();
/*
* Binds event listeners to DOM objects.
*/
function InitialiseEventListeners()
{
	document.getElementById("button_select").addEventListener("click", function()
	{
		screen.activeSelectType = SelectTypes.SELECT;
	});

	document.getElementById("button_add").addEventListener("click", function()
	{
		screen.activeSelectType = SelectTypes.ADD;
	});

	document.getElementById("button_delete").addEventListener("click", function()
	{
		screen.activeSelectType = SelectTypes.REMOVE;
	});
}