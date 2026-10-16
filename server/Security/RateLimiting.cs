using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace FatGuide.Api.Security;

/// <summary>Request limits from the "RateLimits" section of appsettings.json.</summary>
public sealed class RateLimitOptions
{
    public const string Section = "RateLimits";

    /// <summary>Requests one client IP may make per minute. A class behind one school router shares it.</summary>
    public int PerIpPerMinute { get; init; }

    /// <summary>Requests all clients together may make per minute. Caps CPU and outbound traffic in a flood.</summary>
    public int TotalPerMinute { get; init; }
}

public static class RateLimiting
{
    /// <summary>
    /// Every request counts against its client IP and against the total for all clients. Past either limit
    /// the API answers 429 with Retry-After without doing any work. One visit to the guide fetches 6 dumps.
    /// </summary>
    public static IServiceCollection AddApiRateLimits(this IServiceCollection services, IConfiguration config)
    {
        var limits = config.GetSection(RateLimitOptions.Section).Get<RateLimitOptions>();
        if (limits is null || limits.PerIpPerMinute <= 0 || limits.TotalPerMinute <= 0)
            throw new InvalidOperationException($"Set {RateLimitOptions.Section}:PerIpPerMinute and TotalPerMinute above 0.");

        services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.CreateChained(
                PartitionedRateLimiter.Create<HttpContext, string>(context => RateLimitPartition.GetFixedWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => PerMinute(limits.PerIpPerMinute))),
                PartitionedRateLimiter.Create<HttpContext, string>(_ => RateLimitPartition.GetFixedWindowLimiter(
                    "total",
                    _ => PerMinute(limits.TotalPerMinute))));
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = (context, _) =>
            {
                if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
                {
                    context.HttpContext.Response.Headers.RetryAfter =
                        Math.Ceiling(retryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture);
                }
                return ValueTask.CompletedTask;
            };
        });
        return services;
    }

    private static FixedWindowRateLimiterOptions PerMinute(int permits) => new()
    {
        PermitLimit = permits,
        Window = TimeSpan.FromMinutes(1),
        QueueLimit = 0,
    };
}
