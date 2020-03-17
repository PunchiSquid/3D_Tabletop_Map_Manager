class InstancedObjectPicker
{
	constructor(map, scene, canvas, html)
	{
        this.raycaster = new THREE.Raycaster();
        this.map = map;
        this.scene = scene;
        this.canvas = canvas;
        this.html = html;

		this.pickedClickObject = null;
		this.pickedClickInstance = null;

		this.pickedHoverObject = null;
		this.pickedHoverInstance = null;
		this.hoverMesh = null;
	}

	/*
	* Clear the selected objects from the last frame.
	*/
	ClearObjects()
	{
		if (this.pickedClickInstance)
		{
			this.pickedClickObject = null;
			this.pickedClickInstance = null;
		}

		if (this.pickedHoverInstance)
		{
			this.pickedHoverObject = null;
			this.pickedHoverInstance = null;
			
			if (this.hoverMesh)
			{
				this.scene.remove(this.hoverMesh);
				this.hoverMesh = null;	
			}
		}
	}

	/*
	* Selects an object when the mouse is clicked.
	* @Param mousePosition The current position of the mouse cursor in the canvas world space.
	* @Param camera The current active camera in the scene.
	* @Param clicked Boolean to determine if the mouse was clicked.
	* @Param brushSize The current size of the brush for adding / removing blocks from the map grid.
	* @Param activeSelectType The current type of tool being used.
	*/
	PickClickedObject(mousePosition, camera, clicked, brushSize, activeSelectType)
	{
		// cast a ray through the frustum
		this.raycaster.setFromCamera(mousePosition, camera);

		// get the list of objects the ray intersected
		const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);

		if (intersectedObjects.length) 
		{
			// pick the first contacted object.
			this.pickedClickObject = intersectedObjects[0].object;
			this.pickedClickInstance = intersectedObjects[0].instanceId;

			if (clicked)
			{
				if (activeSelectType == SelectTypes.ADD)
				{
					this.AddValueToBlock();
				}
				else if (activeSelectType == SelectTypes.REMOVE)
                {
                    this.AddValueToBlock();
				}
				else if (activeSelectType == SelectTypes.SELECT)
				{
					this.SelectBlock();
                }
				else if (activeSelectType == SelectTypes.CHARACTER)
				{
					this.AddCharacter(camera);
				}
			}
		}
	}

	AddCharacter()
	{
		let detail = 
		{ 
			instance: this.pickedClickInstance,
			object: this.pickedClickObject
		};
		let event = new CustomEvent("AddCharacter", { detail: detail });
		document.dispatchEvent(event);
	}

	/*
	* Selects an object when the mouse hovers over an object.
	* @Param mousePosition The current position of the mouse cursor in the canvas world space.
	* @Param camera The current active camera in the scene.
	* @Param brushSize The current size of the brush for adding / removing blocks from the map grid.
	*/
	PickHoveredObject(mousePosition, camera, brushSize)
	{
		// cast a ray through the frustum
		this.raycaster.setFromCamera(mousePosition, camera);

		// get the list of objects the ray intersected
		const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);

		if (intersectedObjects.length) 
		{
			// pick the first contacted object.
			this.pickedHoverObject = intersectedObjects[0].object;
			this.pickedHoverInstance = intersectedObjects[0].instanceId;

			if (this.pickedHoverInstance)
			{
				// Set a material for the hovering box
				var hoverMaterial = new THREE.MeshPhongMaterial();
				hoverMaterial.color = new THREE.Color("red");
				hoverMaterial.opacity = 0.5;
				hoverMaterial.transparent = true;

				// Retrieve the instance transformation matrix
				var matrix = new THREE.Matrix4();
				this.pickedHoverObject.getMatrixAt(this.pickedHoverInstance, matrix);

				// Retrieve the height value from the map matrix
				var value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

				// Set the dimensions of the cube
				var hoverBoxGeometry = new THREE.BoxGeometry(brushSize + 0.25, value + 0.25, brushSize + 0.25);

				// Create the mesh, set the position and add to the this.scene
				this.hoverMesh = new THREE.Mesh( hoverBoxGeometry, hoverMaterial);
				this.hoverMesh.position.set(matrix.elements[12], matrix.elements[13], matrix.elements[14]);

				this.scene.add(this.hoverMesh);
			}
		}
	}

	/*
	* Triggers addition of a value to a block on the map grid.
	*/
	AddValueToBlock()
	{
		let detail = { instance: this.pickedClickInstance };
		let event = new CustomEvent("DrawBlock", { detail: detail });
		document.dispatchEvent(event);
    }

	/*
	* Triggers selection of a block on the grid, adding a HTML element to the area.
	*/
	SelectBlock()
	{
		let detail = { instance: this.pickedClickInstance };
		let event = new CustomEvent("SelectBlock", { detail: detail });
		document.dispatchEvent(event);
	}
}