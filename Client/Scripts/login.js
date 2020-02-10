$(document).ready(function()
{
	HandleAuthenticationFailure();
});

function HandleAuthenticationFailure()
{
	if (RetrieveURLParameter("authfail") == "true")
	{
		alert("User details incorrect, please try again with correct details.");
	}
}