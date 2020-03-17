SelectTypes = 
{
	SELECT: "select",
	ADD: "add",
	REMOVE: "remove",
	CHARACTER: "character"
};

class MapScreen
{
	constructor()
	{
		// Map size variables
		this.xDimension = 125;
		this.yDimension = 125;
		this.count = this.xDimension * this.yDimension + 1;

		// Raycasting variables
		this.pickPosition = {x: 0, y: 0};
		this.mouseClicked = false;
		this.pickHelper;

		// Bind the rendering function to a single instance
		this.render = this.Render.bind(this);

		// User interaction variables
		this.brushSize = 1;
		this.brushValue = 2;
		this.activeSelectType = SelectTypes.SELECT;
		this.html = new HTMLGenerator(this);
	}

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

		document.addEventListener("DrawBlock", this.DrawBlock.bind(this));
		document.addEventListener("SelectBlock", this.SelectBlock.bind(this));
		document.addEventListener("AddCharacter", this.AddCharacter.bind(this));
	}

	/*
	* Load a map from the database based on the URL parameters
	*/
	LoadMap()
	{
		// Retrieve the last part of the URL, the ID
		let urlParameter = document.location.href.split('/');
		let id = urlParameter[urlParameter.length - 1];

		// Construct a new map and load from a file
		this.mapMatrix = new Map();
		this.mapMatrix.LoadMap(id).then(function() 
		{
			// Set up the geometry
			let boxGeometry = new THREE.BoxGeometry(1, 1, 1);
			let instancedGeometry = new THREE.InstancedBufferGeometry();
			instancedGeometry.fromGeometry(boxGeometry);

			var hoverBoxGeometry = new THREE.CylinderGeometry( 0.75, 0, 2, 8 );
			let hoverMaterial = new THREE.MeshPhongMaterial();
			hoverMaterial.color = new THREE.Color("red");
			hoverMaterial.opacity = 0.75;
			hoverMaterial.transparent = true;

			// Set up a colour buffer for the mesh
			let material = new THREE.MeshPhongMaterial();
			instancedGeometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( this.mapMatrix.colourArray, 3 ) );

			material.vertexColors = THREE.VertexColors;

			// Set up the final instanced mesh and add to the scene
			this.mesh = new THREE.InstancedMesh( instancedGeometry, material, this.count);
			this.mesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame
			this.scene.add(this.mesh);

			// Iterate through the height map and move instances to fill the generated map
			let matrix = new THREE.Matrix4();
			let offset = 0;
			const dummy = new THREE.Object3D();

			for (let i = 0; i < this.mapMatrix.heightMap.length; i++)
			{
				for (let j = 0; j < this.mapMatrix.heightMap[i].length; j++)
				{			
					offset++;
					this.mesh.getMatrixAt(offset, matrix);
					let value = this.mapMatrix.heightMap[i][j];

					if (this.mapMatrix.GetCharacter(i, j) != null)
					{
						let characterMesh = new THREE.Mesh( hoverBoxGeometry, hoverMaterial);
						characterMesh.position.x = i;
						characterMesh.position.z = j;
						characterMesh.position.y = value + 1.25;
						this.scene.add(characterMesh);
					}

					dummy.position.set(i, value / 2, j);
					dummy.updateMatrix();
					dummy.matrix.elements[5] = value;
					dummy.matrix.elements[13] = value / 2;
					this.mesh.setMatrixAt( offset, dummy.matrix );
				}
			}

			// Flag the matrix for updating
			this.mesh.instanceMatrix.needsUpdate = true;

			// Create a new helper class to assist in raycasting and object picking, then begin the render cycle
			this.pickHelper = new InstancedObjectPicker(this.mapMatrix, this.scene, this.camera, this.html);
			this.BeginRendering();

		}.bind(this));
	}

	/*
	* Save the current map to the database
	*/
	SaveMap()
	{
		this.mapMatrix.SaveMap().then(function()
		{
			console.log("Map Saved");
		});
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
	* Modifies the height of a block incrementally or decrementally in the heightmap and then modifies the associated instance matrix to re-render it.
	*/
	DrawBlock(e)
	{
		// Store event variables for shortened code
		let object = this.mesh;
		let instance = e.detail.instance;

		// Internal function to increment the height of selected blocks
		let modifyHeight = function()
		{
			let value;

			// Increment or decrement based on selection type
			if (this.activeSelectType == SelectTypes.ADD)
			{
				// Increase the height value of the corresponding element in the map matrix
				value = this.mapMatrix.AddToHeight(matrix.elements[12], matrix.elements[14], this.brushValue);
			}
			else if (this.activeSelectType == SelectTypes.REMOVE)
			{
				// Decrease the height value of the corresponding element in the map matrix
				value = this.mapMatrix.AddToHeight(matrix.elements[12], matrix.elements[14], -this.brushValue);
			}

			// Set corresponding values in the transformation matrix for the instance
			matrix.elements[5] = value;
			matrix.elements[13] = value / 2;

			// Set the transformation matrix to the instance and flag it for updates
			object.setMatrixAt(instanceValue, matrix);
			object.instanceMatrix.needsUpdate = true;

		}.bind(this);

		// Retrieve the transformation matrix for the clicked instance
		let originalMatrix = new THREE.Matrix4();
		object.getMatrixAt(instance, originalMatrix);

		// Iterate through the selected area, the size of the "brush"
		for (let i = -Math.floor(this.brushSize / 2); i <= Math.floor(this.brushSize / 2); i++)
		{
			for (let j = -Math.floor(this.brushSize / 2); j <= Math.floor(this.brushSize / 2); j++)
			{
				// Calculate the instance ID based on an offset
				var instanceValue = (instance + (i + (j * this.mapMatrix.mapXDimension)));

				// Retrieve the transformation matrix for the clicked instance
				var matrix = new THREE.Matrix4();
				object.getMatrixAt(instanceValue, matrix);

				// Ensure that the matrix is retrieved correctly
				if (matrix.elements != null)
				{
					// If iterating to the left of the center block, X value should be less
					if (i < 0) {
						if (matrix.elements[14] < originalMatrix.elements[14]) {
							modifyHeight();
						}
					}

					// If iterating to the right of the center block, X value should be more
					else if (i > 0) {
						if (matrix.elements[14] > originalMatrix.elements[14]) {
							modifyHeight();
						}
					}

					// if in the center
					else { modifyHeight(); }
				}
			}
		}
	}

	/*
	* Selects a block on the grid, adding a HTML element to the area.
	*/
	SelectBlock(e)
	{
		// Store event variables for shortened code
		let object = this.mesh;
		let instance = e.detail.instance;

		// Only select a block if an instance exists
		if (instance)
		{
			// Retrieve the transformation matrix for the clicked instance
			let matrix = new THREE.Matrix4();
			object.getMatrixAt(instance, matrix);

			// Retrieve the world position projected from the camera
			let dummy = new THREE.Object3D();
			let tempVector = new THREE.Vector3();
			dummy.position.set(matrix.elements[12], matrix.elements[13], matrix.elements[14]);
			dummy.updateMatrix();
			dummy.getWorldPosition(tempVector);
			tempVector.project(this.camera);

			// Get screen space for placing HTML elements
			let x = (tempVector.x *  .5 + .5) * this.canvas.clientWidth;
			let y = (tempVector.y * -.5 + .5) * this.canvas.clientHeight;

			// Add a label
			this.html.AddLabel(x, y, object, instance);
		}
	}

	/*
	* Adds or selects a character to / on the map
	*/
	AddCharacter(e)
	{
		// Store event variables for shortened code
		let object = e.detail.object;
		let instance = e.detail.instance;

		// If the selected object is an instance of the grid blocks
		if (!instance)
		{
			// Retrieve the transformation matrix for the clicked instance
			let matrix = new THREE.Matrix4();
			matrix = object.position;

			// Retrieve the world position projected from the camera
			let dummy = new THREE.Object3D();
			let tempVector = new THREE.Vector3();
			dummy.position.set(matrix.x, matrix.y, matrix.z);
			dummy.updateMatrix();
			dummy.getWorldPosition(tempVector);
			tempVector.project(this.camera);

			// Get screen space for placing HTML elements
			let x = (tempVector.x *  .5 + .5) * this.canvas.clientWidth;
			let y = (tempVector.y * -.5 + .5) * this.canvas.clientHeight;

			// Add a label
			this.html.AddCharacterLabel(x, y, matrix);
		}

		// If the selected object is a character
		else
		{
			// Retrieve position
			let matrix = new THREE.Matrix4();
			object.getMatrixAt(instance, matrix);

			// Produce a JSON transformation matrix for the clicked object
			let locationMatrix = 
			{
				x: matrix.elements[12],
				y: matrix.elements[13],
				z: matrix.elements[14]
			}

			// If a character is not present, create a new one
			if (this.mapMatrix.GetCharacter(locationMatrix.x, locationMatrix.z) == null)
			{
				// Set a material for the hovering box
				let hoverMaterial = new THREE.MeshPhongMaterial();
				hoverMaterial.color = new THREE.Color("red");;
				hoverMaterial.opacity = 0.7;
				hoverMaterial.transparent = true;

				// Retrieve the height value from the map matrix
				let value = this.mapMatrix.heightMap[locationMatrix.x][locationMatrix.z];

				// Set character in the map
				this.mapMatrix.AddCharacter(locationMatrix.x, locationMatrix.z);

				// Set the dimensions of the cube
				let hoverBoxGeometry = new THREE.CylinderGeometry( 0.75, 0, 2, 8 );

				// Create the mesh, set the position and add to the this.scene
				let characterMesh = new THREE.Mesh( hoverBoxGeometry, hoverMaterial);
				characterMesh.position.set(locationMatrix.x, value + 1.25, locationMatrix.z);

				// Add to the scene
				this.scene.add(characterMesh);
			}

			// Retrieve the world position projected from the camera
			let dummy = new THREE.Object3D();
			let tempVector = new THREE.Vector3();
			dummy.position.set(locationMatrix.x, locationMatrix.y, locationMatrix.z);
			dummy.updateMatrix();
			dummy.getWorldPosition(tempVector);
			tempVector.project(this.camera);

			// Get screen space for placing HTML elements
			let x = (tempVector.x *  .5 + .5) * this.canvas.clientWidth;
			let y = (tempVector.y * -.5 + .5) * this.canvas.clientHeight;

			// Add a label
			this.html.AddCharacterLabel(x, y, locationMatrix);
		}
	}

	/*
	* Increases the height of a block in the height map, then re-renders the corresponding instance.
	* @Param value The value to set to the height map
	* @Param object The object to set the resultant matrix to
	* @Param instance The instance to transform.
	*/
	IncreaseHeightOfBlock(value, object, instance)
	{
		// Retrieve the transformation matrix for the clicked instance
		var matrix = new THREE.Matrix4();
		object.getMatrixAt(instance, matrix);

		// Increase the height value of the corresponding element in the map matrix
		var returnedValue = this.mapMatrix.SetHeight(matrix.elements[12], matrix.elements[14], value);

		// Set corresponding values in the transformation matrix for the instance
		matrix.elements[5] = returnedValue;
		matrix.elements[13] = returnedValue / 2;

		// Set the transformation matrix to the instance and flag it for updates
		object.setMatrixAt(instance, matrix);
		object.instanceMatrix.needsUpdate = true;	
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
		
		this.html.MoveLabel();
		this.pickHelper.ClearObjects(this.scene);
		this.pickHelper.PickClickedObject(this.pickPosition, this.camera, this.mouseClicked, this.brushSize, this.activeSelectType);
		this.pickHelper.PickHoveredObject(this.pickPosition, this.camera, this.brushSize);
		this.mouseClicked = false;

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
screen.LoadMap();
InitialiseEventListeners();

// External event handlers and listeners

/*
* Gets the mouse position relative to the canvas.
* @Param event Event object with position values.
*/
function GetCanvasRelativePosition(event)
{
	const rect = screen.canvas.getBoundingClientRect();
	
	const xValue = event.clientX - rect.left;
	const yValue = event.clientY - rect.top;
	
	json = { x: xValue, y: yValue };
	return (json);
}

/*
* Sets the pick position for the InstancedObjectPicker to use.
* @Param event Event object to retrieve mouse position relative to the canvas.
*/
function SetPickPosition(event) 
{
	const pos = GetCanvasRelativePosition(event);
	screen.pickPosition.x = (pos.x / screen.canvas.clientWidth ) *  2 - 1;
	screen.pickPosition.y = (pos.y / screen.canvas.clientHeight) * -2 + 1;  // note we flip Y
}

/*
* Sets a variable to define if the mouse was clicked.
* @Param event Event object that contains the clicked button.
*/
function SetClick(event)
{
	if (event.button == 0)
	{
		screen.mouseClicked = true;
	}
}

/*
* Binds event listeners to DOM objects.
*/
function InitialiseEventListeners()
{
	screen.canvas.addEventListener('mousemove', SetPickPosition);
	screen.canvas.addEventListener( 'mousedown', SetClick, false );

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

	document.getElementById("button_character").addEventListener("click", function()
	{
		screen.activeSelectType = SelectTypes.CHARACTER;
	});

	document.getElementById("button_save").addEventListener("click", function()
	{
		screen.SaveMap();
	});
}