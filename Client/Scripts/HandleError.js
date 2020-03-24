let alertModal;

$(document).ready(function()
{
	alertModal = new AlertModal();
	HandleAlert();
});

function HandleAlert()
{
	// Retrieve the alert cookie
	let alertMessage = $.cookie("Alert");
	
	// If the cookie exists, display an alert
	if (alertMessage != null)
	{
		alertModal.Show(alertMessage);
		$.removeCookie("Alert");
	}
}