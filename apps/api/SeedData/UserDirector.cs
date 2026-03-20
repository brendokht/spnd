namespace Api.SeedData;

public class UserDirector
{
    private IUserBuilder _builder = default!;

    public IUserBuilder Builder
    {
        set { this._builder = value; }
    }

    public void BuildEmailUser(string email)
    {
        this._builder.SetEmail(email);
        this._builder.SetEmailProvider();
    }

    public void BuildGoogleUser(string email)
    {
        this._builder.SetEmail(email);
        this._builder.SetGoogleProvider();
    }
}