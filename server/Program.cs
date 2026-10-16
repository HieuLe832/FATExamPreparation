using FatGuide.Api.Security;
using FatGuide.Api.Services;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "Frontend";
// Browsers send Origin without a trailing slash, so "https://x.vercel.app/" in config would never match.
var allowedOrigins = (builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
    .Select(origin => origin.Trim().TrimEnd('/'))
    .Where(origin => origin.Length > 0)
    .ToArray();

builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;
    // Every endpoint is a GET, so no request needs a body.
    options.Limits.MaxRequestBodySize = 1024;
});

// On the VM only Caddy can reach the API (port 8080 is not published), and Caddy replaces any
// X-Forwarded-For a client sends with the client's real IP. The rate limits are per that IP.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.ForwardLimit = 1;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xml = Path.Combine(AppContext.BaseDirectory, $"{typeof(Program).Assembly.GetName().Name}.xml");
    options.IncludeXmlComments(xml);
});
builder.Services.AddCors(options => options.AddPolicy(FrontendCorsPolicy, policy =>
    policy.WithOrigins(allowedOrigins).WithMethods("GET").AllowAnyHeader()));
builder.Services.AddApiRateLimits(builder.Configuration);
builder.Services.AddSingleton<IHexDumpService, JsonHexDumpService>();

var app = builder.Build();

app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS before the limiter, so the page can read a 429 and tell the learner to wait.
app.UseCors(FrontendCorsPolicy);
app.UseRateLimiter();
app.MapControllers();

app.Run();
