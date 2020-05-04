// Assertion library
const assert = require('chai').assert;
const THREE = require('three');

// Model classes to test
const Character = require('./../Client/Scripts/Character');
const HiddenRegion = require('./../Client/Scripts/HiddenRegion');
const Map = require('./../Client/Scripts/Map');

suite("Testing Character Model Functions", function()
{
	// Global variables for testing
	var ownerName = "TestUser";
	var characterName = "TestCharacter";
	var characterNotes = "TestNotes";
	var testCharacter;

	setup(function()
	{
		testCharacter = new Character(ownerName);
	});

	teardown(function()
	{
		testCharacter = null;
	});

	test("Testing that character construction is correct", function()
	{
		assert.isString(testCharacter.owner);
		assert.equal(testCharacter.owner, ownerName, "Value should be equal to TestUser.");

		assert.isString(testCharacter.name);
		assert.equal(testCharacter.name, "New Character", "Value should be equal to TestCharacter.");

		assert.isString(testCharacter.notes);
		assert.equal(testCharacter.notes, "", "Value should be equal to TestNotes.");
	})

	test("Testing setting a character name", function()
	{
		testCharacter.SetCharacterName(characterName);
		assert.isString(testCharacter.name);
		assert.equal(testCharacter.name, characterName, "Value should be equal to TestCharacter.");
	});

	test("Testing setting character notes", function()
	{
		testCharacter.SetCharacterNotes(characterNotes);
		assert.isString(testCharacter.notes);
		assert.equal(testCharacter.notes, characterNotes, "Value should be equal to TestNotes.");
	});

	test("Testing getting character name", function()
	{
		testCharacter.name = characterName;
		let returnedValue = testCharacter.GetCharacterName();

		assert.isString(returnedValue);
		assert.equal(returnedValue, characterName, "Value should be equal to TestName.");
	});

	test("Testing getting character notes", function()
	{
		testCharacter.notes = characterNotes;
		let returnedValue = testCharacter.GetCharacterNotes();

		assert.isString(returnedValue);
		assert.equal(returnedValue, characterNotes, "Value should be equal to TestNotes.");
	});

	test("Testing getting character owner", function()
	{
		let returnedValue = testCharacter.GetCharacterOwner();

		assert.isString(returnedValue);
		assert.equal(returnedValue, ownerName, "Value should be equal to TestUser.");
	});
});

suite("Testing HiddenRegion Model Functions", function()
{
	var testName = "testRegion";
	var testRegion;

	setup(function()
	{
		testRegion = new HiddenRegion(testName);
	});

	teardown(function()
	{
		testRegion = null;
	});

	test("Testing that hiddenRegion construction is correct", function()
	{
		assert.isString(testRegion.name);
		assert.equal(testRegion.name, testName, "Value should be equal to TestRegion.");

		assert.isArray(testRegion.hiddenBlocks);
		assert.lengthOf(testRegion.hiddenBlocks, 0, "Array should be empty");

		assert.isBoolean(testRegion.isHidden);
		assert.isTrue(testRegion.isHidden, "Value should be true.");
	});

	test("Testing adding a single hidden block", function()
	{
		testRegion.AddHiddenBlock(1, 2);

		let returnedArray = testRegion.GetHiddenBlocks();
		assert.lengthOf(returnedArray, 1, "Array should have length 1");
		assert.equal(returnedArray[0].x, 1, "X value should be 1");
		assert.equal(returnedArray[0].y, 2, "Y value should by 2");
	});

	test("Testing adding multiple hidden blocks", function()
	{
		testRegion.AddHiddenBlock(1, 2);
		testRegion.AddHiddenBlock(3, 4);

		let returnedArray = testRegion.GetHiddenBlocks();
		assert.lengthOf(returnedArray, 2, "Array should have length 2");
		assert.equal(returnedArray[0].x, 1, "X value should be 1");
		assert.equal(returnedArray[0].y, 2, "Y value should by 2");
		assert.equal(returnedArray[1].x, 3, "X value should be 3");
		assert.equal(returnedArray[1].y, 4, "Y value should by 4");
	});

	test("Testing removing a single hidden block", function()
	{
		testRegion.AddHiddenBlock(1, 2);
		testRegion.AddHiddenBlock(3, 4);

		testRegion.RemoveHiddenBlock(1, 2);

		let returnedArray = testRegion.GetHiddenBlocks();
		assert.lengthOf(returnedArray, 1, "Array should have length 1");
		assert.equal(returnedArray[0].x, 3, "X value should be 3");
		assert.equal(returnedArray[0].y, 4, "Y value should by 4");
	})

	test("Testing removing multiple hidden blocks.", function()
	{
		testRegion.AddHiddenBlock(1, 2);
		testRegion.AddHiddenBlock(3, 4);
		testRegion.AddHiddenBlock(5, 6);
		testRegion.AddHiddenBlock(7, 8);

		testRegion.RemoveHiddenBlock(1, 2);
		testRegion.RemoveHiddenBlock(5, 6);

		let returnedArray = testRegion.GetHiddenBlocks();
		assert.lengthOf(returnedArray, 2, "Array should have length 2");
		assert.equal(returnedArray[0].x, 3, "X value should be 3");
		assert.equal(returnedArray[0].y, 4, "Y value should by 4");
		assert.equal(returnedArray[1].x, 7, "X value should be 7");
		assert.equal(returnedArray[1].y, 8, "Y value should by 8");
	});

	test("Testing getting the hidden blocks array", function()
	{
		testRegion.AddHiddenBlock(1, 2);
		testRegion.AddHiddenBlock(3, 4);

		let returnedArray = testRegion.GetHiddenBlocks();
		assert.lengthOf(returnedArray, 2, "Array should have length 2");
		assert.isArray(returnedArray);
		assert.equal(returnedArray[0].x, 1, "X value should be 1");
		assert.equal(returnedArray[0].y, 2, "Y value should by 2");
		assert.equal(returnedArray[1].x, 3, "X value should be 3");
		assert.equal(returnedArray[1].y, 4, "Y value should by 4");
	});

	test("Testing getting the isHidden property", function()
	{
		let returnedValue = testRegion.GetIsHidden();
		assert.isBoolean(returnedValue);
		assert.isTrue(returnedValue, "Value should be true.");
	});

	test("Testing setting the isHidden property", function()
	{
		testRegion.SetIsHidden(false);

		let returnedValue = testRegion.GetIsHidden();
		assert.isBoolean(returnedValue);
		assert.isFalse(returnedValue, "Value should be false.");
	});
});

suite("Testing Map model functions", function()
{
	var xDimension = 125;
	var yDimension = 125;
	var testMap;

	setup(function()
	{
		testMap = new Map();
		testMap.GenerateNewMap(xDimension, yDimension);
	});

	teardown(function()
	{
		testMap = null;
	});

	test("Testing GenerateNewMap", function()
	{
		assert.equal(testMap.mapXDimension, xDimension, "Value should be 125");
		assert.equal(testMap.mapYDimension, yDimension, "Value should be 125");

		assert.isArray(testMap.heightMap);
		assert.lengthOf(testMap.heightMap, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.heightMap[0], 125, "Length of the Y dimension should be 125")

		assert.isArray(testMap.detailMatrix);
		assert.lengthOf(testMap.detailMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.detailMatrix[0], 125, "Length of the Y dimension should be 125")

		assert.isArray(testMap.characterMatrix);
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125")

		assert.isArray(testMap.hiddenBlockMatrix);
		assert.lengthOf(testMap.hiddenBlockMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.hiddenBlockMatrix[0], 125, "Length of the Y dimension should be 125")

		assert.isArray(testMap.hiddenRegions);
		assert.lengthOf(testMap.hiddenRegions, 0, "Length of array should be 0");

		assert.lengthOf(testMap.colourArray, 46878, "Length should be 46878");
	});

	test("Testing the SetHeight method", function()
	{
		testMap.SetHeight(1, 3, 4);
		assert.isArray(testMap.heightMap);
		assert.lengthOf(testMap.heightMap, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.heightMap[0], 125, "Length of the Y dimension should be 125");
		assert.equal(testMap.heightMap[1][3], 4, "Value should be 4");
	});

	test("Testing the GetHeight method", function()
	{
		testMap.SetHeight(1, 3, 4);
		let value = testMap.GetHeight(1, 3);

		assert.isArray(testMap.heightMap);
		assert.lengthOf(testMap.heightMap, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.heightMap[0], 125, "Length of the Y dimension should be 125");
		assert.equal(value, 4, "Value should be 4");
	});

	test("Testing the SetDescription method", function()
	{
		testMap.SetDescription(1, 3, "TestValue");
		assert.isArray(testMap.detailMatrix);
		assert.lengthOf(testMap.detailMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.detailMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isString(testMap.detailMatrix[1][3]);
		assert.equal(testMap.detailMatrix[1][3], "TestValue", "Value should be TestValue");
	});

	test("Testing the GetDescription method", function()
	{
		testMap.SetDescription(1, 3, "TestValue");
		let value = testMap.GetDescription(1, 3);

		assert.isArray(testMap.detailMatrix);
		assert.lengthOf(testMap.detailMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.detailMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isString(testMap.detailMatrix[1][3]);
		assert.equal(value, "TestValue", "Value should be TestValue");
	});

	test("Testing the AddCharacter method", function()
	{
		testMap.AddCharacter(1, 3, "TestOwner");

		assert.isArray(testMap.characterMatrix);
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isObject(testMap.characterMatrix[1][3], 'Value should be an object');
		assert.equal(testMap.characterMatrix[1][3].owner, "TestOwner", "Value should be TestOwner");
		assert.equal(testMap.characterMatrix[1][3].name, "New Character", "Value should be New Character");
		assert.equal(testMap.characterMatrix[1][3].notes, "", "Value should be an empty string");
	});

	test("Testing the AddCharacter method", function()
	{
		testMap.AddCharacter(1, 3, "TestOwner");
		let value = testMap.GetCharacter(1, 3);

		assert.isArray(testMap.characterMatrix);
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isObject(value, 'Value should be an object');
		assert.equal(value.owner, "TestOwner", "Value should be TestOwner");
		assert.equal(value.name, "New Character", "Value should be New Character");
		assert.equal(value.notes, "", "Value should be an empty string");
	});

	test("Testing the SetCharacter method", function()
	{
		let character = new Character("TestOwner");
		testMap.SetCharacter(1, 3, character);

		assert.isArray(testMap.characterMatrix);
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isObject(testMap.characterMatrix[1][3], 'Value should be an object');
		assert.equal(testMap.characterMatrix[1][3].owner, "TestOwner", "Value should be TestOwner");
		assert.equal(testMap.characterMatrix[1][3].name, "New Character", "Value should be New Character");
		assert.equal(testMap.characterMatrix[1][3].notes, "", "Value should be an empty string");
	});

	test("Testing the SetCharacterName method", function()
	{
		testMap.AddCharacter(1, 3, "TestOwner");
		testMap.SetCharacterName(1, 3, "TestName");

		assert.isArray(testMap.characterMatrix);
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isObject(testMap.characterMatrix[1][3], 'Value should be an object');
		assert.equal(testMap.characterMatrix[1][3].name, "TestName", "Value should be TestName");
	});

	test("Testing the GetCharacterName method", function()
	{
		testMap.AddCharacter(1, 3, "TestOwner");
		testMap.SetCharacterName(1, 3, "TestName");
		let value = testMap.GetCharacterName(1, 3);

		assert.isArray(testMap.characterMatrix);
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isObject(testMap.characterMatrix[1][3], 'Value should be an object');
		assert.equal(value, "TestName", "Value should be TestName");
	});

	test("Testing the SetCharacterNotes method", function()
	{
		testMap.AddCharacter(1, 3, "TestOwner");
		testMap.SetCharacterNotes(1, 3, "TestNotes");

		assert.isArray(testMap.characterMatrix);
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isObject(testMap.characterMatrix[1][3], 'Value should be an object');
		assert.equal(testMap.characterMatrix[1][3].notes, "TestNotes", "Value should be TestNotes");
	});

	test("Testing the GetCharacterNotes method", function()
	{
		testMap.AddCharacter(1, 3, "TestOwner");
		testMap.SetCharacterNotes(1, 3, "TestNotes");
		let value = testMap.GetCharacterNotes(1, 3);

		assert.isArray(testMap.characterMatrix);
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.isObject(testMap.characterMatrix[1][3], 'Value should be an object');
		assert.equal(value, "TestNotes", "Value should be TestNotes");
	});

	test("Testing the AddToHeight method", function()
	{
		testMap.AddToHeight(1, 3, 2)

		assert.isArray(testMap.heightMap);
		assert.lengthOf(testMap.heightMap, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.heightMap[0], 125, "Length of the Y dimension should be 125");
		assert.equal(testMap.heightMap[1][3], 3, "Value should be 3");
	});

	test("Testing the AddNewRegion method", function()
	{
		testMap.AddNewRegion("Test Region");

		assert.isArray(testMap.hiddenRegions);
		assert.lengthOf(testMap.hiddenRegions, 1, "Value should be 1");
		assert.equal(testMap.hiddenRegions[0].name, "Test Region", "Value should be Test Region");
	});

	test("Testing the RemoveHiddenRegion method", function()
	{
		testMap.AddNewRegion("Region To Remove");
		testMap.AddNewRegion("Test Region");

		testMap.RemoveHiddenRegion("Region To Remove");

		assert.isArray(testMap.hiddenRegions);
		assert.lengthOf(testMap.hiddenRegions, 1, "Value should be 1");
		assert.equal(testMap.hiddenRegions[0].name, "Test Region", "Value should be Test Region");
	});

	test("Testing the RevealHiddenRegion method", function()
	{
		testMap.AddNewRegion("Test Region");

		assert.isTrue(testMap.hiddenRegions[0].GetIsHidden());
		testMap.RevealHiddenRegion("Test Region", false);
		assert.isFalse(testMap.hiddenRegions[0].GetIsHidden());
	});

	test("Testing the AddBlockToHiddenRegion method", function()
	{
		testMap.AddNewRegion("Test Region");

		testMap.AddBlockToHiddenRegion(1, 2, "Test Region");

		assert.lengthOf(testMap.hiddenRegions[0].hiddenBlocks, 1);
		assert.equal(testMap.hiddenRegions[0].hiddenBlocks[0].x, 1, "Value should be 1");
		assert.equal(testMap.hiddenRegions[0].hiddenBlocks[0].y, 2, "Value should be 1");
	});

	test("Testing the RemoveBlockFromHiddenRegion method", function()
	{
		testMap.AddNewRegion("Test Region");

		testMap.AddBlockToHiddenRegion(1, 2, "Test Region");
		testMap.AddBlockToHiddenRegion(3, 4, "Test Region");
		testMap.RemoveBlockFromHiddenRegion(1, 2, "Test Region");

		assert.lengthOf(testMap.hiddenRegions[0].hiddenBlocks, 1);
		assert.equal(testMap.hiddenRegions[0].hiddenBlocks[0].x, 3, "Value should be 3");
		assert.equal(testMap.hiddenRegions[0].hiddenBlocks[0].y, 4, "Value should be 4");
	});

	test("Testing the LoadFromRecord method", function()
	{
		let mapToCopy = new Map();
		mapToCopy._id = 1;
		mapToCopy.GenerateNewMap(xDimension, yDimension);

		mapToCopy.AddNewRegion("Test Region");
		mapToCopy.AddBlockToHiddenRegion(1, 2, "Test Region");
		mapToCopy.AddToHeight(1, 2, 2);
		mapToCopy.SetDescription(1, 2, "Test Description");
		mapToCopy.AddCharacter(1, 2, "Test Owner");

		testMap.LoadFromRecord(mapToCopy);

		assert.lengthOf(testMap.heightMap, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.heightMap[0], 125, "Length of the Y dimension should be 125");
		assert.lengthOf(testMap.characterMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.characterMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.lengthOf(testMap.detailMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.detailMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.lengthOf(testMap.hiddenBlockMatrix, 125, "Length of the X dimension should be 125");
		assert.lengthOf(testMap.hiddenBlockMatrix[0], 125, "Length of the Y dimension should be 125");
		assert.lengthOf(testMap.colourArray, 46878, "Length should be 46878");
		assert.lengthOf(testMap.hiddenRegions, 1);

		assert.equal(testMap.hiddenRegions[0].name, "Test Region");
		assert.equal(testMap.hiddenRegions[0].hiddenBlocks[0].x, 1, "Value should be 1");
		assert.equal(testMap.hiddenRegions[0].hiddenBlocks[0].y, 2, "Value should be 2");
		assert.equal(testMap.heightMap[1][2], 3, "Value should be 3");
		assert.equal(testMap.detailMatrix[1][2], "Test Description", "Value should be Test Description");
		assert.equal(testMap.characterMatrix[1][2].owner, "Test Owner", "Value should be Test Owner");
		assert.equal(testMap.characterMatrix[1][2].name, "New Character", "Value should be New Character");		
	});
});