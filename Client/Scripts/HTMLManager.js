class HTMLGenerator
{
	constructor(mapScreen)
	{
		this.labelContainer = document.querySelector('#labels');
		this.currentLabelObject = null;
		this.currentLabelLocation = null;
        this.newLabel = null;
        this.mapScreen = mapScreen;
	}

	/*
	* Removes currently active labels on the screen.
	*/
	RemoveLabels()
	{
		// Remove all child nodes
		while (this.labelContainer.hasChildNodes())
		{
			this.labelContainer.removeChild(this.labelContainer.childNodes[0]);
		}

		this.currentLabelObject = null;
		this.currentLabelLocation = null;
		this.newLabel = null;
	}

	/*
	* Adds to the height map value at the specified location on the heightmap, 
	* then returns the resultant value.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param currentLabelobject The instanced object to retrieve the transformation matrix from.
	* @Param currentLabelLocation The specific instance of the object to access.
	*/
	AddLabel(x, y, currentLabelObject, currentLabelLocation)
	{
		// Clear the existing labels
		this.RemoveLabels();

		this.currentLabelObject = currentLabelObject;
		this.currentLabelLocation = currentLabelLocation;

		var originalMatrix = new THREE.Matrix4();
		this.currentLabelObject.getMatrixAt(this.currentLabelLocation, originalMatrix);
		let val = this.mapScreen.mapMatrix.heightMap[originalMatrix.elements[12]][originalMatrix.elements[14]];

		// Create a new label div
		this.newLabel = document.createElement("div");

		// Create a new header and set the inner text
		let heightTitle = document.createElement("p");
		heightTitle.textContent = "Height";
		heightTitle.style = "display: inline-block; padding-right: 10px;";

		let descriptionTitle = document.createElement("p");
		descriptionTitle.textContent = "Description";

		let heightForm = document.createElement("input");
		heightForm.setAttribute("type", "number");
		heightForm.setAttribute("min", "1");
		heightForm.setAttribute("value", val);
		heightForm.style = "display: inline-block";

		let descriptionForm = document.createElement("textarea");

		/*
		* Internal function for modifying block height when number field is modified.
		*/
		const heightModFunction = function()
		{
			// Retrieve the transformation matrix for the clicked instance
			var matrix = new THREE.Matrix4();
			this.currentLabelObject.getMatrixAt(this.currentLabelLocation, matrix);

			// Increase the height value of the corresponding element in the map matrix
			let value = parseInt(heightForm.value);
			this.mapScreen.mapMatrix.heightMap[matrix.elements[12]][matrix.elements[14]] = value;

			// Set corresponding values in the transformation matrix for the instance
			matrix.elements[5] = value;
			matrix.elements[13] = value / 2;

			// Set the transformation matrix to the instance and flag it for updates
			this.currentLabelObject.setMatrixAt(this.currentLabelLocation, matrix);
			this.currentLabelObject.instanceMatrix.needsUpdate = true;	
		}

		// Register event listener for when the height number field is modified.
		heightForm.addEventListener('change', heightModFunction.bind(this));
		

		// Append the new label to the label container
		this.labelContainer.appendChild(this.newLabel);
		this.newLabel.appendChild(heightTitle);
		this.newLabel.appendChild(heightForm);
		this.newLabel.appendChild(descriptionTitle);
		this.newLabel.appendChild(descriptionForm);

		// Transform the new element with CSS
		this.newLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
	}

	/*
	* Moves existing labels to update locations based on the moving 3D space.
	*/
	MoveLabel()
	{
		if (this.currentLabelObject && this.currentLabelLocation)
		{
			// Retrieve the transformation matrix for the clicked instance
			var originalMatrix = new THREE.Matrix4();
			this.currentLabelObject.getMatrixAt(this.currentLabelLocation, originalMatrix);

			var dummy = new THREE.Object3D();
			var tempVector = new THREE.Vector3();
			dummy.position.set(originalMatrix.elements[12], originalMatrix.elements[13], originalMatrix.elements[14]);
			dummy.updateMatrix();
			dummy.getWorldPosition(tempVector);
			tempVector.project(this.mapScreen.camera);

			let x = (tempVector.x *  .5 + .5) * this.mapScreen.canvas.clientWidth;
			let y = (tempVector.y * -.5 + .5) * this.mapScreen.canvas.clientHeight;

			this.newLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
		}
	}
}