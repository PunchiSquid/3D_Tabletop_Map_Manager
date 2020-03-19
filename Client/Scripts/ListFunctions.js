$(document).ready(function()
{
    let newMapModal = new NewMapModal();
	PopulateMapList();
});

function PopulateMapList()
{
    var modal = new ProcessModal();
	modal.Show("Loading map list, please wait.");

    let container = document.querySelector('#map_list');

    $.get("maplist", function(data, status)
    {
        modal.Hide();

        for (let i = 0; i < data.length; i++)
        {
            let outerContainer = document.createElement("div");
            outerContainer.setAttribute("class", "outerContainer");
            container.appendChild(outerContainer);

            let name = document.createElement("h3");
            name.setAttribute("class", "name");
            outerContainer.appendChild(name);

            let innerContainer = document.createElement("div");
            innerContainer.setAttribute("class", "innerContainer");
            outerContainer.appendChild(innerContainer);

            let description = document.createElement("p");
            description.setAttribute("class", "description");
            innerContainer.appendChild(description);

            let buttonContainer = document.createElement("div");
            buttonContainer.setAttribute("class", "buttonContainer");
            innerContainer.appendChild(buttonContainer);

            let editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.setAttribute("value", data[i]._id);
            editButton.setAttribute("href", "/");
            buttonContainer.appendChild(editButton);

            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.setAttribute("value", data[i]._id);
            buttonContainer.appendChild(deleteButton);

            if (data[i].name != null)
            {
                name.textContent = data[i].name;
            }
            else
            {
                name.textContent = "No Name";
            }

            if (data[i].description != null)
            {
                description.textContent = data[i].description;
            }
            else
            {
                description.textContent = "No description.";
            }

            $(editButton).click(function()
            {
                window.location.href = "/editor/" + editButton.value;
                console.log(editButton.value);
            });
        }
    });
}

function NewMap(name, description)
{
	let map = new Map();
	map.GenerateNewMap(125, 125);
	map.name = name;
    map.description = description;
    
	let json = JSON.stringify(map);

	let object = 
	{
		"map": json,
	};

    var request = $.post("/maps", object);

    // Upon success log to the console
    request.done(function(data, status)
    {
        window.location.href = "/editor/" + data;
    });

    // Upon failure reject the promise
    request.fail(function(errorObject, string, errorString)
    {
        console.log(errorString);
    });
}