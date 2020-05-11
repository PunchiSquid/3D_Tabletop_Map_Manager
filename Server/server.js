// Node package require statements
const express = require("express");
const cookieParser = require('cookie-parser');
const http = require("http");
const fs = require('fs');
const app = express();
const MongoClient = require('mongodb').MongoClient;

// Require statements for server hosting and websockets
const server = require("http").Server(app);
const io = require('socket.io')(server, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
            "Access-Control-Allow-Credentials": true
        };
        res.writeHead(200, headers);
        res.end();
    }
});

// Require custom node modules
const MongoConnection = require('./databaseFunctions');
const Map = require(__dirname + './../Client/Scripts/Map.js');

// Load connection strings
let rawdata = fs.readFileSync(__dirname + '/connection.json');
let connection = JSON.parse(rawdata);

// Port used to listen for connections 
// If hosted on Heroku, the port is defined by the service
// If hosted locally the port is 9000
const serverPort = process.env.PORT || 9000;

// MongoDB URI
const uri = connection.uri;

// Set up express to parse JSON data from a request body
app.use(express.json({limit: '50MB', parameterLimit: 1000000, extended: true}));
app.use(express.urlencoded({limit: '50MB', parameterLimit: 1000000, extended: true }));

// Set up express to parse cookies
app.use(cookieParser());

// Set up session variables
const session = require("express-session")
({
	secret: connection.session,
	resave: true,
	saveUninitialized: true
});

const sharedSession = require("express-socket.io-session");

// Set up static routes
app.use(express.static(__dirname + '/../Client/Scripts/'));
app.use(express.static(__dirname + '/../Client/Stylesheets/'));
app.use(express.static(__dirname + '/../External Libraries/'));
app.use(express.static(__dirname + '/../Resources/'));

// Use express-sessions middleware
app.use(session);

io.use(sharedSession(session, 
{
	autoSave: true
}));

/****************************/
/* Websockets functionality */
/****************************/

io.on("connection", function (socket)
{
	socket.on("create_session", function()
	{
		// Set the host ID of the room as the socket ID of the creating user
		io.sockets.adapter.rooms[socket.id].hostID = socket.id;
		socket.currentSession = socket.id;
		socket.emit("session_created_successfully");
	});

	socket.on("join_session", function(sessionID)
	{
		// Join the room, then set the current session ID for easy access
		socket.join(sessionID);
		socket.currentSession = sessionID;
		socket.emit("session_joined_successfully");
	})

	socket.on("client_request_map", function()
	{
		// Direct a client request to the host
		socket.to(socket.currentSession).emit("server_request_map");
	});

	socket.on("host_send_map", function(map)
	{
		// Direct a host map file to all clients
		socket.to(socket.currentSession).emit("server_send_map", map);
	});
});

/***************/
/* Page Routes */
/***************/

// Default route. Directs to a log-in page
app.get("/", function(request, response)
{
	if (request.session.userID)
	{
		// Check the username in the session exists on the database
		let connection = new MongoConnection(uri);
		connection.GetUserAccountByUsername(request.session.username).then(function(res)
		{
			if (res)
			{
				response.redirect("/list");
			}
			else
			{
				// Reset user session if the account does not exist. 
				request.session.destroy();
				response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
				response.redirect("/");
			}
		})
		.catch(function(err)
		{
			// Reset user session if the account does not exist. 
			request.session.destroy();
			response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
			response.redirect("/");
		});
	}
	else
	{
		response.sendFile("/Client/login.html", {"root": __dirname + "/../"});
	}
});

// Registration route
app.get("/register", function(request, response)
{
	response.sendFile("/Client/register.html", {"root": __dirname + "/../"});
});

// List route
app.get("/list", function(request, response)
{
	if (request.session.userID)
	{
		// Check the username in the session exists on the database
		let connection = new MongoConnection(uri);
		connection.GetUserAccountByUsername(request.session.username).then(function(res)
		{
			if (res)
			{
				response.sendFile("/Client/list.html", {"root": __dirname + "/../"});
			}
			else
			{
				// Reset user session if the account does not exist. 
				request.session.destroy();
				response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
				response.redirect("/");
			}
		})
		.catch(function(err)
		{
			response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
			response.redirect("/");
		});
	}
	else
	{
		response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
		response.redirect("/");
	}
});

// Host and editor route
app.get("/editor/:mapID", function(request, response)
{
	if (request.session.userID)
	{
		// Check the username in the session exists on the database
		let connection = new MongoConnection(uri);
		connection.GetUserAccountByUsername(request.session.username).then(function(res)
		{
			if (res)
			{
				if (request.cookies.SessionType == "client")
				{
					response.sendFile("/Client/mapClient.html", {"root": __dirname + "/../"});
				}
				else
				{
					response.sendFile("/Client/map.html", {"root": __dirname + "/../"});
				}
			}
			else
			{
				// Reset user session if the account does not exist. 
				request.session.destroy();
				response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
				response.redirect("/");
			}
		})
		.catch(function(err)
		{
			response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
			response.redirect("/");
		});
	}
	else
	{
		response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
		response.redirect("/");
	}
});

// Testing route
app.get("/test", function(request, response)
{
	response.sendFile("/Client/secure.html", {"root": __dirname + "/../"});
});

/**************/
/* API Routes */
/**************/

app.get("/logout", function(request, response)
{
	if (request.session)
	{
		request.session.destroy();
		response.send(null);
	}
});

app.get("/getUser", function(request, response)
{
	if (request.session.username)
	{
		response.send(request.session.username);
	}
	else
	{
		response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
		response.send(null);
	}
});

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
		if (res.result == true)
		{
			request.session.username = request.body.username;
			request.session.userID = res._id;
			response.redirect("/list");
		}
		else
		{
			response.cookie("Alert", "Log in unsuccessful. Please try again with the correct details.", {maxAge: 30000});
			response.redirect("/");
		}
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
		emailAddress: body.emailAddress,
		mapRecords: new Array()
	}
	
	// Create a second JSON object for user authentication
	let authenticationData = 
	{
		username: body.username, 
		password: body.password
	};
	
	// Add the record
	connection.AddUserAccount(inputData).then(function(res)
	{		
		response.cookie("Alert", "Registration Successful! Please log in.", {maxAge: 30000});
		response.redirect("/");
	})
	.catch(function(err)
	{
		if (!err.usernamePresent)
		{
			response.cookie("Alert", "No username entered. Please enter a username.", {maxAge: 30000});
			response.redirect("/register");
		}
		else if (!err.passwordPresent)
		{
			response.cookie("Alert", "No password entered. Please enter a password.", {maxAge: 30000});
			response.redirect("/register");
		}
		else if (!err.emailAddressPresent)
		{
			response.cookie("Alert", "No email address entered. Please enter an email address.", {maxAge: 30000});
			response.redirect("/register");
		}
		else if (!err.emailAddessValid)
		{
			response.cookie("Alert", "The email address entered is invalid. Please use a valid email address.", {maxAge: 30000});
			response.redirect("/register");
		}
		else if (!err.usernameUnique)
		{
			response.cookie("Alert", "The username is taken, please use a different username.", {maxAge: 30000});
			response.redirect("/register");
		}
		else
		{
			response.cookie("Alert", "Error received: " + err + ".", {maxAge: 30000});
			response.redirect("/register");
		}
	});
});

// Route to retrieve a list of map records
app.get("/maplist", function(request, response)
{
	if (request.session.userID)
	{
		// Create a MongoDB connection
		let connection = new MongoConnection(uri);

		// Retrieve records
		connection.GetMapRecords(request.session.userID).then(function(res)
		{
			response.cookie("Alert", "Maps retrieved!", {maxAge: 30000});
			response.send(res);
		})
		.catch(function(err)
		{
			response.cookie("Alert", "Error received: " + err + ".", {maxAge: 30000});
			response.redirect("/");
		});
	}
	else
	{
		response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
		response.redirect("/");
	}
});

// Route to insert new map record
app.post("/maps", function(request, response)
{
	if (request.session.userID)
	{
		// Create a MongoDB connection
		let body = request.body;
		let connection = new MongoConnection(uri);

		// Convert request body data into a more easily usable object form
		let inputMap = JSON.parse(body.map);
		let inputUserID = request.session.userID;

		// Add the record
		connection.AddMapRecord(inputMap, inputUserID).then(function(res)
		{
			response.cookie("Alert", "New Map Generated!", {maxAge: 30000});
			response.send(res.insertedId);
		})
		.catch(function(err)
		{
			response.cookie("Alert", "Error received: " + err + ".", {maxAge: 30000});
			response.redirect("/");
		});
	}
	else
	{
		response.cookie("Alert", "Session invalid. Please log in.", {maxAge: 30000});
		response.redirect("/");
	}
});

// Route to modify a map record
app.get("/map/:mapID", function(request, response)
{
	// Create a MongoDB connection
	let connection = new MongoConnection(uri);

	// Add the record
	connection.GetMapRecord(request.params.mapID).then(function(res)
	{
		response.cookie("Alert", "Map Retrieved Successfully!", {maxAge: 30000});
		response.send(res);
	})
	.catch(function(err)
	{
		response.cookie("Alert", "Error received: " + err + ".", {maxAge: 30000});
		response.redirect("/");
	});
});

// Route to modify a map record
app.put("/map", function(request, response)
{
	// Create a MongoDB connection
	let body = request.body;
	let connection = new MongoConnection(uri);

	// Convert request body data into a more easily usable object form
	let inputMap = JSON.parse(body.map);

	// Add the record
	connection.UpdateMapRecord(inputMap).then(function(res)
	{
		response.cookie("Alert", "Map Modified Successfully!", {maxAge: 30000});
		response.send("Success");
	})
	.catch(function(err)
	{
		response.cookie("Alert", "Error received: " + err + ".", {maxAge: 30000});
		response.redirect("/");
	});
});

// Listen for connections
server.listen(serverPort, function()
{
	console.log("Listening for HTTP requests on " + serverPort);
});