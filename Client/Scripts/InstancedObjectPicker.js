class InstancedObjectPicker
{
	constructor(scene)
	{
		this.raycaster = new THREE.Raycaster();
        this.scene = scene;

		this.pickedClickObject = null;
		this.pickedClickInstance = null;

		this.pickedHoverObject = null;
		this.pickedHoverInstance = null;
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
		}
	}

	/*
	* Selects an object when the mouse is clicked.
	* @Param mousePosition The current position of the mouse cursor in the canvas world space.
	* @Param camera The current active camera in the scene.
	* @Param clicked Boolean to determine if the mouse was clicked.
	* @Param activeSelectType The current type of tool being used.
	*/
	PickClickedObject(mousePosition, camera, clicked, activeSelectType)
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
					this.AddCharacter();
				}
			}
		}
	}

	/*
	* Selects an object when the mouse hovers over an object.
	* @Param mousePosition The current position of the mouse cursor in the canvas world space.
	* @Param camera The current active camera in the scene.
	*/
	PickHoveredObject(mousePosition, camera)
	{
		// cast a ray through the frustum
		this.raycaster.setFromCamera(mousePosition, camera);

		// get the list of objects the ray intersected
		const intersectedObjects = this.raycaster.intersectObjects(this.scene.children);

		// If objects have been intersected
		if (intersectedObjects.length) 
		{
			let detail = { instance: this.pickedClickInstance };
			let event = new CustomEvent("CursorHover", { detail: detail });
			document.dispatchEvent(event);
		}
	}

	/*
	* Triggers addition or selection of a character to / on the map
	*/
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