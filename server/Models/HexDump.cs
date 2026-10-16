namespace FatGuide.Api.Models;

/// <summary>One hex dump of the mini practice disk used by the lessons.</summary>
public sealed class HexDump
{
    /// <summary>Stable key used by the frontend, e.g. "rdet".</summary>
    public required string Id { get; init; }

    public required string Title { get; init; }

    /// <summary>Short note shown next to the title, e.g. "cluster 2".</summary>
    public required string Note { get; init; }

    /// <summary>Which decoder reads it: mbr, boot, fat or dir.</summary>
    public required string Kind { get; init; }

    /// <summary>Absolute byte offset of the first row on the disk or volume.</summary>
    public required long BaseOffset { get; init; }

    /// <summary>Absolute offset of the byte selected when the dump first renders.</summary>
    public required long PickOffset { get; init; }

    /// <summary>16 space-separated hex bytes per row.</summary>
    public required IReadOnlyList<string> Rows { get; init; }
}
