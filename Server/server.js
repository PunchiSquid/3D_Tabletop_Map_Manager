// Node package require statements
const express = require("express");
const http = require("http");
const url = require("url");
const MongoClient = require('mongodb').MongoClient;

// Require custom node modules
const MongoConnection = require('./databaseFunctions');

// Port used to listen for connections 
// If hosted on Heroku, the port is defined by the service
// If hosted locally the port is 9000
const port = process.env.PORT || 9000;

// Initialise the Express app.
app = express();

// Create HTTP server.
server = http.createServer(app);

// Set up express to parse JSON data from a request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up static routes
app.use(express.static('../Client/Scripts/'));

/***************/
/* Page Routes */
/***************/

// Default route. Directs to a log-in page
app.get("/", function(request, response)
{
	response.sendFile("/Client/login.html", {"root": __dirname + "/../"});
});

// Placeholder secure route
app.get("/secure", function(request, response)
{
	response.send("Secure Page Accessed");
});

/**************/
/* API Routes */
/**************/

// Route to authenticate a user record
app.post("/login", function(request, response)
{
	// Retrieve request body and create a MongoDB connection
	let body = request.body;	
	let connection = new MongoConnection(uri);
	
	// Convert request body data into easily usable JSON
	let inputData = 
	{
		username: body.username,
		password: body.password,
	}
	
	// Authenticate the record
	connection.AuthenticateAccount(inputData).then(function(res)
	{
		response.send(res);
	})
	.catch(function(err)
	{
		response.send(err);
	});
});

// Route to insert new user account record
app.post("/user-accounts", function(request, response)
{
	// Retrieve request body and create a MongoDB connection
	let body = request.body;	
	let connection = new MongoConnection(uri);
	
	// Convert request body data into easily usable JSON
	let inputData = 
	{
		username: body.username,
		password: body.password,
		emailAddress: body.emailAddress
	}
	
	// Add the record
	connection.AddUserAccount(inputData).then(function(res)
	{
		response.send(res);
	})
	.catch(function(err)
	{
		response.send(err);
	});
});

// HelloWorld route
app.get("/HelloWorld", function(request, response)
{
	// Set up connection variables
	var client = new MongoClient(uri, { useNewUrlParser: true });
	
	// Connect to the MongoDB instance
	client.connect().then(function(dbResponse)
	{
		// Retrieve database record
		var dbObject = dbResponse.db("HelloWorld");
		
		try
		{
			// Create the "HelloWorld" collection
			dbObject.createCollection("HelloWorld").then(function(res)
			{
				// Insert test record
				dbObject.collection("HelloWorld").insertOne( {data: "Hello World"} ).then(function(res)
				{
					client.close();
					response.send(res);	
				})
				.catch(function(err)
				{
					client.close();
					response.send("Failed on insertion " + err);
				});
			})
			.catch(function(err)
			{
				client.close();
				response.send("Failed on creation " + err);
			});
		}
		catch(err)
		{
			client.close();
			response.send("Exception caught " + err);
			
		};
	})
	.catch(function(err)
	{
		client.close();
		response.send("Failed on MongoDB connection " + err);
	});
});

// Listen for connections
server.listen(port, function()
{
	console.log("Listening on " + port);
});