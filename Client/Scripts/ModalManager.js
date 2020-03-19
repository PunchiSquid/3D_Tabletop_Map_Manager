class NewMapModal
{
    constructor()
    {
        this.GenerateHTML();

        this.newButton = document.getElementById("newButton");

        this.closeButton.addEventListener('click', this.Hide.bind(this));
        this.submitButton.addEventListener('click', this.Submit.bind(this));
        this.newButton.addEventListener('click', this.Show.bind(this));
    }

    /*
	* Generate the modal
	*/
    GenerateHTML()
    {
        this.modal = document.createElement("div");
        this.modal.id = "create_map_modal";
        this.modal.className = "my-modal-content";

        let modalHeader = document.createElement("div");
        modalHeader.className = "my-modal-header";

        this.closeButton = document.createElement("span");
        this.closeButton.id = "my-modal-close";
        this.closeButton.className = "my-modal-close";
        this.closeButton.textContent = "×";

        let headerContent = document.createElement("h2");
        headerContent.textContent = "Enter Map Details";

        let modalBody = document.createElement("div");
        modalBody.className = "my-modal-body";

        let nameLabel = document.createElement("p");
        nameLabel.textContent = "Name:";

        let nameInput = document.createElement("input");
        nameInput.setAttribute("type", "text");
        nameInput.setAttribute("name", "name");
        nameInput.id = "map_name";

        let descriptionLabel = document.createElement("p");
        descriptionLabel.textContent = "Description:";

        let descriptionInput = document.createElement("textarea");
        descriptionInput.setAttribute("name", "description");
        descriptionInput.id = "map_description";

        this.submitButton = document.createElement("button");
        this.submitButton.id = "create_map_modal_submit";
        this.submitButton.textContent = "Create Map";

        document.body.appendChild(this.modal);
        this.modal.appendChild(modalHeader);
        modalHeader.appendChild(this.closeButton);
        modalHeader.appendChild(headerContent);
		this.modal.appendChild(modalBody);
        modalBody.appendChild(nameLabel);
        modalBody.appendChild(nameInput);
        modalBody.appendChild(document.createElement("br"));
        modalBody.appendChild(descriptionLabel);
        modalBody.appendChild(descriptionInput);
        modalBody.appendChild(document.createElement("br"));
        modalBody.appendChild(document.createElement("br"));
        modalBody.appendChild(this.submitButton);
    }

    /*
	* Show the modal
	*/
    Show()
    {
        this.modal.classList.toggle('transition');
    }

    /*
	* Hide the modal
	*/
    Hide()
    {
        this.modal.classList.toggle('transition');
    }

    /*
	* Submit the new map form and generate a new map
	*/
    Submit()
    {
        // Retrieve elements
        let nameElement = document.getElementById("map_name");
        let descriptionElement = document.getElementById("map_description");

        // Disable form elements
        nameElement.disabled = true;
        descriptionElement.disabled = true
        this.submitButton.disabled = true;
        this.closeButton.disabled = true;

        // Create a new map with the chosen values
        NewMap(nameElement.value, descriptionElement.value);
    }
}

class ProcessModal
{
    constructor()
    {
        this.GenerateHTML();
    }

    /*
	* Generate the modal
	*/
    GenerateHTML()
    {
        this.modal = document.createElement("div");
        this.modal.id = "process_modal";
        this.modal.className = "my-modal-content";

        let modalHeader = document.createElement("div");
        modalHeader.className = "my-modal-header";

        let headerContent = document.createElement("h2");
        headerContent.textContent = "Alert";

        let modalBody = document.createElement("div");
        modalBody.className = "my-modal-body";

        this.message = document.createElement("p");
        this.message.id = "process_modal_message";
        this.message.textContent = "Placeholder";

        document.body.appendChild(this.modal);
        this.modal.appendChild(modalHeader);
        modalHeader.appendChild(headerContent);
		this.modal.appendChild(modalBody);
		modalBody.appendChild(this.message);
    }

    /*
    * Show the modal, displaying a specific message
    * @Param text The text message to display
	*/
    Show(text)
    {
        this.message.textContent = text;
        this.modal.classList.toggle('transition');
    }

    Hide()
    {
        this.modal.classList.toggle("transition");
    }
}

class AlertModal
{
    constructor()
    {
        this.GenerateHTML();
        this.closeButton.addEventListener('click', this.Hide.bind(this));
    }

    /*
	* Generate the modal
	*/
    GenerateHTML()
    {
        this.modal = document.createElement("div");
        this.modal.id = "alert_modal";
        this.modal.className = "my-modal-content";

        let modalHeader = document.createElement("div");
        modalHeader.className = "my-modal-header";

        let headerContent = document.createElement("h2");
        headerContent.textContent = "Alert";

        let modalBody = document.createElement("div");
        modalBody.className = "my-modal-body";

        this.message = document.createElement("p");
        this.message.id = "alert_modal_message";
        this.message.textContent = "Placeholder";

        this.closeButton = document.createElement("button");
        this.closeButton.id = "alert_modal_close";
        this.closeButton.textContent = "Ok";

        document.body.appendChild(this.modal);
        this.modal.appendChild(modalHeader);
        modalHeader.appendChild(headerContent);
		this.modal.appendChild(modalBody);
		modalBody.appendChild(this.message);
		modalBody.appendChild(this.closeButton);
    }

    /*
    * Show the modal, displaying a specific message
    * @Param text The text message to display
	*/
    Show(text)
    {
        this.message.textContent = text;
        this.modal.classList.toggle('transition');
    }

    /*
	* Hide the modal
	*/
    Hide()
    {
        this.modal.classList.toggle("transition");
    }
}