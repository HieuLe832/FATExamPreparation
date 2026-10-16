using FatGuide.Api.Models;

namespace FatGuide.Api.Services;

public interface IHexDumpService
{
    IReadOnlyList<HexDump> GetAll();

    HexDump? GetById(string id);
}
