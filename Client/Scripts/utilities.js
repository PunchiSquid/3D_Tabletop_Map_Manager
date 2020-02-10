function RetrieveURLParameter(parameter)
{
	// Initialise interface to search for URL parameters
	let searchParameters = new URLSearchParams(window.location.search);
	
	// if the URL has the parameter, return it, otherwise return null
	if (searchParameters.has(parameter))
	{
		return searchParameters.get(parameter);
	}
	else
	{
		return null;
	}
}