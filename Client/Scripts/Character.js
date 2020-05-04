class Character
{
    constructor(owner)
    {
        this.owner = owner;
        this.name = "New Character";
        this.notes = "";
    }

    SetCharacterName(name)
    {
        if (name)
        {
            this.name = name;
        }
    }

    GetCharacterName()
    {
        return this.name;
    }

    SetCharacterNotes(notes)
    {
        if (notes)
        {
            this.notes = notes;
        }
    }

    GetCharacterNotes()
    {
        return this.notes;
    }

    GetCharacterOwner()
    {
        return this.owner;
    }
}

module.exports = Character;
