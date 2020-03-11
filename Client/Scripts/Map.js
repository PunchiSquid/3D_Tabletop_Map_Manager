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
	}

	/*
	* Loads values from a retrieved map record into this, allowing for storage of data while maintaining function integrity.
	* @Param mapRecord The map record retrieved to load and copy values from.
	*/
	LoadFromRecord(mapRecord)
	{
		this.heightMap = mapRecord.heightMap;
		this._id = mapRecord._id;
		this.name = mapRecord.name;
		this.description = mapRecord.description;
		this.detailMatrix = mapRecord.detailMatrix;

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
}