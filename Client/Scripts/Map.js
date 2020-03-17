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
	* Adds to the height map value at the specified location on the heightmap, 
	* then returns the resultant value.
	* @Param x The X index on the matrix.
	* @Param y The Y index on the matrix.
	* @Returns The resultant value after incrementing.
	*/
	AddBlock(x, y)
	{
		this.heightMap[x][y] += 1;
		return(this.heightMap[x][y]);
	}

	SetHeight(x, y, height)
	{
		if (height > 0)
		{
			this.heightMap[x][y] = height;
		}

		return this.heightMap[x][y];
	}

	AddCharacter(x, y)
	{
		if (this.characterMatrix[x][y] == null)
		{
			let character = new Character();
			this.characterMatrix[x][y] = character;
		}
	}

	GetCharacter(x, y)
	{
		return this.characterMatrix[x][y];
	}
}