// Assertion library
const assert = require('chai').assert;

// Necessary Node modules
const fs = require('fs');

// Necessary custom modules
const MongoConnection = require('./../Server/databaseFunctions');

// Model classes for inserting into the database
const Character = require('./../Client/Scripts/Character');
const HiddenRegion = require('./../Client/Scripts/HiddenRegion');
const Map = require('./../Client/Scripts/Map');

// Load connection strings
let rawdata = fs.readFileSync(__dirname + './../Server/connection.json');
let connectionValues = JSON.parse(rawdata);

suite("Testing user account functions", function()
{
    let connection;
    let insertedId;

    let testAccount = 
    {
        username: "TestUser",
        password: "TestPassword",
        emailAddress: "email@test.com",
        mapRecords: new Array()
    };

    suiteSetup(function()
    {
        connection = new MongoConnection(connectionValues.uri);
    });

    test("Testing the AddUserAccount function", function(done)
    {
        const inputAccount = Object.assign({}, testAccount);

        let bacon = "🥓";

        connection.AddUserAccount(inputAccount).then(function(result)
        {
            insertedId = result.insertedId;
            assert.equal(result.insertedCount, 1, "Value of insertedCount should be 1.");

            done();
        })
        .catch(function(rejection)
        {
            assert.fail("Request rejected");
            done();
        }); 
    });

    test("Testing the GetUserAccountByUsername function", function(done)
    {
        const inputAccount = Object.assign({}, testAccount);
        
        connection.GetUserAccountByUsername(inputAccount.username).then(function(result)
        {
            assert.equal(result.username, inputAccount.username, "Value of username should match the input account username.");
            assert.equal(String(result._id), String(insertedId), "Value of _id should match the _id of the inserted record.");
            done();
        })
        .catch(function(rejection)
        {
            assert.fail("Request rejected");
            done();
        }); 
    });

    test("Testing the AuthenticateAccount function", function(done)
    {
        const inputAccount = Object.assign({}, testAccount);
        const input = {username: inputAccount.username, password: inputAccount.password};

        connection.AuthenticateAccount(input).then(function(result)
        {
            assert.isTrue(result.result);
            done();
        })
        .catch(function(rejection)
        {
            assert.fail("Request rejected");
            done();
        }); 
    });

    test("Testing the RemoveUserAccount function", function(done)
    {
        connection.RemoveUserAccount(insertedId).then(function(result)
        {
            assert.equal(result.deletedCount, 1, "Value of deletedCount should be 1.");
            done();
        })
        .catch(function(rejection)
        {
            assert.fail("Request rejected");
            done();
        });
    });
});

suite("Testing Map functions", function()
{
    let connection;
	let accountId;
	let mapId;
	let retrievedMap;

    suiteSetup(function(done)
    {
        connection = new MongoConnection(connectionValues.uri);

        let testAccount = 
        {
            username: "TestUser",
            password: "TestPassword",
            emailAddress: "email@test.com",
            mapRecords: new Array()
        };

        connection.AddUserAccount(testAccount).then(function(result)
        {
            accountId = result.insertedId;
            done();
        }); 
    });

    suiteTeardown(function(done)
    {
        connection.RemoveUserAccount(accountId).then(function(result)
        {
            connection = null;
            done();
        });
    });

	test("Testing the AddMapRecord function", function(done)
	{
		const map = new Map();
		map.GenerateNewMap(125, 125);
		map.name = "Test Name";
		map.description = "Test Description";

		connection.AddMapRecord(map, accountId).then(function(result)
		{
			assert.equal(result.insertedCount, 1, "Value of insertedCount should be 1");
			mapId = result.insertedId;
			done();
		})
		.catch(function(rejection)
		{
			assert.fail("Request rejected");
			done();
		});
	});

	test("Testing the GetMapRecord function", function(done)
	{
		connection.GetMapRecord(mapId).then(function(result)
		{
			retrievedMap = result;
			assert.equal(String(result._id), String(mapId), "Values of the id fields should be equal");
			assert.equal(result.name, "Test Name", "Value should be equal to Test Name");
			assert.equal(result.description, "Test Description", "Value should be equal to Test Description");
			done();
		})
		.catch(function(done)
		{
			assert.fail("Request rejected");
			done();
		})
	});

	test("Testing the GetMapRecords function", function(done)
	{
		const map = new Map();
		map.GenerateNewMap(125, 125);
		map.name = "Test Name";
		map.description = "Test Description";

		connection.AddMapRecord(map, accountId).then(function(result)
		{
			let secondMapId = result.insertedId;
			
			connection.GetMapRecords(accountId).then(function(result)
			{
				assert.equal(String(result[0]._id), String(mapId), "Value of map ids should match");
				assert.equal(String(result[1]._id), String(secondMapId), "Value of map ids should match");
				done();
			})
			.catch(function(done)
			{
				assert.fail("Request rejected");
				done();
			});
		})
		.catch(function(rejection)
		{
			assert.fail("Request rejected");
			done();
		});
	});

	test("Testing the UpdateMapRecord function", function(done)
	{
		retrievedMap.name = "New Name";

		connection.UpdateMapRecord(retrievedMap).then(function(result)
		{
			assert.equal(result.modifiedCount, 1, "Value of modifiedCount should be 1");
			done();
		})
		.catch(function(done)
		{
			assert.fail("Request rejected");
			done();
		});
	});
});