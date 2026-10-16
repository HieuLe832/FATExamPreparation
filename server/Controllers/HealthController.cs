using FatGuide.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FatGuide.Api.Controllers;

/// <summary>Liveness check used by deploy/vm/deploy.sh and the deploy workflow after each release.</summary>
[ApiController]
[Route("api/health")]
[Produces("application/json")]
public sealed class HealthController : ControllerBase
{
    private readonly IHexDumpService _hexDumps;

    public HealthController(IHexDumpService hexDumps)
    {
        _hexDumps = hexDumps;
    }

    /// <summary>Returns 200 once the app is up and the exercise data has loaded.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        return Ok(new { status = "ok", hexDumps = _hexDumps.GetAll().Count });
    }
}
