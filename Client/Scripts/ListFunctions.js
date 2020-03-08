$(document).ready(function()
{
	PopulateMapList();
});

function PopulateMapList()
{
    let container = document.querySelector('#map_list');

    $.get("maplist", function(data, status)
    {
        for (let i = 0; i < data.length; i++)
        {
            let text = document.createElement("p");

            if (data[i].name != null)
            {
                text.textContent = data[i].name;
            }
            else
            {
                text.textContent = "No name.";
            }
            
            container.appendChild(text);
        }
    });
}