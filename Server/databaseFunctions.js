// Node package require statements
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');

// Require custom node modules
const Validator = require('./Validator');

// Number of salt rounds for bcrypt to use
const saltRounds = 10;

module.exports = class MongoConnection
{
	constructor(url)
	{
		this.url = url;
	}
	
	/*
	* Inserts a single user account record to the database.
	* @Param inputData The user account object to insert into the database.
	*/
	AddUserAccount(inputData)
	{		
		// Create a local variable for the URL. The Promise seems to be unable to access the properties of the class.
		let promiseURL = this.url;
		
		// Create and return a new promise for a later retrieved value
		return new Promise(function(resolve, reject)
		{	
			// Validate the user account details and retrieve validation data
			let validator = new Validator();
			let validationResults = validator.ValidateUserAccount(inputData);
			
			for (let key in validationResults)
			{
				if (!validationResults[key])
				{
					reject(validationResults);
					return;
				}
			}
				
			// Set up a DB event handler for connections
			MongoClient.connect(promiseURL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(function(dbResponse)
			{
				// The specific database to access
				var dbObject = dbResponse.db("map_manager_db");
				
				// Create a query based on input parameters
				let query = { username: inputData.username };
				
				// Finds and returns a single entry that matches the query
				dbObject.collection("user_accounts").findOne(query).then(function(response)
				{
					// If no records are retrieved, then the username is available
					if (response == null)
					{
						// Hash the input password before storing it in the database
						bcrypt.hash(inputData.password, saltRounds).then(function(result)
						{
							// Set the new hashed password as the input data
							inputData.password = result;
						
							// Inserts a new record into the database
							dbObject.collection("user_accounts").insertOne(inputData).then(function(response)
							{	
								// Close the connection and resolve the promise with the returned responses
								dbResponse.close();
								resolve(response);
							})
							.catch(function (error) 
							{
								// Close the connection and reject the promise and return the error
								dbResponse.close();
								reject(error);
								return;
							});
						})
						.catch(function (error) 
						{
							reject(error);
							return;
						});
					}
					else
					{
						// Reject the promise as the username is taken
						validationResults.usernameUnique = false;
						dbResponse.close();
						reject(validationResults);
						return;
					}
				})
				.catch(function (error) 
				{
					// Close the connection and reject the promise and return the error
					dbResponse.close();
					reject(error);
					return;
				});
			})
			.catch(function(error)
			{
				reject(error);
				return;
			});	
		});
	}
}