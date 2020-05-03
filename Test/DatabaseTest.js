// Assertion library
const assert = require('chai').assert;

// Necessary Node modules
const fs = require('fs');

// Necessary custom modules
const MongoConnection = require('./../Server/databaseFunctions');

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