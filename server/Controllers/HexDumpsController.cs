using FatGuide.Api.Models;
using FatGuide.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FatGuide.Api.Controllers;

/// <summary>The hex dumps from the exercise that the study guide decodes.</summary>
[ApiController]
[Route("api/hex-dumps")]
[Produces("application/json")]
public sealed class HexDumpsController : ControllerBase
{
    private readonly IHexDumpService _hexDumps;

    public HexDumpsController(IHexDumpService hexDumps)
    {
        _hexDumps = hexDumps;
    }

    /// <summary>Lists every dump without its bytes.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<HexDumpSummary>> GetAll()
    {
        return Ok(_hexDumps.GetAll().Select(HexDumpSummary.From));
    }

    /// <summary>Returns one dump with all of its rows.</summary>
    /// <param name="id">Dump key, e.g. "mbr", "boot", "fat", "rdet", "tmc1", "tmc2".</param>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<HexDump> GetById(string id)
    {
        var dump = _hexDumps.GetById(id);
        return dump is null ? NotFound() : Ok(dump);
    }
}
