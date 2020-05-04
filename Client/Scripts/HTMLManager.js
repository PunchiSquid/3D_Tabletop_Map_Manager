class HTMLGenerator
{
	constructor(mapScreen)
	{
		this.labelContainer = document.querySelector('#labels');
		this.menuContainer = document.querySelector('#menus');
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

		while (this.menuContainer.hasChildNodes())
		{
			this.menuContainer.removeChild(this.menuContainer.childNodes[0]);
		}

		this.object = null;
		this.instance = null;
		this.label = null;
	}

	AddCharacterLabel(x, y, object, active)
	{
		// Clear the existing labels
		this.RemoveLabels();

		// Set the active object
		this.object = object;

		// Retrieve details for display
		let ownerValue = this.mapScreen.mapMatrix.characterMatrix[this.object.position.x][this.object.position.z].owner;
		let nameValue = this.mapScreen.mapMatrix.characterMatrix[this.object.position.x][this.object.position.z].name;
		let notesValue = this.mapScreen.mapMatrix.characterMatrix[this.object.position.x][this.object.position.z].notes;

		// Create a new label div
		this.label = document.createElement("div");
		this.label.className = "active_label";

		// Create a new header and set the inner text
		let ownerTitle = document.createElement("p");
		ownerTitle.textContent = "Owner";
		ownerTitle.style = "display: inline-block; padding-right: 10px;";

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

		let ownerForm = document.createElement("input");
		ownerForm.setAttribute("type", "text");
		ownerForm.setAttribute("value", ownerValue);
		ownerForm.style = "display: inline-block";
		ownerForm.disabled = true;
		

		let notesForm = document.createElement("textarea");
		notesForm.value = notesValue;

		// Create buttons
		let closeButton = document.createElement("input");
		closeButton.setAttribute("type", "button");
		closeButton.setAttribute("value", "Close");

		let moveButton = document.createElement("input");
		moveButton.setAttribute("type", "button");
		moveButton.setAttribute("value", "Move");

		let deleteButton = document.createElement("input");
		deleteButton.setAttribute("type", "button");
		deleteButton.setAttribute("value", "Delete");

		// Append the new label to the label container and label elements to the label
		this.labelContainer.appendChild(this.label);
		this.label.appendChild(ownerTitle);
		this.label.appendChild(ownerForm);
		this.label.appendChild(nameTitle);
		this.label.appendChild(nameForm);
		this.label.appendChild(notesTitle);
		this.label.appendChild(notesForm);
		this.label.appendChild(closeButton);

		if (!active)
		{
			nameForm.disabled = true;
			notesForm.disabled = true;
		}
		else
		{
			this.label.appendChild(moveButton);
			this.label.appendChild(deleteButton);
		}

		// Transform the new element with CSS
		this.label.style.transform = `translate(-50%, -50%) translate(${x + this.horizontalOffset}px,${y}px)`;

		/*
		* Internal function for modifying block height when number field is modified.
		*/
		const nameModFunction = function()
		{
			let value = nameForm.value;
			this.mapScreen.mapMatrix.SetCharacterName(this.object.position.x, this.object.position.z, value);
		}

		/*
		* Internal function for modifying block description when the text area is modified.
		*/
		const notesModFunction = function()
		{
			// Increase the height value of the corresponding element in the map matrix
			let value = notesForm.value;
			this.mapScreen.mapMatrix.SetCharacterNotes(this.object.position.x, this.object.position.z, value);
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

		const moveCharacterFunction = function()
		{
			// Dispatch a MoveCharacter event to the document
			let detail = { object: this.object };
			let event = new CustomEvent("MoveCharacter", { detail: detail });
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
		moveButton.addEventListener('mousedown', moveCharacterFunction.bind(this));
		deleteButton.addEventListener('mousedown', deleteCharacterFunction.bind(this));
	}

	/*
	* Adds to the height map value at the specified location on the heightmap, 
	* then returns the resultant value.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param object The object to track the instance of.
	* @Param instance The instance ID for matrix retrieval.
	* @Param active Boolean to determine if the user can edit the map.
	*/
	AddLabel(x, y, object, instance, active)
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

		if (!active)
		{
			heightForm.disabled = true;
			descriptionForm.disabled = true;
		}

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

	AddDrawMenu(isAdding)
	{
		// Clear the existing labels
		this.RemoveLabels();
		
		// Create a new label div
		this.label = document.createElement("div");
		this.label.className = "active_label";

		// Create new headers and set the inner text
		let brushSizeTitle = document.createElement("p");
		brushSizeTitle.textContent = "Brush Size";
		brushSizeTitle.style = "display: inline-block; padding-right: 10px;";

		let brushValueTitle = document.createElement("p");

		if (isAdding)
		{
			brushValueTitle.textContent = "Increment Value";
		}
		else
		{
			brushValueTitle.textContent = "Decrement Value";
		}

		// Create forms and fill with retrieved values
		let brushSizeForm = document.createElement("input");
		brushSizeForm.setAttribute("type", "number");
		brushSizeForm.setAttribute("step", "2");
		brushSizeForm.setAttribute("min", "1");
		brushSizeForm.setAttribute("value", this.mapScreen.brushSize);
		brushSizeForm.style = "display: inline-block";

		let brushValueForm = document.createElement("input");
		brushValueForm.setAttribute("type", "number");
		brushValueForm.setAttribute("min", "1");
		brushValueForm.setAttribute("value", this.mapScreen.brushValue);
		brushValueForm.style = "display: inline-block";

		// Create buttons
		let closeButton = document.createElement("input");
		closeButton.setAttribute("type", "button");
		closeButton.setAttribute("value", "Close");

		// Append the new label to the label container and label elements to the label
		this.menuContainer.appendChild(this.label);
		this.label.appendChild(brushSizeTitle);
		this.label.appendChild(brushSizeForm);
		this.label.appendChild(brushValueTitle);
		this.label.appendChild(brushValueForm);
		this.label.appendChild(closeButton);

		/*
		* Internal function for modifying block height when number field is modified.
		*/
		const valueModFunction = function()
		{
			let sizeValue = parseInt(brushSizeForm.value);

			if ((sizeValue % 2) == 0)
			{
				sizeValue += 1;
				brushSizeForm.value = sizeValue;
			}

			this.mapScreen.brushSize = sizeValue;

			let incrementValue = parseInt(brushValueForm.value);
			this.mapScreen.brushValue = incrementValue;
		}

		/*
		* Internal function for closing labels when the close button is clicked.
		*/
		const closeLabelFunction = function()
		{
			this.RemoveLabels();
		}

		// Register event listeners for label HTML interactions.
		brushSizeForm.addEventListener('input', valueModFunction.bind(this));
		brushValueForm.addEventListener('input', valueModFunction.bind(this));
		closeButton.addEventListener('mousedown', closeLabelFunction.bind(this));
	}

	AddHiddenRegionMenu()
	{
		// Clear the existing labels
		this.RemoveLabels();
		
		// Create a new label div
		this.label = document.createElement("div");
		this.label.className = "active_label";

		// Create new headers and set the inner text
		let hiddenRegionsTitle = document.createElement("h5");
		hiddenRegionsTitle.textContent = "Hidden Regions";
		hiddenRegionsTitle.style = "display: inline-block; padding-right: 10px;";

		// Create form elements for new regions
		let newRegionLabel = document.createElement("h5");
		newRegionLabel.textContent = "New Region";
		newRegionLabel.style = "display: inline-block; padding-right: 10px;";

		let newRegionForm = document.createElement("input");
		newRegionForm.setAttribute("type", "text");
		newRegionForm.style = "display: inline-block";

		// Create buttons
		let closeButton = document.createElement("input");
		closeButton.setAttribute("type", "button");
		closeButton.setAttribute("value", "Close");

		let newRegionButton = document.createElement("button");
		newRegionButton.textContent = "New Region";

		// Append the new label to the label container and label elements to the label
		this.menuContainer.appendChild(this.label);
		this.label.appendChild(newRegionLabel);
		this.label.appendChild(newRegionForm);
		this.label.appendChild(newRegionButton);
		this.label.appendChild(hiddenRegionsTitle);

		let regionListDiv = document.createElement("div");
		this.label.appendChild(regionListDiv);

		const clearRegionListFunction = function()
		{``
			while (regionListDiv.hasChildNodes())
			{
				regionListDiv.removeChild(regionListDiv.childNodes[0]);
			}
		}

		const populateRegionListFunction = function()
		{
			let regions = this.mapScreen.mapMatrix.hiddenRegions.slice();

			for (let i = 0; i < regions.length; i++)
			{
				let individualRegionDiv = document.createElement("div");
				individualRegionDiv.style = "border-color: white; border-style: solid; border-radius: 10px; border-width: 1px;";

				//let hiddenRegionContent = document.createElement("p");
				individualRegionDiv.textContent = regions[i].name;

				let revealToggle = document.createElement("input");
				revealToggle.textContent = "Reveal";
				revealToggle.setAttribute("type", "checkbox");
				revealToggle.setAttribute("value", regions[i].name);
				revealToggle.checked = regions[i].GetIsHidden();

				let addButton = document.createElement("button");
				addButton.textContent = "Add To";
				addButton.setAttribute("value", regions[i].name);

				let removeButton = document.createElement("button");
				removeButton.textContent = "Remove From";
				removeButton.setAttribute("value", regions[i].name);

				let deleteRegionButton = document.createElement("button");
				deleteRegionButton.textContent = "Delete";
				deleteRegionButton.setAttribute("value", regions[i].name);

				//individualRegionDiv.appendChild(hiddenRegionContent);
				individualRegionDiv.appendChild(revealToggle);
				individualRegionDiv.appendChild(addButton);
				individualRegionDiv.appendChild(removeButton);
				individualRegionDiv.appendChild(deleteRegionButton);

				regionListDiv.appendChild(individualRegionDiv);

				$(revealToggle).change(function()
				{
					let detail = { region: revealToggle.value, isHidden: revealToggle.checked };
					let event = new CustomEvent("ToggleHiddenRegionVisibility", { detail: detail });
					document.dispatchEvent(event);
				});

				$(addButton).click(function()
				{
					let detail = { region: addButton.value };
					let event = new CustomEvent("SelectRegionToEdit", { detail: detail });
					this.RemoveLabels();
					document.dispatchEvent(event);

					this.mapScreen.activeSelectType = SelectTypes.ADD_BLOCK_TO_REGION;

				}.bind(this));

				$(removeButton).click(function()
				{
					let detail = { region: removeButton.value };
					let event = new CustomEvent("SelectRegionToEdit", { detail: detail });
					this.RemoveLabels();
					document.dispatchEvent(event);

					this.mapScreen.activeSelectType = SelectTypes.REMOVE_BLOCK_FROM_REGION;

				}.bind(this));

				$(deleteRegionButton).click(function()
				{
					let detail = { region: deleteRegionButton.value };
					let event = new CustomEvent("RemoveHiddenRegion", { detail: detail });
					document.dispatchEvent(event);
				});
			}
		}.bind(this);

		populateRegionListFunction();

		this.label.appendChild(closeButton);

		/*
		* Internal function for closing labels when the close button is clicked.
		*/
		const closeLabelFunction = function()
		{
			this.RemoveLabels();
		}

		// Register event listeners for label HTML interactions.
		closeButton.addEventListener('mousedown', closeLabelFunction.bind(this));
		newRegionButton.addEventListener('mousedown', function()
		{
			if (newRegionForm.value != null)
			{
				let detail = { region: newRegionForm.value };
				let event = new CustomEvent("AddNewHiddenRegion", { detail: detail });
				document.dispatchEvent(event);
			}
		})

		document.addEventListener("RefreshLists", function()
		{
			clearRegionListFunction();
			populateRegionListFunction();
			
		}.bind(this));
	}

	/*
	* Moves existing labels to update locations based on the moving 3D space.
	*/
	MoveLabel()
	{
		if (this.label)
		{
			// Show the label
			this.label.classList.toggle('show', true);
		}

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

			// Translate the label to the correct position
			this.label.style.transform = `translate(-50%, -50%) translate(${x  + this.horizontalOffset}px,${y}px)`;
		}
	}
}