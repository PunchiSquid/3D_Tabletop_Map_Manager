class HTMLGenerator
{
	constructor(mapScreen)
	{
		this.labelContainer = document.querySelector('#labels');
		this.currentLabelObject = null;
		this.currentLabelLocation = null;
		this.matrix = null;
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
		this.matrix = null;
		this.newLabel = null;
	}

	AddCharacterLabel(x, y, matrix)
	{
		// Clear the existing labels
		this.RemoveLabels();

		this.matrix = matrix;

		let nameValue = this.mapScreen.mapMatrix.characterMatrix[this.matrix.x][this.matrix.z].name;
		let notesValue = this.mapScreen.mapMatrix.characterMatrix[this.matrix.x][this.matrix.z].notes;

		// Create a new label div
		this.newLabel = document.createElement("div");

		// Create a new header and set the inner text
		let nameTitle = document.createElement("p");
		nameTitle.textContent = "Name";
		nameTitle.style = "display: inline-block; padding-right: 10px;";

		let notesTitle = document.createElement("p");
		notesTitle.textContent = "Notes";

		let nameForm = document.createElement("input");
		nameForm.setAttribute("type", "text");
		nameForm.setAttribute("min", "1");
		nameForm.setAttribute("value", nameValue);
		nameForm.style = "display: inline-block";

		let notesForm = document.createElement("textarea");
		notesForm.value = notesValue;

		let closeButton = document.createElement("input");
		closeButton.setAttribute("type", "button");
		closeButton.setAttribute("value", "Close");

		let deleteButton = document.createElement("input");
		deleteButton.setAttribute("type", "button");
		deleteButton.setAttribute("value", "Delete");

		/*
		* Internal function for modifying block height when number field is modified.
		*/
		const nameModFunction = function()
		{
			let value = nameForm.value;
			this.mapScreen.mapMatrix.characterMatrix[this.matrix.x][this.matrix.z].name = value;
		}

		/*
		* Internal function for modifying block description when the text area is modified.
		*/
		const notesModFunction = function()
		{
			// Increase the height value of the corresponding element in the map matrix
			let value = notesForm.value;
			this.mapScreen.mapMatrix.characterMatrix[this.matrix.x][this.matrix.z].notes = value;
		}

		/*
		* Internal function for modifying block description when the text area is modified.
		*/
		const deleteCharacterFunction = function()
		{
			// Increase the height value of the corresponding element in the map matrix
			let value = notesForm.value;
			this.mapScreen.mapMatrix.characterMatrix[this.matrix.x][this.matrix.z] = null;

			let count = this.mapScreen.scene.children.length;

			for (let i = 0; i < count; i++)
			{
				let element = this.mapScreen.scene.children[i];

				if (element != null && element.position.x == this.matrix.x && element.position.z == this.matrix.z)
				{
					this.mapScreen.scene.remove(element);
					break;
				}
			}

			this.RemoveLabels();
		}

		/*
		* Internal function for closing labels when the close button is clicked.
		*/
		const closeLabelFunction = function()
		{
			this.RemoveLabels();
		}

		// Register event listeners for label HTML interactions.
		nameForm.addEventListener('input', nameModFunction.bind(this));
		notesForm.addEventListener('input', notesModFunction.bind(this));
		closeButton.addEventListener('mousedown', closeLabelFunction.bind(this));
		deleteButton.addEventListener('mousedown', deleteCharacterFunction.bind(this));
		

		// Append the new label to the label container
		this.labelContainer.appendChild(this.newLabel);
		this.newLabel.appendChild(nameTitle);
		this.newLabel.appendChild(nameForm);
		this.newLabel.appendChild(notesTitle);
		this.newLabel.appendChild(notesForm);
		this.newLabel.appendChild(closeButton);
		this.newLabel.appendChild(deleteButton);

		// Transform the new element with CSS
		this.newLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
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

		// Retrieve the transformation matrix for the clicked instance
		var retrievedMatrix = new THREE.Matrix4();
		this.currentLabelObject.getMatrixAt(this.currentLabelLocation, retrievedMatrix);

		var matrix = 
		{
			x: retrievedMatrix.elements[12],
			y: retrievedMatrix.elements[13],
			z: retrievedMatrix.elements[14]
		};

		this.matrix = matrix;

		let heightValue = this.mapScreen.mapMatrix.heightMap[this.matrix.x][this.matrix.z];
		let descriptionValue = this.mapScreen.mapMatrix.detailMatrix[this.matrix.x][this.matrix.z]


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
		heightForm.setAttribute("value", heightValue);
		heightForm.style = "display: inline-block";

		let descriptionForm = document.createElement("textarea");
		descriptionForm.value = descriptionValue;
		let closeButton = document.createElement("input");
		closeButton.setAttribute("type", "button");
		closeButton.setAttribute("value", "Close");

		/*
		* Internal function for modifying block height when number field is modified.
		*/
		const heightModFunction = function()
		{
			let value = parseInt(heightForm.value);
			this.mapScreen.IncreaseHeightOfBlock(value, this.currentLabelObject, this.currentLabelLocation);
		}

		/*
		* Internal function for modifying block description when the text area is modified.
		*/
		const descriptionModFunction = function()
		{
			// Increase the height value of the corresponding element in the map matrix
			let value = descriptionForm.value;
			this.mapScreen.mapMatrix.detailMatrix[this.matrix.x][this.matrix.z] = value;
		}

		/*
		* Internal function for closing labels when the close button is clicked.
		*/
		const closeLabelFunction = function()
		{
			this.RemoveLabels();
		}

		// Register event listeners for label HTML interactions.
		heightForm.addEventListener('change', heightModFunction.bind(this));
		descriptionForm.addEventListener('input', descriptionModFunction.bind(this));
		closeButton.addEventListener('mousedown', closeLabelFunction.bind(this));
		

		// Append the new label to the label container
		this.labelContainer.appendChild(this.newLabel);
		this.newLabel.appendChild(heightTitle);
		this.newLabel.appendChild(heightForm);
		this.newLabel.appendChild(descriptionTitle);
		this.newLabel.appendChild(descriptionForm);
		this.newLabel.appendChild(closeButton);

		// Transform the new element with CSS
		this.newLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
	}

	/*
	* Moves existing labels to update locations based on the moving 3D space.
	*/
	MoveLabel()
	{
		if (this.matrix)
		{
			var dummy = new THREE.Object3D();
			var tempVector = new THREE.Vector3();
			dummy.position.set(this.matrix.x, 0, this.matrix.z);
			dummy.updateMatrix();
			dummy.getWorldPosition(tempVector);
			tempVector.project(this.mapScreen.camera);

			let x = (tempVector.x *  .5 + .5) * this.mapScreen.canvas.clientWidth;
			let y = (tempVector.y * -.5 + .5) * this.mapScreen.canvas.clientHeight;

			this.newLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
		}
	}
}