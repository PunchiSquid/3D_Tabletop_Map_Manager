class Map
{
	/*
	* Creates a new map, generating a new height map, colour array and detail matrix
	* @Param mapXDimension The x dimensions of the map.
	* @Param mapYDimension The y dimensions of the map.
	*/
	GenerateNewMap(mapXDimension, mapYDimension)
	{
		this.mapXDimension = mapXDimension;
		this.mapYDimension = mapYDimension;

		this.GenerateHeightMap();
		this.GenerateColourBufferArray();
		this.GenerateDetailMatrix();
		this.GenerateHiddenBlocKMatrix();
		this.GenerateCharacterMatrix();
	}

	/*
	* Saves a map to the database.
	*/
	SaveMap()
	{
		// Return a promise so that work can be performed asynchronously
		return new Promise(function(resolve, reject)
		{
			// Stringify the map record for ease of data transmission
			let json = JSON.stringify(this);

			// Wrap it in an object to avoid unwanted parsing by the Express body parser
			let object = 
			{
				"map": json
			};

			// Make a PUT request to the API to update the existing record.
			var request = $.ajax
			({
				url: "/map",
				type: "PUT",
				data: object,
			});

			// Upon success resolve the promise with a success message
			request.done(function(data, status)
			{
				resolve(status);
			});

			// Upon failure reject the promise
			request.fail(function(errorObject, string, errorString)
			{
				reject(errorString);
			});
			
		}.bind(this));
	}

	/*
	* Loads a map by making a network request and retrieving a map record.
	* @Param id The ID field to retrieve a record with.
	*/
	LoadMap(id)
	{
		// Return a promise so that work can be performed asynchronously
		return new Promise(function(resolve, reject)
		{
			// Make a get request
			var request = $.get("/map/" + id);

			// Upon success load the data from the map record into the current map object and resolve
			request.done(function(data, status)
			{
				this.LoadFromRecord(data);
				resolve(status);

			}.bind(this));

			// Upon failure reject the promise
			request.fail(function(errorObject, string, errorString)
			{
				reject(errorString);
			});

		}.bind(this));
	}

	/*
	* Loads values from a retrieved map record into this, allowing for storage of data while maintaining function integrity.
	* @Param mapRecord The map record retrieved to load and copy values from.
	*/
	LoadFromRecord(mapRecord)
	{
		this._id = mapRecord._id;

		this.name = mapRecord.name;
		this.description = mapRecord.description;

		this.mapXDimension = mapRecord.mapXDimension;
		this.mapYDimension = mapRecord.mapYDimension;
		this.heightMap = mapRecord.heightMap;
		this.detailMatrix = mapRecord.detailMatrix;
		this.characterMatrix = mapRecord.characterMatrix;
		this.hiddenBlockMatrix = mapRecord.hiddenBlockMatrix;

		this.CopyHiddenRegions(mapRecord.hiddenRegions);
		this.CopyColourArray(mapRecord.colourArray);
	}

	/*
	* Creates a new map, generating a new height map, colour array and detail matrix.
	* @Param retrievedColourArray The array in the retrieved map record.
	*/
	CopyColourArray(retrievedColourArray)
	{
		// Retrieve values from the arbitrary object retrieved
		let valueArray = Object.values(retrievedColourArray);

		// Create a new array with RGB values for every block on the map grid
		this.colourArray = new Float32Array(valueArray.length);

		// Copy the array into the new generated array
		for (let i = 0; i < valueArray.length; i++)
		{
			this.colourArray[i] = valueArray[i];
		}
	}

	CopyHiddenRegions(retrievedHiddenRegions)
	{
		this.hiddenRegions = new Array();

		for (let i = 0; i < retrievedHiddenRegions.length; i++)
		{
			let copiedHiddenRegion = new HiddenRegion(retrievedHiddenRegions[i].name);
			copiedHiddenRegion.hiddenBlocks = retrievedHiddenRegions[i].hiddenBlocks;
			this.hiddenRegions.push(copiedHiddenRegion);
		}
	}

	/*
	* Generates a flat height map matrix.
	*/
	GenerateHeightMap()
	{
		this.heightMap = new Array(this.mapXDimension);

		for (let i = 0; i < this.heightMap.length; i++)
		{
			let column = new Array(this.mapYDimension);
			column.fill(1);							// Fill with 1s to provide a flat plane
			this.heightMap[i] = column;
		}
	}

	/*
	* Generates a colour buffer for displaying colours.
	*/
	GenerateColourBufferArray()
	{
		const colour = {r: 0, g: 0.5019607843137255, b: 0};

		const colourCount = (this.mapXDimension * this.mapYDimension) + 1;

		// Create a new array with RGB values for every block on the map grid
		this.colourArray = new Float32Array(colourCount * 3 );
		
		// Add colour to the colour array
		for (var i = 0; i < colourCount * 3; i += 3)
		{
			this.colourArray[i] = colour.r;
			this.colourArray[i + 1] = colour.g;
			this.colourArray[i + 2] = colour.b;
		}
	}

	/*
	* Generates an empty matrix for descriptive details.
	*/
	GenerateDetailMatrix()
	{
		this.detailMatrix = new Array(this.mapXDimension);

		for (let i = 0; i < this.detailMatrix.length; i++)
		{
			let column = new Array(this.mapYDimension);
			this.detailMatrix[i] = column;
		}
	}

	/*
	* Generates an empty matrix for descriptive details.
	*/
	GenerateCharacterMatrix()
	{
		this.characterMatrix = new Array(this.mapXDimension);

		for (let i = 0; i < this.characterMatrix.length; i++)
		{
			let column = new Array(this.mapYDimension);
			this.characterMatrix[i] = column;
		}
	}

	/*
	* Generates a hidden block matrix and a hidden regions array
	*/
	GenerateHiddenBlocKMatrix()
	{
		this.hiddenBlockMatrix = new Array(this.mapXDimension);
		this.hiddenRegions = new Array();

		for (let i = 0; i < this.characterMatrix.length; i++)
		{
			let column = new Array(this.mapYDimension);
			column.fill(false);
			this.hiddenBlockMatrix[i] = column;
		}
	}

	AddBlockToHiddenRegion(x, y, regionName)
	{
		this.hiddenBlockMatrix[x][y] = true;
		
		for (let i = 0; i < this.hiddenRegions.length; i++)
		{
			if (this.hiddenRegions[i].name == regionName)
			{
				this.hiddenRegions[i].AddHiddenBlock(x, y);
				break;
			}
		}
	}

	RemoveBlockFromHiddenRegion(x, y, regionName)
	{
		this.hiddenBlockMatrix[x][y] = false;
		
		for (let i = 0; i < this.hiddenRegions.length; i++)
		{
			if (this.hiddenRegions[i].name == regionName)
			{
				this.hiddenRegions[i].RemoveHiddenBlock(x, y);
				break;
			}
		}
	}

	RevealHiddenRegion(regionName, isHidden)
	{
		let blocksToReveal;

		for (let i = 0; i < this.hiddenRegions.length; i++)
		{
			if (this.hiddenRegions[i].name == regionName)
			{
				blocksToReveal = this.hiddenRegions[i].GetHiddenBlocks();
				break;
			}
		}

		for (let j = 0; j < blocksToReveal.length; j++)
		{
			const x = blocksToReveal[j].x;
			const y = blocksToReveal[j].y;

			this.hiddenBlockMatrix[x][y] = isHidden;
		}
	}

	AddNewRegion(regionName)
	{
		if (regionName != null)
		{
			this.hiddenRegions.push(new HiddenRegion(regionName));
		}
	}

	RemoveHiddenRegion(regionName)
	{
		let blocksToReveal;

		for (let i = 0; i < this.hiddenRegions.length; i++)
		{
			if (this.hiddenRegions[i].name == regionName)
			{
				console.log(this.hiddenRegions[i].name);
				blocksToReveal = this.hiddenRegions[i].GetHiddenBlocks().slice();
				this.hiddenRegions.splice(i, 1);
				break;
			}
		}

		for (let j = 0; j < blocksToReveal.length; j++)
		{
			const x = blocksToReveal[j].x;
			const y = blocksToReveal[j].y;

			this.hiddenBlockMatrix[x][y] = false;
		}
	}

	/*
	* Adds to the height map value at the specified location on the heightmap, 
	* then returns the resultant value.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param value The value to add to / subtract from the heightmap
	* @Returns The resultant value after incrementing.
	*/
	AddToHeight(x, y, value)
	{
		this.heightMap[x][y] += value;

		// Prevent values less than 1, keeping cube dimensions positive
		if (this.heightMap[x][y] < 1) { this.heightMap[x][y] = 1; }

		return(this.heightMap[x][y]);
	}

	/*
	* Sets the height map value at the specified location on the heightmap, 
	* then returns the resultant value.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param height The value to set to the heightmap
	* @Returns The resultant value after incrementing.
	*/
	SetHeight(x, y, height)
	{
		if (height > 0)
		{
			this.heightMap[x][y] = height;
		}

		document.dispatchEvent(new Event("UpdateMap"));
		return(this.heightMap[x][y]);
	}

	/*
	* Retrieves the height map value at the specified location on the heightmap.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Returns The value at the specified indices.
	*/
	GetHeight(x, y)
	{
		return(this.heightMap[x][y]);
	}

	/*
	* Retrieves the description value at the specified location on the description matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Returns The value at the specified indices.
	*/
	GetDescription(x, y)
	{
		return(this.detailMatrix[x][y]);
	}

	/*
	* Sets the description value at the specified location on the description matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param value The value to set to the description matrix.
	*/
	SetDescription(x, y, value)
	{
		if (value)
		{
			this.detailMatrix[x][y] = String(value);
			document.dispatchEvent(new Event("UpdateMap"));
		}
	}

	/*
	* Creates a new character instance at the specified location on the character matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	*/
	AddCharacter(x, y, owner)
	{
		if (this.characterMatrix[x][y] == null)
		{
			let character = new Character(owner);
			this.characterMatrix[x][y] = character;
			document.dispatchEvent(new Event("UpdateMap"));
		}
	}

	/*
	* Retrieves a character instance at the specified location on the character matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Returns The character instance at the specified indices.
	*/
	GetCharacter(x, y)
	{
		return this.characterMatrix[x][y];
	}

	/*
	* Sets a character instance at the specified location on the character matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param value The character instance to set at the specified location.
	*/
	SetCharacter(x, y, value)
	{
		// Only allow valid characters with properties or empty records for deletion
		if (value == null || (value.name))
		{
			this.characterMatrix[x][y] = value;	
			document.dispatchEvent(new Event("UpdateMap"));
		}
	}

	/*
	* Sets the name value of a character instance at the specified location on the character matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param name Name value to set at the specified location.
	*/
	SetCharacterName(x, y, name)
    {
        this.characterMatrix[x][y].name = name;
        document.dispatchEvent(new Event("UpdateMap"));
    }

	/*
	* Retrieves the name value of a character instance at the specified location on the character matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Returns The name property of the character instance at the specified indices.
	*/
    GetCharacterName(x, y)
    {
        return(this.characterMatrix[x][y].name);
    }

	/*
	* Sets the notes value of a character instance at the specified location on the character matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Param name The descriptive value to set at the specified location.
	*/
    SetCharacterNotes(x, y, notes)
    {
        this.characterMatrix[x][y].notes = notes;
        document.dispatchEvent(new Event("UpdateMap"));
    }

	/*
	* Sets the name value of a character instance at the specified location on the character matrix.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Returns The notes property of the character instance at the specified indices.
	*/
    GetCharacterNotes(x, y)
    {
        return(this.characterMatrix[x][y].notes);
    }
}