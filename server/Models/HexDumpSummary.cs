namespace FatGuide.Api.Models;

/// <summary>List item for GET /api/hex-dumps.</summary>
public sealed record HexDumpSummary(string Id, string Title, string Kind, long BaseOffset, long Sector, int ByteCount)
{
    public static HexDumpSummary From(HexDump dump) => new(
        dump.Id, dump.Title, dump.Kind, dump.BaseOffset, dump.BaseOffset / 512, dump.Rows.Count * 16);
}
