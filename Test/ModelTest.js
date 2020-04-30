// Assertion library
const assert = require('chai').assert;

// Model classes to test
const Character = require('./../Client/Scripts/Character');

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