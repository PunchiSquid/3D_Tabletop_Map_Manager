class HiddenRegion
{
    constructor(name)
    {
        this.name = name;
        this.hiddenBlocks = new Array();
    }

    /*
    * Adds a new coordinate pair to the list of hidden blocks in this region
    * @Param x The x coordinate for the block
    * @Param y The y coordinate for the block
    */
    AddHiddenBlock(x, y)
    {
        // Add a Vector2 for easy storage of X and Y values
        let data = new THREE.Vector2(x, y);
        this.hiddenBlocks.push(data);
    }

    /*
    * Removes a coordinate pair from the list of hidden blocks in this region
    * @Param x The x coordinate for the block
    * @Param y The y coordinate for the block
    */
    RemoveHiddenBlock(x, y)
    {
        // Iterate through the array and remove the coordinate pair
        for (var i = 0; i < this.hiddenBlocks.length; i++)
        {
            if (this.hiddenBlocks[i].x == x && this.hiddenBlocks[i].y == y)
            {
                this.hiddenBlocks.splice(i, 1);
                break;
            }
        }
    }

    /*
    * Returns the list of hidden blocks in this region
    */
    GetHiddenBlocks()
    {
        return this.hiddenBlocks;
    }
}