using System.Security.Claims;
using System.Text;

using Api.Data;
using Api.Data.Enums;
using Api.SeedData;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddCors();

builder.Services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(
            builder.Configuration.GetConnectionString("Database"),
            o =>
            {
                //Serialize/Deserialize TransactionType and RecurringFrequency 
                // between C# and Postgres at runtime when executing queries.
                o.MapEnum<TransactionType>("transaction_type", "public");
                o.MapEnum<RecurringFrequency>("recurring_frequency", "public");
            })
        .UseSnakeCaseNamingConvention());

var secret = builder.Configuration["Jwt:Secret"]!;
var issuer = builder.Configuration["Jwt:Issuer"]!;
var audience = builder.Configuration["Jwt:Audience"]!;

var isDev = builder.Environment.IsDevelopment();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = isDev
            ? DevTokenValidation()
            : ProdTokenValidation(secret, issuer, audience);

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                var logger = ctx.HttpContext.RequestServices
                    .GetRequiredService<ILogger<Program>>();
                Api.Logging.AuthLog.AuthenticationFailed(logger, ctx.Exception.Message);
                return Task.CompletedTask;
            },
            OnChallenge = ctx =>
            {
                var logger = ctx.HttpContext.RequestServices
                    .GetRequiredService<ILogger<Program>>();
                Api.Logging.AuthLog.Challenge(logger, ctx.Request.Path, ctx.Error, ctx.ErrorDescription);
                return Task.CompletedTask;
            },
            OnForbidden = ctx =>
            {
                var logger = ctx.HttpContext.RequestServices
                    .GetRequiredService<ILogger<Program>>();
                Api.Logging.AuthLog.Forbidden(logger, ctx.Request.Path);
                return Task.CompletedTask;
            },
        };
    });

builder.Services.AddAuthorization(options =>
{
    if (builder.Environment.IsDevelopment())
    {
        options.DefaultPolicy = new AuthorizationPolicyBuilder()
            .RequireAssertion(_ => true)
            .Build();
    }
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // Automatically applies any pending EF migrations on startup
    await db.Database.MigrateAsync().ConfigureAwait(false);

    if (app.Environment.IsDevelopment())
    {
        var seederLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        await DatabaseSeeder.SeedAsync(db, seederLogger).ConfigureAwait(false);
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors(policy => policy
    //TODO: Restrict this when we go to production
    .WithOrigins("http://localhost:3000")
    .AllowAnyHeader()
    .AllowAnyMethod());

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/me", (ClaimsPrincipal user) => new
{
    UserId = user.FindFirstValue("sub"),
    Email = user.FindFirstValue("email"),
}).RequireAuthorization();

await app.RunAsync().ConfigureAwait(false);

// Local Supabase issues JWTs with a kid that won't match a statically configured key,
// causing key resolution to fail before signature validation runs.
// Skip this entirely in dev; claims are still populated from the token payload.
static TokenValidationParameters DevTokenValidation() => new()
{
    ValidateIssuerSigningKey = false,
    SignatureValidator = (token, _) => new JsonWebToken(token),
    ValidateIssuer = false,
    ValidateAudience = false,
    ValidateLifetime = true,
};

static TokenValidationParameters ProdTokenValidation(string secret, string issuer, string audience) => new()
{
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
    ValidateIssuer = true,
    ValidIssuer = issuer,
    ValidateAudience = true,
    ValidAudience = audience,
    ValidateLifetime = true,
};