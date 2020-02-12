$(document).ready(function()
{
	HandleAlert();
});

function HandleAlert()
{
	// Retrieve the alert cookie
	let alertMessage = $.cookie("Alert");
	
	// If the cookie exists, display an alert
	if (alertMessage != null)
	{
		alert(alertMessage);
		$.removeCookie("Alert");
	}
}