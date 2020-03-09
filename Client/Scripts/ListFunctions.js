$(document).ready(function()
{
	PopulateMapList();
});

function LoadMap(mapID)
{
    return null;
}

function PopulateMapList()
{
    let container = document.querySelector('#map_list');

    $.get("maplist", function(data, status)
    {
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
                console.log(editButton.value);
            });
        }
    });
}