// Assertion library
const assert = require('chai').assert;
const THREE = require('three');

// Model classes to test
const Character = require('./../Client/Scripts/Character');
const HiddenRegion = require('./../Client/Scripts/HiddenRegion');

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