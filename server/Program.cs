using FatGuide.Api.Services;

var builder = WebApplication.CreateBuilder(args);

const string FrontendCorsPolicy = "Frontend";
// Browsers send Origin without a trailing slash, so "https://x.vercel.app/" in config would never match.
var allowedOrigins = (builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
    .Select(origin => origin.Trim().TrimEnd('/'))
    .Where(origin => origin.Length > 0)
    .ToArray();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xml = Path.Combine(AppContext.BaseDirectory, $"{typeof(Program).Assembly.GetName().Name}.xml");
    options.IncludeXmlComments(xml);
});
builder.Services.AddCors(options => options.AddPolicy(FrontendCorsPolicy, policy =>
    policy.WithOrigins(allowedOrigins).WithMethods("GET").AllowAnyHeader()));
builder.Services.AddSingleton<IHexDumpService, JsonHexDumpService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(FrontendCorsPolicy);
app.MapControllers();

app.Run();
