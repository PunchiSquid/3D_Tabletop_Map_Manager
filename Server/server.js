// Node package require statements
const express = require("express");
const http = require("http");

// Port used to listen for connections 
// If hosted on Heroku, the port is defined by the service
// If hosted locally the port is 9000
const port = process.env.PORT || 9000;

// Initialise the Express app.
app = express();

// Create HTTP server.
server = http.createServer(app);

// Default route
app.get("/", function(request, response)
{
	response.send("Hello World");
});

// Listen for connections
server.listen(port, function()
{
	console.log("Listening on " + port);
});