using System.Text;
using DziennikPodrozy.Api.Data;
using DziennikPodrozy.Api.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using DziennikPodrozy.Api.Services;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireNonAlphanumeric = false;
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

var jwtSettings = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings["Key"]!))
        };
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();

                var account = userId == null
                    ? null
                    : await db.Users
                        .AsNoTracking()
                        .Where(u => u.Id == userId)
                        .Select(u => new { u.LockoutEnd, u.LastActiveAt })
                        .FirstOrDefaultAsync();

                if (account == null || (account.LockoutEnd.HasValue && account.LockoutEnd > DateTimeOffset.UtcNow))
                {
                    context.Fail("Konto jest zawieszone lub nie istnieje.");
                    return;
                }

                var now = DateTime.UtcNow;

                if (account.LastActiveAt == null || now - account.LastActiveAt.Value > TimeSpan.FromMinutes(5))
                {
                    await db.Users
                        .Where(u => u.Id == userId)
                        .ExecuteUpdateAsync(setters => setters.SetProperty(u => u.LastActiveAt, now));
                }
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddScoped<TokenService>();

builder.Services.AddScoped<FileStorageService>();

builder.Services.AddHttpClient<WeatherService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(4);
});

builder.Services.AddHttpClient<GeocodingService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(4);
    client.DefaultRequestHeaders.UserAgent.ParseAdd("DziennikPodrozy/1.0 (projekt inzynierski)");
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    foreach (var roleName in new[] { "User", "Admin" })
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    var adminSection = app.Configuration.GetSection("AdminSeed");
    var adminEmail = adminSection["Email"];
    var adminPassword = adminSection["Password"];

    if (!string.IsNullOrEmpty(adminEmail)
        && !string.IsNullOrEmpty(adminPassword)
        && await userManager.FindByEmailAsync(adminEmail) == null)
    {
        var admin = new ApplicationUser
        {
            UserName = adminSection["UserName"],
            Email = adminEmail
        };

        var result = await userManager.CreateAsync(admin, adminPassword);

        if (result.Succeeded)
        {
            await userManager.AddToRolesAsync(admin, new[] { "User", "Admin" });
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();