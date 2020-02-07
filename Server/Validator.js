module.exports = class Validator
{
	/*
	* Validates the input data for the create/update operations on the user_accounts.
	* @Param inputData The user account JSON object to validate.
	*/
	ValidateUserAccount(inputData)
	{
		// JSON for validation results
		let validationResults = 
		{
			usernamePresent: true,
			passwordPresent: true,
			emailAddressPresent: true,
			emailAddressValid: false,
			usernameUnique: true
		}
		
		// Check fields are not null
		if (inputData.username == null)
		{
			validationResults.usernamePresent = false;
		}
		
		if (inputData.password == null)
		{
			validationResults.passwordPresent = false;
		}
		
		if (inputData.emailAddress == null)
		{
			validationResults.emailAddressPresent = false;
		}
		else
		{
			// Ensure the email address matches the format defined in RFC 5322
			let emailRegex = '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';
			
			if (inputData.emailAddress.match(emailRegex))
			{
				validationResults.emailAddressValid = true;
			}
		}
		
		return validationResults;
	}
}