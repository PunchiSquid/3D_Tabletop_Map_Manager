class HTMLGenerator
{
	constructor(mapScreen)
	{
		this.labelContainer = document.querySelector('#labels');
		this.object = null;
		this.instance = null;
        this.label = null;
		this.mapScreen = mapScreen;
		this.horizontalOffset = 200;
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

		this.object = null;
		this.instance = null;
		this.label = null;
	}

	AddCharacterLabel(x, y, object)
	{
		// Clear the existing labels
		this.RemoveLabels();

		// Set the active object
		this.object = object;

		// Retrieve details for display
		let nameValue = this.mapScreen.mapMatrix.characterMatrix[this.object.position.x][this.object.position.z].name;
		let notesValue = this.mapScreen.mapMatrix.characterMatrix[this.object.position.x][this.object.position.z].notes;

		// Create a new label div
		this.label = document.createElement("div");
		this.label.className = "active_label";

		// Create a new header and set the inner text
		let nameTitle = document.createElement("p");
		nameTitle.textContent = "Name";
		nameTitle.style = "display: inline-block; padding-right: 10px;";

		let notesTitle = document.createElement("p");
		notesTitle.textContent = "Notes";

		// Create forms and fill with retrieved values
		let nameForm = document.createElement("input");
		nameForm.setAttribute("type", "text");
		nameForm.setAttribute("min", "1");
		nameForm.setAttribute("value", nameValue);
		nameForm.style = "display: inline-block";

		let notesForm = document.createElement("textarea");
		notesForm.value = notesValue;

		// Create buttons
		let closeButton = document.createElement("input");
		closeButton.setAttribute("type", "button");
		closeButton.setAttribute("value", "Close");

		let deleteButton = document.createElement("input");
		deleteButton.setAttribute("type", "button");
		deleteButton.setAttribute("value", "Delete");

		// Append the new label to the label container and label elements to the label
		this.labelContainer.appendChild(this.label);
		this.label.appendChild(nameTitle);
		this.label.appendChild(nameForm);
		this.label.appendChild(notesTitle);
		this.label.appendChild(notesForm);
		this.label.appendChild(closeButton);
		this.label.appendChild(deleteButton);

		// Transform the new element with CSS
		this.label.style.transform = `translate(-50%, -50%) translate(${x + this.horizontalOffset}px,${y}px)`;

		/*
		* Internal function for modifying block height when number field is modified.
		*/
		const nameModFunction = function()
		{
			let value = nameForm.value;
			this.mapScreen.mapMatrix.characterMatrix[this.object.position.x][this.object.position.z].name = value;
		}

		/*
		* Internal function for modifying block description when the text area is modified.
		*/
		const notesModFunction = function()
		{
			// Increase the height value of the corresponding element in the map matrix
			let value = notesForm.value;
			this.mapScreen.mapMatrix.characterMatrix[this.object.position.x][this.object.position.z].notes = value;
		}

		/*
		* Internal function for modifying block description when the text area is modified.
		*/
		const deleteCharacterFunction = function()
		{
			// Dispatch a DeleteCharacter event to the document
			let detail = { object: this.object };
			let event = new CustomEvent("DeleteCharacter", { detail: detail });
			document.dispatchEvent(event);

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
	}

	/*
	* Adds to the height map value at the specified location on the heightmap, 
	* then returns the resultant value.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param currentLabelobject The instanced object to retrieve the transformation matrix from.
	* @Param currentLabelLocation The specific instance of the object to access.
	*/
	AddLabel(x, y, object, instance)
	{
		// Clear the existing labels
		this.RemoveLabels();

		// Set the active object
		this.object = object;
		this.instance = instance;

		// Retrieve the transformation matrix for the clicked instance
		var retrievedMatrix = new THREE.Matrix4();
		this.object.getMatrixAt(this.instance, retrievedMatrix);

		// Store repeatedly accessed values in a form that can be more easily read
		var matrix = 
		{
			x: retrievedMatrix.elements[12],
			y: retrievedMatrix.elements[13],
			z: retrievedMatrix.elements[14]
		};

		// Retrieve values for display
		let heightValue = this.mapScreen.mapMatrix.GetHeight(matrix.x, matrix.z);
		let descriptionValue = this.mapScreen.mapMatrix.GetDescription(matrix.x, matrix.z);

		// Create a new label div
		this.label = document.createElement("div");
		this.label.className = "active_label";

		// Create a new header and set the inner text
		let heightTitle = document.createElement("p");
		heightTitle.textContent = "Height";
		heightTitle.style = "display: inline-block; padding-right: 10px;";

		let descriptionTitle = document.createElement("p");
		descriptionTitle.textContent = "Description";

		// Create forms and fill with retrieved values
		let heightForm = document.createElement("input");
		heightForm.setAttribute("type", "number");
		heightForm.setAttribute("min", "1");
		heightForm.setAttribute("value", heightValue);
		heightForm.style = "display: inline-block";

		let descriptionForm = document.createElement("textarea");
		descriptionForm.value = descriptionValue;

		// Create buttons
		let closeButton = document.createElement("input");
		closeButton.setAttribute("type", "button");
		closeButton.setAttribute("value", "Close");

		// Append the new label to the label container
		this.labelContainer.appendChild(this.label);
		this.label.appendChild(heightTitle);
		this.label.appendChild(heightForm);
		this.label.appendChild(descriptionTitle);
		this.label.appendChild(descriptionForm);
		this.label.appendChild(closeButton);

		// Transform the new element with CSS
		this.label.style.transform = `translate(-50%, -50%) translate(${x + this.horizontalOffset}px,${y}px)`;

		/*
		* Internal function for modifying block height when number field is modified.
		*/
		const heightModFunction = function()
		{
			let value = parseInt(heightForm.value);

			let detail = 
			{
				instance: this.instance,
				object: this.object,
				value: value 
			};

			let event = new CustomEvent("SetBlockHeight", { detail: detail });
			document.dispatchEvent(event);
		}

		/*
		* Internal function for modifying block description when the text area is modified.
		*/
		const descriptionModFunction = function()
		{
			// Increase the height value of the corresponding element in the map matrix
			let value = descriptionForm.value;
			this.mapScreen.mapMatrix.SetDescription(matrix.x, matrix.z, value);
		}

		/*
		* Internal function for closing labels when the close button is clicked.
		*/
		const closeLabelFunction = function()
		{
			this.RemoveLabels();
		}

		// Register event listeners for label HTML interactions.
		heightForm.addEventListener('input', heightModFunction.bind(this));
		descriptionForm.addEventListener('input', descriptionModFunction.bind(this));
		closeButton.addEventListener('mousedown', closeLabelFunction.bind(this));
	}

	/*
	* Moves existing labels to update locations based on the moving 3D space.
	*/
	MoveLabel()
	{
		if (this.object)
		{
			// Used for positioning of label components
			let matrix;

			if (this.instance)
			{
				// Retrieve the transformation matrix for the clicked instance
				var retrievedMatrix = new THREE.Matrix4();
				this.object.getMatrixAt(this.instance, retrievedMatrix);

				// Store position values in JSON
				matrix = 
				{
					x: retrievedMatrix.elements[12],
					y: 0,
					z: retrievedMatrix.elements[14]
				};
			}
			else
			{
				// Store position values in JSON
				matrix =
				{
					x: this.object.position.x,
					y: this.object.position.y,
					z: this.object.position.z
				};
			}

			// Create a dummy object to set the position of the label, projected into screen space
			var dummy = new THREE.Object3D();
			var tempVector = new THREE.Vector3();
			dummy.position.set(matrix.x, matrix.y, matrix.z);
			dummy.updateMatrix();
			dummy.getWorldPosition(tempVector);
			tempVector.project(this.mapScreen.camera);

			let x = (tempVector.x *  .5 + .5) * this.mapScreen.canvas.clientWidth;
			let y = (tempVector.y * -.5 + .5) * this.mapScreen.canvas.clientHeight;

			// Show the label
			this.label.classList.toggle('show', true);

			// Translate the label to the correct position
			this.label.style.transform = `translate(-50%, -50%) translate(${x  + this.horizontalOffset}px,${y}px)`;
		}
	}
}