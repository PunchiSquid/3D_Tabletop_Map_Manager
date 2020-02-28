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

			if (this.pickedClickInstance && clicked)
			{
				if (activeSelectType == SelectTypes.ADD)
				{
					this.AddBlockToGrid(brushSize);
				}
				else if (activeSelectType == SelectTypes.SELECT)
				{
					this.SelectBlockOnGrid(camera);
                }
                else if (activeSelectType == SelectTypes.REMOVE)
                {
                    this.RemoveBlockFromGrid(brushSize);
                }
			}
		}
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
				hoverMaterial.color = new THREE.Color("red");;
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
	* Adds a block to the map grid.
	* @Param brushSize The current size of the brush for adding / removing blocks from the map grid.
	*/
	AddBlockToGrid(brushSize)
	{
		// Create a new colour
		var newColour = new THREE.Color("green");

		// Retrieve the transformation matrix for the clicked instance
		var originalMatrix = new THREE.Matrix4();
		this.pickedClickObject.getMatrixAt(this.pickedClickInstance, originalMatrix);

		for (let i = -Math.floor(brushSize / 2); i <= Math.floor(brushSize / 2); i++)
		{
			for (let j = -Math.floor(brushSize / 2); j <= Math.floor(brushSize / 2); j++)
			{
				// Retrieve the transformation matrix for the clicked instance
				var matrix = new THREE.Matrix4();
				this.pickedClickObject.getMatrixAt(this.pickedClickInstance + (i + (j * this.map.mapXDimension)), matrix);

				if (matrix.elements[14] != null)
				{
					if (i < 0)
					{
						if (matrix.elements[14] < originalMatrix.elements[14])
						{
							// Set the new colour to the corresponding block
							newColour.toArray( this.map.colourArray, (this.pickedClickInstance + (i + (j * this.map.mapXDimension))) * 3 );

							// Increase the height value of the corresponding element in the map matrix
							var value = this.map.AddBlock(matrix.elements[12], matrix.elements[14]);

							// Set corresponding values in the transformation matrix for the instance
							matrix.elements[5] = value;
							matrix.elements[13] = value / 2;

							// Set the transformation matrix to the instance and flag it for updates
							this.pickedClickObject.setMatrixAt(this.pickedClickInstance + (i + (j * this.map.mapXDimension)), matrix);
							this.pickedClickObject.instanceMatrix.needsUpdate = true;	
						}
					}
					else if (i > 0)
					{
						if (matrix.elements[14] > originalMatrix.elements[14])
						{
							// Set the new colour to the corresponding block
							newColour.toArray( this.map.colourArray, (this.pickedClickInstance + (i + (j * this.map.mapXDimension))) * 3 );

							// Increase the height value of the corresponding element in the map matrix
							this.map.heightMap[matrix.elements[12]][matrix.elements[14]] += 1;
							var value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

							// Set corresponding values in the transformation matrix for the instance
							matrix.elements[5] = value;
							matrix.elements[13] = value / 2;

							// Set the transformation matrix to the instance and flag it for updates
							this.pickedClickObject.setMatrixAt(this.pickedClickInstance + (i + (j * this.map.mapXDimension)), matrix);
							this.pickedClickObject.instanceMatrix.needsUpdate = true;	
						}
					}
					else
					{
						// Set the new colour to the corresponding block
						newColour.toArray( this.map.colourArray, (this.pickedClickInstance + (i + (j * this.map.mapXDimension))) * 3 );

						// Increase the height value of the corresponding element in the map matrix
						this.map.heightMap[matrix.elements[12]][matrix.elements[14]] += 1;
						var value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

						// Set corresponding values in the transformation matrix for the instance
						matrix.elements[5] = value;
						matrix.elements[13] = value / 2;

						// Set the transformation matrix to the instance and flag it for updates
						this.pickedClickObject.setMatrixAt(this.pickedClickInstance + (i + (j * this.map.mapXDimension)), matrix);
						this.pickedClickObject.instanceMatrix.needsUpdate = true;	
					}
				}
			}
		}
		// Buffer the colour array for the material shader
		this.pickedClickObject.geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( this.map.colourArray, 3 ) );
    }
	
	/*
	* Removes a block from the map grid.
	* @Param brushSize The current size of the brush for adding / removing blocks from the map grid.
	*/
    RemoveBlockFromGrid(brushSize)
	{
		// Create a new colour
		var newColour = new THREE.Color("green");

		// Retrieve the transformation matrix for the clicked instance
		var originalMatrix = new THREE.Matrix4();
		this.pickedClickObject.getMatrixAt(this.pickedClickInstance, originalMatrix);

		for (let i = -Math.floor(brushSize / 2); i <= Math.floor(brushSize / 2); i++)
		{
			for (let j = -Math.floor(brushSize / 2); j <= Math.floor(brushSize / 2); j++)
			{
				// Retrieve the transformation matrix for the clicked instance
				var matrix = new THREE.Matrix4();
				this.pickedClickObject.getMatrixAt(this.pickedClickInstance + (i + (j * this.map.mapXDimension)), matrix);

				if (matrix.elements[14] != null)
				{
					if (i < 0)
					{
						if (matrix.elements[14] < originalMatrix.elements[14])
						{
							// Set the new colour to the corresponding block
							newColour.toArray( this.map.colourArray, (this.pickedClickInstance + (i + (j * this.map.mapXDimension))) * 3 );

                            var value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

							if (value > 1)
                            {
                                // Increase the height value of the corresponding element in the map matrix
                                this.map.heightMap[matrix.elements[12]][matrix.elements[14]] -= 1;
                                value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

                                // Set corresponding values in the transformation matrix for the instance
                                matrix.elements[5] = value;
                                matrix.elements[13] = value / 2;
                            }

							// Set the transformation matrix to the instance and flag it for updates
							this.pickedClickObject.setMatrixAt(this.pickedClickInstance + (i + (j * this.map.mapXDimension)), matrix);
							this.pickedClickObject.instanceMatrix.needsUpdate = true;	
						}
					}
					else if (i > 0)
					{
						if (matrix.elements[14] > originalMatrix.elements[14])
						{
							// Set the new colour to the corresponding block
							newColour.toArray( this.map.colourArray, (this.pickedClickInstance + (i + (j * this.map.mapXDimension))) * 3 );

                            var value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

							if (value > 1)
                            {
                                // Increase the height value of the corresponding element in the map matrix
                                this.map.heightMap[matrix.elements[12]][matrix.elements[14]] -= 1;
                                value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

                                // Set corresponding values in the transformation matrix for the instance
                                matrix.elements[5] = value;
                                matrix.elements[13] = value / 2;
                            }

							// Set the transformation matrix to the instance and flag it for updates
							this.pickedClickObject.setMatrixAt(this.pickedClickInstance + (i + (j * this.map.mapXDimension)), matrix);
							this.pickedClickObject.instanceMatrix.needsUpdate = true;	
						}
					}
					else
					{
						// Set the new colour to the corresponding block
						newColour.toArray( this.map.colourArray, (this.pickedClickInstance + (i + (j * this.map.mapXDimension))) * 3 );

                        var value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

                        if (value > 1)
                        {
                            // Increase the height value of the corresponding element in the map matrix
                            this.map.heightMap[matrix.elements[12]][matrix.elements[14]] -= 1;
                            value = this.map.heightMap[matrix.elements[12]][matrix.elements[14]];

                            // Set corresponding values in the transformation matrix for the instance
                            matrix.elements[5] = value;
                            matrix.elements[13] = value / 2;
                        }

						// Set the transformation matrix to the instance and flag it for updates
						this.pickedClickObject.setMatrixAt(this.pickedClickInstance + (i + (j * this.map.mapXDimension)), matrix);
						this.pickedClickObject.instanceMatrix.needsUpdate = true;	
					}
				}
			}
		}
		// Buffer the colour array for the material shader
		this.pickedClickObject.geometry.setAttribute( 'color', new THREE.InstancedBufferAttribute( this.map.colourArray, 3 ) );
	}

	/*
	* Selects a block on the grid, adding a HTML element to the area.
	* @Param camera The current active camera in the scene.
	*/
	SelectBlockOnGrid(camera)
	{
		// Retrieve the transformation matrix for the clicked instance
		var originalMatrix = new THREE.Matrix4();
		this.pickedClickObject.getMatrixAt(this.pickedClickInstance, originalMatrix);

		var dummy = new THREE.Object3D();
		var tempVector = new THREE.Vector3();
		dummy.position.set(originalMatrix.elements[12], originalMatrix.elements[13], originalMatrix.elements[14]);
		dummy.updateMatrix();
		dummy.getWorldPosition(tempVector);
		tempVector.project(camera);

		let x = (tempVector.x *  .5 + .5) * this.canvas.clientWidth;
		let y = (tempVector.y * -.5 + .5) * this.canvas.clientHeight;

		this.html.AddLabel(x, y, this.pickedClickObject, this.pickedClickInstance);
	}
}