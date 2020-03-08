// MongoClient node API
const MongoClient = require("mongodb").MongoClient;
const fs = require('fs');

// Load connection strings
let rawdata = fs.readFileSync(__dirname + '\\connection.json');
let connection = JSON.parse(rawdata);

// MongoDB URI
const uri = connection.uri;

function CreateUserAccountCollection()
{		
	// Define validation for the user_accounts table
	let validationSchema = 
	{
		validator:
		{
			$jsonSchema:
			{
				required: ["username", "password", "emailAddress"],
				properties:
				{
					username: 
					{
						bsonType: "string",
						description: "Must be a string and is required"
					},
					
					password: 
					{
						bsonType: "string",
						description: "Must be a string and is required"
					},
					
					emailAddress: 
					{
						bsonType: "string",
						description: "Must be a string and is required"
					}
				}
			}
		},
		validationLevel: "strict",
		validationAction: "error"
	}
	
	// Create and return a new promise for a later retrieved value
	return new Promise(function(resolve, reject)
	{
		// Set up a DB event handler for connections
		MongoClient.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }).then(function(dbResponse) 
		{	
			// The specific database to access
			var dbObject = dbResponse.db("map_manager_db");
			
			// Create a new collection with the defined validation
			dbObject.createCollection("user_accounts", validationSchema).then(function(res)
			{
				// Ensure the username field on the user_accounts is unique
				dbObject.createIndex("user_accounts", {"username": 1}, { unique: true }).then(function(res)
				{
					// Insert placeholder record into the new collection
					dbObject.collection("user_accounts").insertOne({ username: "TestUser", password: "TestPassword", emailAddress: "test@test.te.st", mapRecords: [] }).then(function(res)
					{
						resolve("Completed creation of user_accounts and insertion of a placeholder record");
						dbResponse.close();
						return;
					})
					.catch(function(err)
					{
						reject(err);
						dbResponse.close();
						return;
					});
				})
				.catch(function(err)
				{
					reject(err);
					dbResponse.close();
					return;
				});
			})
			.catch(function(err)
			{
				reject(err);
				dbResponse.close();
				return;
			});
		})
		.catch(function(err)
		{
			reject(err);
			dbResponse.close();
			return;
		});
	});
}

// Create the collection and output the server response
CreateUserAccountCollection().then(function(res)
{
	console.log(res);
})
.catch(function(err)
{
	console.log(err);
});