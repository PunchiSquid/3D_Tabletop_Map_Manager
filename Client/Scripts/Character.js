class Character
{
    constructor()
    {
        this.SetName("New Character");
        this.SetNotes("");        
    }

    SetName(name)
    {
        this.name = name;
    }

    GetName()
    {
        return(this.name);
    }

    SetNotes(notes)
    {
        this.notes = notes;
    }

    GetNotes()
    {
        return(this.notes);
    }
}