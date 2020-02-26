class Map
{
	constructor(mapXDimension, mapYDimension)
	{
		this.mapXDimension = mapXDimension;
		this.mapYDimension = mapYDimension;

		this.GenerateHeightMap();
		this.GenerateColourBufferArray();
		this.GenerateDetailMatrix();
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
		const colour = new THREE.Color("green");;
		const colourCount = (this.mapXDimension * this.mapYDimension) + 1;

		// Create a new array with RGB values for every block on the map grid
		this.colourArray = new Float32Array(colourCount * 3 );
		
		// Add colour to the colour array
		for (var i = 0; i < colourCount; i++)
		{
			colour.toArray( this.colourArray, i * 3 );
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
	}
}