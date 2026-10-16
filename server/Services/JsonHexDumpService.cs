using System.Text.Json;
using System.Text.RegularExpressions;
using FatGuide.Api.Models;

namespace FatGuide.Api.Services;

/// <summary>Loads the hex dumps from Data/hex-dumps.json once and validates them at startup.</summary>
public sealed partial class JsonHexDumpService : IHexDumpService
{
    private const string DataFile = "Data/hex-dumps.json";
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly IReadOnlyList<HexDump> _dumps;
    private readonly Dictionary<string, HexDump> _byId;

    public JsonHexDumpService(IWebHostEnvironment env)
    {
        var path = Path.Combine(env.ContentRootPath, DataFile);
        var dumps = JsonSerializer.Deserialize<List<HexDump>>(File.ReadAllText(path), JsonOptions)
            ?? throw new InvalidOperationException($"{DataFile} is empty.");
        dumps.ForEach(Validate);

        _dumps = dumps;
        _byId = dumps.ToDictionary(d => d.Id, StringComparer.OrdinalIgnoreCase);
    }

    public IReadOnlyList<HexDump> GetAll() => _dumps;

    public HexDump? GetById(string id) => _byId.GetValueOrDefault(id);

    private static void Validate(HexDump dump)
    {
        for (var i = 0; i < dump.Rows.Count; i++)
        {
            if (!RowPattern().IsMatch(dump.Rows[i]))
                throw new InvalidOperationException($"{DataFile}: dump '{dump.Id}' row {i} is not 16 hex bytes.");
        }

        var end = dump.BaseOffset + dump.Rows.Count * 16;
        if (dump.PickOffset < dump.BaseOffset || dump.PickOffset >= end)
            throw new InvalidOperationException($"{DataFile}: dump '{dump.Id}' pickOffset is outside the dump.");
    }

    [GeneratedRegex("^([0-9A-F]{2} ){15}[0-9A-F]{2}$")]
    private static partial Regex RowPattern();
}
