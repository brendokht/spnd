namespace Api.SeedData;

public interface IUserBuilder
{
    void SetEmail(string email);
    void SetEmailProvider();
    void SetGoogleProvider();
}