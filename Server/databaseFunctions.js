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
	* Retrieves a user account by the username input.
	* @Param inputUsername The username to find an account by.
	*/
	GetUserAccountByUsername(inputUsername)
	{
		// Create a local variable for the URL. The Promise seems to be unable to access the properties of the class.
		let promiseURL = this.url;
		
		// Create and return a new promise for a later retrieved value
		return new Promise(function(resolve, reject)
		{				
			// Set up a DB event handler for connections
			MongoClient.connect(promiseURL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(function(dbResponse)
			{
				// The specific database to access
				var dbObject = dbResponse.db("map_manager_db");
				
				// Create a query based on input parameters
				let query = { username: inputUsername };
				let projection = {projection: { "password": 0, "emailAddress": 0} }
				
				// Finds and returns a single entry that matches the query
				dbObject.collection("user_accounts").findOne(query, projection).then(function(response)
				{
					dbResponse.close()
					resolve(response);
					return;
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
	
	/*
	* Authenticates an input user account against the database.
	* @Param inputData The input user data to authenticate against the database.
	*/
	AuthenticateAccount(inputData)
	{		
		// Create a local variable for the URL. The Promise seems to be unable to access the properties of the class.
		let promiseURL = this.url;
		
		// Create and return a new promise for a later retrieved value
		return new Promise(function(resolve, reject)
		{				
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
					if (response == null)
					{
						dbResponse.close();
						resolve(false);
						return;
					}
					
					// Hash the input password before storing it in the database
					bcrypt.compare(inputData.password, response.password).then(function(result)
					{					
						let finalResponse = {_id: response._id, result: result};
						resolve(finalResponse);
					})
					.catch(function (error) 
					{
						dbResponse.close();
						reject(error);
						return;
					});
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

	/*
	* Inserts a single user account record to the database.
	* @Param inputData The user account object to insert into the database.
	*/
	AddMapRecord(inputMap, userID)
	{		
		// Create a local variable for the URL. The Promise seems to be unable to access the properties of the class.
		let promiseURL = this.url;
		
		// Create and return a new promise for a later retrieved value
		return new Promise(function(resolve, reject)
		{					
			// Set up a DB event handler for connections
			MongoClient.connect(promiseURL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(function(dbResponse)
			{
				// The specific database to access
				var dbObject = dbResponse.db("map_manager_db");

				// Inserts a new record into the database
				dbObject.collection("maps").insertOne(inputMap).then(function(insertResponse)
				{
					// Query to identify the record being modified
					let userQuery = { _id: ObjectID(userID) };

					// Query to push a new characterSheet object ID to an array on a userAccount object
					let addMapQuery = { $push: { "mapRecords": String(insertResponse.insertedId) } };

					dbObject.collection("user_accounts").updateOne(userQuery, addMapQuery).then(function(updateResponse)
					{
						if (updateResponse.modifiedCount == 1)
						{
							// Close the connection and resolve the promise with the returned responses
							dbResponse.close();
							resolve(insertResponse);
						}
						else
						{
							// Close the connection and reject the promise and return the error
							dbResponse.close();
							reject(updateResponse.modifiedCount);
							return;
						}
						
					});
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

	/*
	* Retrieves map records by the user _id input.
	* @Param inputUserID The user _id field to find records by.
	*/
	GetMapRecords(inputUserID)
	{
		// Create a local variable for the URL. The Promise seems to be unable to access the properties of the class.
		let promiseURL = this.url;
		
		// Create and return a new promise for a later retrieved value
		return new Promise(function(resolve, reject)
		{				
			// Set up a DB event handler for connections
			MongoClient.connect(promiseURL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(function(dbResponse)
			{
				// The specific database to access
				var dbObject = dbResponse.db("map_manager_db");
				
				// Create a query based on input parameters
				let query = { _id: ObjectID(inputUserID) };
				let projection = {projection: { "mapRecords": 1 } };
				
				// Finds and returns a single entry that matches the query
				dbObject.collection("user_accounts").findOne(query, projection).then(function(response)
				{
					// Retrieve the map record IDs from the account, then convert into a new query
					let mapRecordStrings = Array.from(response.mapRecords);
					let mapRecordObjectIDs = new Array();
					
					for (var i = 0; i < mapRecordStrings.length; i++)
					{
						mapRecordObjectIDs[i] = ObjectID(mapRecordStrings[i]);
					}
					
					// Retrieve a record corresponding to every ObjectID in the array
					let mapRecordQuery = {	_id: { $in: mapRecordObjectIDs } };
					let mapRecordProjection = {projection: { "_id": 1, "name": 1, "description": 1 }};
					
					// Retrieves map records from the database
					dbObject.collection("maps").find(mapRecordQuery, mapRecordProjection, function(error, cursor)
					{						
						if (error)
						{
							reject(error);
							dbResponse.close();
							return;
						}
						else
						{
							let resultArray = cursor.toArray();
							resolve(resultArray);
							dbResponse.close();
							return;
						}
					});
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